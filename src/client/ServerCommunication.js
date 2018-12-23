import serverConnection from './serverConnection.js'

export default new class ServerCommunication extends EventEmitter3 {
	constructor() {
		super()
	}

	send(type, payload) {
		serverConnection.send(type, payload)
	}

	init(loginPayload) {

		serverConnection.on('error', (payload) => {
			console.error(`[Server Error]`, payload)
		})
		serverConnection.on('disconnect', () => {
			this.emit('disconnect')
		})
		serverConnection.on('log', (payload) => {
			console.log(`[Server Log]`, payload)
		})
		serverConnection.on('updateLoginPayload', (payload) => {
			console.log(`[Server] localStorage loginPayload updated from server:`, payload)
			serverConnection.setLoginPayload(payload)
			this.emit('updateLoginPayload', JSON.stringify(payload))
		})
		serverConnection.on('userConnectedElsewhere', (payload) => {
			console.log(`[Server] userConnectedElsewhere`)
			serverConnection.disconnect()
			this.emit('halt', 'userConnectedElsewhere')
		})
		serverConnection.on('welcomeLocalControl', (payload) => { // login successful and there is no supervised battle to reconnect to (empty payload)
			this.emit('connect')
			this.emit('localControl')
		})
		serverConnection.on('welcomeContinueSupervisedBattle', (payload) => {
			this.emit('connect')
			const { battleBlueprint, previousResults, myTeamId, timerDetails } = payload
			this.emit('supervisedBattleStart', battleBlueprint, myTeamId, timerDetails, previousResults)
		})
		serverConnection.on('resultsAndTimer', (payload) => {
			const { results, timerDetails } = payload
			this.emit('resultsAndTimer', results, timerDetails)
		})

		serverConnection.setLoginPayload(loginPayload)
		serverConnection.connect()

	}
}
