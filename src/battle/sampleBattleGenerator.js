import BattleModel from './BattleModel.js'
import FieldBuilder from './FieldBuilder.js'

const sampleNames = 'Agmund Amleth Asgeir Bertil Bjarte Borphlum Byggvir Dagur Denkli Diederik Dominic Edgo Egon Einherjar Eirik Elof Erland Fenris Fixandu Gjurd Gorla Grendoz Grompl Halvdan Haukur Helheimr Helva Homlur Ignaas Ingefred Isak Jervis Kari Klemenz Kormorflo Leif Lodewijk Lorbo Lund Malto Mikko Morta Nestor Olander Ormur Ragnvald Remur Sigfinnur Smlorg Somerled Sven Tapani Toivo Torstein Trencha Tryggvi Ull Ulrik Urho Valdimar Valgrind Verdl Vihtori Vixja Wendig Wendirgl'.split(' ')

class Builder {
	constructor(battleDescriptor) {
		this.battleDescriptor = battleDescriptor
		this.fieldDescriptor = {
			type: "randomwoods",
			seed: 123,
		}
		const myTeamId = undefined
		this.model = BattleModel.createFromBlueprint({
			fieldDescriptor: this.fieldDescriptor,
			units: {},
			turn: {},
		}, myTeamId)
		this.nextUnitId = 0
	}
	isPVP() {
		return this.battleDescriptor.type === 'pvp'
	}
	addUnit(unit) {
		const unitId = this.nextUnitId
		this.nextUnitId += 1
		this.model.units[unitId] = unit
	}
	build() {
		return {
			fieldDescriptor: this.fieldDescriptor,
			units: this.model.units,
			turn: {},
		}
	}
}

export function build(battleDescriptor) {

	const builder = new Builder(battleDescriptor)

	builder.addUnit({
		teamId: 0,
		name: _.sample(sampleNames), spriteSet: "human_red", pos: [11, 11], facing: 0, hp: 6, hpMax: 7, mana: 4, manaMax: 5, nextTurnTime: 47, turnbreaker: 0.454563,
		buffs: {
			0: { buffType: "Poison", power: 1, turnsRemaining: 2, },
		},
		abilities: {
			0: { abilityType: "Face", },
			1: { abilityType: "Walk", distance: 7, },
			2: { abilityType: "Fireball", distance: 5, },
		}
	})

	builder.addUnit({
		teamId: 1,
		aiType: builder.isPVP() ? undefined : 1,
		name: _.sample(sampleNames), spriteSet: "goblin_purple", pos: [7, 9], facing: 1, hp: 7, hpMax: 7, mana: 4, manaMax: 4, nextTurnTime: 69, turnbreaker: 0.873465,
		buffs: {
		},
		abilities: {
			0: { abilityType: "Face", },
			1: { abilityType: "Walk", distance: 5, },
			2: { abilityType: "Fireball", distance: 5, },
		}
	})

	return builder.build()
}
