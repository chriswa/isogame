import BaseTargetingController from './base.js'
import { glowOptions as billboardGlowOptions } from './../../gfx/BillboardGroup.js'

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
			let colour = 0
			const casterDistance = manhattan(casterCoords, testCoords)
			if (casterDistance >= this.minTargetDistance && casterDistance <= this.maxTargetDistance) {
				colour = 1
			}

			const targetDistanceFromCaster = manhattan(casterCoords, targetCoords)
			if (targetDistanceFromCaster >= this.minTargetDistance && targetDistanceFromCaster <= this.maxTargetDistance) {
				const targetDistance = manhattan(targetCoords, testCoords)
				if (targetDistance === 0) {
					colour = 3
				}
				else if (targetDistance <= this.aoeRange) {
					colour = 2
				}
			}

			return colour
			//return manhattan === 0 ? 3 : manhattan < 2 ? 2 : manhattan < 11 ? 1 : 0
		})

	}
	onClick(pickedTileCoords, pickedUnitId) {
		const casterCoords = this.model.getUnitCoordsById(this.castingUnitId)
		if (pickedTileCoords !== undefined) {

			const targetDistanceFromCaster = manhattan(casterCoords, pickedTileCoords)
			if (targetDistanceFromCaster >= this.minTargetDistance && targetDistanceFromCaster <= this.maxTargetDistance) {
				console.log(`TARGET: ${pickedTileCoords}`)
				return true // handled click!
			}

			else {
				console.log(`ignored click on tile which is not in range: ${pickedTileCoords}`)
			}

			//const midHeight = this.view.fieldView.getTileAtCoords(pickedTileCoords).midHeight
			//cameraController.setTargetCenter([pickedTileCoords[0] + 0.5, midHeight, pickedTileCoords[1] + 0.5])
		}
		return false // click not handled, allow default click behaviour (i.e. select unit)
	}
}
