class Ability {
	getSpriteName() {
		return 'unknown'
	}
	isCastable(battleModel, casterUnitId, abilityIndex) {
		return true
	}
	getTooltipText(battleModel, casterUnitId, abilityIndex) {
		return "Oops, this Ability did not override getTooltipText"
	}
	getTargetingUIId(battleModel, casterUnitId, abilityIndex) {
		return 'aoe'
	}
	isTargetValid(battleModel, casterUnitId, abilityIndex, target) {
		return false
	}
	execute(battleModel, casterUnitId, abilityIndex, target, simulator) {
		//getUnit(battleModel, casterUnitId).mana -= 10
		//simulator.addResult(battleModel, { type: 'unitCast', unitId: casterUnitId, facing: getFacingFromPointToPoint(getUnitPos(battleModel, casterUnitId), target) })
	}
}
