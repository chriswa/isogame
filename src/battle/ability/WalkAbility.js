import BaseAbility from './base.js'
import WalkPathing from './../WalkPathing.js'

export default class WalkAbility extends BaseAbility {
	initArgs(unitArgs) {
		const distance = unitArgs.distance - (this.model.getActiveUnitId() === this.unitId ? (this.model.turn.movementUsed || 0) : 0)
		const walkPathing = new WalkPathing(this.model, this.getUnitCoords(), distance)

		return {
			maxDistance: unitArgs.distance,
			distance,
			walkPathing,
		}
	}
	getImage() {
		return 'tread'
	}
	getTooltip() {
		return `
			<div class="manaCost" style="color: yellow">${this.args.distance} / ${this.args.maxDistance} remaining</div>
			<h1>Walk</h1>
			<p>Move across the field.</p>
		`
	}
	isEnabled() {
		return this.args.distance > 0
	}
	isValidTarget(target) {
		return this.args.walkPathing.isValidTarget(target)
	}
	determineTargetingUI() {
		return { type: 'Walk', ...this.args }
	}
	execute(target, executionHelper) {

		const walkPathing = new WalkPathing(this.model, this.unit.pos, this.args.distance)

		const path = walkPathing.findAppealingPath(target)

		_.each(path, (nextCoords) => {
			executionHelper.result('Walk', { unitId: this.unitId, target: nextCoords })
		})

	}
}
