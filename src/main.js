import * as input from './util/input.js'
import * as gfx from './gfx/gfx.js'
import * as battleBuilder from './battle/battleBuilder.js'
import * as debugCanvas from './gfx/debugCanvas.js'
import AbilityArchetypes from './battle/AbilityArchetypes.js'

const simulator = {
	addResult(x) {
		battleController.addResult(x)
	}
}

const decisionCallback = (abilityId, target) => {
	const unitId = battleController.model.getActiveUnitId()
	console.log(`battleAuthority.onSendDecision(${unitId}, ${abilityId}, ${target})`)

	const activeUnit = battleController.model.getUnitById(unitId)
	const abilityType = activeUnit.abilities[abilityId].abilityType
	const abilityArch = AbilityArchetypes[abilityType]
	abilityArch.execute(battleController.model, unitId, abilityId, target, simulator)
}

const battleController = battleBuilder.buildSampleBattleController(decisionCallback)

setTimeout(() => {
	battleController.addResult({ type: 'Spellcast', unitId: 1, name: 'Bar' })
}, 500)

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
