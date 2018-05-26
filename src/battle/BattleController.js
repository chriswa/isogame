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
	render() { }
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
		this.view.setTopText('')
		this.startNextResult()
	}
	onStateExit() {
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
	render() {
		this.activePlayerAnimation.render()
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
	}
	render() {
		this.activeTargetingUI.render()
	}
	onStateEnter() {
		this.selectUnit(undefined)
		this.battleController.mouseController.activate()
		this.view.showActiveUnitIndicator(this.model.getActiveUnitId())
	}
	onStateExit() {
		this.removeActiveTargetingUi()
		this.battleController.mouseController.deactivate()
		this.view.hideActiveUnitIndicator()
		this.view.setTopText('')
	}
	removeActiveTargetingUi() {
		if (this.activeTargetingUI) {
			this.activeTargetingUI.destroy()
			this.activeTargetingUI = undefined
		}
	}
	onClick(mousePos) {
		const mousePick = this.view.mousePick()
		let clickHandled = false
		if (this.activeTargetingUI) {
			const decisionCallback = (target) => {
				if (!this.model.isItMyTurn()) { throw new Error(`assertion failed: targetingUi tried to send decision but selected unit is not owned by player`) }
				this.battleController.onSendDecision(this.selectedAbilityId, target)
			}
			clickHandled = this.activeTargetingUI.onClick(mousePick, decisionCallback)
		}
		if (!clickHandled) {
			if (mousePick.hasUnit()) {
				this.selectUnit(mousePick.getUnitId())
			}
			else {
				const activeUnitId = this.model.getActiveUnitId()
				if (activeUnitId !== undefined) {
					this.selectUnit(activeUnitId)
				}
			}
		}
	}
	selectUnit(unitId) {
		if (unitId === undefined) {
			unitId = this.model.getActiveUnitId()
		}
		this.selectedUnitId = unitId
		if (this.selectedUnitId === undefined) { return }
		this.view.selectUnit(unitId)
		
		if (this.model.isItMyTurn()) {
			this.view.setTopText("Your turn")
		}
		else {
			this.view.setTopText("Waiting for opponent...")
		}

		//this.onSelectAbility(1) // default to Walk (1), instead of Face (0)
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

		const onSelectAbility = (abilityId) => {
			this.currentSubController.onSelectAbility(abilityId)
		}

		// BattleView
		this.view = new BattleView(fieldView, this.model, onSelectAbility)

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

	onSendDecision(abilityId, target) { // called by TargetingSubController
		this.decisionCallback(abilityId, target)
		this.view.setWaiting(true)
	}

	onResultsComplete() { // called by ResultPlayingSubController
		this.setSubController(this.allSubControllers.TARGETING)
	}

	update(dt) {
		this.currentSubController.update(dt)
		this.view.update(dt) // this sets glows and sprite names for billboards
		this.mouseController.update(dt) // this calls cameraTweener.update
	}

	render() {
		this.currentSubController.render() // does a mouseover pick, which should be done after (a) the camera has been moved and (b) sprites have been finalized (except glow)
		this.view.render()
	}
	
}
