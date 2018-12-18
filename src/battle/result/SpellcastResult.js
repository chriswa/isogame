import BaseResult from './base.js'
import * as v2 from './../../util/v2.js'

export default class SpellcastResult extends BaseResult {
	updateModel() {
		const unit = this.model.getUnitById(this.resultData.unitId)

		unit.facing = v2.getFacing(unit.pos, this.resultData.target) // face the target

		if (this.resultData.manaCost) {
			unit.mana -= this.resultData.manaCost
		}

		if (!this.resultData.allowMovementAfter) {
			this.model.turn.moveDisallowed = true
		}

		this.model.turn.actionUsed = true
	}
	getAnimationDurationMs() {
		return 500
	}
	animationStart(view) {
		const startPosV2 = this.model.units[this.resultData.unitId].pos
		view.unitSprites[this.resultData.unitId].setFacing(v2.getFacing(startPosV2, this.resultData.target))
		view.unitSprites[this.resultData.unitId].startAnimation('CAST')
		view.setTopText(JSON.stringify(this.resultData))
		view.centerOnUnitId(this.resultData.unitId)
	}
	animationUpdate(view, normalizedT) {
		view.setTopText(`Casting ${this.resultData.name} - ${Math.round(normalizedT * 100)}%`)
	}
	animationComplete(view) {
		view.unitSprites[this.resultData.unitId].startAnimation('IDLE')
	}
}
