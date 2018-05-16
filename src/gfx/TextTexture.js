const textureSize = 1024
const gridSize = 256

const cellSize = textureSize / gridSize
const cellCount = (textureSize * textureSize) / (gridSize * gridSize)

const canvas = document.createElement('canvas')
canvas.width = textureSize
canvas.height = textureSize
const ctx = canvas.getContext('2d')
ctx.textBaseline = 'top'
// DEBUGGING
//document.body.appendChild(canvas)


const availableCells = []
for (let i = 0; i < cellCount; i += 1) {
	availableCells.push(i)
}

function acquireCell() {
	if (availableCells.length > 0) {
		return availableCells.shift()
	}
	else {
		throw new Error(`TextTexture has run out of cells`)
	}
}
function releaseCell(cellIndex) {
	const x0 = (cellIndex % cellSize) * gridSize
	const y0 = Math.floor(cellIndex / cellSize) * gridSize
	ctx.clearRect(x0, y0, gridSize, gridSize)
	availableCells.unshift(cellIndex)
}

export function drawText(text, fill = 'white', stroke = 'black', font = '20px Verdana', fontTop = 3, fontBottom = 26, strokeWidth = 2.5, strokeMultiplier = 4) {
	const cellIndex = acquireCell()
	const releaseCallback = () => { releaseCell(cellIndex) }

	const x0 = (cellIndex % cellSize) * gridSize
	const y0 = Math.floor(cellIndex / cellSize) * gridSize

	ctx.font = font
	ctx.fillStyle = fill
	ctx.strokeStyle = stroke
	ctx.lineWidth = strokeWidth

	const textWidth = ctx.measureText(text).width

	const x1 = x0 + textWidth
	const y1 = y0 + fontBottom - fontTop
	// DEBUGGING
	ctx.save()
	ctx.fillStyle = 'red'
	ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
	ctx.restore()

	for (let i = 0; i < strokeMultiplier; i += 1) {
		ctx.strokeText(text, x0, y0 - fontTop)
	}
	ctx.fillText(text, x0, y0 - fontTop)

	return { releaseCallback, x0, y0, x1, y1 }
}

// DEBUGGING
//const textOptions = ["+12", "-3", "*fallen*", "*gW*"]
//for (let i = 0; i < 16; i += 1) {
//	const text = textOptions[Math.floor(Math.random() * textOptions.length)]
//	const {x0, releaseCallback} = drawText(text)
//	if (Math.random() < 0.9) { releaseCallback() }
//}
