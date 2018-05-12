import * as gfx from './gfx/gfx.js'
import * as battleBuilder from './battle/battleBuilder.js'

console.log('%cAPP START                ', 'font-size: 200%; margin-top: 20px; border-bottom: 3px solid black;')

const decisionCallback = (unitId, abilityId, target) => {
	console.log(`battleAuthority.onSendDecision(${unitId}, ${abilityId}, ${target})`)
	battleController.addBattleSimulationResult({ type: 'teleport', unitId, target })
}

const battleController = battleBuilder.buildSampleBattleController(decisionCallback)

setTimeout(() => {
	battleController.addBattleSimulationResult({ type: 'Spellcast', unitId: 0, name: 'Hello World!' })
	battleController.addBattleSimulationResult({ type: 'Spellcast', unitId: 1, name: 'foobar' })
}, 500)

gfx.startLoop(dt => {

	// update
	battleController.update(dt)

	// render
	gfx.clear()
	battleController.render()

})
