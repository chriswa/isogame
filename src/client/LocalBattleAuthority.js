import AIBattleSimulator from '../battle/AIBattleSimulator.js'
import BattleModel from '../battle/BattleModel.js'
import BattleController from '../battle/view/BattleController.js'

export default class LocalBattleAuthority extends EventEmitter3 {
	constructor(battleBlueprint) {
		super()

		this.resultsQueue = []
		this.resultsLog = []

		this.battleBlueprint = _.cloneDeep(battleBlueprint)
		this.model = BattleModel.createFromBlueprint(_.cloneDeep(this.battleBlueprint))
		this.simulator = new AIBattleSimulator(this.model, this.resultsQueue)

		this.myTeamId = 0

		this.start()
	}
	start() {
		this.battleController = new BattleController(this.battleBlueprint, this.myTeamId, this.resultsLog)

		this.battleController.on('decision', ({ abilityId, target }) => {
			// TODO: make sure it's the player's turn?
			this.simulator.executeDecision(abilityId, target)
			this.advanceBattle()
		})

		this.battleController.on('dismiss', () => {
			this.emit('dismiss', undefined)
		})

		this.advanceBattle()
	}
	stop() {
		this.battleController.destroy()
		this.battleController = undefined
	}
	advanceBattle() {
		this.simulator.advanceWithAI()
		this.sendQueuedResults()
	}
	sendQueuedResults() {
		while (this.resultsQueue.length) {
			const result = this.resultsQueue.shift()
			this.resultsLog.push(result)
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

