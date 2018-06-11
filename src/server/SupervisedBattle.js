import * as sampleBattleGenerator from './../battle/sampleBattleGenerator.js'
import AIBattleSimulator from './../battle/AIBattleSimulator.js'
import BattleModel from './../battle/BattleModel.js'
import UserConnection from './UserConnection.js'

function createBattleBlueprintFromDescriptor(battleDescriptor, userConnections) {
	// TODO: depending on battleDescriptor, take some data from userConnections (e.g. if it's pvp, look for a hunting team config for this match type)
	const battleBlueprint = sampleBattleGenerator.build()
	return battleBlueprint
}

const INACTIVITY_TIMEOUT_SECONDS = 60 * 5

export default class SupervisedBattle {
	constructor(battleDescriptor, userConnections, onBattleCompleteCallback) {
		this.battleDescriptor = battleDescriptor
		/** @type {Array<UserConnection>} */
		this.userConnections = _.fromPairs(_.map(userConnections, (userConnection) => [ userConnection.getUsername(), userConnection ])) // { 'username0': uc0 }
		this.teamIds = _.fromPairs(_.map(userConnections, (userConnection, index) => [userConnection.getUsername(), index]))
		this.onBattleCompleteCallback = onBattleCompleteCallback

		this.completeBattleLog = [] // [{type:'result',payload:{}},{type:'decision',payload:{abilityId, target}}]
		this.resultsQueue = []

		this.setInactivityTimeout()

		this.battleBlueprint = createBattleBlueprintFromDescriptor(battleDescriptor, userConnections)

		this.model = BattleModel.createFromBlueprint(_.cloneDeep(this.battleBlueprint))
		this.simulator = new AIBattleSimulator(this.model, this.resultsQueue)

		_.each(this.userConnections, (userConnection) => {
			const myTeamId = this.teamIds[userConnection.getUsername()]
			userConnection.onSupervisedBattleStart(this, { battleBlueprint: this.battleBlueprint, myTeamId })
		})

		this.advanceSimAndSendResults()
	}
	clearInactivityTimeout() {
		if (this.timeout) {
			clearTimeout(this.timeout)
			this.timeout = undefined
		}
	}
	setInactivityTimeout() {
		this.clearInactivityTimeout()
		this.timeout = setTimeout(() => {
			console.log(`(SupervisedBattle) inactivity timeout! terminating battle.`)
			this.simulator.applyResult({ type: 'Victory', victoryState: { winningTeamId: undefined, reason: 'InactivityTimeout' } })
			this.sendQueuedResults()
			this.terminate()
		}, INACTIVITY_TIMEOUT_SECONDS * 1000)
	}
	terminate() {
		this.clearInactivityTimeout()
		const victoryState = this.model.getVictoryState()
		// unregister with supervisedBattleRegistrar (so users don't get reconnected to this battle, and we can be garbage collected)
		this.onBattleCompleteCallback(victoryState)
	}
	reconnectUser(userConnection) {
		this.userConnections[userConnection.getUsername()] = userConnection
		const myTeamId = this.teamIds[userConnection.getUsername()]
		const previousResults = []
		_.each(this.completeBattleLog, ({ type, payload }) => {
			if (type === 'result') {
				previousResults.push(payload)
			}
		})
		userConnection.onSupervisedBattleStart(this, { battleBlueprint: this.battleBlueprint, myTeamId, previousResults })
	}
	advanceSimAndSendResults() {
		//console.log(`(SupervisedBattle) advanceSimAndSendResults`)
		this.simulator.advanceWithAI()
		this.sendQueuedResults()
		const victoryState = this.model.getVictoryState()
		if (victoryState) {
			console.log(`(SupervisedBattle) victory! terminating battle.`)
			this.terminate()
		}
	}
	sendQueuedResults() {
		_.each(this.userConnections, (userConnection) => {
			if (userConnection) { // when a user is disconnected, this.userConnections is { 'username0': undefined }
				userConnection.onSupervisedBattleResults(this.resultsQueue)
			}
		})
		_.each(this.resultsQueue, (result) => {
			this.completeBattleLog.push({ type: 'result', time: Date.now(), payload: result })
		})
		this.resultsQueue.length = 0
	}

	onUserDisconnected(userConnection) {
		this.userConnections[userConnection.getUsername()] = undefined
	}
	onUserDecision(userConnection, abilityId, target) { // called by userConnection
		// TODO: validate that it's the correct user
		this.completeBattleLog.push({ type: 'decision', time: Date.now(), payload: { abilityId, target } })
		this.simulator.executeDecision(abilityId, target)
		this.advanceSimAndSendResults()
	}
}
