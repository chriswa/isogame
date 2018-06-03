import * as input from './util/input.js'
import * as gfx from './gfx/gfx.js'
import * as debugCanvas from './gfx/debugCanvas.js'
import BattleController from './battle/BattleController.js'
import FieldBuilder from './battle/field/FieldBuilder.js'
import BattleModel from './battle/BattleModel.js'
import LocalAuthority from './LocalAuthority.js'



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







/** @type BattleController */
let battleController

const localTeamId = 0

const authorityCallbacks = {
	onBattleStart(battleBlueprint) {
		const decisionCallback = (abilityId, target) => { // called by TargetingUi
			authority.executeDecision(abilityId, target)
		}
		battleController = new BattleController(battleBlueprint, localTeamId, decisionCallback)
	},
	onResult(result) {
		battleController.addResult(result)
		window.clientModel = battleController.model // for debugging
	},
}

const authority = new LocalAuthority(authorityCallbacks)

window.authorityModel = authority.model // for debugging



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
