import * as fieldBuilder from './field/fieldBuilder.js'
import BattleModel from './BattleModel.js'
import BattleView from './BattleView.js'
import ResultPlayers from './ResultPlayers.js'
import AbilityArchetypes from './AbilityArchetypes.js'
import MouseController from './MouseController.js'


/*
	FSM relationship:
		BattleController.SubControllers : {
			RESULTPLAYING: ResultPlayingSubController,
			TARGETING: TargetingSubController,
		}
		BattleController.currentSubController : BaseSubController
*/

class BaseSubController {
	constructor(battleController) {
		/** @type BattleController */
		this.battleController = battleController
	}
	get view() { return this.battleController.view } // shortcut
	get model() { return this.battleController.model } // shortcut
	update(dt) { }
	onStateEnter() { }
	onStateExit() { }
	onClick(mousePos) { } // ignore this event
}

class ResultPlayingSubController extends BaseSubController {
	constructor(battleController) {
		super(battleController)
		this.queuedResults = []
		this.activePlayerAnimation = undefined
		this.activePlayerModelUpdater = undefined
	}
	addResult(result) {
		this.queuedResults.push(result)
	}
	onStateEnter() {
		this.view.fieldView.updateOverlay(testCoords => { return 0 }) // clear targeting overlay
		this.startNextResult()
	}
	startNextResult() {
		if (this.queuedResults.length) {
			const activeResult = this.queuedResults.shift()
			const resultPlayer = ResultPlayers[activeResult.type]
			this.activePlayerAnimation = resultPlayer.startAnimation(this.model, this.view, activeResult)
			this.activePlayerModelUpdater = () => {
				this.battleController.log(`ResultPlayer model updater called: `, activeResult)
				resultPlayer.updateModel(this.model, activeResult)
			}
			this.battleController.log(`ResultAnimation started: `, this.activePlayerAnimation)
		}
		else {
			this.activePlayerAnimation = undefined
		}
	}
	update(dt) {
		let remainingDt = dt
		while (this.activePlayerAnimation) {

			// update the animation
			remainingDt = this.activePlayerAnimation.update(remainingDt)

			// if the animation used all the time, it's not done yet, so we're done for now
			if (!remainingDt) {
				return
			}

			// the animation is complete, update the model and move on to the next result (if there is one)
			this.activePlayerModelUpdater()
			this.startNextResult()
		}

		// check for end of results
		if (!this.activePlayerAnimation) {
			this.battleController.onResultsComplete()
		}
	}
}

class TargetingSubController extends BaseSubController {
	constructor(battleController) {
		super(battleController)
		this.selectedUnitId = undefined
		this.selectedAbilityId = undefined
		this.activeTargetingUI = undefined
	}
	update(dt) {
		this.activeTargetingUI.update(dt)
	}
	onStateEnter() {
		this.onSelectUnit(undefined)
		this.battleController.mouseController.activate()
	}
	onStateExit() {
		this.removeActiveTargetingUi()
		this.battleController.mouseController.deactivate()
	}
	removeActiveTargetingUi() {
		if (this.activeTargetingUI) {
			this.activeTargetingUI.destroy()
			this.activeTargetingUI = undefined
		}
	}
	onClick(mousePos) {
		const [pickedTileCoords, pickedUnitId] = this.view.mousePick(true)
		console.log(`click!`, pickedTileCoords, pickedUnitId)
		let clickHandled = false
		if (this.activeTargetingUI) {
			clickHandled = this.activeTargetingUI.onClick(pickedTileCoords, pickedUnitId)
		}
		if (!clickHandled) {
			if (pickedUnitId !== undefined) {
				this.onSelectUnit(pickedUnitId)
			}
		}
	}
	onSelectUnit(unitId) {
		if (unitId === undefined) {
			unitId = this.model.getActiveUnitId()
		}
		this.selectedUnitId = unitId
		if (this.selectedUnitId === undefined) { return }
		this.view.selectUnit(unitId)
		this.onSelectAbility(0)
	}
	onSelectAbility(abilityId) {
		if (this.selectedUnitId === undefined) { return }
		this.selectedAbilityId = abilityId
		this.view.selectAbility(abilityId)
		const activeUnit = this.model.getUnitById(this.selectedUnitId)
		const abilityType = activeUnit.abilities[abilityId].abilityType
		const abilityArch = AbilityArchetypes[abilityType]
		this.removeActiveTargetingUi() // call this first, so everything is cleaned up for TargetingUi constructor created next
		this.activeTargetingUI = abilityArch.createTargetingController(this.model, this.view, this.selectedUnitId, this.selectedAbilityId)
		this.battleController.log(`TargetingController started: `, this.activeTargetingUI)
	}
	onSelectTarget(target) {
		if (!this.model.isItMyTurn()) { return }
		if (this.selectedUnitId !== this.model.getActiveUnitId()) {}
		this.battleController.onSendDecision(this.selectedUnitId, this.selectedAbilityId, target)
	}
}


export default class BattleController {

	constructor(fieldDescriptor, unitsModel, turnModel, myTeamId, decisionCallback) {

		this.decisionCallback = decisionCallback

		// convert the fieldDescriptor (e.g. { type: "randomwoods", seed: 123 } into a view and model
		const { fieldView, fieldModel } = fieldBuilder.build(fieldDescriptor)

		// Battle Model
		this.model = new BattleModel({
			field: fieldModel,
			units: unitsModel,
			turn: turnModel,
			myTeamId,
		})

		// BattleView
		this.view = new BattleView(fieldView, this.model)

		this.mouseController = new MouseController(this.view, (clickPos) => { this.currentSubController.onClick(clickPos) })

		// UI States
		this.allSubControllers = {
			RESULTPLAYING: new ResultPlayingSubController(this),
			TARGETING: new TargetingSubController(this),
		}
		this.currentSubController = this.allSubControllers.TARGETING
		this.currentSubController.onStateEnter()
	}

	destroy() { // called by owner
		this.mouseController.destroy() // it has eventlisteners to clean up
	}

	log(arg0, ...args) {
		console.log('%cBattleController: ' + arg0, 'color: #09c;', ...args)
	}

	setSubController(newState) {
		this.currentSubController.onStateExit()
		this.currentSubController = newState
		this.currentSubController.onStateEnter()
	}

	addResult(result) { // called by "owner"
		this.allSubControllers.RESULTPLAYING.addResult(result)
		if (this.currentSubController !== this.allSubControllers.RESULTPLAYING) {
			this.setSubController(this.allSubControllers.RESULTPLAYING)
		}
	}

	onSendDecision(unitId, abilityId, target) { // called by TargetingSubController
		decisionCallback(unitId, abilityId, target)
		this.view.setWaiting(true)
	}

	onResultsComplete() { // called by ResultPlayingSubController
		this.setSubController(this.allSubControllers.TARGETING)
	}

	update(dt) {
		this.currentSubController.update(dt)
		this.view.update(dt)
		this.mouseController.update(dt)
	}

	render() {
		this.view.render()
	}
	
}
