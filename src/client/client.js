import * as clientGameLoop from './clientGameLoop.js'
import LocalBattleAuthority from './LocalBattleAuthority.js'
import * as sampleBattleGenerator from '../battle/sampleBattleGenerator.js'
import ServerCommunication from './ServerCommunication.js'
import RemoteBattleAuthority from './RemoteBattleAuthority.js'
import Town from './Town.js'
import FSM from '../util/FSM.js'


// ============
//  CLIENT FSM 
// ============

let battleAuthority = undefined // undefined if no active battle, otherwise either LocalBattleAuthority or RemoteBattleAuthority
const clientFSM = new FSM({
	locked: {
		onEnterState() {
			console.log(`(clientFSM) locked! reload the page`)
		},
	},
	town: {
		onEnterState() {
			console.log(`(clientFSM) welcome to town!`)
			battleAuthority = undefined
			Town.setActive(true)
		},
		onExitState() {
			Town.setActive(false)
		},
	},
	battle: {
		update(dt) { battleAuthority.update(dt) },
		render() { battleAuthority.render() },
	},
})
clientFSM.setState('town') // initial state


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

Town.on('startLocal', (localBattleType) => {
	startLocalBattle(localBattleType)
})
Town.on('startChallenge', (challengeId) => {
	ServerCommunication.send('startChallenge', { challengeId })
})
Town.on('matchMakerSubscribe', (matchType) => {
	ServerCommunication.send('matchMakerSubscribe', { matchType })
})
Town.on('matchMakerUnsubscribe', (matchType) => {
	ServerCommunication.send('matchMakerUnsubscribe', { matchType })
})
Town.on('matchMakerUnsubscribeAll', () => {
	ServerCommunication.send('matchMakerUnsubscribeAll', undefined)
})

let localBattleAuthority = undefined

function startLocalBattle(localBattleId) {
	clientFSM.setState('battle')
	const battleDescriptor = { type: 'local', localBattleId }
	const battleBlueprint = sampleBattleGenerator.build(battleDescriptor)
	battleAuthority = new LocalBattleAuthority(battleBlueprint)
	localBattleAuthority = battleAuthority
	battleAuthority.on('dismiss', () => {
		localBattleAuthority = undefined
		clientFSM.setState('town')
	})
}


// ========
//  SERVER 
// ========

ServerCommunication.on('supervisedBattleStart', (battleBlueprint, myTeamId, timerDetails, previousResults) => {
	// give local battle a chance to cleanly shutdown in preparation of continuing after the supervised battle
	if (localBattleAuthority) {
		localBattleAuthority.stop()
	}
	clientFSM.setState('battle')
	battleAuthority = new RemoteBattleAuthority(battleBlueprint, myTeamId, timerDetails, previousResults)
	battleAuthority.on('decision', ({ abilityId, target }) => {
		ServerCommunication.send('decision', { abilityId, target })
	})
	battleAuthority.on('dismiss', () => {
		ServerCommunication.emit('supervisedBattleEnd') // either continue the paused local battle or go to town //FIXME: forcing an emit?
	})

})
ServerCommunication.on('supervisedBattleEnd', () => {
	if (localBattleAuthority) {
		localBattleAuthority.start()
		battleAuthority = localBattleAuthority
		clientFSM.setState('battle')
	}
	else {
		clientFSM.setState('town')
	}
})
ServerCommunication.on('localControl', () => { // when we connect or reconnect and there is no supervised battle to resume
	if (clientFSM.stateName === 'authenticating') { // we don't want to stop a local battle for a temporarily dropped connection
		clientFSM.setState('town')
	}
})
ServerCommunication.on('connect', () => {
	Town.setServerConnected(true)
})
ServerCommunication.on('disconnect', () => {
	Town.setServerConnected(false)
})
ServerCommunication.on('halt', (message) => {
	clientFSM.setState('locked')
	alert(`Your account connected from another device, which disconnected this device. Reload this page to reconnect.`)
})
ServerCommunication.on('resultsAndTimer', (results, timerDetails) => {
	battleAuthority.addResults(results) // assuming battleAuthority is still a RemoteBattleAuthority!
	battleAuthority.setTurnClock(timerDetails)
})
ServerCommunication.on('updateLoginPayload', (loginPayload) => {
	window.localStorage.setItem('loginPayload', loginPayload)
})

let loginPayload = window.localStorage.getItem('loginPayload')
loginPayload = loginPayload ? JSON.parse(loginPayload) : undefined
console.log(`loginPayload from localStorage:`, loginPayload)

ServerCommunication.init(loginPayload)
