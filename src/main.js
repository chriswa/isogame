import * as input from './util/input.js'
import * as gfx from './gfx/gfx.js'
import * as battleBuilder from './battle/battleBuilder.js'
import * as debugCanvas from './gfx/debugCanvas.js'

const decisionCallback = (unitId, abilityId, target) => {
	console.log(`battleAuthority.onSendDecision(${unitId}, ${abilityId}, ${target})`)
	battleController.addResult({ type: 'Spellcast', unitId, name: `${target}` })
}

const battleController = battleBuilder.buildSampleBattleController(decisionCallback)

setTimeout(() => {
	battleController.addResult({ type: 'Spellcast', unitId: 0, name: 'Hello World!' })
	battleController.addResult({ type: 'Spellcast', unitId: 1, name: 'foobar' })
}, 500)

gfx.startLoop(dt => {

	debugCanvas.update()

	// process queued input events first: for accurate mouse picks, this is done before moving the camera or advancing sprite animations
	input.update()

	// update
	battleController.update(dt)

	// render
	gfx.clear()
	battleController.render()

})
