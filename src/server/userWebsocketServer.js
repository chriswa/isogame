import WebSocket from 'ws'
import wsServer from './websocketServer.js'
import UserAuthenticator from './UserAuthenticator.js'
import UserConnection from './UserConnection.js'
import version from './version.js'
import chalk from 'chalk'


/** @type {Object.<string, UserConnection>} */
const userConnections = {} // keyed by username


const newUserData = { version, campaign: 0, elo: 1500, }
const userAuthenticator = new UserAuthenticator(wsServer, newUserData)

userAuthenticator.on('authenticated', ({ wsConnection, userAccount }) => {
	const previousConnection = userConnections[userAccount.username]
	if (previousConnection) {
		console.error(chalk.cyan(`(userWebsocketServer) user ${userAccount.username} is already connected! terminating previous connection`))
		if (previousConnection.readyState === WebSocket.OPEN) {
			previousConnection.send('userConnectedElsewhere') // tell previous client not to try to automatically reconnect!
			previousConnection.disconnect()
		}
	}

	userConnections[userAccount.username] = new UserConnection(wsConnection, userAccount)

	console.log(chalk.cyan(`(userWebsocketServer) connected: '${userAccount.username}' - now ${_.size(userConnections)} user(s) connected`))
	
	wsConnection.on('terminate', () => { // custom event emitted by websocketServer.js when a heartbeat fails, causing connection termination, or the connection is closed normally
		delete userConnections[userAccount.username]
		console.log(chalk.cyan(`(userWebsocketServer) disconnected: '${userAccount.username}' - now ${_.size(userConnections)} user(s) connected`))
		// n.b. UserConnection also listens for this event
	})
})

export default wsServer // meh
