import BattleModel from '../BattleModel.js'
import BattleView from './BattleView.js'
import MouseController from './MouseController.js'
import FieldBuilder from '../FieldBuilder.js'
import FieldView from './FieldView.js'
import ResultFactory from '../ResultFactory.js'
import TurnClock from './TurnClock.js'

import ResultPlayingSubController from './ResultPlayingSubController.js'
import TargetingSubController from './TargetingSubController.js'
import VictorySubController from './VictorySubController.js'

import BattleGUI from '../../gui/battle/BattleGUI.js'

/*
	FSM relationship:
		BattleController.SubControllers : {
			RESULTPLAYING: ResultPlayingSubController,
			TARGETING: TargetingSubController,
			VICTORY: VictorySubController,
		}
		BattleController.currentSubController : BaseSubController
*/

export default class BattleController extends EventEmitter3 {

	constructor(battleBlueprint, myTeamId, previousResults) {
		super()

		console.log(battleBlueprint)
		
		// convert the fieldDescriptor (e.g. { type: "randomwoods", seed: 123 } into a view and model
		const fieldBuilder = FieldBuilder(battleBlueprint.fieldDescriptor)
		const fieldView = new FieldView(fieldBuilder.getFieldViewData())

		// Battle Model
		this.model = BattleModel.createFromBlueprint(battleBlueprint, myTeamId)

		// fast forward previousResults
		if (previousResults) {
			_.each(previousResults, resultData => {
				const result = ResultFactory(resultData, this.model)
				result.updateModel()
			})
		}

		const onSelectAbility = (abilityId) => {
			this.currentSubController.onSelectAbility(abilityId)
		}

		BattleGUI.init(this.model, onSelectAbility)

		// BattleView
		this.view = new BattleView(fieldView, this.model)

		this.mouseController = new MouseController(this.view, (clickPos) => { this.currentSubController.onClick(clickPos) })

		// UI States
		this.allSubControllers = {
			RESULTPLAYING: new ResultPlayingSubController(this),
			TARGETING: new TargetingSubController(this),
			VICTORY: new VictorySubController(this),
		}
		this.onResultsComplete() // start with either TARGETING or VICTORY

		this.turnClock = new TurnClock(this.model.myTeamId)
	}

	destroy() { // called by owner
		this.mouseController.destroy() // it has eventlisteners to clean up
		BattleGUI.hide()
	}

	setTurnClock(timerDetails) {
		if (timerDetails === undefined) { return }
		const { currentTime, direction, freeTime, maxTime } = timerDetails // see TurnTimer.getTimerDetails
		this.turnClock.setFromServer(currentTime, freeTime, maxTime, direction)
	}

	log(arg0, ...args) {
		//console.log('%cBattleController: ' + arg0, 'color: #09c;', ...args)
	}

	setSubController(newState) {
		if (this.currentSubController) {
			this.currentSubController.onStateExit()
		}
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
		this.emit('decision', { abilityId, target })
		this.view.setWaiting(true)
	}

	onDismissBattle() { // called by VictorySubController
		this.emit('dismiss', undefined)
	}

	onResultsComplete() { // called by ResultPlayingSubController
		if (this.model.getVictoryState()) {
			this.setSubController(this.allSubControllers.VICTORY)
		}
		else {
			this.setSubController(this.allSubControllers.TARGETING)
		}
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
