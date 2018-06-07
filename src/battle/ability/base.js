import BattleModel from '../BattleModel.js'

export default class BaseAbility {
	constructor(model, unitId, abilityId) {
		/** @type {BattleModel} */
		this.model = model
		this.unitId = unitId
		this.abilityId = abilityId
		this.unit = this.model.getUnitById(this.unitId)
		this.unitArgs = this.model.getUnitAbilityArgsById(this.unitId, this.abilityId)
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
		return true
	}
}
