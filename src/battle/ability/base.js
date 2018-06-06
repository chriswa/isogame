export default class BaseAbility {
	getImage() {
		return 'help' // override me!
	}
	getTooltip(model, selectedUnitId, abilityId) {
		return `<h1>Error</h1><p>Abilities should override getTooltip</p>`
	}
	getCastable(model, selectedUnitId, abilityId) {
		return true
	}
}
