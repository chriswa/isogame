import BaseAbility from './base.js'
import WalkTargetingController from '../targeting/WalkTargeting.js'
import WalkPathing from './../WalkPathing.js'

export default new class WalkAbility {
	getSpriteName() {
		return 'unknown'
	}
	createTargetingController(model, view, selectedUnitId, abilityId) {
		const ability = model.getAbilityById(selectedUnitId, abilityId)
		/*const extraArgs = {
			minTargetDistance: 1,
			maxTargetDistance: ability.distance,
			aoeRange: 1,
		}
		return new AOETargetingController(model, view, selectedUnitId, extraArgs)
		*/
		const distance = ability.distance - (model.getActiveUnitId() === selectedUnitId ? (model.turn.movementUsed || 0) : 0)
		return new WalkTargetingController(model, view, selectedUnitId, { distance })
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
