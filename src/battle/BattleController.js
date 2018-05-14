import * as fieldBuilder from './field/fieldBuilder.js'
import BattleModel from './BattleModel.js'
import BattleView from './BattleView.js'
import PlaybackControllers from './PlaybackControllers.js'
import AbilityArchetypes from './AbilityArchetypes.js'

import { EventSubscriber } from '../util/domUtils.js'
import * as cameraController from '../gfx/cameraController.js'

class MouseController {
	constructor(view) {
		this.view = view
		this.active = false
		this.eventSubscriber = new EventSubscriber() // for easy unsubscribing
		this.initEventHandlers()
	}
	initEventHandlers() {
		// on mouse wheel
		this.eventSubscriber.subscribe(document, 'wheel', e => {
			cameraController.setZoom(cameraController.getZoom() - e.deltaY / 100 / 10)
		})
		// on mousedown
		this.eventSubscriber.subscribe(document, 'mousedown', e => {
			if (e.button === 1) { // middle mouse button
				cameraController.setTargetFacing((cameraController.getFacing() + 1) % 4)
			}
			else if (e.button === 0) { // left mouse button

			}
		})
		// on "click"
		this.eventSubscriber.subscribe(document, 'click', e => {
			const [pickedTileCoords, pickedUnitId] = this.view.mousePick(true)
			if (pickedTileCoords !== undefined) {
				const midHeight = this.view.fieldView.getTileAtCoords(pickedTileCoords).midHeight
				cameraController.setTargetCenter([pickedTileCoords[0] + 0.5, midHeight, pickedTileCoords[1] + 0.5])
			}
		})
	}
	activate() {
		this.active = true
	}
	deactivate() {
		this.active = false
	}
}

/*
	FSM relationship:
		BattleController.uiManagers : {
			PLAYBACK: PlaybackManager,
			TARGETING: TargetingManager,
		}
		BattleController.currentUiManager : BaseManager
*/

class BaseManager {
	constructor(battleController) {
		/** @type BattleController */
		this.battleController = battleController
	}
	get view() { return this.battleController.view } // shortcut
	get model() { return this.battleController.model } // shortcut
	update(dt) { }
	render(worldViewProjectionMatrix) { }
	onStateEnter() { }
	onStateExit() { }
	onSelectUnit(unitId) { } // ignore this event
	onSelectAbility(abilityId) { } // ignore this event
	onSelectTarget(target) { } // ignore this event
}

class PlaybackManager extends BaseManager {
	constructor(battleController) {
		super(battleController)
		this.activePlaybackController = undefined
	}
	update(dt) {
		let remainingDt = dt
		while (remainingDt > 0 && this.activePlaybackController) {

			const consumedDt = this.activePlaybackController.update(remainingDt)
			if (consumedDt) {
				remainingDt -= consumedDt
			}

			const isComplete = this.activePlaybackController.isComplete()

			if (!consumedDt && !isComplete) { debugger } // prevent infinite loop

			if (!isComplete) {
				return // this watcher has more to show, so wait for next update
			}
			
			// active watcher is complete, move on to next result
			this.startNextResult()
		}

		// check for end of results
		if (!this.activePlaybackController) {
			this.battleController.onPlaybackComplete()
		}
	}
	onStateEnter() {
		this.view.fieldView.updateOverlay(testCoords => { return 0 }) // clear targeting overlay
		this.startNextResult()
	}
	startNextResult() {
		if (this.battleController.queuedResults.length) {
			const activeResult = this.battleController.queuedResults.shift()
			const playbackControllerClass = PlaybackControllers[activeResult.type]
			this.activePlaybackController = new playbackControllerClass(this.model, this.view, activeResult)
			this.battleController.log(`PlaybackController started: `, this.activePlaybackController)
		}
		else {
			this.activePlaybackController = undefined
		}
	}
	render(worldViewProjectionMatrix) {
		if (this.activePlaybackController) {
			this.activePlaybackController.render(worldViewProjectionMatrix)
		}
	}
}

class TargetingManager extends BaseManager {
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
	}
	onStateExit() {
		this.removeActiveTargetingUi()
	}
	removeActiveTargetingUi() {
		if (this.activeTargetingUI) {
			this.activeTargetingUI.destroy()
			this.activeTargetingUI = undefined
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
		this.activeTargetingUI = abilityArch.createTargetingUi(this.model, this.view, this.selectedUnitId, this.selectedAbilityId)
		this.battleController.log(`TargetingUI started: `, this.activeTargetingUI)
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
		this.queuedResults = []

		// convert the fieldDescriptor (e.g. { type: "randomwoods", seed: 123 } into a view and model
		const { fieldView, fieldModel } = fieldBuilder.build(fieldDescriptor)

		// Battle Model
		this.model = new BattleModel(fieldModel, unitsModel, turnModel, myTeamId)

		// BattleView
		const viewCallbacks = {
			onSelectUnit: (unitId) => { this.currentUiManager.onSelectUnit(unitId) },
			onSelectAbility: (abilityId) => { this.currentUiManager.onSelectAbility(abilityId) },
			onSelectTarget: (target) => { this.currentUiManager.onSelectTarget(target) },
		}
		this.view = new BattleView(fieldView, this.model, viewCallbacks)

		// UI States
		this.uiManagers = {
			PLAYBACK: new PlaybackManager(this),
			TARGETING: new TargetingManager(this),
		}
		this.currentUiManager = this.uiManagers.TARGETING
		this.currentUiManager.onStateEnter()

		this.mouseController = new MouseController(this.view)
	}

	destroy() { // called by owner
		this.mouseController.destroy() // it has eventlisteners to clean up
	}

	log(arg0, ...args) {
		console.log('%cBattleController: ' + arg0, 'color: #09c;', ...args)
	}

	setUiState(newState) {
		this.currentUiManager.onStateExit()
		this.currentUiManager = newState
		this.currentUiManager.onStateEnter()
	}

	addBattleSimulationResult(result) { // called by "owner"
		this.queuedResults.push(result)
		if (this.currentUiManager !== this.uiManagers.PLAYBACK) {
			this.setUiState(this.uiManagers.PLAYBACK)
		}
	}

	onSendDecision(unitId, abilityId, target) { // called by TargetingManager
		decisionCallback(unitId, abilityId, target)
		this.view.setWaiting(true)
	}

	onPlaybackComplete() { // called by PlaybackManager
		this.setUiState(this.uiManagers.TARGETING)
	}

	update(dt) {
		this.currentUiManager.update(dt)
		this.view.update(dt)
		cameraController.update(dt) // this must occur after anything which may update the cameraController
	}

	render() {
		const worldViewProjectionMatrix = this.view.render()
		this.currentUiManager.render(worldViewProjectionMatrix)
	}
	
}
