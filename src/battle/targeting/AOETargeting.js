import BaseTargetingController from './base.js'
import { colourOptions as overlayColourOptions } from '../view/FieldOverlayRenderer.js'
import * as v2 from '../../util/v2.js'
import Dijkstra from './../../util/Dijkstra.js'
import Grid from './../../util/Grid.js'

export default class AOETargetingController extends BaseTargetingController {
	init() {
		this.minTargetDistance = this.abilityArgs.minTargetDistance
		this.maxTargetDistance = this.abilityArgs.maxTargetDistance
		this.aoeRange = this.abilityArgs.aoeRange
	}
	render(view, mousePick) {

		this.updateUnitGlows(view, undefined) // caster is solid white, mouseover unit is flashing white-black

		const pickedCoords = mousePick.getTileCoords(true)
		view.fieldView.updateOverlay(testCoords => {
			//if (!pickedCoords) { return 0 }
			let colour = overlayColourOptions.NONE
			const casterDistance = v2.manhattan(this.casterCoords, testCoords)

			// targeting range
			if (casterDistance >= this.minTargetDistance && casterDistance <= this.maxTargetDistance) {
				colour = this.isCasterActiveAndOwned() ? overlayColourOptions.SOLID_CYAN : overlayColourOptions.SOLID_GREY
			}

			// aoe range
			const targetDistanceFromCaster = v2.manhattan(this.casterCoords, pickedCoords)
			if (targetDistanceFromCaster >= this.minTargetDistance && targetDistanceFromCaster <= this.maxTargetDistance) {
				const targetDistance = v2.manhattan(pickedCoords, testCoords)
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
		if (mousePick.hasTileCoords(true)) {

			const tileCoords = mousePick.getTileCoords(true)

			// clicked on a valid target tile?
			const targetDistanceFromCaster = v2.manhattan(this.casterCoords, tileCoords)
			if (targetDistanceFromCaster >= this.minTargetDistance && targetDistanceFromCaster <= this.maxTargetDistance) {
				//console.log(`TARGET: ${tileCoords}`)
				decisionCallback(tileCoords)
				return true // handled click!
			}
		}
		return false // click not handled, allow default click behaviour (i.e. select unit clicked on, or select default active unit)
	}
}
