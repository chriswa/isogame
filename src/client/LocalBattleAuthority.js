import AIBattleSimulator from '../battle/AIBattleSimulator.js'
import BaseBattleAuthority from './BaseBattleAuthority.js'

const localTeamId = 0

export default class LocalBattleAuthority extends BaseBattleAuthority {
	constructor(battleBlueprint) {
		super(battleBlueprint, localTeamId)

		this.resultsQueue = []
		this.resultsLog = []

		this.simulator = new AIBattleSimulator(this.model, this.resultsQueue)

		this.start()
	}
	start() { // also called by Client after a supervised battle ends, to resume the paused local battle
		this.initBattleController(this.resultsLog)

		this.battleController.on('decision', ({ abilityId, target }) => {
			this.simulator.executeDecision(abilityId, target, this.myTeamId)
			this._advanceBattle()
		})

		this._advanceBattle()
	}
	stop() { // called by Client when a supervised battle starts, to paused the local battle
		this.battleController.destroy()
		this.battleController = undefined
	}
	_advanceBattle() {
		this.simulator.advanceWithAI()
		this._sendQueuedResults()
	}
	_sendQueuedResults() {
		while (this.resultsQueue.length) {
			const result = this.resultsQueue.shift()
			this.resultsLog.push(result)
			this.battleController.addResult(result)
		}
	}
}

