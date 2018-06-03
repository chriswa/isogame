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
			const userConnections = _.values(subscriptionsForThisMatchType)
			if (userConnections.length >= 2) {
				this.startBattle(matchType, userConnections[0], userConnections[1])
			}
		})
	}
	startBattle(matchType, userConnection0, userConnection1) {
		// n.b. UserConnection.onSupervisedBattleStart will call matchMaker.unsubscribeAll
		supervisedBattleRegistrar.startBattle(matchType, [ userConnection0, userConnection1 ])
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