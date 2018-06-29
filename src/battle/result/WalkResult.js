import BaseResult from './base.js'
import * as v2 from './../../util/v2.js'

export default class WalkResult extends BaseResult {
	updateModel() {
		const unit = this.model.getUnitById(this.result.unitId)
		v2.copy(this.result.target, unit.pos)
		this.model.turn.movementUsed = (this.model.turn.movementUsed || 0) + 1
	}
	getAnimationDurationMs() {
		return 200
	}
	animationStart(view) {
		const startPosV2 = this.model.units[this.result.unitId].pos
		view.unitSprites[this.result.unitId].setFacing(v2.getFacing(startPosV2, this.result.target))
		view.unitSprites[this.result.unitId].startAnimation('WALK')
		//view.centerOnUnit(this.result.unitId)
		this.startPos = view.getWorldCoordsForTileCenter(startPosV2)
		this.endPos = view.getWorldCoordsForTileCenter(this.result.target)
	}
	animationUpdate(view, normalizedT) {
		const newPos = twgl.v3.lerp(this.startPos, this.endPos, normalizedT)
		view.unitSprites[this.result.unitId].setPosition(newPos)
		view.lerpCameraToPos(newPos)
	}
	animationComplete(view) {
		view.unitSprites[this.result.unitId].startAnimation('IDLE')
		view.unitSprites[this.result.unitId].setPosition(this.endPos)
	}
}
