export default class BattleModel {
	constructor(field, units, turn, myTeamId) {
		this.field = field
		this.units = units
		this.turn = turn
		this.myTeamId = myTeamId
	}
	clone() {
		const newData = {
			field: _.clone(this.field, true),
			units: _.clone(this.units, true),
			turn: _.clone(this.turn, true),
			myTeamId: this.myTeamId,
		}
		return new BattleModel(newData.field, newData.units, newData.turn, newData.myTeamId)
	}

	getActiveUnitId() {
		return this.turn.activeUnitId
	}
	getUnitById(unitId) {
		return this.units[unitId]
	}
	getUnitCoordsById(unitId) {
		const unit = this.getUnitById(unitId)
		return [ unit.x, unit.y ]
	}
	isItMyTurn() {
		const activeUnit = this.getUnit(this.getActiveUnitId())
		return activeUnit && activeUnit.teamId === this.myTeamId
	}

}
