import BaseResult from './base.js'

export default class DeathResult extends BaseResult {
	updateModel() {
		delete this.model.units[this.result.unitId]
	}
	getAnimationDurationMs() {
		return 500
	}
	animationStart(view) {
		view.unitSprites[this.result.unitId].startAnimation('CAST')
		view.setTopText(`Slain`)
		view.centerOnUnitId(this.result.unitId)
	}
	//onPartial(ratio) {
	//}
	animationUpdate(view, normalizedT) {
	}
	animationComplete(view) {
		view.removeUnitSprite(this.result.unitId)
	}
}
