import BaseResult from './base.js'

export default class HurtResult extends BaseResult {
	updateModel() {
		const unit = this.model.getUnitById(this.resultData.unitId)
		unit.hp -= this.resultData.damageAmount
	}
	getAnimationDurationMs() {
		return 500
	}
	animationStart(view) {
		view.unitSprites[this.resultData.unitId].startAnimation('CAST')
		view.setTopText(`-${this.resultData.damageAmount} (${this.resultData.damageType})`)
		view.centerOnUnitId(this.resultData.unitId)
	}
	animationUpdate(view, normalizedT) {
	}
	animationComplete(view) {
		view.unitSprites[this.resultData.unitId].startAnimation('IDLE')
	}
}
