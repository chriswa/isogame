class Ability {
	getSpriteName() {
		return 'unknown'
	}
	isCastable(battleModel, casterUnitId, abilityId) {
		return true
	}
	getTooltipText(battleModel, casterUnitId, abilityId) {
		return "Oops, this Ability did not override getTooltipText"
	}
	getTargetingUIId(battleModel, casterUnitId, abilityId) {
		return 'aoe'
	}
	isTargetValid(battleModel, casterUnitId, abilityId, target) {
		return false
	}
	execute(battleModel, casterUnitId, abilityId, target, simulator) {
		//getUnit(battleModel, casterUnitId).mana -= 10
		//simulator.addResult(battleModel, { type: 'unitCast', unitId: casterUnitId, facing: getFacingFromPointToPoint(getUnitPos(battleModel, casterUnitId), target) })
	}
}
