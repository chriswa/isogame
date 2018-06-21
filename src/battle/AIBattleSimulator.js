import BattleSimulator from './BattleSimulator.js'

export default class AIBattleSimulator extends BattleSimulator {

	advanceWithAI() {
		this.advance()
		// if the next unit is ai-controlled, call makeAIDecision(), advance the simulator, and repeat
		while (true) {
			if (this.model.getVictoryState()) {
				return
			}
			const activeUnitId = this.model.getActiveUnitId()
			const activeUnit = this.model.getUnitById(activeUnitId)
			if (activeUnit.aiType === undefined) { break }
			this.makeAIDecision(activeUnitId, activeUnit)
			this.advance()
		}
	}

	makeAIDecision(activeUnitId, activeUnit) {
		//this.executeDecision(2, activeUnit.pos) // cast fireball on self
		const newFacing = (activeUnit.facing + 1) % 4 // turn right
		this.executeDecision(0, newFacing) // abilityId 0 is always supposed to be the Face ability!
	}
	
}

