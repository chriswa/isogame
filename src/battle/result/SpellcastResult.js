import BaseResult from './base.js'

export default class SpellcastResult extends BaseResult {
	updateModel() {
		this.model.turn.actionUsed = true
		if (this.result.manaCost) {
			const unit = this.model.getUnitById(this.result.unitId)
			unit.mana -= this.result.manaCost
		}
	}
	getAnimationDurationMs() {
		return 500
	}
	animationStart(view) {
		view.unitSprites[this.result.unitId].startAnimation('CAST')
		view.setTopText(JSON.stringify(this.result))
		view.centerOnUnitId(this.result.unitId)
	}
	animationUpdate(view, normalizedT) {
		view.setTopText(`Casting ${this.result.name} - ${Math.round(normalizedT * 100)}%`)
	}
	animationComplete(view) {
		view.unitSprites[this.result.unitId].startAnimation('IDLE')
	}
}
