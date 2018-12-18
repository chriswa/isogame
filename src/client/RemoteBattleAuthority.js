import BaseBattleAuthority from './BaseBattleAuthority.js'

export default class RemoteBattleAuthority extends BaseBattleAuthority {
	constructor(battleBlueprint, myTeamId, timerDetails, previousResults) {
		super(battleBlueprint, myTeamId)

		this.initBattleController(previousResults)

		this.battleController.on('decision', ({ abilityId, target }) => {
			this.emit('decision', { abilityId, target })
		})

		this.battleController.setTurnClock(timerDetails)

	}
	addResults(results) {
		while (results.length) {
			const result = results.shift()
			this.battleController.addResult(result)
		}
	}
	setTurnClock(timerDetails) {
		this.battleController.setTurnClock(timerDetails)
	}
}

