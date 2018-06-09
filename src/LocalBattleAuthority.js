import AIBattleSimulator from './battle/AIBattleSimulator.js'
import BattleModel from './battle/BattleModel.js'

export default class LocalBattleAuthority extends EventEmitter3 {
	constructor() {
		super()
		//this.eventEmitter = new EventEmitter3()

		this.resultsQueue = []
		this.battleBlueprint = undefined
		this.model = undefined
		this.simulator = undefined
	}
	start(battleBlueprint) {
		this.battleBlueprint = _.cloneDeep(battleBlueprint)
		this.model = BattleModel.createFromBlueprint(_.cloneDeep(this.battleBlueprint))
		this.simulator = new AIBattleSimulator(this.model, this.resultsQueue)

		this.emit('start', _.cloneDeep(this.battleBlueprint))
		this.advanceBattle()
	}
	advanceBattle() {
		this.simulator.advanceWithAI()
		this.sendQueuedResults()
	}	
	executeDecision(abilityId, target) {
		// TODO: make sure it's the player's turn!
		this.simulator.executeDecision(abilityId, target)
		this.advanceBattle()
	}
	sendQueuedResults() {
		while (this.resultsQueue.length) {
			this.emit('result', this.resultsQueue.shift())
		}
	}
}

