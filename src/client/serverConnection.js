export default new class ServerConnection extends EventEmitter3 {
	constructor() {
		super()
		this.socket = undefined
		this.loginPayload = {}
	}
	setLoginPayload(newLoginPayload) {
		this.loginPayload = newLoginPayload
	}
	connect() {
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
			console.log('WebSocket Closed')
			this.socket = undefined
		}

		openingSocket.onerror = (error) => {
			console.log('WebSocket Error', error)
		}

		openingSocket.onmessage = (e) => {
			const messageStr = e.data
			//console.log('WebSocket Recv', messageStr)
			//console.log(messageStr)
			const [type, payload] = JSON.parse(messageStr)
			this.emit(type, payload)
		}
	}
	send(type, payload) {
		if (this.socket) {
			this.socket.send(JSON.stringify([type, payload]))
		}
	}

}

