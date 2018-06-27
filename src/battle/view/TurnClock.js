import * as gfx from '../../gfx/gfx.js'
const gl = gfx.gl


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
	#define PI 3.1415926538
	
	uniform vec3 u_colourFg;
	uniform vec3 u_colourBg;
	uniform float u_portion;

	varying vec2 v_texcoord;

	void main() {
		float distSqr = v_texcoord.x * v_texcoord.x + v_texcoord.y * v_texcoord.y;
		vec4 colour;
		if (distSqr > 1.0) {
			colour = vec4(1.0, 1.0, 1.0, 0.0);
		}
		else if (distSqr > (0.91 * 0.91)) {
			colour = vec4(0.0, 0.0, 0.0, 1.0);
		}
		else {
			float portion = atan(v_texcoord.y, v_texcoord.x) / PI / 2.0 + 0.5;
			if (portion <= u_portion) {
				colour = vec4(u_colourFg, 1.0);
			}
			else {
				colour = vec4(u_colourBg, 1.0);
			}
		}

		gl_FragColor = colour;
	}
`

const programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource])

const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
	a_position: [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0,], // just a quad
	a_texcoord: [-1, 1, 1, 1, 1, -1, -1, -1,],
	indices: [0, 1, 2, 0, 2, 3,],
})

const margin = 10
const size = 60

function renderClock(portion) {

	let colourBg
	let colourFg
	if (portion < 0) {
		portion += 1
		colourBg = [1, 0, 0]
		colourFg = [1, 1, 1]
	}
	else {
		colourBg = [1, 1, 1]
		colourFg = [0, 0, 1]
	}

	const viewProjectionMatrix = twgl.m4.create()
	twgl.m4.scale(viewProjectionMatrix, [1 / (gl.canvas.width / 2), 1 / (gl.canvas.height / 2), 1], viewProjectionMatrix)
	twgl.m4.translate(viewProjectionMatrix, [-gl.canvas.width / 2 + margin, gl.canvas.height / 2 - (margin + size), 0], viewProjectionMatrix)
	twgl.m4.scale(viewProjectionMatrix, [size, size, 1], viewProjectionMatrix)

	gl.useProgram(programInfo.program)
	twgl.setUniforms(programInfo, {
		u_viewProjectionMatrix: viewProjectionMatrix,
		u_colourBg: colourBg,
		u_colourFg: colourFg,
		u_portion: portion,
	})
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
	twgl.drawBufferInfo(gl, bufferInfo)
}


export default class TurnClock {
	constructor(myTeamId) {
		this.isActive = false
		this.value = 0
		this.isRunning = false
		this.direction = -1
		this.maxTime = 1
		this.myTeamId = myTeamId
	}
	setFromServer(currentTime, freeTime, maxTime, direction) {
		this.isActive = true
		this.isRunning = true
		this.value = this.myTeamId === 1 ? -currentTime : currentTime
		this.freeTime = freeTime
		this.maxTime = maxTime
		this.direction = this.myTeamId === 1 ? -direction : direction
	}
	update(dt) {
		if (this.isRunning && this.isActive) {
			this.value += (dt) * this.direction
			this.value = Math.max(this.value, -this.maxTime)
			this.value = Math.min(this.value, this.maxTime)
		}
	}
	render() {
		if (this.isActive) {
			renderClock(this.value / this.maxTime)
		}
	}
}
