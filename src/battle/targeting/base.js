import BattleModel from '../BattleModel.js'
import BattleView from '../BattleView.js'
import billboardGlowOptions from '../../gfx/billboardGlowOptions.js'

export default class BaseTargetingController {
	constructor(model, view, castingUnitId, extraArgs) {
		/** @type BattleModel */
		this.model = model
		/** @type BattleView */
		this.view = view
		this.castingUnitId = castingUnitId
		this.extraArgs = extraArgs
		this.init()
	}
	init() {
		// override me! (instead of declaring a constructor and having to call super())
	}
	destroy() {
	}
	update(dt) {
	}
	render() {
	}

	onClick(pickedTileCoords, pickedUnitId, pickedTileCoordsBehindUnit) {
	}

	isCasterActiveAndOwned() {
		return this.model.isItMyTurn() && this.model.getActiveUnitId() == this.castingUnitId
	}
	updateUnitGlows(targetUnitId) {
		this.view.updateUnitGlows(unitId => {
			if (unitId === this.castingUnitId) { return billboardGlowOptions.SOLID_WHITE }
			else if (unitId === targetUnitId) { return billboardGlowOptions.PULSE_WHITE_BLACK }
			else { return billboardGlowOptions.NONE }
		})
	}

}
