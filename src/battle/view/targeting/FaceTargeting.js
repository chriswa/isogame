import BaseTargetingController from './base.js'
import { colourOptions as overlayColourOptions } from '../FieldOverlayRenderer.js'
import * as v2 from '../../../util/v2.js'
import Dijkstra from '../../../util/Dijkstra.js'
import Grid from '../../../util/Grid.js'

export default class FaceTargetingController extends BaseTargetingController {
	init() {
	}
	render(view, mousePick) {

		this.updateUnitGlows(view, undefined) // caster is solid white

		//const mousePos = mousePick.getScreenPos()
		const pickedCoords = mousePick.getTileCoords(true)

		const pickedFacing = v2.getFacing(this.ability.getUnitCoords(), pickedCoords)
		view.unitSprites[this.castingUnitId].setFacing(pickedFacing)

		view.fieldView.updateOverlay(testCoords => {
			let colour = overlayColourOptions.NONE
			
			const testDistanceFromCaster = v2.manhattan(this.ability.getUnitCoords(), testCoords)
			if (testDistanceFromCaster === 1 && v2.getFacing(this.ability.getUnitCoords(), testCoords) === pickedFacing) {
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

			if (!v2.isEqual(this.ability.getUnitCoords(), tileCoords)) {
				const pickedFacing = v2.getFacing(this.ability.getUnitCoords(), tileCoords)

				decisionCallback(pickedFacing)
				return true // handled click!
			}
		}
		return false // click not handled, allow default click behaviour (i.e. select unit clicked on, or select default active unit)
	}
}
