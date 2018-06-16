import BattleModel from '../BattleModel.js'

export default class BaseAbility {
	constructor(model, unitId, abilityId) {
		/** @type {BattleModel} */
		this.model = model
		this.unitId = unitId
		this.abilityId = abilityId
		this.unit = this.model.getUnitById(this.unitId)
		this.unitArgs = this.model.getUnitAbilityArgsById(this.unitId, this.abilityId)
		this.abilityArgs = this.calcAbilityArgs()
	}
	calcAbilityArgs() {
		return {} // override me!
	}
	getUnit() {
		return this.model.getUnitById(this.unitId)
	}
	getImage() {
		return 'help' // override me!
	}
	getTooltip() {
		return `<h1>Error</h1><p>Abilities should override getTooltip</p>`
	}
	getCastable() {
		const actionAvailable = !this.model.turn.actionUsed
		const manaRemaining = this.unit.mana || 0
		return actionAvailable && manaRemaining >= this.getManaCost()
	}
	isValidTarget(target) {
		return false // override me
	}
	getManaCost() {
		return 0 // override me!
	}
}
