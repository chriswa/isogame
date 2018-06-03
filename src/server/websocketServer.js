import WebSocket from 'ws'

const wsServer = new WebSocket.Server({ port: 9090 })
export default wsServer

// manage broken connections with a heartbeat ping
const intervalMs = 30000
setInterval(() => {
	wsServer.clients.forEach((wsConnection) => {
		if (wsConnection.isAlive === false) {
			wsConnection.emit('terminate')
			wsConnection.terminate()
			clearInterval(interval)
			return
		}
		wsConnection.isAlive = false
		wsConnection.ping()
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

