import * as fieldBuilder from './field/fieldBuilder.js'
import BattleModel from './BattleModel.js'
import BattleView from './BattleView.js'
import PlaybackControllers from './PlaybackControllers.js'
// import AbilityArchetypes from '???'

class BattleControllerState {
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

class BattleControllerStatePlayback extends BattleControllerState {
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
		this.startNextResult()
	}
	startNextResult() {
		if (this.battleController.queuedResults.length) {
			const activeResult = this.battleController.queuedResults.shift()
			const playbackControllerClass = PlaybackControllers[activeResult.type]
			this.activePlaybackController = new playbackControllerClass(this.model, this.view, activeResult)
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

class BattleControllerStateTargeting extends BattleControllerState {
	constructor(battleController) {
		super(battleController)
		this.selectedUnitId = undefined
		this.selectedAbilityId = undefined
		this.activeTargetingUI = undefined
	}
	update(dt) {
	}
	onStateEnter() {
		this.onSelectUnit(undefined)
	}
	onStateExit() {
		this.view.setOverlayHandler(undefined)
	}
	onSelectUnit(unitId) {
		if (unitId === undefined) {
			unitId = this.model.getActiveUnitId()
		}
		this.selectedUnitId = unitId
		if (!this.selectedUnitId) { return }
		this.view.selectUnit(unitId)
		this.onSelectAbility(0)
	}
	onSelectAbility(abilityId) {
		if (!this.selectedUnitId) { return }
		this.selectedAbilityId = abilityId
		this.view.selectAbility(abilityId)
		const activeUnit = this.model.getUnitById(this.selectedUnitId)
		const abilityType = activeUnit.abilities[abilityId].abilityType
		const abilityArch = AbilityArchetypes[abilityType]
		const overlayHandler = abilityArch.createOverlayHandler(this.model, this.selectedUnitId, abilityId)
		this.view.setOverlayHandler(overlayHandler)
	}
	onSelectTarget(target) {
		if (!this.model.isItMyTurn()) { return }
		if (this.selectedUnitId !== this.model.getActiveUnitId()) {}
		this.battleController.onSendDecision(this.selectedUnitId, this.selectedAbilityId, target)
	}
}


export default class BattleController {

	constructor(fieldDescriptor, unitsModel, turnModel, localTeamId, decisionCallback) {

		this.decisionCallback = decisionCallback
		this.queuedResults = []

		// convert the fieldDescriptor (e.g. { type: "randomwoods", seed: 123 } into a view and model
		const { fieldView, fieldModel } = fieldBuilder.build(fieldDescriptor)

		// Battle Model
		this.model = new BattleModel(fieldModel, unitsModel, turnModel, localTeamId)

		// BattleView
		const viewCallbacks = {
			onSelectUnit: (unitId) => { this.uiState.onSelectUnit(unitId) },
			onSelectAbility: (abilityId) => { this.uiState.onSelectAbility(abilityId) },
			onSelectTarget: (target) => { this.uiState.onSelectTarget(target) },
		}
		this.view = new BattleView(fieldView, this.model, viewCallbacks)

		// UI States
		this.uiStates = {
			PLAYBACK: new BattleControllerStatePlayback(this),
			TARGETING: new BattleControllerStateTargeting(this),
		}
		this.uiState = this.uiStates.TARGETING
		this.uiState.onStateEnter()
	}

	destroy() { // called by owner
		this.view.destroy() // BattleView has eventlisteners to clean up
	}

	setUiState(newState) {
		this.uiState.onStateExit()
		this.uiState = newState
		this.uiState.onStateEnter()
	}

	addBattleSimulationResult(result) { // called by "owner"
		this.queuedResults.push(result)
		if (this.uiState !== this.uiStates.PLAYBACK) {
			this.setUiState(this.uiStates.PLAYBACK)
		}
	}

	onSendDecision(unitId, abilityId, target) { // called by BattleControllerStateTargeting
		decisionCallback(unitId, abilityId, target)
		this.view.setWaiting(true)
	}

	onPlaybackComplete() { // called by BattleControllerStatePlayback
		this.setUiState(this.uiStates.TARGETING)
	}

	update(dt) {
		this.uiState.update(dt)
		this.view.update(dt)
	}

	render() {
		const worldViewProjectionMatrix = this.view.render()
		this.uiState.render(worldViewProjectionMatrix)
	}
	
}
