import * as gfx from './gfx.js'
const gl = gfx.gl

export const position = twgl.v3.create(0, 0, 0)
export const rotation = twgl.v3.create(Math.PI * -0.25, Math.PI * 0.25, Math.PI * 0)
export const scale = twgl.v3.create(80, 80, 80)
let zoomExp = 0
let zoom = 1

function ortho(dstMatrix) {
	twgl.m4.ortho(
		-gl.canvas.width / 2 - 0.5,
		gl.canvas.width / 2 - 0.5,
		gl.canvas.height / 2 - 0.5,
		-gl.canvas.height / 2 - 0.5,
		-10000,
		10000,
		dstMatrix
	)
}

export function getZoomExp() {
	return zoomExp
}
export function setZoomExp(zoomExp_) {
	zoomExp = zoomExp_
	zoom = Math.pow(2, zoomExp)
}

export function getRawZoom() {
	return zoom
}

export function setPosition(x, y, z) {
	position[0] = x
	position[1] = y
	position[2] = z
}

export function getFacing(relFacing = 0) {
	let rightTurns = relFacing - (rotation[1] + Math.PI / 4) / (Math.PI / 2)
	while (rightTurns < 0) { rightTurns += 4 }
	return Math.round(rightTurns) % 4
}

const worldViewProjectionMatrix = twgl.m4.identity()

export function getWorldViewProjectionMatrix() {
	ortho(worldViewProjectionMatrix)
	const scaleFactor = zoom * Math.min(gl.canvas.height, gl.canvas.width) * 1/16
	scale[0] = scale[1] = scale[2] = scaleFactor
	twgl.m4.scale(worldViewProjectionMatrix, scale, worldViewProjectionMatrix)
	twgl.m4.rotateX(worldViewProjectionMatrix, rotation[0], worldViewProjectionMatrix)
	twgl.m4.rotateY(worldViewProjectionMatrix, rotation[1], worldViewProjectionMatrix)
	twgl.m4.rotateZ(worldViewProjectionMatrix, rotation[2], worldViewProjectionMatrix)
	twgl.m4.translate(worldViewProjectionMatrix, position, worldViewProjectionMatrix)
	
	return worldViewProjectionMatrix
}

export function getAspectScaleXY() {
	const smallestDimension = Math.min(gl.canvas.height, gl.canvas.width)
	const xScale = gl.canvas.width
	const yScale = gl.canvas.height
	const scaleFactor = zoom * smallestDimension * 1 / 16

	return [
		zoom / xScale * smallestDimension * 1/16 / 16, // FIXME: why /16 a second time?
		zoom / yScale * smallestDimension * 1/16 / 16, // FIXME: why /16 a second time?
	]
}

export function getRayFromScreenPos(screenPos) {
	const origin = twgl.v3.create(
		(screenPos[0] / gl.canvas.width * 2) - 1,
		-(screenPos[1] / gl.canvas.height * 2) + 1,
		-1
	)
	const dst = twgl.v3.copy(origin)
	dst[2] = 1

	//ortho(worldViewProjectionMatrix)
	const matrix = getWorldViewProjectionMatrix()
	twgl.m4.inverse(matrix, matrix)

	twgl.m4.transformPoint(matrix, origin, origin)


	twgl.m4.transformPoint(matrix, dst, dst)
	twgl.v3.subtract(dst, origin, dst)
	twgl.v3.normalize(dst, dst)
	
	const direction = dst

	return { origin, direction }
}
