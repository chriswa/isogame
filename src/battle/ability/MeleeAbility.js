import BaseAbility from './base.js'
import DamageTypes from '../DamageTypes.js'
import * as v2 from '../../util/v2.js'


export default class MeleeAbility extends BaseAbility {
	initArgs(unitArgs) {
		this.args = {
			power: unitArgs.power,
		}
	}
	getImage() {
		return 'gladius'
	}
	getTooltip() {
		return `
			<div class="manaCost">${this.getManaCost()} mana</div>
			<h1>Melee</h1>
			<p>Does damage in a small blast radius.</p>
			<p>Does not require line-of-sight.</p>
		`
	}
	getManaCost() {
		return 0
	}
	isValidTarget(target) {
		if (!target) { return false }
		const casterDistance = v2.manhattan(this.getUnitCoords(), target)
		const unitIdsInRange = this.model.findUnitIdsInRange(target, 0)
		return (casterDistance === 1 && unitIdsInRange.length === 1)
	}
	determineTargetingUI() {
		return {
			type: 'AOE', // TODO: this isn't the best
			minTargetDistance: 1,
			maxTargetDistance: 1,
			aoeRange: 0,
		}
	}
	execute(target, executionHelper) {
		executionHelper.result('Spellcast', { unitId: this.unitId, name: `Melee`, manaCost: this.getManaCost(), target: target })
		const unitIdsInRange = this.model.findUnitIdsInRange(target, 0)
		_.each(unitIdsInRange, unitId => {
			executionHelper.hurt(unitId, this.args.power, 'physical')
		})
	}
}
