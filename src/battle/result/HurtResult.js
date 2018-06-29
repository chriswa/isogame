import BaseResult from './base.js'

export default class HurtResult extends BaseResult {
	updateModel() {
		const unit = this.model.getUnitById(this.result.unitId)
		unit.hp -= this.result.damageAmount
	}
	getAnimationDurationMs() {
		return 500
	}
	animationStart(view) {
		view.unitSprites[this.result.unitId].startAnimation('CAST')
		view.setTopText(`-${this.result.damageAmount} (${this.result.damageType})`)
		view.centerOnUnitId(this.result.unitId)
	}
	animationUpdate(view, normalizedT) {
	}
	animationComplete(view) {
		view.unitSprites[this.result.unitId].startAnimation('IDLE')
	}
}
