import BaseSubController from './BaseSubController.js'
import ResultFactory from '../ResultFactory.js'

export default class ResultPlayingSubController extends BaseSubController {
	constructor(battleController) {
		super(battleController)
		this.queuedResults = []
		this.activeResult = undefined
	}
	addResult(result) {
		this.queuedResults.push(result)
	}
	onStateEnter() {
		this.view.fieldView.updateOverlay(testCoords => { return 0 }) // clear targeting overlay
		this.view.setTopText('')
		this.startNextResult()
	}
	onStateExit() {
	}
	startNextResult() {
		if (this.queuedResults.length) {
			const activeResultData = this.queuedResults.shift()
			this.activeResult = ResultFactory(activeResultData, this.model)
			this.activeResult.startAnimation(this.view)
			this.battleController.log(`Result started: `, this.activeResult)
		}
		else {
			this.activeResult = undefined
		}
	}
	update(dt) {
		let remainingDt = dt
		while (this.activeResult) {

			// update the animation
			remainingDt = this.activeResult.updateAnimation(this.view, remainingDt)

			// if the animation used all the time, it's not done yet, so we're done for now
			if (!remainingDt) {
				return
			}

			// the animation is complete, update the model and move on to the next result (if there is one)
			this.battleController.log(`resultAnimation model updater called: `, this.activeResultData)
			this.activeResult.updateModel()
			this.startNextResult()
		}

		// check for end of results
		if (!this.activeResult) {
			this.battleController.onResultsComplete()
		}
	}
	render() {
		//this.activeResult.renderAnimation()
	}
}
