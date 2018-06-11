import BaseAbility from './base.js'

export default class FaceAbility extends BaseAbility {
	calcAbilityArgs() {
		return {}
	}
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
	execute(target, executionHelper) {
		executionHelper.result('Face', { unitId: this.unitId, target: target })
	}
}
