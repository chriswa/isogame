import * as sampleBattleGenerator from './battle/sampleBattleGenerator.js'
import AIBattleSimulator from './battle/AIBattleSimulator.js'
import BattleModel from './battle/BattleModel.js'

export default class LocalAuthority {
	constructor(callbacks) {
		this.callbacks = callbacks

		this.resultsQueue = []

		const battleBlueprint = sampleBattleGenerator.build()
		this.model = BattleModel.createFromBlueprint(_.cloneDeep(battleBlueprint))
		this.simulator = new AIBattleSimulator(this.model, this.resultsQueue)

		// tell caller to start the battle
		this.callbacks.onBattleStart(_.cloneDeep(battleBlueprint))

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
			this.callbacks.onResult(this.resultsQueue.shift())
		}
	}
}

