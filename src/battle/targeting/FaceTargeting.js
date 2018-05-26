import BaseTargetingController from './base.js'
import { colourOptions as overlayColourOptions } from './../field/FieldOverlayRenderer.js'
import * as v2 from '../../util/v2.js'
import Dijkstra from './../../util/Dijkstra.js'
import Grid from './../../util/Grid.js'

export default class FaceTargetingController extends BaseTargetingController {
	init() {
	}
	render() {
		const mousePick = this.view.mousePick()

		this.updateUnitGlows() // caster is solid white

		const pickedCoords = mousePick.getTileCoords(true)

		const pickedFacing = v2.getFacing(this.casterCoords, pickedCoords)
		this.view.unitSprites[this.castingUnitId].setFacing(pickedFacing)

		this.view.fieldView.updateOverlay(testCoords => {
			let colour = overlayColourOptions.NONE
			
			const testDistanceFromCaster = v2.manhattan(this.casterCoords, testCoords)
			if (testDistanceFromCaster === 1 && v2.getFacing(this.casterCoords, testCoords) === pickedFacing) {
				colour = overlayColourOptions.SOLID_RED
			}

			return colour
		})

	}
	onClick(mousePick, decisionCallback) {
		if (!this.isCasterActiveAndOwned()) { return false } // default click behaviour: select the active unit
		// clicked on a tile?
		if (mousePick.hasTileCoords(true)) {

			const tileCoords = mousePick.getTileCoords(true)

			if (!v2.isEqual(this.casterCoords, tileCoords)) {
				const pickedFacing = v2.getFacing(this.casterCoords, tileCoords)

				decisionCallback(pickedFacing)
				return true // handled click!
			}
		}
		return false // click not handled, allow default click behaviour (i.e. select unit clicked on, or select default active unit)
	}
}
