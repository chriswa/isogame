import BaseAbility from './base.js'

export default class FireballAbility extends BaseAbility {
	getImage() {
		return 'fireball'
	}
	getTooltip() {
		return `
			<h1>Fireball</h1>
			<p style="color: cyan; font-size: 80%;">30 mana</p>
			<p>Does damage in a small blast radius.</p>
			<p>Does not require line-of-sight.</p>
		`
	}
	getCastable() {
		return true // TODO: check mana
	}
	determineTargetingController() {
		const abilityArgs = {
			minTargetDistance: 1,
			maxTargetDistance: this.unitArgs.distance,
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
	execute(target, addResultCallback) {
		addResultCallback({ type: 'Spellcast', unitId: this.unitId, name: `target = ${target}`, target: target })
	}
}
