import WebSocket from 'ws'
import staticServer from './staticServer.js'

import * as sampleBattleGenerator from './../battle/sampleBattleGenerator.js'
import AIBattleSimulator from './../battle/AIBattleSimulator.js'
import BattleModel from './../battle/BattleModel.js'

class ServerBattle {
	constructor() {
		this.observers = []
		this.resultsQueue = []

		const battleBlueprint = sampleBattleGenerator.build()
		this.model = BattleModel.createFromBlueprint(_.cloneDeep(battleBlueprint))
		this.simulator = new AIBattleSimulator(this.model, this.resultsQueue)

		this.advanceBattle()
	}
	advanceBattle() {
		this.simulator.advanceWithAI()
		this.sendQueuedResults()
	}
	executeDecision(abilityId, target) {
		// TODO: make sure it's the requesting player's turn!
		this.simulator.executeDecision(abilityId, target)
		this.advanceBattle()
	}
	sendQueuedResults() {
		_.each(this.observers, observer => {
			observer.sendResults(this.resultsQueue)
		})
		this.resultsQueue.length = 0
	}
	
}

const theOneBattle = new ServerBattle()

let playerCounter = 0


class ConnectedPlayer {
	constructor(wsConnection, teamId) {
		this.teamId = teamId
		this.wsConnection = wsConnection
		theOneBattle.observers.push({
			sendResults(results) {
				this.wsConnection.send(JSON.stringify(results))
			}
		})
		this.wsConnection.on('message', (message) => {
		})
	}
}




const wsServer = new WebSocket.Server({ port: 9090 })

wsServer.on('connection', (wsConnection) => {

	new ConnectedPlayer(wsConnection, playerCounter)
	playerCounter += 1

	//wsConnection.on('message', (message) => {
	//	console.log('received: %s', message)
	//})
	//
	//wsConnection.send('server acknowledges connection')
})

