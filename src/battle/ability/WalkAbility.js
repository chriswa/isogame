import BaseAbility from './base.js'
import WalkPathing from './../WalkPathing.js'

export default class WalkAbility extends BaseAbility {
	getImage() {
		return 'tread'
	}
	getTooltip() {
		return `
			<div class="manaCost" style="color: yellow">${this.getAvailableDistance()} / ${this.unitArgs.distance} remaining</div>
			<h1>Walk</h1>
			<p>Move across the field.</p>
		`
	}
	getCastable() {
		return this.getAvailableDistance() > 0
	}
	getAvailableDistance() {
		const distance = this.unitArgs.distance - (this.model.getActiveUnitId() === this.unitId ? (this.model.turn.movementUsed || 0) : 0)
		return distance
	}
	determineTargetingController() {
		const distance = this.getAvailableDistance()
		const abilityArgs = { distance }
		return { targetingId: 'Walk', abilityArgs }
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

		const distance = this.unitArgs.distance - (this.model.getActiveUnitId() === this.unitId ? (this.model.turn.movementUsed || 0) : 0)
		const walkPathing = new WalkPathing(this.model, this.unit.pos, distance)

		const path = walkPathing.findAppealingPath(target)

		_.each(path, (nextCoords) => {
			addResultCallback({ type: 'Walk', unitId: this.unitId, target: nextCoords })
		})

		//addResultCallback({ type: 'Spellcast', unitId: casterUnitId, name: `target = ${target}`, target: target })

		//getUnit(model, casterUnitId).mana -= 10
		//addResultCallback({ type: 'unitCast', unitId: casterUnitId, facing: getFacingFromPointToPoint(getUnitPos(model, casterUnitId), target) })
	}
}
