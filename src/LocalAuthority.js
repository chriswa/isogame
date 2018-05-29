import * as sampleBattleGenerator from './battle/sampleBattleGenerator.js'
import BattleSimulator from './battle/BattleSimulator.js'
import BattleModel from './battle/BattleModel.js'
import AbilityArchetypes from './battle/AbilityArchetypes.js'

export default class LocalAuthority {
	constructor(callbacks) {
		this.callbacks = callbacks

		const battleBlueprint = sampleBattleGenerator.build()
		this.model = BattleModel.createFromBlueprint(_.cloneDeep(battleBlueprint))
		this.simulator = new BattleSimulator(this.model)

		// tell caller to start the battle
		const decisionCallback = (abilityId, target) => {
			this.executeAbility(abilityId, target)
			this.proceed()
		}
		this.callbacks.onBattleStart(_.cloneDeep(battleBlueprint), decisionCallback)

		this.proceed()
	}
	proceed() {
		this.simulator.advance()
		this.makeAIDecisions()
		this.sendQueuedResults()
	}	
	executeAbility(abilityId, target) {
		const activeUnitId = this.model.getActiveUnitId()
		//console.log(`LocalAuthority.executeAbility(${activeUnitId}, ${abilityId}, ${target})`)

		const activeUnit = this.model.getUnitById(activeUnitId)
		const abilityType = activeUnit.abilities[abilityId].abilityType
		const abilityArch = AbilityArchetypes[abilityType]
		abilityArch.execute(this.model, activeUnitId, abilityId, target, (result) => {
			this.simulator.addResult(result)
		})
	}
	sendQueuedResults() {
		const queuedResults = this.simulator.getQueuedResults()
		while (queuedResults.length) {
			this.callbacks.onResult(queuedResults.shift())
		}
	}
	makeAIDecisions() {
		// if the next unit is ai-controlled, call makeAIDecision(), advance the simulator, and repeat
		while (true) {
			const activeUnitId = this.model.getActiveUnitId()
			const activeUnit = this.model.getUnitById(activeUnitId)
			if (activeUnit.teamId !== 1) { break }
			this.makeAIDecision(activeUnitId, activeUnit)
			this.simulator.advance()
		}
	}
	makeAIDecision(activeUnitId, activeUnit) {
		this.executeAbility(2, activeUnit.pos) // cast fireball on self
		const newFacing = (activeUnit.facing + 1) % 4 // turn right
		this.executeAbility(0, newFacing) // abilityId 0 is always supposed to be the Face ability!
	}
}

