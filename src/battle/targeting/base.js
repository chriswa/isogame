import BattleModel from '../BattleModel.js'
import BattleView from '../BattleView.js'

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

	onClick(pickedTileCoords, pickedUnitId) {
	}

}
