import FBM from '../util/FBM.js'
import * as TerrainTypes from './TerrainTypes.js'
import * as v2 from '../util/v2.js'

class BaseFieldBuilder {
	constructor(fieldDescriptor) {
		this.fieldDescriptor = fieldDescriptor
		this.size = 32
		this.fieldMetrics = this.buildFieldMetrics()
		this.tileData = this.buildTileData()
	}
	buildFieldMetrics() {
		return {
			//isPVP: this.fieldDescriptor.isPVP,
			teamStarts: {
				0: {
					facing: 1,
					center: [Math.round(this.size / 6), Math.round(this.size / 2)],
				},
				1: {
					facing: 3,
					center: [Math.round(5 * this.size / 6), Math.round(this.size / 2)],
				},
			}
		}
	}
	buildTileData() { throw new Error('abstract method') }
	drawMeshes() { throw new Error('abstract method') }
	getMetrics() {
		return this.fieldMetrics
	}
	getModel() {
		return {
			size: this.size,
			squares: this.tileData.map(d => { return { terrainTypeId: d.terrainTypeId, height: d.y } })
		}
	}
	getFieldViewData() {
		return {
			size: this.size,
			tileData: this.tileData,
			meshData: this.drawMeshes(),
		}
	}
}

class BasicProceduralFieldBuilder extends BaseFieldBuilder {
	drawMeshes() {
		const decorPositionData = []
		const decorTexcoordData = []
		const decorCenterData = []
		const overlayPositionData = []
		const overlayCenterData = []
		for (let z = 0; z < this.size; z += 1) {
			for (let x = 0; x < this.size; x += 1) {
				const tile = this.tileData[x + z * this.size]
				const corner = tile.cornerHeights

				const xw = (x - 0.5)
				const xe = (x + 0.5)
				const zn = (z - 0.5)
				const zs = (z + 0.5)

				const xmid = x
				const zmid = z

				const u = Math.floor(Math.random() * 2)
				const v = 0
				let u0 = (u + 0) / 16
				let u1 = (u + 1) / 16
				let v0 = (v + 0) / 16
				let v1 = (v + 1) / 16

				tile.overlayQuadId = overlayPositionData.length / 6 / 3

				pushQuadAsVerts(overlayPositionData, [], overlayCenterData, xmid, tile.y, zmid, xw, corner.nw, zn, u0, v0, xw, corner.sw, zs, u0, v1, xe, corner.se, zs, u1, v1, xe, corner.ne, zn, u1, v0)

				pushQuadAsTris(decorPositionData, decorTexcoordData, decorCenterData, xmid, tile.y, zmid, xw, corner.nw, zn, u0, v0, xw, corner.sw, zs, u0, v1, xe, corner.se, zs, u1, v1, xe, corner.ne, zn, u1, v0)

				v0 += 1 / 16
				v1 += 1 / 16

				pushQuadAsTris(decorPositionData, decorTexcoordData, decorCenterData, xmid, tile.y, zmid, xw, corner.nw, zn, u0, v0, xw, 2, zn, u0, v1, xw, 2, zs, u1, v1, xw, corner.sw, zs, u1, v0)
				pushQuadAsTris(decorPositionData, decorTexcoordData, decorCenterData, xmid, tile.y, zmid, xw, corner.sw, zs, u0, v0, xw, 2, zs, u0, v1, xe, 2, zs, u1, v1, xe, corner.se, zs, u1, v0)
				pushQuadAsTris(decorPositionData, decorTexcoordData, decorCenterData, xmid, tile.y, zmid, xe, corner.se, zs, u0, v0, xe, 2, zs, u0, v1, xe, 2, zn, u1, v1, xe, corner.ne, zn, u1, v0)
				pushQuadAsTris(decorPositionData, decorTexcoordData, decorCenterData, xmid, tile.y, zmid, xe, corner.ne, zn, u0, v0, xe, 2, zn, u0, v1, xw, 2, zn, u1, v1, xw, corner.nw, zn, u1, v0)

			}
		}
		const [u0, u1, v0, v1] = [0 / 16, 1 / 16, 0 / 16, 1 / 16]

		return {
			decorPositionData: new Float32Array(decorPositionData),
			decorTexcoordData: new Float32Array(decorTexcoordData),
			decorCenterData: new Float32Array(decorCenterData),
			overlayPositionData: new Float32Array(overlayPositionData),
			overlayCenterData: new Float32Array(overlayCenterData),
		}
	}
}

class RandomWoodsFieldBuilder extends BasicProceduralFieldBuilder {
	buildTileData() {
		const isPVP = this.fieldDescriptor.isPVP
		const seed = this.fieldDescriptor.seed

		const fbm = new FBM(seed, 6, 2, 0.2, 2, 0.07)
		const staticFbm = new FBM(seed, 1, 2, 0.2, 2, 0.87)

		const tileData = []
		for (let z = 0; z < this.size; z += 1) {
			for (let x = 0; x < this.size; x += 1) {
				const cornerHeights = {
					ne: quantize(fbm.sample(x + 0.5, z - 0.5)),
					se: quantize(fbm.sample(x + 0.5, z + 0.5)),
					sw: quantize(fbm.sample(x - 0.5, z + 0.5)),
					nw: quantize(fbm.sample(x - 0.5, z - 0.5)),
				}
				const y = quantize(fbm.sample(x, z))
				//const y = (cornerHeights.nw + cornerHeights.se) / 2

				let terrainTypeId = 'DIRT'
				const staticSample = staticFbm.sample(x, z)
				if (staticSample > 0.2) {
					//terrainTypeId = _.sample('BUSH,DEADBUSH,SMALLTREE,LEAFYBUSH,ROCK1,ROCK2,STICK,BIGTREE'.split(','))
					terrainTypeId = _.sample('BUSH,BUSH,DEADBUSH,SMALLTREE,LEAFYBUSH,LEAFYBUSH,ROCK1,ROCK1,ROCK2,ROCK2,STICK,BIGTREE'.split(','))
				}

				let distanceFromTeamCenter = v2.manhattan([x, z], this.fieldMetrics.teamStarts[0].center)
				if (isPVP) {
					distanceFromTeamCenter = Math.min(distanceFromTeamCenter, v2.manhattan([x, z], this.fieldMetrics.teamStarts[1].center))
				}
				if (distanceFromTeamCenter <= 4) {
					terrainTypeId = 'DIRT'
				}

				tileData.push({
					x: x,
					z: z,
					terrainTypeId, // see TerrainTypes
					y: y,
					edgeSlopeHeights: { n: 4.5, s: 4, e: undefined, w: undefined }, // undefined may signify a step or a jump
					overlayQuadId: 0, // used to detemine which triangles to enable for rendering an overlay for this tile
					west: undefined,  // pointers to neighboring tiles; set below
					east: undefined,  // pointers to neighboring tiles; set below
					north: undefined, // pointers to neighboring tiles; set below
					south: undefined, // pointers to neighboring tiles; set below

					cornerHeights, // cornerHeights is not used outside of fieldGenerator
				})
			}
		}
		// connect neighbours
		for (let z0 = 0; z0 < this.size; z0 += 1) {
			for (let x0 = 0; x0 < this.size; x0 += 1) {
				if (x0 > 0) {
					tileData[z0 * this.size + x0].west = tileData[(z0) * this.size + (x0 - 1)]
				}
				if (x0 < this.size - 1) {
					tileData[z0 * this.size + x0].east = tileData[(z0) * this.size + (x0 + 1)]
				}
				if (z0 > 0) {
					tileData[z0 * this.size + x0].north = tileData[(z0 - 1) * this.size + (x0)]
				}
				if (z0 < this.size - 1) {
					tileData[z0 * this.size + x0].south = tileData[(z0 + 1) * this.size + (x0)]
				}
			}
		}

		return tileData
	}
}


function quantize(v) {
	//return Math.floor(v * 8) / 3
	//return (v * 5 - 3)
	return Math.floor(v * 6 - 2) / 2
}


function pushQuadAsTris(positionData, texcoordData, centerData, xmid, ymid, zmid, x0, y0, z0, u0, v0, x1, y1, z1, u1, v1, x2, y2, z2, u2, v2, x3, y3, z3, u3, v3) {
	positionData.push(
		x0, y0, z0,
		x1, y1, z1,
		x2, y2, z2,
		x0, y0, z0,
		x2, y2, z2,
		x3, y3, z3,
	)
	texcoordData.push(
		u0, v0,
		u1, v1,
		u2, v2,
		u0, v0,
		u2, v2,
		u3, v3,
	)
	for (let i = 0; i < 6; i += 1) {
		centerData.push(xmid, ymid, zmid)
	}
}

function pushQuadAsVerts(positionData, texcoordData, centerData, xmid, ymid, zmid, x0, y0, z0, u0, v0, x1, y1, z1, u1, v1, x2, y2, z2, u2, v2, x3, y3, z3, u3, v3) {
	positionData.push(
		x0, y0, z0,
		x1, y1, z1,
		x2, y2, z2,
		x3, y3, z3,
	)
	texcoordData.push(
		u0, v0,
		u1, v1,
		u2, v2,
		u3, v3,
	)
	for (let i = 0; i < 4; i += 1) {
		centerData.push(xmid, ymid, zmid)
	}
}



export default function fieldBuilderFactory(fieldDescriptor) {
	if (fieldDescriptor.type !== 'randomwoods') { throw new Error(`field type unsupported`) }
	// TODO: support multiple field builders
	return new RandomWoodsFieldBuilder(fieldDescriptor)
}
