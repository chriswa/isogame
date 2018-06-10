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
		console.error(`user ${userAccount.username} is already connected! terminating previous connection`)
		previousConnection.send('userConnectedElsewhere') // tell previous client not to try to automatically reconnect!
		previousConnection.disconnect()
	}

	console.log(chalk.cyan(`(userWebsocketServer) connected: '${userAccount.username}'`))

	userConnections[userAccount.username] = new UserConnection(wsConnection, userAccount)

	wsConnection.on('terminate', () => { // custom event emitted by websocketServer.js when a heartbeat fails, causing connection termination, or the connection is closed normally
		console.log(chalk.cyan(`(userWebsocketServer) disconnected: '${userAccount.username}'`))
		delete userConnections[userAccount.username]
		// n.b. UserConnection also listens for this event
	})
})

export default wsServer // meh
