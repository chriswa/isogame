import * as clientGameLoop from './clientGameLoop.js'
import LocalBattleAuthority from './LocalBattleAuthority.js'
import * as sampleBattleGenerator from '../battle/sampleBattleGenerator.js'
import serverConnection from './serverConnection.js'
import RemoteBattleAuthority from './RemoteBattleAuthority.js'

/** @type BattleController */

let battleAuthority = undefined






serverConnection.on('log', (payload) => {
	console.log(`[Server Log]`, payload)
})
serverConnection.on('userConnectedElsewhere', (payload) => {
	console.log(`[Server] userConnectedElsewhere, TODO: don't try to reconnect`)
})
serverConnection.on('startSupervisedBattle', (payload) => {
	const battleBlueprint = payload.battleBlueprint
	const previousResults = payload.previousResults
	const myTeamId = payload.myTeamId
	// TODO: store any existing local battle to be returned to after
	const decisionCallback = (abilityId, target) => {
		serverConnection.send('decision', { abilityId, target })
	}
	battleAuthority = new RemoteBattleAuthority(battleBlueprint, myTeamId, previousResults, decisionCallback)
})
serverConnection.on('results', (payload) => {
	battleAuthority.addResults(payload) // assuming battleAuthority is a RemoteBattleAuthority!
})
serverConnection.on('battleComplete', (payload) => {
	console.log(`(client) supervised battle complete: ${payload.victoryState}`)
	battleAuthority = undefined // assuming battleAuthority is the RemoteBattleAuthority!
})
serverConnection.setLoginPayload({
	username: 'bob',
	password: 'pass',
	signup: undefined,
})
serverConnection.connect()

// MORE TESTING
window.TEST = {}
window.TEST.startChallenge = () => {
	setTimeout(() => { serverConnection.send('startChallenge', { challengeId: 'whatever' }) }, 1000)
}
window.TEST.sendDecision = () => {
	setTimeout(() => { serverConnection.send('decision', { abilityId: 0, target: 0 }) }, 2000)
}


function startLocalBattle() {
	const battleBlueprint = sampleBattleGenerator.build()
	battleAuthority = new LocalBattleAuthority(battleBlueprint)
	battleAuthority.on('battleComplete', victoryState => {
		console.log(`(client) local battle complete: ${victoryState}`)
		battleAuthority = undefined
	})
}

window.TEST.startLocal = () => {
	startLocalBattle()
}
setTimeout(() => {
	console.log(`window.TEST functions available: ` + _.map(_.keys(window.TEST), k => `TEST.${k}()`).join(', '))
}, 500)



// main game loop (e.g. debugCanvas.clear, input.update, gfx.clear)
clientGameLoop.start(
	// update
	(dt) => {
		if (battleAuthority) {
			battleAuthority.update(dt)
		}
	},
	// render
	() => {
		if (battleAuthority) {
			battleAuthority.render()
		}
	}
)


