import BaseResult from './base.js'

export default class VictoryResult extends BaseResult {
	updateModel() {
		this.model.turn.victory = this.resultData.victoryState
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
