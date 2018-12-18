import BaseResult from './base.js'

export default class TurnResult extends BaseResult {
	updateModel() {
		if (this.resultData.clear) {
			this.model.data.turn = {}
		}
		if (this.resultData.activeUnitId) {
			this.model.turn.activeUnitId = this.resultData.activeUnitId
		}
		if (this.resultData.stage) {
			this.model.turn.stage = this.resultData.stage
		}
	}
	getAnimationDurationMs(view) {
		return 0
	}
	animationStart(view) {
	}
	animationUpdate(view, normalizedT) {
	}
	animationComplete(view) {
	}
}
