import BaseSubController from './BaseSubController.js'
import ResultAppliers from '../ResultAppliers.js'
import ResultAnimations from '../ResultAnimations.js'

export default class ResultPlayingSubController extends BaseSubController {
	constructor(battleController) {
		super(battleController)
		this.queuedResults = []
		this.activePlayerAnimation = undefined
		this.activePlayerModelUpdater = undefined
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
			const activeResult = this.queuedResults.shift()
			const resultAnimation = ResultAnimations[activeResult.type]
			const resultApplier = ResultAppliers[activeResult.type]
			this.activePlayerAnimation = new resultAnimation(this.model, this.view, activeResult)
			this.activePlayerModelUpdater = () => {
				this.battleController.log(`resultAnimation model updater called: `, activeResult)
				resultApplier(this.model, activeResult)
			}
			this.battleController.log(`ResultAnimation started: `, this.activePlayerAnimation)
		}
		else {
			this.activePlayerAnimation = undefined
		}
	}
	update(dt) {
		let remainingDt = dt
		while (this.activePlayerAnimation) {

			// update the animation
			remainingDt = this.activePlayerAnimation.update(remainingDt)

			// if the animation used all the time, it's not done yet, so we're done for now
			if (!remainingDt) {
				return
			}

			// the animation is complete, update the model and move on to the next result (if there is one)
			this.activePlayerModelUpdater()
			this.startNextResult()
		}

		// check for end of results
		if (!this.activePlayerAnimation) {
			this.battleController.onResultsComplete()
		}
	}
	render() {
		this.activePlayerAnimation.render()
	}
}
