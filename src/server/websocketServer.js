import WebSocket from 'ws'
import http from 'http'

const server = http.createServer()

const wsServer = new WebSocket.Server({ server })
export default wsServer

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
	wsConnection.on('pong', () => {
		wsConnection.isAlive = true
	})
	wsConnection.on('close', (code, reason) => {
		// for consistency, also emit 'terminate'
		wsConnection.emit('terminate')
	})
})

server.listen(9090, function () {
	console.log('(websocketServer) Listening on port 9090');
})
