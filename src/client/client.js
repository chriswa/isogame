import * as clientGameLoop from './clientGameLoop.js'
import LocalBattleAuthority from './LocalBattleAuthority.js'
import * as sampleBattleGenerator from '../battle/sampleBattleGenerator.js'
import serverConnection from './serverConnection.js'
import RemoteBattleAuthority from './RemoteBattleAuthority.js'

/** @type BattleController */

let battleAuthority = undefined



let loginPayload = window.localStorage.getItem('loginPayload')
loginPayload = loginPayload ? JSON.parse(loginPayload) : undefined
console.log(`loginPayload from localStorage:`, loginPayload)





serverConnection.on('log', (payload) => {
	console.log(`[Server Log]`, payload)
})
serverConnection.on('updateLoginPayload', (payload) => {
	console.log(`[Server] localStorage loginPayload updated from server:`, payload)
	window.localStorage.setItem('loginPayload', JSON.stringify(payload))
})
serverConnection.on('userConnectedElsewhere', (payload) => {
	console.log(`[Server] userConnectedElsewhere`)
	serverConnection.disconnect()
	alert(`Your account connected from another device, which disconnected this device. Reload this page to reconnect.`)
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


function startLocalBattle() {
	const battleBlueprint = sampleBattleGenerator.build()
	battleAuthority = new LocalBattleAuthority(battleBlueprint)
}




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





window.TEST = {
	login(newLoginPayload) {
		loginPayload = newLoginPayload
		window.localStorage.setItem('loginPayload', JSON.stringify(newLoginPayload))
		location.reload()
	},
	startChallenge() {
		serverConnection.send('startChallenge', { challengeId: 'whatever' })
	},
	sendDecision() {
		serverConnection.send('decision', { abilityId: 0, target: 0 })
	},
	matchMakerSubscribe() {
		serverConnection.send('matchMakerSubscribe', { matchType: 'SIMPLE_PVP' })
	},
	matchMakerUnsubscribe() {
		serverConnection.send('matchMakerUnsubscribe', { matchType: 'SIMPLE_PVP' })
	},
	matchMakerUnsubscribeAll() {
		serverConnection.send('matchMakerUnsubscribeAll', {})
	},
	startLocal() {
		startLocalBattle()
	},
}
setTimeout(() => {
	console.log(`window.TEST functions available: ` + _.map(_.keys(window.TEST), k => `TEST.${k}()`).join(', '))
}, 500)
