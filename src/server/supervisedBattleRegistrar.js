import SupervisedBattle from './SupervisedBattle.js'

export default new class SupervisedBattleRegistrar {
	constructor() {
		this.usernamesToBattles = {}
		this.battleCount = 0
	}
	reconnectUser(userConnection) {
		const username = userConnection.getUsername()
		/** @type {SupervisedBattle} */
		const battle = this.usernamesToBattles[username]
		if (battle) {
			battle.reconnectUser(userConnection)
			return true
		}
		else {
			return false
		}
	}
	startBattle(battleDescriptor, userConnections) { // called by matchMaker (for pvp) or UserConnection (for single-player challenges)
		const usernamesVerbose = _.map(userConnections, uc => `"${uc.getUsername()}"`).join(', ')

		// prepare a callback to remove registry entries later
		const onBattleComplete = () => {
			_.each(userConnections, (userConnection) => {
				const username = userConnection.getUsername()
				delete this.usernamesToBattles[username]
			})

			this.battleCount -= 1
			console.log(`(supervisedBattleRegistrar) battle complete for ${usernamesVerbose} - now ${this.battleCount} supervised battles`)
		}
		// create a SupervisedBattle, which will call userConnection.onSupervisedBattleStart
		const battle = new SupervisedBattle(battleDescriptor, userConnections, onBattleComplete)
		// add userConnections to registry by username
		_.each(userConnections, (userConnection) => {
			const username = userConnection.getUsername()
			this.usernamesToBattles[username] = battle
		})

		this.battleCount += 1
		console.log(`(supervisedBattleRegistrar) started battle for ${usernamesVerbose} - now ${this.battleCount} supervised battles`)
	}
}
