import BattleModel from '../battle/BattleModel.js'
import BattleController from '../battle/view/BattleController.js'

export default class BaseBattleAuthority extends EventEmitter3 {
	constructor(battleBlueprint, myTeamId) {
		super()

		this.battleBlueprint = _.cloneDeep(battleBlueprint)
		this.myTeamId = myTeamId
		this.model = BattleModel.createFromBlueprint(_.cloneDeep(this.battleBlueprint), this.myTeamId)
	}
	initBattleController(previousResults) {
		this.battleController = new BattleController(this.battleBlueprint, this.myTeamId, previousResults)

		this.battleController.on('dismiss', () => {
			this.battleController.destroy()
			this.emit('dismiss', undefined)
		})
	}
	update(dt) {
		this.battleController.update(dt)
	}
	render() {
		this.battleController.render()
	}
}
