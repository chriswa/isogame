import BattleModel from './BattleModel.js'
import FieldBuilder from './FieldBuilder.js'
import WalkPathing from './WalkPathing.js'
import TerrainType from './TerrainTypes.js'
import * as v2 from '../util/v2.js'

const sampleNames = 'Agmund Amleth Asgeir Bertil Bjarte Borphlum Byggvir Dagur Denkli Diederik Dominic Edgo Egon Einherjar Eirik Elof Erland Fenris Fixandu Gjurd Gorla Grendoz Grompl Halvdan Haukur Helheimr Helva Homlur Ignaas Ingefred Isak Jervis Kari Klemenz Kormorflo Leif Lodewijk Lorbo Lund Malto Mikko Morta Nestor Olander Ormur Ragnvald Remur Sigfinnur Smlorg Somerled Sven Tapani Toivo Torstein Trencha Tryggvi Ull Ulrik Urho Valdimar Valgrind Verdl Vihtori Vixja Wendig Wendirgl'.split(' ')

class Builder {
	constructor(battleDescriptor, seed) {
		this.battleDescriptor = battleDescriptor
		this.fieldDescriptor = {
			type: "randomwoods",
			seed: seed,
			isPVP: this.isPVP(),
		}

		const fieldBuilder = FieldBuilder(this.fieldDescriptor)
		this.fieldMetrics = fieldBuilder.getMetrics()

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
	buildBattleBlueprint() {
		return {
			fieldDescriptor: this.fieldDescriptor,
			units: this.model.units,
			turn: {},
		}
	}
	isPosWalkable(pos) {
		const square = this.model.field.grid.getCell(pos)
		if (!square) { return false }
		const terrainType = TerrainType[square.terrainTypeId]
		return !!terrainType.walkCost
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
			if (!this.isPosWalkable(unit.pos)) {
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

	placeFourUnitTeam(builder, 0)

	if (builder.isPVP()) {
		placeFourUnitTeam(builder, 1)
	}
	else {
		const teamId = 1
		const teamCenter = builder.fieldMetrics.teamStarts[teamId].center
		const teamFacing = builder.fieldMetrics.teamStarts[teamId].facing
		for (let i = 0; i < 6; i += 1) {
			new UnitBuilder(builder, teamId).spriteSet('goblin_purple').near(teamCenter, [3, 10], teamFacing).buff({ buffType: "Poison", power: 1, turnsRemaining: 2, }).done()
		}
		builder.setUnitAIForTeamId(teamId, 1) // this must be done after all units have been added
	}

	// TESTING
	//console.log(`[sampleBattleGenerator] buildAttempt: enabling AI for team 0 for testing!`)
	//builder.setUnitAIForTeamId(0, 1) // this must be done after all units have been added

	builder.rollInitiative()
	return builder
}

function placeFourUnitTeam(builder, teamId) {
	const teamCenter = builder.fieldMetrics.teamStarts[teamId].center
	const teamFacing = builder.fieldMetrics.teamStarts[teamId].facing
	new UnitBuilder(builder, teamId).spriteSet('human_red').at(v2.add(teamCenter, v2.facingToDelta(teamFacing + 0)), teamFacing).done()
	new UnitBuilder(builder, teamId).spriteSet('human_purple').at(v2.add(teamCenter, v2.facingToDelta(teamFacing + 1)), teamFacing).ability({ abilityType: "Fireball", distance: 4 }).done()
	new UnitBuilder(builder, teamId).spriteSet('human_blue').at(v2.add(teamCenter, v2.facingToDelta(teamFacing + 2)), teamFacing).done()
	new UnitBuilder(builder, teamId).spriteSet('human_green').at(v2.add(teamCenter, v2.facingToDelta(teamFacing + 3)), teamFacing).done()
}

class UnitBuilder {
	constructor(builder, teamId) {
		this.builder = builder
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
	at(pos, facing) { this.details.pos = pos; this.details.facing = facing; return this }
	near(centerPos, range, facing) {
		if (facing === undefined) { facing = Math.floor(Math.random() * 4) }
		const pos = [0, 0]
		while (true) {
			pos[0] = centerPos[0] + Math.floor(Math.random() * range[0] * 2) - range[0]
			pos[1] = centerPos[1] + Math.floor(Math.random() * range[1] * 2) - range[1]
			if (this.builder.isPosWalkable(pos)) { break }
		}
		this.details.pos = pos
		this.details.facing = facing
		return this
	}
	//teamId(teamId) { this.details.teamId = teamId; return this }
	walkRange(distance) { this.details.abilities['1'].distance = distance; return this }
	meleePower(power) { this.details.abilities['2'].power = power; return this }
	ability(abilityDetails) { this.details.abilities[this.abilityNextId++] = abilityDetails; return this }
	buff(buffDetails) { this.details.buffs[this.buffNextId++] = buffDetails; return this }
	done() {
		this.builder.addUnit(this.details)
	}
}
