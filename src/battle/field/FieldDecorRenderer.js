import * as gfx from '../../gfx/gfx.js'
const gl = gfx.gl


const vertexShaderSource = `
	uniform mat4 u_viewProjectionMatrix;

	attribute vec3 a_vertpos;
	attribute vec3 a_centerpos;
	attribute vec2 a_texcoord;

	varying vec2 v_texcoord;

	void main() {
		v_texcoord = a_texcoord;
		vec4 vertpos = u_viewProjectionMatrix * vec4(a_vertpos, 1.0);
		vec4 centerpos = u_viewProjectionMatrix * vec4(a_centerpos.x, 0.0, a_centerpos.z, 1.0); // at y=0
		gl_Position = vec4(vertpos.xy, centerpos.z, 1.0);
	}
`
const fragmentShaderSource = `precision mediump float;
	uniform sampler2D u_texture;

	varying vec2 v_texcoord;

	void main() {
		gl_FragColor = texture2D(u_texture, v_texcoord);
	}
`

const programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource])

const fieldDecorTexture = twgl.createTexture(gl, {
	src: 'assets/field.png',
	mag: gl.NEAREST,
	min: gl.NEAREST,
	level: 0,
	auto: false,
	crossOrigin: "anonymous",
}, (err, texture, source) => {
	// texture loaded!
	//console.log("createTexture callback:", err, texture, source)
})

export default class FieldDecorRenderer {
	constructor(positionData, texcoordData, centerData) {
		this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
			a_vertpos: positionData,
			a_centerpos: centerData,
			a_texcoord: texcoordData,
		})
	}
	render(viewProjectionMatrix) {
		const uniforms = {
			u_viewProjectionMatrix: viewProjectionMatrix,
			u_texture: fieldDecorTexture,
		}
		gl.useProgram(programInfo.program)
		twgl.setBuffersAndAttributes(gl, programInfo, this.bufferInfo)
		twgl.setUniforms(programInfo, uniforms)
		twgl.drawBufferInfo(gl, this.bufferInfo)
	}
}
