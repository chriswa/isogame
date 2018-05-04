import glInstance from './gl.js'

export const gl = glInstance

twgl.resizeCanvasToDisplaySize(gl.canvas)

export const quadIndexBufferMaxQuads = 10922 // theoretical max is 10922 (e.g. floor(UNSIGNED_SHORT / 6))
const quadIndexList = []
for (let quadId = 0; quadId < quadIndexBufferMaxQuads; quadId += 1) {
	quadIndexList[quadId * 6 + 0] = quadId * 4 + 0
	quadIndexList[quadId * 6 + 1] = quadId * 4 + 1
	quadIndexList[quadId * 6 + 2] = quadId * 4 + 2
	quadIndexList[quadId * 6 + 3] = quadId * 4 + 0
	quadIndexList[quadId * 6 + 4] = quadId * 4 + 2
	quadIndexList[quadId * 6 + 5] = quadId * 4 + 3
}

export const quadIndexBufferGlType = gl.UNSIGNED_SHORT
export const quadIndexBuffer = twgl.createBufferFromTypedArray(gl, new Uint16Array(quadIndexList), gl.ELEMENT_ARRAY_BUFFER)


export function clear() {
	twgl.resizeCanvasToDisplaySize(gl.canvas)
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
	gl.clearColor(0.3, 0.5, 0.8, 1)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

export function startLoop(callback) {
	let lastTime = performance.now()
	function mainLoop() {
		const now = performance.now()
		const dt = now - lastTime
		lastTime = now

		callback(dt)

		requestAnimationFrame(mainLoop)
	}
	requestAnimationFrame(mainLoop)
}
