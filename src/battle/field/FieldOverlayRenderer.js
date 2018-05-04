import * as gfx from '../../gfx/gfx.js'
const gl = gfx.gl


const vertexShaderSource = `
	uniform mat4 u_worldViewProjectionMatrix;

	attribute vec3 a_position;
	attribute float a_colour;

	varying vec3 v_position;
	varying float v_colour;

	void main() {
		v_position = a_position;
		v_colour = a_colour;
		gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1.0);
	}
`
const fragmentShaderSource = `precision mediump float;
	uniform sampler2D u_texture;

	varying vec3 v_position;
	varying float v_colour;

	void main() {
		float opacity = v_colour > 0.0 ? 1.0 : 0.0;
		float r = v_colour == 1.0 ? 0.1 : v_colour == 2.0 ? 1.0 : 1.0;
		float g = v_colour == 1.0 ? 0.2 : v_colour == 2.0 ? 1.0 : 0.0;
		float b = v_colour == 1.0 ? 1.0 : v_colour == 2.0 ? 0.0 : 0.0;

		float fx = abs(fract(v_position.x) - 0.5) * 2.0;
		float fz = abs(fract(v_position.z) - 0.5) * 2.0;
		float f = max(fx, fz);
		f = f * f * f * 0.3 + 0.4;
		gl_FragColor = vec4(r, g, b, opacity * f);
	}
`

const programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource])

export default class FieldOverlayRenderer {
	constructor(positionData) {
		const vertexCount = positionData.length / 3 // x,y,z
		this.colourData = []
		this.colourData.length = vertexCount
		this.colourData = new Float32Array(this.colourData)

		this.drawCount = vertexCount / 4 * 6 // 6 verts per quad (e.g. 0,1,2,0,2,3)

		this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
			a_position: positionData,
			a_colour: { buffer: this.colourData, numComponents: 1, drawType: gl.DYNAMIC_DRAW },
		})
		this.bufferInfo.indices = gfx.quadIndexBuffer

		this.updateColourData() // FIXME: why is this required to avoid "glDrawElements: attempt to access out of range vertices in attribute 1"
	}
	getColourData() {
		return this.colourData
	}
	updateColourData() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.attribs.a_colour.buffer)
		gl.bufferData(gl.ARRAY_BUFFER, this.colourData, gl.DYNAMIC_DRAW)
	}
	render(worldViewProjectionMatrix) {
		const uniforms = {
			u_worldViewProjectionMatrix: worldViewProjectionMatrix,
		}
		gl.useProgram(programInfo.program)
		twgl.setBuffersAndAttributes(gl, programInfo, this.bufferInfo)
		twgl.setUniforms(programInfo, uniforms)
		twgl.drawBufferInfo(gl, this.bufferInfo, gl.TRIANGLES, this.drawCount)
	}
}
