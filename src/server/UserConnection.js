import version from './version.js'
import UserAccount from './UserAccount.js'
import matchMaker from './matchMaker.js'
import supervisedBattleRegistrar from './supervisedBattleRegistrar.js'
import SupervisedBattle from './SupervisedBattle.js'

const messageHandlers = {
	'matchMakerSubscribe': (uc, payload) => {
		matchMaker.subscribe(uc, payload.matchType)
	},
	'matchMakerUnsubscribe': (uc, payload) => {
		matchMaker.unsubscribe(uc, payload.matchType)
	},
	'matchMakerUnsubscribeAll': (uc, payload) => {
		matchMaker.unsubscribeAll(uc)
	},
	'startChallenge': (uc, payload) => {
		uc.handleMessageStartChallenge(payload)
	},
	'log': (uc, payload) => {
		console.log(`(UserConnection) user sent 'log' message: ${payload}`)
	},
	'decision': (uc, payload) => {
		uc.handleMessageDecision(payload)
	},
}

export default class UserConnection {
	constructor(wsConnection, userAccount) {
		this.wsConnection = wsConnection
		/** @type {UserAccount} */
		this.userAccount = userAccount
		/** @type {SupervisedBattle} */
		this.supervisedBattle = undefined

		//this.userAccount.data.foo = 'foo'
		//this.userAccount.save()

		this.send('log', `Welcome, ${this.userAccount.username}`)

		if (this.userAccount.data.version < version) {
			console.log(`TODO: upgrade old user account!`)
		}

		// reconnect user?
		supervisedBattleRegistrar.reconnectUser(this) // this may call userConnection.onSupervisedBattleStart, thus setting this.supervisedBattle
		if (!this.supervisedBattle) {
			this.send('log', `no supervised battle to reconnect to`)
		}

		this.wsConnection.on('terminate', () => { // custom event emitted by websocketServer.js when a heartbeat fails, causing connection termination, or the connection is closed normally
			this.onDisconnect()
		})

		this.wsConnection.on('message', (messageStr) => {
			console.log(`${this.userAccount.username} received a message from client: ${messageStr}`)
			const message = JSON.parse(messageStr)

			const [type, payload] = message

			const handler = messageHandlers[type]
			if (handler) {
				handler(this, payload)
			}
			else {
				console.error(`Error: Unknown ws message type from ${this.userAccount.username}!`)
			}
		})
	}
	disconnect() {
		this.wsConnection.terminate()
		this.onDisconnect()
	}
	onDisconnect() {
		matchMaker.unsubscribeAll(this)
		if (this.supervisedBattle) {
			this.supervisedBattle.onUserDisconnected(this)
		}
	}
	handleMessageStartChallenge(payload) { // called from messageHandlers['startChallenge']
		if (this.supervisedBattle) {
			return this.send('log', `can't start a challenge while a supervised battle is ongoing`)
		}
		// n.b. UserConnection.onSupervisedBattleStart will call matchMaker.unsubscribeAll
		supervisedBattleRegistrar.startBattle(payload.challengeId, [this])
	}
	handleMessageDecision(msg) { // called from messageHandlers['decision']
		if (this.supervisedBattle) {
			this.supervisedBattle.onUserDecision(this, msg.abilityId, msg.target)
		}
		else {
			console.error(`(UserConnection) user sent a decision message, but there is no active SupervisedBattle to send it to!`)
		}
	}
	getUsername() {
		return this.userAccount.username
	}
	onSupervisedBattleStart(supervisedBattle, payload) {
		this.supervisedBattle = supervisedBattle
		matchMaker.unsubscribeAll(this)
		this.send('startSupervisedBattle', payload)
	}
	onSupervisedBattleResults(results) {
		this.send('results', results)
	}
	send(type, payload) {
		this.wsConnection.send(JSON.stringify([ type, payload ]))
	}
}
