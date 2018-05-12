import BaseTargetingController from './base.js'

function manhattan(a, b) {
	if (!a || !b) { return Infinity }
	return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

export default class WalkTargetingController extends BaseTargetingController {
	init() {
		this.maxTargetDistance = 5
		this.minTargetDistance = 1
		this.aoeRange = 1
	}
	update(dt) {
		const casterCoords = this.model.getUnitCoordsById(this.castingUnitId)
		const [ targetCoords, targetUnitId ] = this.view.mousePick(true)
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
}
