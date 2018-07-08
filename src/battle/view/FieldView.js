import FieldDecorRenderer from './FieldDecorRenderer.js'
import FieldOverlayRenderer from './FieldOverlayRenderer.js'
import * as raycast from '../../util/raycast.js'

const va = twgl.v3.create()
const vb = twgl.v3.create()
const vc = twgl.v3.create()

export default class FieldView {
	constructor(fieldBuilderViewData) {
		this.size = fieldBuilderViewData.size
		this.tileData = fieldBuilderViewData.tileData
		const meshData = fieldBuilderViewData.meshData

		this.overlayPositionData = meshData.overlayPositionData // Float32Array, quad style (e.g. v0,v1,v2,v3)
		this.decorRenderer = new FieldDecorRenderer(meshData.decorPositionData, meshData.decorTexcoordData, meshData.decorCenterData)
		this.overlayRenderer = new FieldOverlayRenderer(meshData.overlayPositionData, meshData.overlayCenterData)
	}
	updateOverlay(callback) {
		const overlayBuffer = this.overlayRenderer.getColourData()
		for (let tz = 0; tz < this.size; tz += 1) {
			for (let tx = 0; tx < this.size; tx += 1) {
				const ti = tz * this.size + tx
				const colour = callback([tx, tz])

				overlayBuffer[ti * 4 + 0] = colour
				overlayBuffer[ti * 4 + 1] = colour
				overlayBuffer[ti * 4 + 2] = colour
				overlayBuffer[ti * 4 + 3] = colour
			}
		}
		this.overlayRenderer.updateColourData()
	}
	render(viewProjectionMatrix) {
		this.decorRenderer.render(viewProjectionMatrix)
		this.overlayRenderer.render(viewProjectionMatrix)
	}
	getTileAtCoords([tx, tz]) {
		return this.tileData[this.size * tz + tx]
	}

	rayPick(origin, direction) {
		let closestDistance = Infinity
		let closestTileCoords = undefined
		for (let tz = 0; tz < this.size; tz += 1) {
			for (let tx = 0; tx < this.size; tx += 1) {
				const ti = tz * this.size + tx

				for (let triangleIndex = 0; triangleIndex < 2; triangleIndex += 1) {
					const positionIndexA = 3 * (ti * 4                    ) // 0, 0
					const positionIndexB = 3 * (ti * 4 + 1 + triangleIndex) // 1, 2
					const positionIndexC = 3 * (ti * 4 + 2 + triangleIndex) // 2, 3
					va[0] = this.overlayPositionData[positionIndexA + 0]
					va[1] = this.overlayPositionData[positionIndexA + 1]
					va[2] = this.overlayPositionData[positionIndexA + 2]
					vb[0] = this.overlayPositionData[positionIndexB + 0]
					vb[1] = this.overlayPositionData[positionIndexB + 1]
					vb[2] = this.overlayPositionData[positionIndexB + 2]
					vc[0] = this.overlayPositionData[positionIndexC + 0]
					vc[1] = this.overlayPositionData[positionIndexC + 1]
					vc[2] = this.overlayPositionData[positionIndexC + 2]
					
					const distance = raycast.intersectTriangle(origin, direction, va, vb, vc)
					if (distance !== null && distance < closestDistance) {
						//console.log(`hit triangle at ${tx},${tz} at t = ${distance}`)
						closestDistance = distance
						closestTileCoords = [tx, tz]
					}

				}
			}
		}
		return [ closestTileCoords, closestDistance ]
	}
}
