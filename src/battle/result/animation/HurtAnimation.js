import BaseResultAnimation from './base.js'
import BattleModel from './../../BattleModel.js'

export default class HurtAnimation extends BaseResultAnimation {
	init() {
		this.duration = 500
		this.view.unitSprites[ this.result.unitId ].startAnimation('CAST')
		this.view.setTopText(`-${this.result.damageAmount} (${this.result.damageType})`)
		this.view.centerOnUnitId(this.result.unitId)
	}
	//onPartial(ratio) {
	//}
	onComplete() {
		this.view.unitSprites[this.result.unitId].startAnimation('IDLE')
	}
}
