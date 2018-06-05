export default class BaseSubController {
	constructor(battleController) {
		/** @type BattleController */
		this.battleController = battleController
	}
	get view() { return this.battleController.view } // shortcut
	get model() { return this.battleController.model } // shortcut
	update(dt) { }
	render() { }
	onStateEnter() { }
	onStateExit() { }
	onClick(mousePos) { } // ignore this event
	onSelectAbility(abilityId) { }
}
