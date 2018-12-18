import BaseResult from './base.js'

export default class FaceResult extends BaseResult {
	updateModel() {
		const unit = this.model.getUnitById(this.resultData.unitId)
		unit.facing = this.resultData.target
		unit.nextTurnTime += 100 // FIXME: this is too simple of a solution to support time magic
		this.model.turn.stage = 'end'
	}
	getAnimationDurationMs() {
		return 0
	}
	animationStart(view) {
		view.centerOnUnitId(this.resultData.unitId)
	}
	animationUpdate(view, normalizedT) {
	}
	animationComplete(view) {
		view.unitSprites[this.resultData.unitId].setFacing(this.resultData.target)
	}
}
