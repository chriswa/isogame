import BattleModel from './BattleModel.js'
import FieldBuilder from './FieldBuilder.js'
import WalkPathing from './WalkPathing.js'

const sampleNames = 'Agmund Amleth Asgeir Bertil Bjarte Borphlum Byggvir Dagur Denkli Diederik Dominic Edgo Egon Einherjar Eirik Elof Erland Fenris Fixandu Gjurd Gorla Grendoz Grompl Halvdan Haukur Helheimr Helva Homlur Ignaas Ingefred Isak Jervis Kari Klemenz Kormorflo Leif Lodewijk Lorbo Lund Malto Mikko Morta Nestor Olander Ormur Ragnvald Remur Sigfinnur Smlorg Somerled Sven Tapani Toivo Torstein Trencha Tryggvi Ull Ulrik Urho Valdimar Valgrind Verdl Vihtori Vixja Wendig Wendirgl'.split(' ')

class Builder {
	constructor(battleDescriptor, seed) {
		this.battleDescriptor = battleDescriptor
		this.fieldDescriptor = {
			type: "randomwoods",
			seed: seed,
		}
		const myTeamId = undefined
		this.model = BattleModel.createFromBlueprint({
			fieldDescriptor: this.fieldDescriptor,
			units: {},
			turn: {},
		}, myTeamId)
		this.nextUnitId = 0
	}
	buildBattleBlueprint() {
		return {
			fieldDescriptor: this.fieldDescriptor,
			units: this.model.units,
			turn: {},
		}
	}
	isValid() {
		// can every unit path to every other unit (allow units to path through each other for this test)
		const anyUnit = _.values(this.model.units)[0]
		const startPos = anyUnit.pos
		const maxDistance = Infinity
		const ignoreOccupyingUnits = true
		const walkPathing = new WalkPathing(this.model, startPos, maxDistance, ignoreOccupyingUnits)
		let canAllUnitsPath = true
		_.each(this.model.units, (unit, unitId) => {
			const distance = walkPathing.getWalkDistance(unit.pos)
			if (distance === undefined) {
				canAllUnitsPath = false
			}
		})
		return canAllUnitsPath
	}
	addUnit(unit) {
		const unitId = this.nextUnitId
		this.nextUnitId += 1
		this.model.units[unitId] = unit
	}
}

export function build(battleDescriptor) {
	// try random seeds until we get a builder that validates
	let buildCount = 0
	while (true) {
		let seed = Math.floor(Math.random() * Math.pow(2, 32))
		let builder = buildAttempt(battleDescriptor, seed)
		if (builder.isValid()) {
			return builder.buildBattleBlueprint()
		}
		console.log(`[sampleBattleBuilder] battle failed validation (not all units can path to each other), trying again with a new seed`)
		buildCount += 1
		if (buildCount > 10) { throw new Error(`[sampleBattleGenerator] 10+ failed builds, incredibly bad luck or bug?`) }
	}
}

function buildAttempt(battleDescriptor, seed) {

	const isPVP = battleDescriptor.type === 'pvp'
	const team1AIType = isPVP ? undefined : 1
	const builder = new Builder(battleDescriptor, seed)

	builder.addUnit({
		teamId: 0,
		name: _.sample(sampleNames), spriteSet: "human_red", pos: [11, 11], facing: 0, hp: 6, hpMax: 7, mana: 4, manaMax: 5, nextTurnTime: 47, turnbreaker: 0.454563,
		buffs: {
			0: { buffType: "Poison", power: 1, turnsRemaining: 2, },
		},
		abilities: {
			0: { abilityType: "Face", },
			1: { abilityType: "Walk", distance: 7, },
			2: { abilityType: "Melee", power: 5, },
			3: { abilityType: "Fireball", distance: 5, },
		}
	})

	builder.addUnit({
		teamId: 1,
		aiType: team1AIType,
		name: _.sample(sampleNames), spriteSet: "goblin_purple", pos: [7, 9], facing: 1, hp: 7, hpMax: 7, mana: 4, manaMax: 4, nextTurnTime: 69, turnbreaker: 0.873465,
		buffs: {
		},
		abilities: {
			0: { abilityType: "Face", },
			1: { abilityType: "Walk", distance: 5, },
			2: { abilityType: "Melee", power: 5, },
			//3: { abilityType: "Fireball", distance: 5, },
		}
	})

	return builder
}
