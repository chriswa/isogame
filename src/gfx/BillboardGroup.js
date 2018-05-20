import * as camera from './camera.js'
import * as gfx from './gfx.js'
const gl = gfx.gl

const depthBonus = 0.00002 // closer than FieldOverlay

const vertexShaderSource = `
	uniform mat4 u_viewProjectionMatrix;
	uniform vec2 u_scaleXY;

	attribute vec3 a_position;
	attribute float a_glow;
	attribute vec2 a_bboffset;
	attribute vec2 a_texcoord;

	varying float v_glow;
	varying vec2 v_texcoord;

	void main() {
		v_glow = a_glow;
		v_texcoord = a_texcoord;

		vec4 origin = u_viewProjectionMatrix * vec4(a_position, 1.0);
		origin += vec4(1.0, 0.0, 0.0, 0.0) * a_bboffset.x * u_scaleXY.x;
		origin += vec4(0.0, 1.0, 0.0, 0.0) * a_bboffset.y * u_scaleXY.y;
		
		origin.z = (u_viewProjectionMatrix * vec4(a_position.x, 0.0, a_position.z, 1.0)).z - ${depthBonus}; // at y=0, and a little bit closer

		gl_Position = origin;
	}
`
const fragmentShaderSource = `precision mediump float;
	uniform sampler2D u_texture;

	varying float v_glow;
	varying vec2 v_texcoord;

	void main() {
		float glowstrength = 1.0 - fract(v_glow);
		vec4 glowcolour = vec4(0.0, 0.0, 0.0, 0.0);
		float glowcolouroption = floor(v_glow);
		if (glowcolouroption == 1.0) {
			glowcolour = vec4(1.0, 1.0, 1.0, glowstrength);
		}
		else if (glowcolouroption == 2.0) {
			glowcolour = vec4(1.0, 0.0, 0.0, glowstrength);
		}

		vec4 texcolour = texture2D(u_texture, v_texcoord);
		float alpha = texcolour.a;
		vec4 colour = texcolour;
		if (alpha > 0.0 && alpha < 1.0) {
			float glowalpha = alpha * 2.0;
			colour = (glowalpha * glowcolour);
		}
		gl_FragColor = colour;
	}
`

const programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource])

function loadTexture(textureSrc) {
	return twgl.createTexture(gl, {
		src: textureSrc,
		mag: gl.NEAREST,
		min: gl.NEAREST,
		level: 0,
		auto: false,
		crossOrigin: "anonymous",
	}, (err, texture, source) => {
		// texture loaded!
		//console.log("createTexture callback:", err, texture, source, source.width, source.height)
	})
}


const floatsPerVertex = 8 // x,y,z, glow, bx,by, u,v
const floatsPerBillboard = floatsPerVertex * 4

class Billboard {
	constructor(groupBufferData, bufferDataOffset, spriteData) {
		this.groupData = groupBufferData
		this.dataOffset = bufferDataOffset
		this.spriteData = spriteData
		this.active = false
	}
	setPosition(pos) {
		for (let v = 0; v < 4; v += 1) {
			this.groupData[this.dataOffset + floatsPerVertex * v + 0] = pos[0] // x
			this.groupData[this.dataOffset + floatsPerVertex * v + 1] = pos[1] // y
			this.groupData[this.dataOffset + floatsPerVertex * v + 2] = pos[2] // z
		}
	}
	setGlow(glow) {
		for (let v = 0; v < 4; v += 1) {
			this.groupData[this.dataOffset + floatsPerVertex * v + 3] = glow
		}
	}
	setSpriteName(name) {
		const sprite = this.spriteData.sprites[name]
		if (!sprite) { throw new Error(`no such sprite: "${name}"`) }
		this.setSprite(sprite.w, sprite.h, sprite.x, sprite.y, sprite.ox, sprite.oy)
	}
	setSprite(width, height, u0, v0, originX, originY) {
		// nw
		this.groupData[this.dataOffset + floatsPerVertex * 0 + 4] = -originX
		this.groupData[this.dataOffset + floatsPerVertex * 0 + 5] = originY
		this.groupData[this.dataOffset + floatsPerVertex * 0 + 6] = u0 / this.spriteData.size
		this.groupData[this.dataOffset + floatsPerVertex * 0 + 7] = v0 / this.spriteData.size
		// sw
		this.groupData[this.dataOffset + floatsPerVertex * 1 + 4] = -originX
		this.groupData[this.dataOffset + floatsPerVertex * 1 + 5] = -height + originY
		this.groupData[this.dataOffset + floatsPerVertex * 1 + 6] = u0 / this.spriteData.size
		this.groupData[this.dataOffset + floatsPerVertex * 1 + 7] = (v0 + height) / this.spriteData.size
		// se
		this.groupData[this.dataOffset + floatsPerVertex * 2 + 4] = width - originX
		this.groupData[this.dataOffset + floatsPerVertex * 2 + 5] = -height + originY
		this.groupData[this.dataOffset + floatsPerVertex * 2 + 6] = (u0 + width) / this.spriteData.size
		this.groupData[this.dataOffset + floatsPerVertex * 2 + 7] = (v0 + height) / this.spriteData.size
		// ne
		this.groupData[this.dataOffset + floatsPerVertex * 3 + 4] = width - originX
		this.groupData[this.dataOffset + floatsPerVertex * 3 + 5] = originY
		this.groupData[this.dataOffset + floatsPerVertex * 3 + 6] = (u0 + width) / this.spriteData.size
		this.groupData[this.dataOffset + floatsPerVertex * 3 + 7] = v0 / this.spriteData.size
	}
	//moveIndex(newIndex) { // for defragging when a billboard is removed which is not the last!
	//}
}

export default class BillboardGroup {
	constructor(textureSrc, maxCount, spriteData) {
		this.texture = loadTexture(textureSrc)
		this.packedBufferData = new Float32Array(floatsPerBillboard * maxCount)
		this.spriteData = spriteData
		this.count = 0
		this.list = []
		for (let i = 0; i < maxCount; i += 1) {
			this.list.push(new Billboard(this.packedBufferData, floatsPerBillboard * i, this.spriteData))
		}
		// init gl
		this.packedBuffer = twgl.createBufferFromTypedArray(gl, this.packedBufferData)
		const bytesPerFloat = 4
		const stride = floatsPerVertex * bytesPerFloat // bytes per float
		this.bufferInfo = {
			numElements: maxCount * 6, // verts per quad with quadIndexBuffer
			indices: gfx.quadIndexBuffer,
			attribs: {
				a_position: { buffer: this.packedBuffer, numComponents: 3, type: gl.FLOAT, stride: stride, offset: 0, },
				a_glow:     { buffer: this.packedBuffer, numComponents: 1, type: gl.FLOAT, stride: stride, offset: 3 * bytesPerFloat, },
				a_bboffset: { buffer: this.packedBuffer, numComponents: 2, type: gl.FLOAT, stride: stride, offset: 4 * bytesPerFloat, },
				a_texcoord: { buffer: this.packedBuffer, numComponents: 2, type: gl.FLOAT, stride: stride, offset: 6 * bytesPerFloat, },
			},
		}
	}
	acquire() {
		if (this.count >= this.list.length) {
			throw new Error(`BillboardGroup acquire failed: no available Billboards in group!`)
		}
		const billboard = this.list[this.count]
		billboard.active = true
		this.count += 1
		return billboard
	}
	release(billboard) {
	}
	pushAllBufferDataToGPU() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.packedBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, this.packedBufferData, gl.DYNAMIC_DRAW)
	}
	render(viewProjectionMatrix) {
		this.pushAllBufferDataToGPU()
		//console.log(camera.getAspectScaleXY())
		const uniforms = {
			u_viewProjectionMatrix: viewProjectionMatrix,
			u_scaleXY: camera.getAspectScaleXY(),
			u_texture: this.texture,
		}
		gl.useProgram(programInfo.program)
		twgl.setBuffersAndAttributes(gl, programInfo, this.bufferInfo)
		twgl.setUniforms(programInfo, uniforms)
		twgl.drawBufferInfo(gl, this.bufferInfo)
	}
	mousePick(mousePos, viewProjectionMatrix) {
		const bbScreenPos = twgl.v3.create()
		for (let i = 0; i < this.count; i += 1) {
			//
			const billboard = this.list[i]
			const worldPos = [billboard.groupData[0], billboard.groupData[1], billboard.groupData[2]]
			twgl.m4.transformPoint(viewProjectionMatrix, worldPos, bbScreenPos)
		}
	}
}
