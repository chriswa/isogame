import BattleState from './BattleState.js'

export function build() {
	
	const fieldDescriptor = {
		type: "randomwoods",
		seed: 123,
	}
	
	const unitsDescriptor = {
		0: {
			unitId: 0,
			name: "Hanz", spriteSet: "human_red", x: 3, y: 3, facing: 0, hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 0, turnbreaker: 0.454563,
			buffs: {
				0: { buffInstId: 0, buffArchId: "poisoned", power: 1, turnsRemaining: 2, },
			},
			abilities: {
				0: { abilityInstId: 0, abilityArchId: "walk", squares: 6, },
			}
		},
		1: {
			unitId: 1,
			name: "Mordeqai", spriteSet: "goblin_purple", x: 7, y: 2, facing: 1, hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 0, turnbreaker: 0.454563,
			buffs: {
				0: { buffInstId: 0, buffArchId: "poisoned", power: 1, turnsRemaining: 2, },
			},
			abilities: {
				0: { abilityInstId: 0, abilityArchId: "walk", squares: 6, },
			}
		},
	}
	
	return new BattleState(fieldDescriptor, unitsDescriptor)
}
