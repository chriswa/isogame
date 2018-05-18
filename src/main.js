import * as gfx from './gfx/gfx.js'
import * as battleBuilder from './battle/battleBuilder.js'

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

	// update
	battleController.update(dt)

	// render
	gfx.clear()
	battleController.render()

})
