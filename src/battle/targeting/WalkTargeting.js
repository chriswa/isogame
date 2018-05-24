import BaseTargetingController from './base.js'
import { colourOptions as overlayColourOptions } from './../field/FieldOverlayRenderer.js'
import { manhattan } from '../../util/mathUtils.js'
import Dijkstra from './../../util/Dijkstra.js'
import Grid from './../../util/Grid.js'
import TerrainTypes from './../field/TerrainTypes.js'

export default class AOETargetingController extends BaseTargetingController {
	init() {
		this.distance = this.extraArgs.distance
		const fieldGrid = new Grid(this.model.field.size, this.model.field.size, this.model.field.squares)
		const casterCoords = this.model.getUnitCoordsById(this.castingUnitId)
		this.dijkstra = new Dijkstra(fieldGrid.width, fieldGrid.height, casterCoords, (coords) => {
			const terrainWalkCost = TerrainTypes[fieldGrid.getCell(coords).terrainTypeId].walkCost
			const occupyingUnitId = this.model.findUnitIdAtPos(coords)
			return terrainWalkCost > 0 && occupyingUnitId === undefined
		})
	}
	render() {
		const [pickedCoords, pickedUnitId, pickedTileCoordsBehindUnit] = this.view.mousePick()

		const casterCoords = this.model.getUnitCoordsById(this.castingUnitId)

		this.updateUnitGlows(pickedUnitId) // caster is solid white, mouseover unit is flashing white-black

		const targetDistance = this.dijkstra.getResult(pickedCoords)
		const isValidTarget = targetDistance > 0 && targetDistance <= this.distance
		const appealingPath = isValidTarget ? this.dijkstra.findAppealingPath(pickedCoords) : []

		this.view.fieldView.updateOverlay(testCoords => {
			let colour = overlayColourOptions.NONE

			const testDistance = this.dijkstra.getResult(testCoords)

			// targeting range
			if (testDistance > 0 && testDistance <= this.distance) {
				colour = this.isCasterActiveAndOwned() ? overlayColourOptions.SOLID_CYAN : overlayColourOptions.SOLID_GREY
			}

			appealingPath.forEach(pathCoords => {
				if (manhattan(pathCoords, testCoords) === 0) {
					colour = overlayColourOptions.SOLID_YELLOW
				}
			})

			const targetDistance = manhattan(pickedCoords, testCoords)
			if (isValidTarget && targetDistance === 0) {
				colour = overlayColourOptions.SOLID_RED
			}


			//colour = dijkstraDistance !== undefined ? ((dijkstraDistance % 3) + 1) : overlayColourOptions.NONE

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

			const targetDistance = this.dijkstra.getResult(pickedTileCoords)

			// clicked on a valid target tile?
			if (targetDistance > 0 && targetDistance <= this.distance) {
				console.log(`TARGET: ${pickedTileCoords}`)
				return true // handled click!
			}
		}
		return false // click not handled, allow default click behaviour (i.e. select unit clicked on, or select default active unit)
	}
}
