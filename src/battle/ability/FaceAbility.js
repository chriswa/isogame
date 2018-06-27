import BaseAbility from './base.js'

export default class FaceAbility extends BaseAbility {
	initArgs(unitArgs) {
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
	isEnabled() {
		// you can always end your own turn (but you can't pretend to end anyone else's)
		return this.unitId === this.model.getActiveUnitId() // && this.model.isItMyTurn()
	}
	isValidTarget(target) {
		return target === 0 || target === 1 || target === 2 || target === 3
	}
	determineTargetingUI() {
		return { type: 'Face', ...this.args }
	}
	execute(target, executionHelper) {
		executionHelper.result('Face', { unitId: this.unitId, target: target })
	}
}
