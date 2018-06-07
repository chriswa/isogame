import BaseAbility from './base.js'

export default class FireballAbility extends BaseAbility {
	getImage() {
		return 'fireball'
	}
	getTooltip() {
		return `
			<div class="manaCost">${this.getManaCost()} mana</div>
			<h1>Fireball</h1>
			<p>Does damage in a small blast radius.</p>
			<p>Does not require line-of-sight.</p>
		`
	}
	getManaCost() {
		return 2
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
		addResultCallback({ type: 'Spellcast', unitId: this.unitId, name: `Fireball`, manaCost: this.getManaCost(), target: target })
	}
}
