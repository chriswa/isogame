export default class BattleModel {
	constructor(data) {
		this.data = data
	}
	get field() { return this.data.field }
	get units() { return this.data.units }
	get turn() { return this.data.turn }
	get myTeamId() { return this.data.myTeamId }
	clone() {
		const newData = _.clone(this.data, true)
		return new BattleModel(newData)
	}

	getActiveUnitId() {
		return this.turn.activeUnitId
	}
	getUnitById(unitId) {
		return this.units[unitId]
	}
	getUnitCoordsById(unitId) {
		const unit = this.getUnitById(unitId)
		return [ unit.x, unit.z ]
	}
	isItMyTurn() {
		const activeUnit = this.getUnitById(this.getActiveUnitId())
		return activeUnit && activeUnit.teamId === this.myTeamId
	}
	getAbilityById(unitId, abilityId) {
		return this.getUnitById(unitId).abilities[abilityId]
	}
	findUnitIdAtPos(pos) {
		if (!pos) { return undefined }
		const [x, z] = pos
		for (let unitId in this.units) {
			const unit = this.units[unitId]
			if (unit.x === x && unit.z === z) {
				return unitId
			}
		}
		return undefined
	}

}
