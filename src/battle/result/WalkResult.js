import { BaseResultPlayer, BaseResultAnimation } from './base.js'
import BattleModel from './../BattleModel.js'
import * as v2 from './../../util/v2.js'

class WalkAnimation extends BaseResultAnimation {
	init() {
		this.duration = 200
		const startPosV2 = this.model.units[this.result.unitId].pos
		this.view.unitSprites[this.result.unitId].setFacing(v2.getFacing(startPosV2, this.result.target))
		this.view.unitSprites[ this.result.unitId ].startAnimation('WALK')
		//this.view.centerOnUnit(this.result.unitId)
		this.startPos = this.view.getWorldCoordsForTileCenter(startPosV2)
		this.endPos = this.view.getWorldCoordsForTileCenter(this.result.target)
	}
	onPartial(ratio) {
		const newPos = twgl.v3.lerp(this.startPos, this.endPos, ratio)
		this.view.unitSprites[this.result.unitId].setPosition(newPos)
		this.view.lerpCameraToPos(newPos)
	}
	onComplete() {
		this.view.unitSprites[this.result.unitId].startAnimation('IDLE')
		this.view.unitSprites[this.result.unitId].setPosition(this.endPos)
	}
}

export default class WalkResult extends BaseResultPlayer {
	static getAnimationClass() {
		return WalkAnimation
	}
	/**
	 * @param {BattleModel} model 
	 * @param {*} result 
	 */
	static updateModel(model, result) {
		const unit = model.getUnitById(result.unitId)
		v2.copy(result.target, unit.pos)
		model.turn.movementUsed = (model.turn.movementUsed || 0) + 1
	}
}
