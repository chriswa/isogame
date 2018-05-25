import BaseTargetingController from './base.js'
import { colourOptions as overlayColourOptions } from './../field/FieldOverlayRenderer.js'
import * as v2 from '../../util/v2.js'
import WalkPathing from './../WalkPathing.js'

export default class AOETargetingController extends BaseTargetingController {
	init() {
		this.distance = this.abilityArgs.distance
		this.walkPathing = new WalkPathing(this.model, this.casterCoords, this.distance)
	}
	render() {
		const mousePick = this.view.mousePick()

		this.updateUnitGlows(mousePick.getUnitId()) // caster is solid white, mouseover unit is flashing white-black

		const pickedCoords = mousePick.getTileCoords()
		const appealingPath = this.walkPathing.findAppealingPath(pickedCoords)

		this.view.fieldView.updateOverlay(testCoords => {

			// targeting range
			if (!this.walkPathing.isValidTarget(testCoords)) {
				return overlayColourOptions.NONE
			}
			
			let colour = this.isCasterActiveAndOwned() ? overlayColourOptions.SOLID_CYAN : overlayColourOptions.SOLID_GREY

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
		if (this.walkPathing.isValidTarget(mousePick.getTileCoords())) {

			// handle click!
			//console.log(`TARGET: ${mousePick.getTileCoords()}`)
			decisionCallback(mousePick.getTileCoords())
			return true // handled click!
		}
		
		return false // click not handled, allow default click behaviour (i.e. select unit clicked on, or select default active unit)
	}
}
