import * as gfx from './gfx.js'
const gl = gfx.gl

export const position = twgl.v3.create(0, 0, 0)
export const rotation = twgl.v3.create(Math.PI * -0.25, Math.PI * 0.25, Math.PI * 0)
export const scaleVector = twgl.v3.create(80, 80, 80)
let scale = 1

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

export function setScale(scale_) {
	scale = scale_
}

export function getScale() {
	return scale
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

const viewProjectionMatrix = twgl.m4.identity()

export function getViewProjectionMatrix() {
	// create projection matrix
	ortho(viewProjectionMatrix)
	const scaleFactor = scale * Math.min(gl.canvas.height, gl.canvas.width)
	scaleVector[0] = scaleVector[1] = scaleVector[2] = scaleFactor
	twgl.m4.scale(viewProjectionMatrix, scaleVector, viewProjectionMatrix)

	// create view matrix and multiply it in-place with projection matrix
	twgl.m4.rotateX(viewProjectionMatrix, rotation[0], viewProjectionMatrix)
	twgl.m4.rotateY(viewProjectionMatrix, rotation[1], viewProjectionMatrix)
	twgl.m4.rotateZ(viewProjectionMatrix, rotation[2], viewProjectionMatrix)
	twgl.m4.translate(viewProjectionMatrix, position, viewProjectionMatrix)
	
	return viewProjectionMatrix
}

export function getAspectScaleXY() {
	const smallestDimension = Math.min(gl.canvas.height, gl.canvas.width)
	const xScale = gl.canvas.width
	const yScale = gl.canvas.height
	const scaleFactor = scale * smallestDimension

	return [
		scale / xScale * smallestDimension / 16, // FIXME: why /16,
		scale / yScale * smallestDimension / 16, // FIXME: why /16
	]
}

export function worldPosToScreenPos(worldPos, outScreenPos) {
	const matrix = getViewProjectionMatrix()

	const viewportToCanvasMatrix = twgl.m4.identity()
	twgl.m4.scale(viewportToCanvasMatrix, [gl.canvas.width * 0.5, -gl.canvas.height * 0.5, 10000], viewportToCanvasMatrix)
	twgl.m4.translate(viewportToCanvasMatrix, [1, -1, 0], viewportToCanvasMatrix)
	twgl.m4.multiply(viewportToCanvasMatrix, matrix, matrix)
	twgl.m4.transformPoint(matrix, worldPos, outScreenPos)
}

export function getRayFromScreenPos(screenPos) {
	const origin = twgl.v3.create(
		(screenPos[0] / gl.canvas.width * 2) - 1,
		-(screenPos[1] / gl.canvas.height * 2) + 1,
		-1
	)
	const dst = twgl.v3.copy(origin)
	dst[2] = 1

	//ortho(viewProjectionMatrix)
	const matrix = getViewProjectionMatrix()
	twgl.m4.inverse(matrix, matrix)

	twgl.m4.transformPoint(matrix, origin, origin)


	twgl.m4.transformPoint(matrix, dst, dst)
	twgl.v3.subtract(dst, origin, dst)
	twgl.v3.normalize(dst, dst)
	
	const direction = dst

	return { origin, direction }
}
