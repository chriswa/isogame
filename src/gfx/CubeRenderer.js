import * as gfx from './gfx'
const gl = gfx.gl


// USAGE
///** @type Array<CubeRenderer> */
//const cubeList = []
//function raycastCubes(rayStart, rayDirection) {
//	twgl.v3.normalize(rayDirection, rayDirection)
//	twgl.v3.mulScalar(rayDirection, 0.1, rayDirection)
//	const totalRayCubes = 1000
//	cubeList.length = 0
//	const rayCursor = twgl.v3.copy(rayStart)
//	for (let i = 0; i < totalRayCubes; i += 1) {
//		cubeList.push(new CubeRenderer(0.1, rayCursor[0], rayCursor[1], rayCursor[2], 1 - i / totalRayCubes, 0, 0))
//		twgl.v3.add(rayCursor, rayDirection, rayCursor)
//	}
//}
//document.addEventListener("click", e => {
//	const { origin, direction } = camera.getRayFromMouse(input.mousePos)
//	raycastCubes(origin, direction)
//	const tileCoords = field1.rayPick(origin, direction)
//	console.log(tileCoords)
//})
// ... render
//	cubeList.forEach(cube => {
//		cube.render(viewProjectionMatrix)
//	})




const vertexShaderSource = `
	uniform mat4 u_viewProjectionMatrix;

	attribute vec3 a_position;
	attribute vec2 a_texcoord;

	varying vec2 v_texcoord;

	void main() {
		v_texcoord = a_texcoord;
		gl_Position = u_viewProjectionMatrix * vec4(a_position, 1.0);
	}
`
const fragmentShaderSource = `precision mediump float;
	uniform vec3 u_colour;

	varying vec2 v_texcoord;

	void main() {
		float fu = abs(fract(v_texcoord.x) - 0.5) * 2.0;
		float fv = abs(fract(v_texcoord.y) - 0.5) * 2.0;
		float f = max(fu, fv);
		f = f * f * f * 0.6;

		gl_FragColor = vec4(u_colour * (1.0 - f) + vec3(0.0, 0.0, 0.0) * f, 1.0);
	}
`

const programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource])

const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
	a_position: [ -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5,	 -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5,	],
	/* wrong? */ //a_normal: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
	/* wrong? */ a_texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
	indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
})

const workMatrix = twgl.m4.create()

export default class CubeRenderer {
	constructor(size = 1, x = 0, y = 0, z = 0, r = 1, g = 1, b = 1) {
		this.scale = twgl.v3.create(size, size, size)
		this.position = twgl.v3.create(x, y, z)
		this.colour = twgl.v3.create(r, g, b)
	}
	render(viewProjectionMatrix) {
		twgl.m4.translate(viewProjectionMatrix, this.position, workMatrix)
		twgl.m4.scale(workMatrix, this.scale, workMatrix)
		const uniforms = {
			u_viewProjectionMatrix: workMatrix,
			u_colour: this.colour,
		}
		gl.useProgram(programInfo.program)
		twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
		twgl.setUniforms(programInfo, uniforms)
		twgl.drawBufferInfo(gl, bufferInfo)
	}
}
