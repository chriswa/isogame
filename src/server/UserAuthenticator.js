import db from './db.js'
import EventEmitter from 'events'
import UserAccount from './UserAccount.js'
import safeJsonParse from '../util/safeJsonParse.js'

export default class UserAuthenticator extends EventEmitter {
	constructor(wsServer, newUserRecord) {
		super()
		this.newUserRecord = newUserRecord

		// authenticate websocket connections
		wsServer.on('connection', (wsConnection) => {

			// wait for authentication message
			wsConnection.once('message', (messageStr) => {
				const message = safeJsonParse(messageStr)
				if (!_.isArray(message)) { return this.closeWithError(wsConnection, `malformed message: not an array`) }
				const [type, payload] = message
				if (type !== 'login') { return this.closeWithError(wsConnection, `first message must be of type 'login'`) }

				if (!payload) {
					this.createGuestAccount(wsConnection)
				}
				else {
					this.loginWithPayload(wsConnection, payload)
				}

				/*
				const { username, password } = payload
				const username = username // TODO: check for filesystem vulnerabilities with special characters in usernames
				let userRecord = db.user.get(username, undefined)

				const saveUserRecord = () => {
					db.user.set(username, userRecord)
				}

				// signup?
				if (isSignup) {
					if (userRecord) {
						return this.closeWithError(wsConnection, "username already exists")
					}
					userRecord = { password, ...newUserRecord }
					db.user.set(username, userRecord) // TODO: for production, this async call should be transactional to prevent two users creating the same username atst
				}

				*/
			})
		})
	}
	createGuestAccount(wsConnection) {
		const characterSet = 'abcdefghijklmnopqrstuvwxyz'.split('')
		let username = undefined
		while (true) {
			username = '_guest_' + _.map(_.range(10), () => _.sample(characterSet)).join('')
			if (!db.user.get(username, undefined)) { break }
		}
		const password = '_pass_' + _.map(_.range(20), () => _.sample(characterSet)).join('')

		let userRecord = {
			username,
			password,
			created: new Date(),
			...this.newUserRecord,
		}

		wsConnection.safeSendObject(['log', `Welcome, new user! Assigning automatic username and password.`])
		wsConnection.safeSendObject(['updateLoginPayload', { username, password }])

		this.finalizeLogin(wsConnection, username, userRecord)
	}
	loginWithPayload(wsConnection, loginPayload) {
		const { username, password } = loginPayload

		let userRecord = db.user.get(username, undefined)

		// authenticate password
		if (!userRecord || userRecord.password !== password) {

			wsConnection.safeSendObject(['updateLoginPayload', undefined])

			return this.closeWithError(wsConnection, "invalid username or password")
		}

		this.finalizeLogin(wsConnection, username, userRecord)
	}
	finalizeLogin(wsConnection, username, userRecord) {

		const saveUserRecord = () => {
			db.user.set(username, userRecord)
		}

		userRecord.lastLogin = new Date()
		saveUserRecord()

		const userAccount = new UserAccount(username, userRecord, saveUserRecord)

		this.emit('authenticated', { wsConnection, userAccount })
	}
	closeWithError(wsConnection, error) {
		console.error(`(UserAuthenticator) closeWithError: ${error}`)
		wsConnection.safeSendObject(['error', error])
		wsConnection.close()
	}
}
