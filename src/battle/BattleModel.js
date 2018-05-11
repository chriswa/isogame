export default class BattleModel {
	constructor(field, units, turn, localTeamId) {
		this.field = field
		this.units = units
		this.turn = turn
		this.localTeamId = localTeamId
	}
	clone() {
		const newData = {
			field: _.clone(this.field, true),
			units: _.clone(this.units, true),
			turn: _.clone(this.turn, true),
			localTeamId: this.localTeamId,
		}
		return new BattleModel(newData.field, newData.units, newData.turn, newData.localTeamId)
	}

	getActiveUnitId() {
		return this.turn.activeUnitId
	}
	getUnitById(unitId) {
		this.units[unitId]
	}
	isItMyTurn() {
		const activeUnit = this.getUnit(this.getActiveUnitId())
		return activeUnit && activeUnit.teamId === this.localTeamId
	}

}
