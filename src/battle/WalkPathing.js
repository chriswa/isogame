import Grid from './../util/Grid.js'
import Dijkstra from './../util/Dijkstra.js'
import TerrainTypes from './TerrainTypes.js'

export default class WalkPathing {
	constructor(model, startCoords, maxDistance, ignoreOccupyingUnits = false) {
		this.model = model
		const fieldGrid = this.model.field.grid
		this.dijkstra = new Dijkstra(fieldGrid.width, fieldGrid.height, startCoords, (coords) => {
			const terrainWalkCost = TerrainTypes[fieldGrid.getCell(coords).terrainTypeId].walkCost
			const occupyingUnitId = this.model.findUnitIdAtPos(coords)
			return terrainWalkCost > 0 && (ignoreOccupyingUnits || occupyingUnitId === undefined)
		}, maxDistance)
	}
	getWalkDistance(coords) {
		return this.dijkstra.getResult(coords)
	}
	findAppealingPath(coords) {
		return this.dijkstra.findAppealingPath(coords)
	}
	isValidTarget(coords) {
		return (this.getWalkDistance(coords) > 0)
	}
}
