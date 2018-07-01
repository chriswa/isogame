import BaseResult from './base.js'
import * as v2 from './../../util/v2.js'

export default class SpellcastResult extends BaseResult {
	updateModel() {
		const unit = this.model.getUnitById(this.result.unitId)

		unit.facing = v2.getFacing(unit.pos, this.result.target) // face the target

		if (this.result.manaCost) {
			unit.mana -= this.result.manaCost
		}

		if (!this.result.allowMovementAfter) {
			this.model.turn.moveDisallowed = true
		}

		this.model.turn.actionUsed = true
	}
	getAnimationDurationMs() {
		return 500
	}
	animationStart(view) {
		const startPosV2 = this.model.units[this.result.unitId].pos
		view.unitSprites[this.result.unitId].setFacing(v2.getFacing(startPosV2, this.result.target))
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
