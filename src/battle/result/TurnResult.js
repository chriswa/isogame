import BaseResult from './base.js'

export default class TurnResult extends BaseResult {
	updateModel() {
		if (this.result.clear) {
			this.model.data.turn = {}
		}
		if (this.result.activeUnitId) {
			this.model.turn.activeUnitId = this.result.activeUnitId
		}
		if (this.result.stage) {
			this.model.turn.stage = this.result.stage
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
