import BattleModel from '../battle/BattleModel.js'
import BattleController from '../battle/view/BattleController.js'

export default class RemoteBattleAuthority extends EventEmitter3 {
	constructor(battleBlueprint, myTeamId, timerDetails, previousResults, onDecisionCallback) {
		super()

		this.battleBlueprint = _.cloneDeep(battleBlueprint)
		this.myTeamId = myTeamId

		this.model = BattleModel.createFromBlueprint(_.cloneDeep(this.battleBlueprint), this.myTeamId)

		this.battleController = new BattleController(this.battleBlueprint, this.myTeamId, previousResults)

		this.battleController.on('decision', ({ abilityId, target }) => {
			this.emit('decision', { abilityId, target })
		})

		this.battleController.on('dismiss', () => {
			this.battleController.destroy()
			this.emit('dismiss', undefined)
		})

		this.battleController.setTurnClock(timerDetails)

	}
	addResults(results) {
		while (results.length) {
			const result = results.shift()
			this.battleController.addResult(result)
		}
	}
	setTurnClock(timerDetails) {
		this.battleController.setTurnClock(timerDetails)
	}
	update(dt) {
		this.battleController.update(dt)
	}
	render() {
		this.battleController.render()
	}
}

