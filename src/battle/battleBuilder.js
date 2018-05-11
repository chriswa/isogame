import BattleController from './BattleController.js'

export function buildSampleBattleController(decisionCallback) {
	
	const fieldDescriptor = {
		type: "randomwoods",
		seed: 123,
	}
	
	const unitsModel = {
		0: {
			unitId: 0,
			teamId: 0,
			name: "Hanz", spriteSet: "human_red", x: 3, y: 3, facing: 0, hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 47, turnbreaker: 0.454563,
			buffs: {
				0: { buffId: 0, buffType: "poisoned", power: 1, turnsRemaining: 2, },
			},
			abilities: {
				0: { abilityId: 0, abilityType: "walk", squares: 6, },
			}
		},
		1: {
			unitId: 1,
			teamId: 1,
			name: "Mordeqai", spriteSet: "goblin_purple", x: 7, y: 2, facing: 1, hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 69, turnbreaker: 0.873465,
			buffs: {
				0: { buffId: 0, buffType: "poisoned", power: 1, turnsRemaining: 2, },
			},
			abilities: {
				0: { abilityId: 0, abilityType: "walk", squares: 6, },
			}
		},
	}

	const turnModel = {
		time: 0,
		activeUnitId: undefined,
		movementRemaining: undefined,
		actionsRemaining: undefined,
	}

	const localTeamId = 0
	
	return new BattleController(fieldDescriptor, unitsModel, turnModel, localTeamId, decisionCallback)
}
