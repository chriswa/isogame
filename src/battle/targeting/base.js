import BattleModel from '../BattleModel.js'

export default class BaseTargetingController {
	constructor(model, view, castingUnitId, extraArgs) {
		/** @type BattleModel */
		this.model = model
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
	render(worldViewProjectionMatrix) {
	}

	onClick(pickedTileCoords, pickedUnitId) {
	}

}
