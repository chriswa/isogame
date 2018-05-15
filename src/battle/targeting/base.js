import BattleModel from '../BattleModel.js'

export default class BaseTargetingController {
	constructor(model, view, castingUnitId, castingAbilityId) {
		/** @type BattleModel */
		this.model = model
		this.view = view
		this.castingUnitId = castingUnitId
		this.castingAbilityId = castingAbilityId
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

	onClick(mousePos) {
		//const [pickedTileCoords, pickedUnitId] = this.view.mousePick(true)
		//if (pickedTileCoords !== undefined) {
		//}
	}

}
