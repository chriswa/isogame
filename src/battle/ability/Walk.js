import BaseAbility from './base.js'
import AOETargetingController from '../targeting/AOE.js'

export default new class WalkAbility {
	getSpriteName() {
		return 'unknown'
	}
	createTargetingController(model, view, selectedUnitId, abilityId) {
		const ability = model.getAbilityById(selectedUnitId, abilityId)
		const extraArgs = {
			minTargetDistance: 1,
			maxTargetDistance: ability.distance,
			aoeRange: 1,
		}
		return new AOETargetingController(model, view, selectedUnitId, extraArgs)
	}
	//isCastable(battleModel, casterUnitId, abilityId) {
	//	return true
	//}
	//getTooltipText(battleModel, casterUnitId, abilityId) {
	//	return "Oops, this Ability did not override getTooltipText"
	//}
	//getTargetingUIId(battleModel, casterUnitId, abilityId) {
	//	return 'aoe'
	//}
	//isTargetValid(battleModel, casterUnitId, abilityId, target) {
	//	return false
	//}
	//execute(battleModel, casterUnitId, abilityId, target, simulator) {
	//	//getUnit(battleModel, casterUnitId).mana -= 10
	//	//simulator.addResult(battleModel, { type: 'unitCast', unitId: casterUnitId, facing: getFacingFromPointToPoint(getUnitPos(battleModel, casterUnitId), target) })
	//}
}
