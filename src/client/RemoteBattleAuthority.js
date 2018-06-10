import AIBattleSimulator from '../battle/AIBattleSimulator.js'
import BattleModel from '../battle/BattleModel.js'
import BattleController from '../battle/view/BattleController.js'

export default class RemoteBattleAuthority {
	constructor(battleBlueprint, myTeamId, previousResults, onDecisionCallback) {

		this.battleBlueprint = _.cloneDeep(battleBlueprint)
		this.myTeamId = myTeamId

		this.model = BattleModel.createFromBlueprint(_.cloneDeep(this.battleBlueprint))

		this.battleController = new BattleController(this.battleBlueprint, this.myTeamId, previousResults)

		this.battleController.on('decision', ({ abilityId, target }) => {
			onDecisionCallback(abilityId, target)
		})
	}
	addResults(results) {
		while (results.length) {
			const result = results.shift()
			this.battleController.addResult(result)
		}
	}
	update(dt) {
		this.battleController.update(dt)
	}
	render() {
		this.battleController.render()
	}
}

