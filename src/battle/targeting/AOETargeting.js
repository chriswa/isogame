import BaseTargetingController from './base.js'
import { colourOptions as overlayColourOptions } from './../field/FieldOverlayRenderer.js'
import { manhattan } from '../../util/mathUtils.js'
import Dijkstra from './../../util/Dijkstra.js'
import Grid from './../../util/Grid.js'

export default class AOETargetingController extends BaseTargetingController {
	init() {
		this.minTargetDistance = this.extraArgs.minTargetDistance
		this.maxTargetDistance = this.extraArgs.maxTargetDistance
		this.aoeRange = this.extraArgs.aoeRange
	}
	render() {
		const [pickedCoords, pickedUnitId, pickedTileCoordsBehindUnit] = this.view.mousePick()

		const casterCoords = this.model.getUnitCoordsById(this.castingUnitId)

		this.updateUnitGlows(pickedUnitId) // caster is solid white, mouseover unit is flashing white-black

		this.view.fieldView.updateOverlay(testCoords => {
			//if (!pickedCoords) { return 0 }
			let colour = overlayColourOptions.NONE
			const casterDistance = manhattan(casterCoords, testCoords)

			// targeting range
			if (casterDistance >= this.minTargetDistance && casterDistance <= this.maxTargetDistance) {
				colour = this.isCasterActiveAndOwned() ? overlayColourOptions.SOLID_CYAN : overlayColourOptions.SOLID_GREY
			}

			// aoe range
			const targetDistanceFromCaster = manhattan(casterCoords, pickedCoords)
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
	onClick(pickedTileCoords, pickedUnitId, pickedTileCoordsBehindUnit) {
		//pickedTileCoords = pickedTileCoordsBehindUnit // ignore pickedUnitId!
		if (!this.isCasterActiveAndOwned()) {
			return false // default click behaviour: select the active unit
		}
		// clicked on a tile?
		if (pickedTileCoords !== undefined) {

			// clicked on a valid target tile?
			const casterCoords = this.model.getUnitCoordsById(this.castingUnitId)
			const targetDistanceFromCaster = manhattan(casterCoords, pickedTileCoords)
			if (targetDistanceFromCaster >= this.minTargetDistance && targetDistanceFromCaster <= this.maxTargetDistance) {
				console.log(`TARGET: ${pickedTileCoords}`)
				return true // handled click!
			}
		}
		return false // click not handled, allow default click behaviour (i.e. select unit clicked on, or select default active unit)
	}
}
