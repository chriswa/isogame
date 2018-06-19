import * as gfx from './gfx.js'
import * as input from '../util/input.js'

export const canvas = document.createElement('canvas')
export const ctx = canvas.getContext('2d')

const canvasSize = 120
const sourceSize = 180

canvas.width = canvasSize
canvas.height = canvasSize

canvas.style.position = 'absolute'
canvas.style.top = '0'
canvas.style.left = '0'
canvas.style.width = `${canvas.width}px`
canvas.style.height = `${canvas.height}px`

hide()

document.body.insertBefore(canvas, gfx.gl.canvas.nextSibling)


ctx.beginPath()
ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 3, 0, 2 * Math.PI, false)
ctx.strokeStyle = 'black'
ctx.lineWidth = 6
ctx.stroke()

ctx.beginPath()
ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 4, 0, 2 * Math.PI, false)
ctx.clip()


//ctx.globalCompositeOperation = 'source-in'

export function render() {
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	const mousePos = input.latestMousePos
	canvas.style.top = mousePos[1] - (canvas.height + 20) + 'px'
	canvas.style.left = mousePos[0] - (canvas.width / 2) + 'px'
	const halfSourceSize = Math.floor(sourceSize / 2)
	ctx.drawImage(gfx.gl.canvas, mousePos[0] - halfSourceSize, mousePos[1] - halfSourceSize, sourceSize, sourceSize, 0, 0, canvas.width, canvas.height)
	ctx.fillStyle = 'black'
	ctx.fillText('+', canvas.width / 2 - 2, canvas.height / 2 + 4)
}

export function hide() {
	canvas.style.top = '-1000px'
}
