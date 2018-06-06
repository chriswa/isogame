import BaseAbility from './base.js'

export default new class FireballAbility extends BaseAbility {
	getImage() {
		return 'fireball'
	}
	getTooltip(model, selectedUnitId, abilityId) {
		return `
			<h1>Fireball</h1>
			<p style="color: cyan; font-size: 80%;">30 mana</p>
			<p>Does damage in a small blast radius.</p>
			<p>Does not require line-of-sight.</p>
		`
	}
	getCastable(model, selectedUnitId, abilityId) {
		return false // TODO: check mana
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
