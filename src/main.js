import * as input from './util/input.js'
import * as gfx from './gfx/gfx.js'
import * as battleBuilder from './battle/battleBuilder.js'
import * as debugCanvas from './gfx/debugCanvas.js'
import AbilityArchetypes from './battle/AbilityArchetypes.js'
import ResultPlayers from './battle/ResultPlayers.js'

class Simulation {
	constructor(model) {
		this.model = model.clone()
		this.results = []
		this.takeModelBackup()
	}
	takeModelBackup() {
		this.modelBackup = this.model.clone()
	}
	verifyModelBackup() {
		const serializedModel = JSON.stringify(this.model)
		const serializedBackup = JSON.stringify(this.modelBackup)
		if (serializedModel !== serializedBackup) {
			throw new Error(`model was updated outside of result!`)
		}
	}
	addResult(result) {
		this.verifyModelBackup()
		this.results.push(result)
		const resultPlayer = ResultPlayers[result.type]
		resultPlayer.updateModel(this.model, result)
		this.takeModelBackup()
	}
}

// this is essentially the LocalAuthority?
const decisionCallback = (abilityId, target) => {
	const unitId = battleController.model.getActiveUnitId()
	console.log(`battleAuthority.onSendDecision(${unitId}, ${abilityId}, ${target})`)

	const activeUnit = battleController.model.getUnitById(unitId)
	const abilityType = activeUnit.abilities[abilityId].abilityType
	const abilityArch = AbilityArchetypes[abilityType]
	abilityArch.execute(battleController.model, unitId, abilityId, target, simulation)

	while (simulation.results.length) {
		battleController.addResult(simulation.results.shift())
	}
}

const battleController = battleBuilder.buildSampleBattleController(decisionCallback)

const simulation = new Simulation(battleController.model) // this is a bit backwards: the BattleController should get its model from the authority

//setTimeout(() => {
//	battleController.addResult({ type: 'Spellcast', unitId: 1, name: 'Bar' })
//}, 500)

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
