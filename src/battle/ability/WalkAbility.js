import BaseAbility from './base.js'
import WalkPathing from './../WalkPathing.js'

export default new class WalkAbility extends BaseAbility {
	getImage() {
		return 'tread'
	}
	getTooltip(model, selectedUnitId, abilityId) {
		return `
			<h1>Walk</h1>
			<p>Move across the field.</p>
		`
	}
	getCastable(model, selectedUnitId, abilityId) {
		return this.getAvailableDistance(model, selectedUnitId, abilityId) > 0
	}
	getAvailableDistance(model, selectedUnitId, abilityId) {
		const ability = model.getAbilityById(selectedUnitId, abilityId)
		const distance = ability.distance - (model.getActiveUnitId() === selectedUnitId ? (model.turn.movementUsed || 0) : 0)
		return distance
	}
	determineTargetingController(model, view, selectedUnitId, abilityId) {
		const distance = this.getAvailableDistance(model, selectedUnitId, abilityId)
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
	execute(model, casterUnitId, abilityId, target, addResultCallback) {

		const unit = model.getUnitById(casterUnitId)
		const ability = model.getAbilityById(casterUnitId, abilityId)
		const distance = ability.distance - (model.getActiveUnitId() === casterUnitId ? (model.turn.movementUsed || 0) : 0)
		const walkPathing = new WalkPathing(model, unit.pos, distance)

		const path = walkPathing.findAppealingPath(target)

		_.each(path, (nextCoords) => {
			addResultCallback({ type: 'Walk', unitId: casterUnitId, target: nextCoords })
		})

		//addResultCallback({ type: 'Spellcast', unitId: casterUnitId, name: `target = ${target}`, target: target })

		//getUnit(model, casterUnitId).mana -= 10
		//addResultCallback({ type: 'unitCast', unitId: casterUnitId, facing: getFacingFromPointToPoint(getUnitPos(model, casterUnitId), target) })
	}
}
