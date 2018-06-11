import BaseAbility from './base.js'
import DamageTypes from '../DamageTypes.js'

export default class FireballAbility extends BaseAbility {
	calcAbilityArgs() {
		return {
			minTargetDistance: 1,
			maxTargetDistance: this.unitArgs.distance,
			aoeRange: 1,
		}
	}
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
		return { targetingId: 'AOE', abilityArgs: this.abilityArgs }
	}
	execute(target, executionHelper) {
		executionHelper.result('Spellcast', { unitId: this.unitId, name: `Fireball`, manaCost: this.getManaCost(), target: target })
		const unitIdsInRange = this.model.findUnitIdsInRange(target, this.abilityArgs.aoeRange)
		_.each(unitIdsInRange, unitId => {
			executionHelper.hurt(unitId, 10, 'fire')
		})
	}
}
