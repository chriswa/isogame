import SupervisedBattle from './SupervisedBattle.js'

export default new class SupervisedBattleRegistrar {
	constructor() {
		this.usernamesToBattles = {}
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
		// add userConnections to registry by username
		_.each(userConnections, (userConnection) => {
			const username = userConnection.getUsername()
			this.usernamesToBattles[username] = battle
		})
		// prepare a callback to remove them later
		const onBattleComplete = () => {
			_.each(userConnections, (userConnection) => {
				const username = userConnection.getUsername()
				delete this.usernamesToBattles[username]
			})
		}
		// create a SupervisedBattle, which will call userConnection.onSupervisedBattleStart
		const battle = new SupervisedBattle(battleDescriptor, userConnections, onBattleComplete)
	}
}
