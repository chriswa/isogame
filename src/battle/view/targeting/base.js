import BattleModel from '../../BattleModel.js'
import billboardGlowOptions from '../../../gfx/billboardGlowOptions.js'

export default class BaseTargetingController {
	constructor(model, view, castingUnitId, args, ability) {
		/** @type BattleModel */
		this.model = model
		this.castingUnitId = castingUnitId
		this.args = args
		this.ability = ability

		this.init()
	}
	init() {
		// override me! (instead of declaring a constructor and having to call super())
	}
	destroy() {
	}
	update(dt) {
	}
	render(view) {
	}

	onClick(mousePick, decisionCallback) {
	}

	isCasterActiveAndOwned() {
		return this.model.isItMyTurn() && this.model.getActiveUnitId() == this.castingUnitId
	}
	updateUnitGlows(view, pulseWhiteUnitId, pulseRedUnitId) {
		view.updateUnitGlows(unitId => {
			if (unitId === this.castingUnitId) { return billboardGlowOptions.SOLID_WHITE }
			else if (unitId === pulseWhiteUnitId) { return billboardGlowOptions.PULSE_WHITE_BLACK }
			else if (unitId === pulseRedUnitId) { return billboardGlowOptions.PULSE_RED_YELLOW }
			else { return billboardGlowOptions.NONE }
		})
	}

}
