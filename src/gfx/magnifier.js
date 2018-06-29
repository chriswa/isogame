import * as gfx from './gfx.js'
import * as input from '../util/input.js'

export const canvas = document.createElement('canvas')
export const ctx = canvas.getContext('2d')

const canvasSize = 120
const sourceSize = 80

canvas.width = canvasSize
canvas.height = canvasSize

canvas.style.position = 'absolute'
canvas.style.top = '0'
canvas.style.left = '0'
canvas.style.width = `${canvas.width}px`
canvas.style.height = `${canvas.height}px`

hide()

gfx.insertBeforeGLCanvas(canvas)


ctx.beginPath()
ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 3, 0, 2 * Math.PI, false)
ctx.strokeStyle = 'black'
ctx.lineWidth = 6
ctx.stroke()

ctx.beginPath()
ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 4, 0, 2 * Math.PI, false)
ctx.clip()

//ctx.globalCompositeOperation = 'copy'

export function render() {
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	const mousePos = input.latestMousePos
	canvas.style.display = 'block'
	canvas.style.top = (mousePos[1] - (canvas.height + 20)) + 'px'
	canvas.style.left = (mousePos[0] - (canvas.width / 2)) + 'px'
	const halfSourceSize = Math.floor(sourceSize / 2)

	let sx = mousePos[0] - halfSourceSize
	let sy = mousePos[1] - halfSourceSize
	let sw = sourceSize
	let sh = sourceSize
	let dx = 0
	let dy = 0
	let dw = canvas.width
	let dh = canvas.height

	// on ios, we can't attempt to drawImage from outside of the bounds of the canvas
	const leftMargin = 0 - sx
	if (leftMargin > 0) {
		sx = 0
		sw -= leftMargin
		dx += leftMargin * (canvas.width / sourceSize)
		dw -= leftMargin * (canvas.width / sourceSize)
	}
	const rightMargin = sx + sw - gfx.gl.canvas.width
	if (rightMargin > 0) {
		sw -= rightMargin
		dw -= rightMargin * (canvas.width / sourceSize)
	}
	const topMargin = 0 - sy
	if (topMargin > 0) {
		sy = 0
		sh -= topMargin
		dy += topMargin * (canvas.height / sourceSize)
		dh -= topMargin * (canvas.height / sourceSize)
	}
	const bottomMargin = sy + sh - gfx.gl.canvas.height
	if (bottomMargin > 0) {
		sh -= bottomMargin
		dh -= bottomMargin * (canvas.height / sourceSize)
	}	

	ctx.drawImage(gfx.gl.canvas, sx, sy, sw, sh, dx, dy, dw, dh)
	
	ctx.fillStyle = 'black'
	ctx.fillText('+', canvas.width / 2 - 2, canvas.height / 2 + 4)
}

export function hide() {
	canvas.style.display = 'none'
}
