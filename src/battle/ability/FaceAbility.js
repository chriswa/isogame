import BaseAbility from './base.js'

export default new class FaceAbility {
	getSpriteName() {
		return 'unknown'
	}
	determineTargetingController(model, view, selectedUnitId, abilityId) {
		return { targetingId: 'Face', abilityArgs: {} }
	}
	//isCastable(model, casterUnitId, abilityId) {
	//	return true
	//}
	//getTooltipText(model, casterUnitId, abilityId) {
	//	return "Oops, this Ability did not override getTooltipText"
	//}
	//getTargetingUIId(model, casterUnitId, abilityId) {
	//	return 'aoe'
	//}
	//isTargetValid(model, casterUnitId, abilityId, target) {
	//	return false
	//}
	execute(model, casterUnitId, abilityId, target, addResultCallback) {
		addResultCallback({ type: 'Face', unitId: casterUnitId, target: target })
	}
}
