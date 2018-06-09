import * as input from './util/input.js'
import * as gfx from './gfx/gfx.js'
import * as debugCanvas from './gfx/debugCanvas.js'
import BattleController from './battle/view/BattleController.js'
import LocalBattleAuthority from './LocalBattleAuthority.js'
import * as sampleBattleGenerator from './battle/sampleBattleGenerator.js'


var socket = new WebSocket('ws://localhost:9090')
socket.onopen = () => {
	socket.send(JSON.stringify(['login', { username: 'bob', password: 'pass', signup: undefined }])) // on the server, UserAuthenticator requires we send a login message first!
	//socket.send(JSON.stringify({ username: 'bob', password: 'pass', isSignup: true }))
}
socket.onerror = (error) => {
	console.log('WebSocket Error ' + error)
}
socket.onmessage = (e) => {
	//console.log(e.data)
	const [type, payload] = JSON.parse(e.data)
	console.log(`Server: ${type} - ${JSON.stringify(payload)}`)
}

window.wsSend = (type, payload) => {
	socket.send(JSON.stringify([ type, payload ]))
}

// MORE TESTING
//setTimeout(() => { wsSend('startChallenge', { challengeId: 'whatever' }) }, 1000)
//setTimeout(() => { wsSend('decision', { abilityId: 0, target: 0 }) }, 2000)



/** @type BattleController */
let battleController

const localTeamId = 0

const localAuthority = new LocalBattleAuthority()

localAuthority.on('start', (battleBlueprint) => {
	battleController = new BattleController(battleBlueprint, localTeamId)
	battleController.on('decision', ({ abilityId, target }) => {
		localAuthority.executeDecision(abilityId, target)
	})
})
localAuthority.on('result', (result) => {
	battleController.addResult(result)
	window.clientModel = battleController.model // for debugging
})

localAuthority.start(sampleBattleGenerator.build())

window.authorityModel = localAuthority.model // for debugging



gfx.startLoop(dt => {
	// wipe the debugCanvas first, so that other code can draw to it at will
	debugCanvas.clear()
	// process queued input events first: for accurate mouse picks, this is done before moving the camera or advancing sprite animations
	input.update()
	// update
	battleController.update(dt)
	// render
	gfx.clear()
	battleController.render()
})
