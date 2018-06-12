export default new class ServerConnection extends EventEmitter3 {
	constructor() {
		super()
		this.socket = undefined
		this.loginPayload = undefined
		this.isOkayToConnect = false
	}
	setLoginPayload(newLoginPayload) {
		this.loginPayload = newLoginPayload
	}
	disconnect() {
		this.isOkayToConnect = false
		if (this.socket) {
			this.socket.close()
			this.socket = undefined
		}
	}
	connect() {
		this.isOkayToConnect = true
		this.connectIfOkay()
	}
	connectIfOkay() {
		if (!this.isOkayToConnect) {
			return
		}
		if (this.socket) {
			console.warn('serverConnection: attempted to connect() when already connected?!')
			return
		}

		let openingSocket = new WebSocket('ws://localhost:9090')

		openingSocket.onopen = () => {
			this.socket = openingSocket
			// on the server, UserAuthenticator requires we send a login message first!
			this.send('login', this.loginPayload)
		}

		openingSocket.onclose = () => {
			console.log('(serverConnection) WebSocket closed! Attempting reconnection...')
			this.socket = undefined
			this.connectIfOkay()
		}

		openingSocket.onerror = (error) => {
			console.log('(serverConnection) WebSocket error', error)
		}

		openingSocket.onmessage = (e) => {
			const messageStr = e.data
			//console.log('WebSocket Recv', messageStr)
			//console.log(messageStr)
			const [type, payload] = JSON.parse(messageStr)
			this.emit(type, payload)

			if (this.listenerCount(type) === 0) {
				console.warn(`(serverConnection) message type "${type}" has no listener!`)
			}
		}
	}
	send(type, payload) {
		if (this.socket) {
			this.socket.send(JSON.stringify([type, payload]))
		}
	}

}

