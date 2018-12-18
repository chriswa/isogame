import BaseResult from './base.js'

export default class DeathResult extends BaseResult {
	updateModel() {
		delete this.model.units[this.resultData.unitId]
	}
	getAnimationDurationMs() {
		return 500
	}
	animationStart(view) {
		view.unitSprites[this.resultData.unitId].startAnimation('CAST')
		view.setTopText(`Slain`)
		view.centerOnUnitId(this.resultData.unitId)
	}
	//onPartial(ratio) {
	//}
	animationUpdate(view, normalizedT) {
	}
	animationComplete(view) {
		view.removeUnitSprite(this.resultData.unitId)
	}
}
