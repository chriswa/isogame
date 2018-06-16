import BaseTargetingController from './base.js'
import { colourOptions as overlayColourOptions } from '../FieldOverlayRenderer.js'
import * as v2 from '../../../util/v2.js'

export default class WalkTargetingController extends BaseTargetingController {
	init() {
	}
	render(view, mousePick) {

		this.updateUnitGlows(view, mousePick.getUnitId()) // caster is solid white

		const pickedCoords = mousePick.getTileCoords()
		const appealingPath = this.args.walkPathing.findAppealingPath(pickedCoords)

		view.fieldView.updateOverlay(testCoords => {

			// targeting range
			if (!this.ability.isValidTarget(testCoords)) {
				return overlayColourOptions.NONE
			}

			if (!this.isCasterActiveAndOwned()) {
				return overlayColourOptions.SOLID_GREY
			}
			
			let colour = overlayColourOptions.SOLID_CYAN

			// part of path
			appealingPath.forEach(pathCoords => {
				if (v2.manhattan(pathCoords, testCoords) === 0) {
					colour = overlayColourOptions.SOLID_YELLOW
				}
			})

			// picked tile
			const targetDistance = v2.manhattan(pickedCoords, testCoords)
			if (targetDistance === 0) {
				colour = overlayColourOptions.SOLID_RED
			}

			return colour
		})

	}
	onClick(mousePick, decisionCallback) {
		if (!this.isCasterActiveAndOwned()) { return false } // default click behaviour: select the active unit

		// clicked on a valid tile?
		if (this.ability.isValidTarget(mousePick.getTileCoords())) {

			// handle click!
			//console.log(`TARGET: ${mousePick.getTileCoords()}`)
			decisionCallback(mousePick.getTileCoords())
			return true // handled click!
		}
		
		return false // click not handled, allow default click behaviour (i.e. select unit clicked on, or select default active unit)
	}
}
