import BaseAbility from './base.js'
import WalkPathing from './../WalkPathing.js'

export default class WalkAbility extends BaseAbility {
	calcAbilityArgs() {
		const distance = this.unitArgs.distance - (this.model.getActiveUnitId() === this.unitId ? (this.model.turn.movementUsed || 0) : 0)
		return {
			distance,
		}
	}
	getImage() {
		return 'tread'
	}
	getTooltip() {
		return `
			<div class="manaCost" style="color: yellow">${this.abilityArgs.distance} / ${this.unitArgs.distance} remaining</div>
			<h1>Walk</h1>
			<p>Move across the field.</p>
		`
	}
	getCastable() {
		return this.abilityArgs.distance > 0
	}
	determineTargetingController() {
		return { targetingId: 'Walk', abilityArgs: this.abilityArgs }
	}
	execute(target, executionHelper) {

		const distance = this.unitArgs.distance - (this.model.getActiveUnitId() === this.unitId ? (this.model.turn.movementUsed || 0) : 0)
		const walkPathing = new WalkPathing(this.model, this.unit.pos, distance)

		const path = walkPathing.findAppealingPath(target)

		_.each(path, (nextCoords) => {
			executionHelper.result('Walk', { unitId: this.unitId, target: nextCoords })
		})

	}
}
