import BaseAbility from './base.js'
import DamageTypes from '../DamageTypes.js'
import * as v2 from '../../util/v2.js'


export default class FireballAbility extends BaseAbility {
	initArgs(unitArgs) {
		return {
			minTargetDistance: 1,
			maxTargetDistance: unitArgs.distance,
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
	isValidTarget(target) {
		const casterDistance = v2.manhattan(this.getUnitCoords(), target)
		return (casterDistance >= this.args.minTargetDistance && casterDistance <= this.args.maxTargetDistance)
	}
	determineTargetingUI() {
		return { type: 'AOE', ...this.args }
	}
	execute(target, executionHelper) {
		executionHelper.result('Spellcast', { unitId: this.unitId, name: `Fireball`, manaCost: this.getManaCost(), target: target })
		const unitIdsInRange = this.model.findUnitIdsInRange(target, this.args.aoeRange)
		_.each(unitIdsInRange, unitId => {
			executionHelper.hurt(unitId, 10, 'fire')
		})
	}
}
