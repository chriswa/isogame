export const canvas = document.createElement('canvas')
export const ctx = canvas.getContext('2d')

canvas.style.position = 'absolute'
canvas.style.top = '0'
canvas.style.left = '0'
canvas.style.width = '100vw'
canvas.style.height = '100vh'

document.body.appendChild(canvas)

export function clear() {
	twgl.resizeCanvasToDisplaySize(canvas)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	//ctx.fillStyle = 'blue'
	//ctx.fillRect(100, 100, canvas.width - 200, canvas.height - 200)
}

