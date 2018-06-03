import db from './db.js'
import EventEmitter from 'events'
import UserAccount from './UserAccount.js'

export default class UserAuthenticator extends EventEmitter {
	constructor(wsServer, newUserRecord) {
		super()

		// authenticate websocket connections
		wsServer.on('connection', (wsConnection) => {

			function closeWithError(error) {
				console.error(`(UserAuthenticator) closeWithError: ${error}`)
				wsConnection.send(JSON.stringify(['error', error]))
				wsConnection.close()
			}

			// wait for authentication message
			wsConnection.once('message', (messageStr) => {
				const [type, payload] = JSON.parse(messageStr)
				if (type !== 'login') { return closeWithError(`expecting a 'login' message first`) }
				const { username, password, isSignup } = payload
				const userKey = username // TODO: check for filesystem vulnerabilities with special characters in usernames
				let userRecord = db.user.get(userKey, undefined)

				const saveUserRecord = () => {
					db.user.set(userKey, userRecord)
				}

				// signup?
				if (isSignup) {
					if (userRecord) {
						return closeWithError("username already exists")
					}
					userRecord = { password, ...newUserRecord }
					db.user.set(userKey, userRecord) // TODO: for production, this async call should be transactional to prevent two users creating the same username atst
				}

				// authenticate password
				if (!userRecord || userRecord.password !== password) {
					return closeWithError("invalid username or password")
				}

				userRecord.lastLogin = new Date()
				saveUserRecord()

				const userAccount = new UserAccount(username, userRecord, saveUserRecord)

				this.emit('authenticated', { wsConnection, userAccount })

			})
		})
	}
}
