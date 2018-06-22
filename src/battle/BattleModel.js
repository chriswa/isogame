import * as v2 from '../util/v2.js'
import FieldBuilder from './FieldBuilder.js'
import Abilities from './Abilities.js'

export default class BattleModel {

	static createFromBlueprint(battleBlueprint, myTeamId = undefined) {
		
		const fieldBuilder = new FieldBuilder(battleBlueprint.fieldDescriptor)
		const fieldModel = fieldBuilder.getModel()
		
		return new BattleModel({
			..._.omit(battleBlueprint, 'fieldDescriptor'), // simply copy all keys except fieldDescriptor
			field: fieldModel,
			myTeamId: myTeamId,
		})
	}

	constructor(data) {
		this.data = data
	}
	get field() { return this.data.field }
	get units() { return this.data.units }
	get turn() { return this.data.turn }
	get myTeamId() { return this.data.myTeamId }
	clone() {
		const newData = _.cloneDeep(this.data)
		return new BattleModel(newData)
	}

	getVictoryState() {
		return this.turn.victory
	}
	getActiveUnitId() {
		return this.turn.activeUnitId
	}
	getUnitById(unitId) {
		return this.units[unitId]
	}
	getUnitCoordsById(unitId) {
		const unit = this.getUnitById(unitId)
		return unit ? unit.pos : undefined
	}
	isItMyTurn() {
		const activeUnit = this.getUnitById(this.getActiveUnitId())
		return activeUnit && activeUnit.teamId === this.myTeamId
	}
	getUnitAbilityArgsById(unitId, abilityId) {
		const unit = this.getUnitById(unitId)
		const unitAbility = unit.abilities[abilityId]
		return unitAbility
	}
	getAbilityById(unitId, abilityId) {
		const unitAbility = this.getUnitAbilityArgsById(unitId, abilityId)
		const ability = unitAbility ? new Abilities[unitAbility.abilityType](this, unitId, abilityId) : undefined
		return ability
	}
	findUnitIdAtPos(pos) {
		if (!pos) { return undefined }
		for (let unitId in this.units) {
			const unit = this.units[unitId]
			if (v2.isEqual(pos, unit.pos)) {
				return unitId
			}
		}
		return undefined
	}
	findUnitIdsInRange(pos, range) {
		const retval = []
		if (!pos) { return retval }
		for (let unitId in this.units) {
			const unit = this.units[unitId]
			if (v2.manhattan(pos, unit.pos) <= range) {
				retval.push(unitId)
			}
		}
		return retval
	}

}
