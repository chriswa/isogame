import supervisedBattleRegistrar from './supervisedBattleRegistrar.js'

const matchTypes = [
	'SIMPLE_PVP'
]

class Subscription {
	constructor(userConnection, matchType) {
		this.userConnection = userConnection
		this.matchType = matchType // unnecessary?
		this.createdTime = Date.now()
	}
	getAge() {
		return Date.now() - this.createdTime
	}
}

setInterval(() => {
	matchMaker.update()
}, 3000)

const matchMaker = new class MatchMaker {
	constructor() {
		this.subscriptionsByMatchType = {} // e.g. { 'SIMPLE_PVP': { 'user1': subscription1, 'user2': subscription2 } }
		_.each(matchTypes, matchType => { this.subscriptionsByMatchType[matchType] = {} })
	}

	update() {
		_.each(this.subscriptionsByMatchType, (subscriptionsForThisMatchType, matchType) => {
			// TODO: look for acceptable pairings of players, depending on ELO difference and subscription age
			const subscriptions = _.values(subscriptionsForThisMatchType)
			if (subscriptions.length >= 2) {
				const userConnection0 = subscriptions[0].userConnection
				const userConnection1 = subscriptions[1].userConnection
				this.unsubscribeAll(userConnection0)
				this.unsubscribeAll(userConnection1)
				this.startBattle(matchType, userConnection0, userConnection1)
			}
		})
	}
	startBattle(matchType, userConnection0, userConnection1) {
		console.log(`(matchMaker) startBattle: ${userConnection0.getUsername()} vs ${userConnection1.getUsername()}`)
		// n.b. UserConnection.onSupervisedBattleStart will call matchMaker.unsubscribeAll
		const battleDescriptor = { type: 'pvp', matchType }
		const isTurnTimed = true
		supervisedBattleRegistrar.startBattle(battleDescriptor, [userConnection0, userConnection1], isTurnTimed, (victoryState) => {
			console.log(`(matchMaker) battle complete: TODO: update users' ELOs from victoryState: ${JSON.stringify(victoryState)} (but don't use userConnections, since they may have disconnected, and potentially also reconnected)`)
		})
	}

	// UserConnection API: subscribe, unsubscribe, unsubscribeAll
	subscribe(userConnection, matchType) {
		const username = userConnection.getUsername()
		this.subscriptionsByMatchType[matchType][username] = new Subscription(userConnection, matchType)
	}
	unsubscribe(userConnection, matchType) {
		const username = userConnection.getUsername()
		delete this.subscriptionsByMatchType[matchType][username]
	}
	unsubscribeAll(userConnection) {
		const username = userConnection.getUsername()
		_.each(this.subscriptionsByMatchType, (subscriptionsForThisMatchType, matchType) => {
			delete subscriptionsForThisMatchType[username]
		})
	}
	
}

export default matchMaker