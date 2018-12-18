import BaseResult from './base.js'
import * as v2 from './../../util/v2.js'

// n.b. WalkAbility can target far away, but WalkResults are for one square only!

export default class WalkResult extends BaseResult {
	updateModel() {
		const unit = this.model.getUnitById(this.resultData.unitId)

		unit.facing = v2.getFacing(unit.pos, this.resultData.target) // face the target

		v2.copy(this.resultData.target, unit.pos)
		this.model.turn.movementUsed = (this.model.turn.movementUsed || 0) + 1
	}
	getAnimationDurationMs() {
		return 200
	}
	animationStart(view) {
		const startPosV2 = this.model.units[this.resultData.unitId].pos
		view.unitSprites[this.resultData.unitId].setFacing(v2.getFacing(startPosV2, this.resultData.target))
		view.unitSprites[this.resultData.unitId].startAnimation('WALK')
		//view.centerOnUnit(this.resultData.unitId)
		this.startPos = view.getWorldCoordsForTileCenter(startPosV2)
		this.endPos = view.getWorldCoordsForTileCenter(this.resultData.target)
	}
	animationUpdate(view, normalizedT) {
		const newPos = twgl.v3.lerp(this.startPos, this.endPos, normalizedT)
		view.unitSprites[this.resultData.unitId].setPosition(newPos)
		view.lerpCameraToPos(newPos)
	}
	animationComplete(view) {
		view.unitSprites[this.resultData.unitId].startAnimation('IDLE')
		view.unitSprites[this.resultData.unitId].setPosition(this.endPos)
	}
}
