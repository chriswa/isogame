import * as camera from './camera.js'
import * as debugCanvas from './debugCanvas.js'
import * as gfx from './gfx.js'
import BitArray from './../util/BitArray.js'
import billboardGlowOptions from './billboardGlowOptions.js'
const gl = gfx.gl

const depthBonus = 0.00002 // closer than FieldOverlay

const vertexShaderSource = `
	uniform mat4 u_viewProjectionMatrix;
	uniform vec2 u_scaleXY;

	attribute vec3 a_position;
	attribute float a_glow;
	attribute vec2 a_bboffset;
	attribute vec2 a_texcoord;

	varying float v_glowColour;
	varying vec2 v_texcoord;

	void main() {
		v_glowColour = a_glow;
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
	uniform float u_glowStrength; // 0.0 == black, 1.0 == full colour according to glowcolouroption

	varying float v_glowColour;
	varying vec2 v_texcoord;

	void main() {
		float glowcolouroption = floor(v_glowColour);
		vec4 glowcolour = vec4(0.0, 0.0, 0.0, 1.0);
		if (v_glowColour == ${billboardGlowOptions.SOLID_WHITE}.0) {
			glowcolour = vec4(1.0, 1.0, 1.0, 1.0);
		}
		else if (v_glowColour == ${billboardGlowOptions.PULSE_WHITE_BLACK}.0) {
			glowcolour += u_glowStrength * vec4(1.0, 1.0, 1.0, 0.0);
		}
		else if (v_glowColour == ${billboardGlowOptions.PULSE_RED_BLACK}.0) {
			glowcolour += u_glowStrength * vec4(1.0, 0.0, 0.0, 0.0);
		}

		vec4 texcolour = texture2D(u_texture, v_texcoord);
		float alpha = texcolour.a;

		vec4 colour = texcolour;
		if (alpha > 0.0 && alpha < 1.0) {
			if (v_glowColour < 1.0) { discard; }

			float glowalpha = alpha * 2.0;
			colour = (glowalpha * glowcolour);
		}
		if (alpha < 0.1) { discard; }
		gl_FragColor = colour;
	}
`

const programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource])

function loadTexture(textureSrc, callback) {
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
		callback(texture, source)
	})
}

function getAlphaBitArrayFromTexture(texture, source) {
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')
	canvas.width = source.width
	canvas.height = source.height
	ctx.drawImage(source, 0, 0, source.width, source.height)
	const imageData = ctx.getImageData(0, 0, source.width, source.height).data
	const pixelCount = source.width * source.height
	const alphaBitmask = new BitArray(pixelCount)
	for (let i = 0; i < pixelCount; i += 1) {
		const alpha = imageData[i*4 + 3]
		alphaBitmask.write(i, alpha >= 128)
	}
	return alphaBitmask
}


const floatsPerVertex = 8 // x,y,z, glow, bx,by, u,v
const floatsPerBillboard = floatsPerVertex * 4

class Billboard {
	constructor(groupBufferData, bufferDataOffset, spriteData) {
		this.groupData = groupBufferData
		this.dataOffset = bufferDataOffset
		this.spriteData = spriteData
		this.pickId = undefined
		this.spriteName = undefined
	}
	setPosition(pos) {
		for (let v = 0; v < 4; v += 1) {
			this.groupData[this.dataOffset + floatsPerVertex * v + 0] = pos[0] // x
			this.groupData[this.dataOffset + floatsPerVertex * v + 1] = pos[1] // y
			this.groupData[this.dataOffset + floatsPerVertex * v + 2] = pos[2] // z
		}
	}
	getPosition() {
		return [
			this.groupData[this.dataOffset + 0],
			this.groupData[this.dataOffset + 1],
			this.groupData[this.dataOffset + 2],
		]
	}
	setGlow(glow) {
		for (let v = 0; v < 4; v += 1) {
			this.groupData[this.dataOffset + floatsPerVertex * v + 3] = glow
		}
	}
	hide() {
		this.setSprite(0, 0, 0, 0, 0, 0)
	}
	show() {
		this.setSpriteName(this.spriteName)
	}
	setSpriteName(name) {
		this.spriteName = name
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
	moveOffset(newOffset) {
		for (let i = 0; i < floatsPerBillboard; i += 1) {
			this.groupData[newOffset + i] = this.groupData[this.dataOffset + i]
		}
		this.dataOffset = newOffset
	}
}

export default class BillboardGroup {

	constructor(textureSrc, maxCount, spriteData) {
		this.textureAlphaBitArray = undefined
		this.texture = loadTexture(textureSrc, (texture, source) => {
			this.textureAlphaBitArray = getAlphaBitArrayFromTexture(texture, source)
		})
		this.packedBufferData = new Float32Array(floatsPerBillboard * maxCount)
		this.spriteData = spriteData
		this.count = 0
		/** @type { Array<Billboard> } */
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
		this.count += 1
		return billboard
	}
	release(doomedBillboard) {
		console.warn(`untested code!`)
		this.count -= 1
		if (doomedBillboard.arrayIndex !== this.count) {
			const shuffledBillboard = this.list[this.count]

			// swap buffer contents
			shuffledBillboard.moveOffset(doomedBillboard.dataOffset)
			doomedBillboard.dataOffset = this.count * floatsPerBillboard

			// swap list positions
			const doomedListIndex = doomedBillboard.dataOffset / floatsPerBillboard
			this.list[doomedListIndex] = shuffledBillboard
			this.list[this.count] = doomedBillboard
		}
	}
	pushAllBufferDataToGPU() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.packedBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, this.packedBufferData, gl.DYNAMIC_DRAW)
	}
	render(viewProjectionMatrix, tt) {
		this.pushAllBufferDataToGPU()
		//console.log(camera.getAspectScaleXY())
		const glowPulsesPerSecond = 4
		const uniforms = {
			u_viewProjectionMatrix: viewProjectionMatrix,
			u_scaleXY: camera.getAspectScaleXY(),
			u_texture: this.texture,
			u_glowStrength: (Math.sin(glowPulsesPerSecond * tt / 1000 * Math.PI * 2) + 1) / 2,
		}
		gl.useProgram(programInfo.program)
		twgl.setBuffersAndAttributes(gl, programInfo, this.bufferInfo)
		twgl.setUniforms(programInfo, uniforms)
		twgl.drawBufferInfo(gl, this.bufferInfo)
	}
	screenPick(pickScreenPos) {
		const bbScreenPos = twgl.v3.create()
		let pickedUnitId = undefined
		let pickedUnitDistance = Infinity

		const scale = camera.getScale() * Math.min(gl.canvas.height, gl.canvas.width) / 16 / 2

		for (let i = 0; i < this.count; i += 1) {
			/** @type { Billboard } */
			const billboard = this.list[i]

			if (billboard.pickId === undefined) { continue } // skip billboards with no pickId set!

			const worldPos = billboard.getPosition()
			camera.worldPosToScreenPos(worldPos, bbScreenPos)

			const unitDistance = bbScreenPos[2] // * scale //  - depthBonus
			
			const dx = pickScreenPos[0] - bbScreenPos[0]
			const dy = pickScreenPos[1] - bbScreenPos[1]

			// AABB check

			const nw_ox = billboard.groupData[billboard.dataOffset + floatsPerVertex * 0 + 4] * scale
			const nw_oy = billboard.groupData[billboard.dataOffset + floatsPerVertex * 0 + 5] * scale
			const nw_u = billboard.groupData[billboard.dataOffset + floatsPerVertex * 0 + 6] * billboard.spriteData.size
			const nw_v = billboard.groupData[billboard.dataOffset + floatsPerVertex * 0 + 7] * billboard.spriteData.size
			const se_ox = billboard.groupData[billboard.dataOffset + floatsPerVertex * 2 + 4] * scale
			const se_oy = billboard.groupData[billboard.dataOffset + floatsPerVertex * 2 + 5] * scale
			const se_u = billboard.groupData[billboard.dataOffset + floatsPerVertex * 2 + 6] * billboard.spriteData.size
			const se_v = billboard.groupData[billboard.dataOffset + floatsPerVertex * 2 + 7] * billboard.spriteData.size

			const inAABB = dx >= nw_ox && dx <= se_ox && dy >= -nw_oy && dy <= -se_oy

			//debugCanvas.ctx.strokeStyle = 'black'
			//debugCanvas.ctx.strokeRect(bbScreenPos[0] + nw_ox, bbScreenPos[1] - nw_oy, se_ox - nw_ox, -(se_oy - nw_oy))

			if (inAABB && unitDistance < pickedUnitDistance) {

				// pixel check

				if (this.textureAlphaBitArray) {
					const u = Math.floor(nw_u + ((dx - nw_ox) / (se_ox - nw_ox)) * (se_u - nw_u))
					const v = Math.floor(nw_v + ((-dy - nw_oy) / (se_oy - nw_oy)) * (se_v - nw_v))
					const pixelOpaque = this.textureAlphaBitArray.read(u + v * billboard.spriteData.size)

					if (pixelOpaque) {
						pickedUnitId = billboard.pickId
						pickedUnitDistance = unitDistance
					}
				}

				//console.log([dx, dy])
				//console.log([nw_ox, nw_oy, se_ox, se_oy])
				//console.log([nw_u, nw_v, se_u, se_v])

			}
			
		}
		return [pickedUnitId, pickedUnitDistance]
	}
}
