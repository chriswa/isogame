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
			name: "Hanz", spriteSet: "human_red", x: 11, z: 11, facing: 0, hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 47, turnbreaker: 0.454563,
			buffs: {
				0: { buffId: 0, buffType: "Poison", power: 1, turnsRemaining: 2, },
			},
			abilities: {
				0: { abilityId: 0, abilityType: "WalkAbility", distance: 16, },
			}
		},
		1: {
			unitId: 1,
			teamId: 1,
			name: "Mordeqai", spriteSet: "goblin_purple", x: 7, z: 9, facing: 1, hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 69, turnbreaker: 0.873465,
			buffs: {
			},
			abilities: {
				0: { abilityId: 0, abilityType: "WalkAbility", distance: 3, },
			}
		},
	}

	for (let i = 2; i < 32; i += 1) {
		unitsModel[i] = {
			unitId: i,
			teamId: 1,
			name: "Rando", spriteSet: "goblin_green", x: Math.floor(Math.random() * 32), z: Math.floor(Math.random() * 32), facing: Math.floor(Math.random() * 4), hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 69, turnbreaker: 0.873465,
			buffs: {
			},
			abilities: {
				0: { abilityId: 0, abilityType: "WalkAbility", distance: 7, },
			}
		}
	}

	const turnModel = {
		time: 0,
		activeUnitId: 0,
		movementUsed: 0,
		actionsUsed: 0,
	}

	const myTeamId = 0
	
	return new BattleController(fieldDescriptor, unitsModel, turnModel, myTeamId, decisionCallback)
}
