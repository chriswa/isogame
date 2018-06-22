import * as gfx from './gfx.js'

export const canvas = document.createElement('canvas')
export const ctx = canvas.getContext('2d')

canvas.style.position = 'absolute'
canvas.style.top = '0'
canvas.style.left = '0'
canvas.style.width = '100vw'
canvas.style.height = '100vh'

gfx.insertBeforeGLCanvas(canvas)

export function clear() {
	twgl.resizeCanvasToDisplaySize(canvas)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	//ctx.fillStyle = '#000'
	//ctx.font = 'bold 18px Arial'
	//ctx.fillText("debugCanvas", canvas.width - 125, 20)
}

