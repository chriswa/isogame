import * as clientGameLoop from './clientGameLoop.js'
import LocalBattleAuthority from './LocalBattleAuthority.js'
import * as sampleBattleGenerator from '../battle/sampleBattleGenerator.js'
import serverConnection from './serverConnection.js'
import RemoteBattleAuthority from './RemoteBattleAuthority.js'

window.TEST = {}

/** @type BattleController */

let battleAuthority = undefined



let loginPayload = window.localStorage.getItem('loginPayload')
loginPayload = loginPayload ? JSON.parse(loginPayload) : {}
console.log(loginPayload)

window.TEST.login = (newLoginPayload) => {
	loginPayload = newLoginPayload
	window.localStorage.setItem('loginPayload', JSON.stringify(newLoginPayload))
	location.reload()
}




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
serverConnection.setLoginPayload(loginPayload)
serverConnection.connect()

// MORE TESTING
window.TEST.startChallenge = () => {
	serverConnection.send('startChallenge', { challengeId: 'whatever' })
}
window.TEST.sendDecision = () => {
	serverConnection.send('decision', { abilityId: 0, target: 0 })
}
window.TEST.matchMakerSubscribe = () => {
	serverConnection.send('matchMakerSubscribe', { matchType: 'SIMPLE_PVP' })
}
window.TEST.matchMakerUnsubscribe = () => {
	serverConnection.send('matchMakerUnsubscribe', { matchType: 'SIMPLE_PVP' })
}
window.TEST.matchMakerUnsubscribeAll = () => {
	serverConnection.send('matchMakerUnsubscribeAll', {})
}


function startLocalBattle() {
	const battleBlueprint = sampleBattleGenerator.build()
	battleAuthority = new LocalBattleAuthority(battleBlueprint)
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


