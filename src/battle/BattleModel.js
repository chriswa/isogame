/** @typedef {number} TerrainType */
/** @typedef {number} UnitId */
/** @typedef {{
			field: {
				size: number,
				squares: [ TerrainType ],
			},
			turn: {
				activeUnit: UnitId,
				movementRemaining: number,
				actionsRemaining: number,
			},
			units: Object.<UnitId, {
				unitId: UnitId,
				stats: {
					name: string,
					spriteSet: string,
					hp: number,
					maxHp: number,
					mana: number,
					maxMana: number,
					time: number,
					turnbreaker: number,
				},
				buffs: Object.<number, {
					buffArchId: number,
					stats: {
						stack: number,
						turnsRemaining: number,
					},
				}>,
				abilities: [{
					abilityArchId: number,
					stats: {
						cooldownRemaining: number,
					},
				}],
			}>,
		}} BattleModelData
 */
/*
	- bm.updateTurn({})
	- bm.addUnit(unitId, unitDict)
	- bm.removeUnit(unitId)
	- bm.updateUnit(unitId, {})
	- bm.addUnitBuff(buffId, buffDict)
	- bm.removeUnitBuff(buffId)
	- bm.updateUnitBuff(buffId, {})
	- bm.updateUnitAbility(buffId, {})
*/

export default class BattleModel {
	constructor(data) {
		this.field = data.field
		this.turn = data.turn
		this.units = data.units
	}
	clone() {
		const newData = {
			field: _.clone(this.field, true),
			turn: _.clone(this.turn, true),
			units: _.clone(this.units, true),
		}
		return new BattleModel(newData)
	}
}

const sampleData = {
	field: {
		size: 5,
		squares: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
	},
	turn: {
		activeUnit: 1,
		movementRemaining: 3,
		actionsRemaining: 0,
	},
	units: {
		1: {
			stats: {
				name: "Hanz",
				spriteSet: "human_red",
				hp: 7,
				maxHp: 7,
				mana: 4,
				maxMana: 4,
				time: 0,
				turnbreaker: 0.454563,
			},
			buffs: {
				0: {
					buffArchId: "poisoned",
					stats: {
						power: 1,
						turnsRemaining: 2,
					},
				},
			},
			abilities: {
				0: {
					abilityArchId: "walk",
					stats: {
						squares: 6,
					},
				},
			},
		},
	},
}
