import Grid from './../util/Grid.js'
import Dijkstra from './../util/Dijkstra.js'
import TerrainTypes from './field/TerrainTypes.js'

export default class WalkPathing {
	constructor(model, startCoords, maxDistance) {
		this.model = model
		const fieldGrid = new Grid(this.model.field.size, this.model.field.size, this.model.field.squares)
		this.dijkstra = new Dijkstra(fieldGrid.width, fieldGrid.height, startCoords, (coords) => {
			const terrainWalkCost = TerrainTypes[fieldGrid.getCell(coords).terrainTypeId].walkCost
			const occupyingUnitId = this.model.findUnitIdAtPos(coords)
			return terrainWalkCost > 0 && occupyingUnitId === undefined
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