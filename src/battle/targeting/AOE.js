import BaseTargetingController from './base.js'
import { glowOptions as billboardGlowOptions } from './../../gfx/BillboardGroup.js'
import { colourOptions as overlayColourOptions } from './../field/FieldOverlayRenderer.js'

function manhattan(a, b) {
	if (!a || !b) { return Infinity }
	return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

export default class AOETargetingController extends BaseTargetingController {
	init() {
		this.minTargetDistance = this.extraArgs.minTargetDistance
		this.maxTargetDistance = this.extraArgs.maxTargetDistance
		this.aoeRange = this.extraArgs.aoeRange
	}
	isCasterActiveAndOwned() {
		return this.model.isItMyTurn() && this.model.getActiveUnitId() == this.castingUnitId
	}
	render() {
		const [targetCoords, targetUnitId] = this.view.mousePick()

		const casterCoords = this.model.getUnitCoordsById(this.castingUnitId)

		this.view.updateUnitGlows(unitId => {
			if (unitId === this.castingUnitId) {
				return billboardGlowOptions.SOLID_WHITE
			}
			else if (unitId === targetUnitId) {
				return billboardGlowOptions.PULSE_WHITE_BLACK
			}
			else {
				return billboardGlowOptions.NONE
			}
		})

		this.view.fieldView.updateOverlay(testCoords => {
			//if (!targetCoords) { return 0 }
			let colour = overlayColourOptions.NONE
			const casterDistance = manhattan(casterCoords, testCoords)
			if (casterDistance >= this.minTargetDistance && casterDistance <= this.maxTargetDistance) {
				colour = this.isCasterActiveAndOwned() ? overlayColourOptions.SOLID_CYAN : overlayColourOptions.SOLID_GREY
			}

			const targetDistanceFromCaster = manhattan(casterCoords, targetCoords)
			if (targetDistanceFromCaster >= this.minTargetDistance && targetDistanceFromCaster <= this.maxTargetDistance) {
				const targetDistance = manhattan(targetCoords, testCoords)
				if (targetDistance === 0) {
					colour = overlayColourOptions.SOLID_RED
				}
				else if (targetDistance <= this.aoeRange) {
					colour = overlayColourOptions.SOLID_YELLOW
				}
			}

			return colour
			//return manhattan === 0 ? 3 : manhattan < 2 ? 2 : manhattan < 11 ? 1 : 0
		})

	}
	onClick(pickedTileCoords, pickedUnitId) {
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
