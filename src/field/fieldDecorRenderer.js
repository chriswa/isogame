import * as gfx from '../gfx.js'
const gl = gfx.gl


const vertexShaderSource = `
	uniform mat4 u_worldViewProjectionMatrix;

	attribute vec3 a_position;
	attribute vec2 a_texcoord;

	varying vec2 v_texcoord;

	void main() {
		v_texcoord = a_texcoord;
		gl_Position = u_worldViewProjectionMatrix * vec4(a_position, 1.0);
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
	constructor(positionData, texcoordData) {
		this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
			a_position: positionData,
			a_texcoord: texcoordData,
		})
	}
	render(worldViewProjectionMatrix) {
		const uniforms = {
			u_worldViewProjectionMatrix: worldViewProjectionMatrix,
			u_texture: fieldDecorTexture,
		}
		gl.useProgram(programInfo.program)
		twgl.setBuffersAndAttributes(gl, programInfo, this.bufferInfo)
		twgl.setUniforms(programInfo, uniforms)
		twgl.drawBufferInfo(gl, this.bufferInfo)
	}
}
