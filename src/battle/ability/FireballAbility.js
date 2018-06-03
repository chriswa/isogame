import BaseAbility from './base.js'

export default new class FireballAbility {
	getSpriteName() {
		return 'unknown'
	}
	determineTargetingController(model, view, selectedUnitId, abilityId) {
		const ability = model.getAbilityById(selectedUnitId, abilityId)
		const abilityArgs = {
			minTargetDistance: 1,
			maxTargetDistance: ability.distance,
			aoeRange: 1,
		}
		return { targetingId: 'AOE', abilityArgs }
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
		addResultCallback({ type: 'Spellcast', unitId: casterUnitId, name: `target = ${target}`, target: target })
	}
}
