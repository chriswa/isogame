import BaseAbility from './base.js'

export default new class FaceAbility extends BaseAbility {
	getImage() {
		return 'stopwatch'
	}
	getTooltip(model, selectedUnitId, abilityId) {
		return `
			<h1>End Turn</h1>
			<p>Choose which direction to face and advance time to the next turn.</p>
		`
	}
	getCastable(model, selectedUnitId, abilityId) {
		return true // you can always end your own turn
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
