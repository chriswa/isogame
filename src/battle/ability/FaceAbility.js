import BaseAbility from './base.js'

export default class FaceAbility extends BaseAbility {
	getImage() {
		return 'cycle'
	}
	getTooltip() {
		return `
			<h1>End Turn</h1>
			<p>Choose which direction to face and advance time to the next turn.</p>
		`
	}
	getCastable() {
		return this.unitId === this.model.getActiveUnitId() // you can always end your own turn (but you can't pretend to end anyone else's)
	}
	determineTargetingController() {
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
	execute(target, addResultCallback) {
		addResultCallback({ type: 'Face', unitId: this.unitId, target: target })
	}
}
