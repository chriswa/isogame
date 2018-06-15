import * as clientGameLoop from './clientGameLoop.js'
import LocalBattleAuthority from './LocalBattleAuthority.js'
import * as sampleBattleGenerator from '../battle/sampleBattleGenerator.js'
import serverConnection from './serverConnection.js'
import RemoteBattleAuthority from './RemoteBattleAuthority.js'
import TownGUI from '../gui/town/TownGUI.js'
import FSM from '../util/FSM.js'

// ============
//  CLIENT FSM
// ============

let battleAuthority = undefined // undefined if no active battle, otherwise either LocalBattleAuthority or RemoteBattleAuthority
const clientFSM = new FSM({
	authenticating: {
		onEnterState() {
			console.log(`(clientFSM) authenticating...`)
		},
	},
	locked: {
		onEnterState() {
			console.log(`(clientFSM) locked! reload the page`)
		},
	},
	town: {
		onEnterState() {
			console.log(`(clientFSM) welcome to town!`)
			battleAuthority = undefined
			TownGUI.isActive = true
		},
		onExitState() {
			TownGUI.isActive = false
		},
	},
	localBattle: {
		update(dt) { battleAuthority.update(dt) },
		render() { battleAuthority.render() },
	},
	supervisedBattle: {
		update(dt) { battleAuthority.update(dt) },
		render() { battleAuthority.render() },
	},
})
clientFSM.setState('authenticating') // initial state


// ================
//  MAIN GAME LOOP 
// ================

// main game loop (e.g. debugCanvas.clear, input.update, gfx.clear)
clientGameLoop.start(
	// update
	(dt) => {
		const update = clientFSM.state.update
		if (update) {
			update(dt)
		}
	},
	// render
	() => {
		const render = clientFSM.state.render
		if (render) {
			render()
		}
	}
)


// ======
//  TOWN 
// ======

TownGUI.$on('startLocal', () => {
	startLocalBattle()
})
TownGUI.$on('startChallenge', () => {
	serverConnection.send('startChallenge', { challengeId: 'CHALLENGE_1' })
})
TownGUI.$on('matchMakerSubscribe', () => {
	serverConnection.send('matchMakerSubscribe', { matchType: 'SIMPLE_PVP' })
})
TownGUI.$on('matchMakerUnsubscribe', () => {
	serverConnection.send('matchMakerUnsubscribe', { matchType: 'SIMPLE_PVP' })
})
TownGUI.$on('matchMakerUnsubscribeAll', () => {
	serverConnection.send('matchMakerUnsubscribeAll', undefined)
})

let localBattleAuthority = undefined

function startLocalBattle() {
	clientFSM.setState('localBattle')
	const battleBlueprint = sampleBattleGenerator.build()
	battleAuthority = new LocalBattleAuthority(battleBlueprint)
	localBattleAuthority = battleAuthority
	battleAuthority.on('dismiss', () => {
		localBattleAuthority = undefined
		clientFSM.setState('town')
	})
}

const supervisedBattleSystem = new EventEmitter3()

supervisedBattleSystem.on('start', () => {
	if (localBattleAuthority) {
		localBattleAuthority.stop()
	}
})
supervisedBattleSystem.on('victory', () => {
	if (localBattleAuthority) {
		localBattleAuthority.start()
		battleAuthority = localBattleAuthority
		clientFSM.setState('localBattle')
	}
	else {
		clientFSM.setState('town')
	}
})
supervisedBattleSystem.on('localControl', () => { // when we connect or reconnect and there is no supervised battle to resume
	if (clientFSM.stateName === 'authenticating') { // we don't want to stop a local battle for a temporarily dropped connection
		clientFSM.setState('town')
	}
})


// ===================
//  SERVER CONNECTION
// ===================

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
	clientFSM.setState('locked')
})
serverConnection.on('noSupervisedBattle', (payload) => { // login successful and there is no supervised battle to reconnect to (no payload)
	supervisedBattleSystem.emit('localControl')
})
serverConnection.on('startSupervisedBattle', (payload) => {
	supervisedBattleSystem.emit('start') // give local battle a chance to cleanly shutdown in preparation of continuing after the supervised battle
	clientFSM.setState('supervisedBattle')
	const battleBlueprint = payload.battleBlueprint
	const previousResults = payload.previousResults
	const myTeamId = payload.myTeamId
	battleAuthority = new RemoteBattleAuthority(battleBlueprint, myTeamId, previousResults)
	battleAuthority.on('decision', ({ abilityId, target }) => {
		serverConnection.send('decision', { abilityId, target })
	})
	battleAuthority.on('dismiss', () => {
		supervisedBattleSystem.emit('victory') // either continue the paused local battle or go to town
	})
})
serverConnection.on('results', (payload) => {
	battleAuthority.addResults(payload) // assuming battleAuthority is still a RemoteBattleAuthority!
})
serverConnection.setLoginPayload(loginPayload)
serverConnection.connect()
