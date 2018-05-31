import * as input from './util/input.js'
import * as gfx from './gfx/gfx.js'
import * as debugCanvas from './gfx/debugCanvas.js'
import BattleController from './battle/BattleController.js'
import FieldBuilder from './battle/field/FieldBuilder.js'
import BattleModel from './battle/BattleModel.js'
import LocalAuthority from './LocalAuthority.js'

/** @type BattleController */
let battleController

const localTeamId = 0

const authorityCallbacks = {
	onBattleStart(battleBlueprint) {
		const decisionCallback = (abilityId, target) => { // called by TargetingUi
			localAuthority.executeDecision(abilityId, target)
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



class UserConnection {
	constructor(socket) {
		this.socket = socket
	}
}

var socket = new WebSocket('ws://localhost:9090')
socket.onopen = function () {
	socket.send('client acknowledges "open"')
}
socket.onerror = function (error) {
	console.log('WebSocket Error ' + error)
}
socket.onmessage = function (e) {
	console.log('Server: ' + e.data)
}








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
