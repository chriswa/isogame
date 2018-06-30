import BattleModel from './BattleModel.js'
import FieldBuilder from './FieldBuilder.js'
import WalkPathing from './WalkPathing.js'
import TerrainType from './TerrainTypes.js'

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
		let retval = true
		_.each(this.model.units, (unit, unitId) => {
			// if any unit occupies a square which is not walkable, the battle is not valid
			const square = this.model.field.grid.getCell(unit.pos)
			const terrainType = TerrainType[square.terrainTypeId]
			if (!terrainType.walkCost) {
				retval = false
			}
			// if any unit cannot path to another unit, the battle is not valid
			const distance = walkPathing.getWalkDistance(unit.pos)
			if (distance === undefined) {
				retval = false
			}
		})
		return retval
	}
	addUnit(unit) {
		const unitId = this.nextUnitId
		this.nextUnitId += 1
		this.model.units[unitId] = unit
	}
	setUnitAIForTeamId(teamId, aiType) {
		_.each(this.model.units, unit => {
			if (unit.teamId === teamId) {
				unit.aiType = aiType
			}
		})
	}
	rollInitiative() {
		_.each(this.model.units, unit => {
			unit.nextTurnTime = Math.floor(Math.random() * 100)
		})
	}
}

export function build(battleDescriptor) {
	// try random seeds until we get one that passes validation
	let buildCount = 0
	while (true) {
		let seed = Math.floor(Math.random() * Math.pow(2, 32))
		let builder = buildAttempt(battleDescriptor, seed)
		if (builder.isValid()) {
			return builder.buildBattleBlueprint()
		}
		console.log(`[sampleBattleBuilder] battle failed validation (not all units can path to each other, or at least one unit is on an unwalkable square), trying again with a new seed`)
		buildCount += 1
		if (buildCount > 100) {
			console.error(`[sampleBattleGenerator] 100+ failed builds, incredibly bad luck or bug. returning an invalid battle blueprint anyways...`)
			debugger; builder.isValid()
			return builder.buildBattleBlueprint()
		}
	}
}

function buildAttempt(battleDescriptor, seed) {

	const builder = new Builder(battleDescriptor, seed)

	new UnitBuilder(0).spriteSet('human_red').where([11, 11], 0).ability({ abilityType: "Fireball", distance: 4 }).add(builder)
	new UnitBuilder(1).spriteSet('goblin_purple').where([7, 9], 0).buff({ buffType: "Poison", power: 1, turnsRemaining: 2, }).add(builder)

	const isPVP = battleDescriptor.type === 'pvp'
	builder.setUnitAIForTeamId(1, 1) // this must be done after all units have been added
	builder.rollInitiative()
	return builder
}

class UnitBuilder {
	constructor(teamId) {
		this.details = {
			teamId: teamId,
			aiType: undefined,
			name: _.sample(sampleNames),
			spriteSet: 'goblin_green',
			pos: [0, 0],
			facing: 0,
			hp: 100,
			hpMax: 100,
			mana: 100,
			manaMax: 100,
			nextTurnTime: 0,
			turnbreaker: Math.random(),
			buffs: {},
			abilities: {
				0: { abilityType: "Face", },
				1: { abilityType: "Walk", distance: 5, },
				2: { abilityType: "Melee", power: 25, },
			},
		}
		this.abilityNextId = 3
		this.buffNextId = 0
	}
	name(name) { this.details.name = name; return this }
	hp(hp) { this.details.hp = hp; this.details.hpMax = hp; return this }
	mana(mana) { this.details.mana = mana; this.details.manaMax = mana; return this }
	spriteSet(spriteSet) { this.details.spriteSet = spriteSet; return this }
	where(pos, facing) { this.details.pos = pos; this.details.facing = facing; return this }
	//teamId(teamId) { this.details.teamId = teamId; return this }
	walkRange(distance) { this.details.abilities['1'].distance = distance; return this }
	meleePower(power) { this.details.abilities['2'].power = power; return this }
	ability(abilityDetails) { this.details.abilities[this.abilityNextId++] = abilityDetails; return this }
	buff(buffDetails) { this.details.buffs[this.buffNextId++] = buffDetails; return this }
	add(builder) {
		builder.addUnit(this.details)
	}
}
