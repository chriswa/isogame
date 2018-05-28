import BaseAbility from './base.js'
import FaceTargetingController from '../targeting/FaceTargeting.js'

export default new class FaceAbility {
	getSpriteName() {
		return 'unknown'
	}
	createTargetingController(model, view, selectedUnitId, abilityId) {
		return new FaceTargetingController(model, view, selectedUnitId)
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
