import BaseResultAnimation from './base.js'
import BattleModel from './../../BattleModel.js'

export default class SpellcastAnimation extends BaseResultAnimation {
	init() {
		this.duration = 500
		this.view.unitSprites[ this.result.unitId ].startAnimation('CAST')
		this.view.setTopText(`Slain`)
		this.view.centerOnUnitId(this.result.unitId)
	}
	//onPartial(ratio) {
	//}
	onComplete() {
		this.view.removeUnitSprite(this.result.unitId)
	}
}
