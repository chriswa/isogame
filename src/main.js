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

const localAuthority = new LocalAuthority({
	onBattleStart(battleBlueprint, decisionCallback) {
		battleController = new BattleController(battleBlueprint, localTeamId, decisionCallback)
	},
	onResult(result) {
		battleController.addResult(result)
		window.clientModel = battleController.model // for debugging
	},
})
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
