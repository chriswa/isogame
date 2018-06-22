import BaseTargetingController from './base.js'
import { colourOptions as overlayColourOptions } from '../FieldOverlayRenderer.js'
import * as v2 from '../../../util/v2.js'
import Dijkstra from '../../../util/Dijkstra.js'
import Grid from '../../../util/Grid.js'

export default class AOETargetingController extends BaseTargetingController {
	init() {
	}
	getValidPickedUnitCoords(mousePick) {
		const pickedUnitId = mousePick.getUnitId()
		const pickedUnitCoords = this.model.getUnitCoordsById(pickedUnitId) // or undefined
		const isPickedUnitValid = this.ability.isValidTarget(pickedUnitCoords)
		return isPickedUnitValid ? pickedUnitCoords : undefined
	}
	render(view, mousePick) {
		const validPickedUnitCoords = this.getValidPickedUnitCoords(mousePick)

		const redFlashUnitId = validPickedUnitCoords ? mousePick.getUnitId() : undefined
		this.updateUnitGlows(view, undefined, redFlashUnitId)

		const pickedCoords = validPickedUnitCoords ? validPickedUnitCoords : mousePick.getTileCoords(true)
		view.fieldView.updateOverlay(testCoords => {
			//if (!pickedCoords) { return 0 }
			let colour = overlayColourOptions.NONE

			// targeting range
			if (this.ability.isValidTarget(testCoords)) {
				colour = this.isCasterActiveAndOwned() ? overlayColourOptions.SOLID_CYAN : overlayColourOptions.SOLID_GREY
			}

			// aoe range
			const targetDistanceFromCaster = v2.manhattan(this.ability.getUnitCoords(), pickedCoords)
			if (targetDistanceFromCaster >= this.args.minTargetDistance && targetDistanceFromCaster <= this.args.maxTargetDistance) {
				const targetDistance = v2.manhattan(pickedCoords, testCoords)
				if (targetDistance === 0) {
					colour = overlayColourOptions.SOLID_RED
				}
				else if (targetDistance <= this.args.aoeRange) {
					colour = overlayColourOptions.SOLID_YELLOW
				}
			}

			return colour
		})

	}
	onClick(mousePick, decisionCallback) {
		if (!this.isCasterActiveAndOwned()) { return false } // default click behaviour: select the active unit

		const validPickedUnitCoords = this.getValidPickedUnitCoords(mousePick)
		const pickedCoords = validPickedUnitCoords ? validPickedUnitCoords : mousePick.getTileCoords(true)

		// clicked on a valid target tile?
		if (this.ability.isValidTarget(pickedCoords)) {
			//console.log(`TARGET: ${pickedCoords}`)
			decisionCallback(pickedCoords)
			return true // handled click!
		}

		return false // click not handled, allow default click behaviour (i.e. select unit clicked on, or select default active unit)
	}
}
