import WebSocket from 'ws'
import fs from 'fs'
import http from 'http'
import https from 'https'
import EventEmitter from 'events'

export default new class WebsocketServerWrapper extends EventEmitter {
	constructor() {
		super()
		this.initWs()
		this.initWss()
	}
	initWebsocket(wsServer) {
		// manage broken connections with a heartbeat ping
		const intervalMs = 30000
		setInterval(() => {
			wsServer.clients.forEach((wsConnection) => {
				if (wsConnection.isAlive === false) {
					wsConnection.emit('terminate')
					wsConnection.terminate()
				}
				else {
					wsConnection.isAlive = false
					if (wsConnection.readyState === WebSocket.OPEN) {
						wsConnection.ping()
					}
				}
			})
		}, intervalMs)

		wsServer.on('connection', (wsConnection) => {
			wsConnection.isAlive = true
			wsConnection.safeSendObject = (obj) => {
				if (wsConnection.readyState === WebSocket.OPEN) {
					wsConnection.send(JSON.stringify(obj))
				}
			}
			wsConnection.on('pong', () => {
				wsConnection.isAlive = true
			})
			wsConnection.on('close', (code, reason) => {
				// for consistency, also emit 'terminate'
				wsConnection.emit('terminate')
			})

			// fire connection event from WebsocketServerWrapper so that consumers can listen to us just like a WebSocket.Server
			this.emit('connection', wsConnection)
		})

	}
	initWs() {
		const httpServer = http.createServer()
		const wsServer = new WebSocket.Server({ server: httpServer })
		this.initWebsocket(wsServer)
		httpServer.listen(9090, () => {
			console.log('Websocket Server listening on port 9090');
		})
	}
	initWss() {
		const sslCertDir = '../sslcert'
		if (fs.existsSync(sslCertDir)) {
			const httpsServer = https.createServer({
				cert: fs.readFileSync(`${sslCertDir}/certificate.pem`),
				key: fs.readFileSync(`${sslCertDir}/key.pem`),
			})
			const wssServer = new WebSocket.Server({ server: httpsServer })
			this.initWebsocket(wssServer)
			httpsServer.listen(9191, () => {
				console.log('Secure Websocket Server listening on port 9191');
			})
		}
	}
}

