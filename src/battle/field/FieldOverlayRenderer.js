import * as gfx from '../../gfx/gfx.js'
const gl = gfx.gl

const depthBonus = 0.00001 // in front of FieldDecor, but behind BillboardGroups

export const colourOptions = {
	NONE: 0,
	SOLID_CYAN: 1,
	SOLID_YELLOW: 2,
	SOLID_RED: 3,
	SOLID_GREY: 4,
}

const vertexShaderSource = `
	uniform mat4 u_viewProjectionMatrix;

	attribute vec3 a_vertpos;
	attribute vec3 a_centerpos;
	attribute float a_colour;

	varying vec3 v_position;
	varying float v_colour;

	void main() {
		v_position = a_vertpos;
		v_colour = a_colour;

		vec4 vertpos = u_viewProjectionMatrix * vec4(a_vertpos, 1.0);
		vec4 centerpos = u_viewProjectionMatrix * vec4(a_centerpos.x, 0.0, a_centerpos.z, 1.0) - ${depthBonus}; // at y=0, and a little bit closer
		gl_Position = vec4(vertpos.xy, centerpos.z, 1.0);
	}
`
const fragmentShaderSource = `precision mediump float;
	uniform sampler2D u_texture;

	varying vec3 v_position;
	varying float v_colour;

	void main() {
		float opacity = v_colour > 0.0 ? 1.0 : 0.0;
		vec3 colour;
		if (v_colour == ${ colourOptions.SOLID_CYAN }.0) {
			colour = vec3(0.1, 0.2, 1.0);
		}
		else if (v_colour == ${ colourOptions.SOLID_YELLOW }.0) {
			colour = vec3(1.0, 1.0, 0.0);
		}
		else if (v_colour == ${ colourOptions.SOLID_RED }.0) {
			colour = vec3(1.0, 0.0, 0.0);
		}
		else if (v_colour == ${ colourOptions.SOLID_GREY }.0) {
			//colour = vec3(0.1, 0.2, 0.5);
			colour = vec3(0.5, 0.4, 0.0);
		}

		float fx = abs(fract(v_position.x + 0.5) - 0.5) * 2.0;
		float fz = abs(fract(v_position.z + 0.5) - 0.5) * 2.0;
		float f = max(fx, fz);
		f = f * f * f * 0.3 + 0.4;
		gl_FragColor = vec4(colour, opacity * f);
	}
`

const programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource])

export default class FieldOverlayRenderer {
	constructor(positionData, centerData) {
		const vertexCount = positionData.length / 3 // x,y,z
		this.colourData = []
		this.colourData.length = vertexCount
		this.colourData = new Float32Array(this.colourData)

		this.drawCount = vertexCount / 4 * 6 // 6 verts per quad (e.g. 0,1,2,0,2,3)

		this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
			a_vertpos: positionData,
			a_centerpos: centerData,
			a_colour: { buffer: this.colourData, numComponents: 1, drawType: gl.DYNAMIC_DRAW },
		})
		this.bufferInfo.indices = gfx.quadIndexBuffer

		//this.updateColourData() // FIXME: why is this required to avoid "glDrawElements: attempt to access out of range vertices in attribute 1"
	}
	getColourData() {
		return this.colourData
	}
	updateColourData() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.attribs.a_colour.buffer)
		gl.bufferData(gl.ARRAY_BUFFER, this.colourData, gl.DYNAMIC_DRAW)
	}
	render(viewProjectionMatrix) {
		const uniforms = {
			u_viewProjectionMatrix: viewProjectionMatrix,
		}
		gl.useProgram(programInfo.program)
		twgl.setBuffersAndAttributes(gl, programInfo, this.bufferInfo)
		twgl.setUniforms(programInfo, uniforms)
		twgl.drawBufferInfo(gl, this.bufferInfo, gl.TRIANGLES, this.drawCount)
	}
}
