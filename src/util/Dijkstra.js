import Grid from './Grid.js'
import * as v2 from './v2.js'

const cardinalVectors = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export default class Dijkstra {
	constructor(width, height, startCoords, walkableCallback, maxDist = Infinity) {
		this.width = width
		this.height = height
		this.resultGrid = this.build(startCoords, walkableCallback, maxDist)
	}

	getResult(coords) {
		if (!coords) { return undefined }
		const resultCell = this.resultGrid.getCell(coords)
		return resultCell ? resultCell.result : undefined
	}

	build(startCoords, walkableCallback, maxDist) {
		this.startCoords = startCoords
		const resultGrid = new Grid(this.width, this.height)
		resultGrid.initCells(coords => {
			return ({ walkable: walkableCallback(coords), result: undefined })
		})
		//console.log(resultGrid.to2dArray(cell=>cell.walkable ? '#' : ':').map(row => row.join(',')))
		const open = []
		const visit = visitCoords => {
			const visitCell = resultGrid.getCell(visitCoords)
			const oldCost = visitCell.result
			const newCost = oldCost + 1
			if (newCost > maxDist) { return }
			for (let [dx, dy] of cardinalVectors) {
				const neighbourCoords = [dx + visitCoords[0], dy + visitCoords[1]]
				const neighbour = resultGrid.getCell(neighbourCoords)
				if (neighbour && neighbour.walkable) {
					const targetCost = neighbour.result
					if (targetCost === undefined) {
						neighbour.result = newCost
						open.push(neighbourCoords)
					}
				}
			}
		}
		resultGrid.getCell(startCoords).result = 0
		open.push(startCoords)
		while (open.length) {
			visit(open.shift())
		}
		return resultGrid
	}

	findAppealingPath(targetCoords) {

		var path = []
		if (!targetCoords) { return path }

		var currentCoords = targetCoords
		var current = this.resultGrid.getCell(currentCoords)
		if (!current || !current.result) { return path } // sanity

		var start = this.resultGrid.getCell(this.startCoords)

		var sanityCounter = 0
		while (current !== start) {
			sanityCounter += 1
			if (sanityCounter > 100) { debugger }
			path.unshift(currentCoords)

			var best = {
				coords: undefined,
				dist: Infinity
			}

			for (var [dx, dy] of cardinalVectors) {
				var neighbourCoords = [dx + currentCoords[0], dy + currentCoords[1]]
				var neighbour = this.resultGrid.getCell(neighbourCoords)
				if (!neighbour || neighbour.result === undefined || neighbour.result >= current.result) {
					continue
				} // not the right direction, into an obstacle, or off the grid

				var distFromStart = v2.distance(neighbourCoords, this.startCoords)
				var distFromTarget = v2.distance(neighbourCoords, targetCoords)
				var totalDist = distFromStart + distFromTarget
				if (totalDist < best.dist) {
					best.dist = totalDist
					best.coords = neighbourCoords
				}
			}
			currentCoords = best.coords
			current = this.resultGrid.getCell(currentCoords)
		}

		return path
	}

}
