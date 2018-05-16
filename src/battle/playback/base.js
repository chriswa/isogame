import BattleModel from './../BattleModel.js'

export default class BasePlaybackController {
	constructor(model, view, result) {
		/** @type BattleModel */
		this.model = model
		this.view = view
		this.result = result
		this.init()
	}
	init() {
		// override me! (instead of declaring a constructor and having to call super())
	}
	update(dt) {
		throw new Error(`PlaybackController should override update()`)
		//return consumedDt
	}
	isComplete() {
		throw new Error(`PlaybackController should override isComplete()`)
		//return true
	}
	render(worldViewProjectionMatrix) {
	}
}
