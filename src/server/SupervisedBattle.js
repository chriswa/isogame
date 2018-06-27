import * as sampleBattleGenerator from './../battle/sampleBattleGenerator.js'
import AIBattleSimulator from './../battle/AIBattleSimulator.js'
import BattleModel from './../battle/BattleModel.js'
import UserConnection from './UserConnection.js'
import TurnTimer from './TurnTimer.js'
import NullTurnTimer from './NullTurnTimer.js'

const turnTimerMs = 1000 * 60

function createBattleBlueprintFromDescriptor(battleDescriptor, userConnections) {
	// TODO: depending on battleDescriptor, take some data from userConnections (e.g. if it's pvp, look for a hunting team config for this match type)
	const battleBlueprint = sampleBattleGenerator.build(battleDescriptor)
	return battleBlueprint
}

const INACTIVITY_TIMEOUT_SECONDS = 60 * 5

export default class SupervisedBattle {
	constructor(battleDescriptor, userConnections, isTurnTimed, onBattleCompleteCallback) {
		this.battleDescriptor = battleDescriptor
		/** @type {Array<UserConnection>} */
		this.userConnections = _.fromPairs(_.map(userConnections, (userConnection) => [ userConnection.getUsername(), userConnection ])) // { 'username0': uc0 }
		this.teamIds = _.fromPairs(_.map(userConnections, (userConnection, index) => [userConnection.getUsername(), index]))
		this.onBattleCompleteCallback = onBattleCompleteCallback

		this.completeBattleLog = [] // [{type:'result',payload:{}},{type:'decision',payload:{abilityId, target}}]
		this.resultsQueue = []

		this.setInactivityTimeout()

		const turnTimerClass = isTurnTimed ? TurnTimer : NullTurnTimer
		this.turnTimer = new turnTimerClass(turnTimerMs)
		this.turnTimer.on('timeout', (teamId) => {
			console.log(`(SupervisedBattle) TurnTimer timeout! teamId = ${teamId} - terminating battle!`)
			this.simulator.applyResult({ type: 'Victory', victoryState: { winningTeamId: teamId, reason: 'TurnTimeout' } })
			this.sendQueuedResultsAndTimer()
			this.terminate()
		})

		this.battleBlueprint = createBattleBlueprintFromDescriptor(battleDescriptor, userConnections)

		this.model = BattleModel.createFromBlueprint(_.cloneDeep(this.battleBlueprint))
		this.simulator = new AIBattleSimulator(this.model, this.resultsQueue)

		_.each(this.userConnections, (userConnection) => {
			const myTeamId = this.getTeamIdForUserConnection(userConnection)
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
			this.sendQueuedResultsAndTimer()
			this.terminate()
		}, INACTIVITY_TIMEOUT_SECONDS * 1000)
	}
	terminate() {
		this.clearInactivityTimeout()
		this.turnTimer.destroy()
		const victoryState = this.model.getVictoryState()
		// unregister with supervisedBattleRegistrar (so users don't get reconnected to this battle, and we can be garbage collected)
		this.onBattleCompleteCallback(victoryState, this.userConnections)
	}
	getTeamIdForUserConnection(userConnection) {
		return this.teamIds[userConnection.getUsername()]
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
		const timerDetails = this.turnTimer.getTimerDetails()
		userConnection.onSupervisedBattleStart(this, { battleBlueprint: this.battleBlueprint, myTeamId, timerDetails, previousResults })
	}
	advanceSimAndSendResults() {
		//console.log(`(SupervisedBattle) advanceSimAndSendResults`)
		this.simulator.advanceWithAI()
		const freeTimeMs = this.sumAnimationTimeMs(this.resultsQueue)
		this.turnTimer.start(this.simulator.getActiveTeamId(), freeTimeMs)
		this.setInactivityTimeout()
		this.sendQueuedResultsAndTimer()
		const victoryState = this.model.getVictoryState()
		if (victoryState) {
			console.log(`(SupervisedBattle) victory! terminating battle.`)
			this.terminate()
		}
	}
	sumAnimationTimeMs(results) {
		let animationTimeMs = 0
		_.each(this.resultsQueue, (result) => {
			animationTimeMs += 100 // TODO: this should come from Result class, after Animation and Applier have been recombined!
		})
		return animationTimeMs
	}
	sendQueuedResultsAndTimer() {
		const timerDetails = this.turnTimer.getTimerDetails()
		_.each(this.userConnections, (userConnection) => {
			if (userConnection) { // when a user is disconnected, this.userConnections is { 'username0': undefined }; skip disconnected users
				userConnection.onSupervisedBattleResults(this.resultsQueue, timerDetails)
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
		const requestorTeamId = this.getTeamIdForUserConnection(userConnection)
		this.completeBattleLog.push({ type: 'decision', time: Date.now(), requestorTeamId, payload: { abilityId, target } })
		this.simulator.executeDecision(abilityId, target, requestorTeamId)
		this.advanceSimAndSendResults()
	}
}
