import BaseSubController from './BaseSubController.js'
import TargetingControllers from './TargetingControllers.js'
import BattleGUI from '../../gui/battle/BattleGUI.js'

export default class TargetingSubController extends BaseSubController {
	constructor(battleController) {
		super(battleController)
		this.selectedUnitId = undefined
		this.selectedAbilityId = undefined
		this.activeTargetingUI = undefined
	}
	update(dt) {
	}
	render() {
		if (this.activeTargetingUI) {
			const mousePick = this.view.mousePick()
			this.activeTargetingUI.render(this.view, mousePick)
		}
	}
	onStateEnter() {
		this.selectUnit(undefined)
		BattleGUI.forceUpdateAll()
		this.battleController.mouseController.activate()
		this.view.showActiveUnitIndicator(this.model.getActiveUnitId())
	}
	onStateExit() {
		this.removeActiveTargetingUi()
		this.battleController.mouseController.deactivate()
		this.view.hideActiveUnitIndicator()
		this.view.resetUnitGlows()
		this.view.setTopText('')
		BattleGUI.selectUnitId(undefined)
	}
	removeActiveTargetingUi() {
		if (this.activeTargetingUI) {
			this.activeTargetingUI.destroy()
			this.activeTargetingUI = undefined
		}
	}
	onClick(mousePos) {
		const mousePick = this.view.mousePick()
		let clickHandled = false
		if (this.activeTargetingUI) {
			const decisionCallback = (target) => {
				if (!this.model.isItMyTurn()) { throw new Error(`assertion failed: targetingUi tried to send decision but selected unit is not owned by player`) }
				this.battleController.onSendDecision(this.selectedAbilityId, target)
			}
			clickHandled = this.activeTargetingUI.onClick(mousePick, decisionCallback)
		}
		if (!clickHandled) {
			if (mousePick.hasUnit()) {
				this.selectUnit(mousePick.getUnitId())
			}
			else {
				const activeUnitId = this.model.getActiveUnitId()
				if (activeUnitId !== undefined) {
					this.selectUnit(activeUnitId)
				}
			}
		}
	}
	selectUnit(unitId) {
		if (unitId === undefined) {
			unitId = this.model.getActiveUnitId()
		}
		this.selectedUnitId = unitId
		if (this.selectedUnitId === undefined) { return }
		this.view.centerOnUnitId(unitId)

		BattleGUI.selectUnitId(unitId)

	}
	onSelectAbility(abilityId) { // n.b. this is called by BattleGUI (via the callback that BattleController provides: onSelectAbility)
		if (this.selectedUnitId === undefined) { return }
		this.selectedAbilityId = abilityId
		this.removeActiveTargetingUi() // call this first, so everything is cleaned up for TargetingUi constructor created next
		const ability = this.model.getAbilityById(this.selectedUnitId, this.selectedAbilityId)
		const { targetingId, abilityArgs } = ability.determineTargetingController()
		const targetingClass = TargetingControllers[ targetingId ]
		this.activeTargetingUI = new targetingClass(this.model, this.view, this.selectedUnitId, abilityArgs)
		this.battleController.log(`TargetingController started: `, this.activeTargetingUI)
	}
}
