import BaseTargetingController from './base.js'
import { colourOptions as overlayColourOptions } from './../field/FieldOverlayRenderer.js'
import { manhattan } from '../../util/mathUtils.js'
import Dijkstra from './../../util/Dijkstra.js'
import Grid from './../../util/Grid.js'

export default class AOETargetingController extends BaseTargetingController {
	init() {
		this.minTargetDistance = this.abilityArgs.minTargetDistance
		this.maxTargetDistance = this.abilityArgs.maxTargetDistance
		this.aoeRange = this.abilityArgs.aoeRange
	}
	render() {
		const mousePick = this.view.mousePick()

		this.updateUnitGlows(mousePick.getUnitId()) // caster is solid white, mouseover unit is flashing white-black

		const pickedCoords = mousePick.getTileCoords()
		this.view.fieldView.updateOverlay(testCoords => {
			//if (!pickedCoords) { return 0 }
			let colour = overlayColourOptions.NONE
			const casterDistance = manhattan(this.casterCoords, testCoords)

			// targeting range
			if (casterDistance >= this.minTargetDistance && casterDistance <= this.maxTargetDistance) {
				colour = this.isCasterActiveAndOwned() ? overlayColourOptions.SOLID_CYAN : overlayColourOptions.SOLID_GREY
			}

			// aoe range
			const targetDistanceFromCaster = manhattan(this.casterCoords, pickedCoords)
			if (targetDistanceFromCaster >= this.minTargetDistance && targetDistanceFromCaster <= this.maxTargetDistance) {
				const targetDistance = manhattan(pickedCoords, testCoords)
				if (targetDistance === 0) {
					colour = overlayColourOptions.SOLID_RED
				}
				else if (targetDistance <= this.aoeRange) {
					colour = overlayColourOptions.SOLID_YELLOW
				}
			}

			return colour
		})

	}
	onClick(mousePick, decisionCallback) {
		if (!this.isCasterActiveAndOwned()) { return false } // default click behaviour: select the active unit
		// clicked on a tile?
		if (mousePick.hasTileCoords()) {

			// clicked on a valid target tile?
			const targetDistanceFromCaster = manhattan(this.casterCoords, mousePick.getTileCoords())
			if (targetDistanceFromCaster >= this.minTargetDistance && targetDistanceFromCaster <= this.maxTargetDistance) {
				//console.log(`TARGET: ${mousePick.getTileCoords()}`)
				decisionCallback(mousePick.getTileCoords())
				return true // handled click!
			}
		}
		return false // click not handled, allow default click behaviour (i.e. select unit clicked on, or select default active unit)
	}
}
