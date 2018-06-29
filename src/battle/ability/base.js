import BattleModel from '../BattleModel.js'

export default class BaseAbility {
	constructor(model, unitId, abilityId) {
		/** @type {BattleModel} */
		this.model = model
		this.unitId = unitId
		this.abilityId = abilityId
		this.unit = this.model.getUnitById(this.unitId)
		const unitArgs = this.model.getUnitAbilityArgsById(this.unitId, this.abilityId)
		this.initArgs(unitArgs)
	}
	initArgs(unitArgs) {
		this.args = {} // override me!
	}
	getUnit() {
		return this.model.getUnitById(this.unitId)
	}
	getUnitCoords() {
		return this.model.getUnitCoordsById(this.unitId)
	}
	getImage() {
		return 'help' // override me!
	}
	getTooltip() {
		return `<h1>Error</h1><p>Abilities should override getTooltip</p>`
	}
	isEnabled() {
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
