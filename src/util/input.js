export const latestMousePos = twgl.v3.create()

export const eventQueue = []

document.addEventListener('mousemove', e => {
	latestMousePos[0] = e.clientX
	latestMousePos[1] = e.clientY
})

const buttonNumbersToNames = ['left', 'middle', 'right']
export const isButtonDown = {
	left: false,
	right: false,
	middle: false,
}

document.addEventListener('contextmenu', e => {
	e.preventDefault()
})

document.addEventListener('mousedown', e => {
	isButtonDown[buttonNumbersToNames[e.button]] = true
	eventQueue.push({ type: 'mousedown', button: e.button, pos: [e.clientX, e.clientY] })
})

document.addEventListener('mouseup', e => {
	isButtonDown[buttonNumbersToNames[e.button]] = false
	eventQueue.push({ type: 'mouseup', button: e.button, pos: [e.clientX, e.clientY] })
})
document.addEventListener('wheel', e => {
	eventQueue.push({ type: 'wheel', deltaY: e.deltaY, pos: [e.clientX, e.clientY] })
})

// ------------------------------------------------------------------------

const inputLayers = []
export function addInputLayer(layer) {
	inputLayers.push(layer)
	inputLayers.sort((a, b) => { return a.layerOrder - b.layerOrder }) // ascending
}
export function removeInputLayer(layer) {
	_.remove(inputLayers, layer)
}

export class InputLayerInterface { // our interface (consumers do not need to inherit)
	constructor() {
		this.layerOrder = 0 // lower numbers are first
		this.dragThreshold = 4
	}
	onMouseDown(pos, button) { return false } // if true, we "capture" the mousedown event and will be called for onClick or onDrag(s)
	onDrag(deltaPos, button) { }
	onClick(pos, button) { }
	onWheel(pos, deltaY) { }
}

class ButtonState {
	constructor(button, buttonName) {
		this.button = button
		this.buttonName = buttonName
		this.isButtonDown = false
		this.isDragging = false
		this.startPos = [0, 0]
		this.targetLayer = undefined
	}
	mousedown(pos) {
		this.targetLayer = _.find(inputLayers, inputLayer => { return inputLayer.onMouseDown(this.button) })
		this.startPos[0] = pos[0]
		this.startPos[1] = pos[1]
		this.isButtonDown = true
	}
	mouseup(pos) {
		if (this.isButtonDown && this.targetLayer) {
			if (this.isDragging) {
				const deltaPos = [pos[0] - this.startPos[0], pos[1] - this.startPos[1]]
				this.targetLayer.onDrag(deltaPos, this.button)
				this.isDragging = false
			}
			else {
				this.targetLayer.onClick(pos, this.button)
			}
		}
		this.isButtonDown = false
	}
	update(pos) {
		if (this.isButtonDown && this.targetLayer) {
			// should we start dragging?
			const dragThreshold = this.targetLayer.dragThreshold
			if (!this.isDragging && dragThreshold) {
				const dragThresholdSquared = dragThreshold * dragThreshold
				const dx = pos[0] - this.startPos[0]
				const dy = pos[1] - this.startPos[1]
				const deltaSquared = dx * dx + dy * dy
				if (deltaSquared >= dragThresholdSquared) {
					this.isDragging = true
				}
			}
			if (this.isDragging) {
				const deltaPos = [pos[0] - this.startPos[0], pos[1] - this.startPos[1]]
				this.startPos[0] = pos[0] // update drag start? this is to support onDrag expecting delta positions
				this.startPos[1] = pos[1] // "
				this.targetLayer.onDrag(deltaPos, this.button)
			}
		}
	}
}

const buttonStates = [
	new ButtonState(0, 'left'),
	new ButtonState(1, 'middle'),
	new ButtonState(2, 'right'),
]

export function update() {
	_.each(eventQueue, ({ type, button, deltaY, pos }) => {
		if (type === 'wheel') {
			_.find(inputLayers, inputLayer => { return inputLayer.onWheel(pos, deltaY) }) // stop after the first one returns true
		}
		else {
			const buttonState = buttonStates[button]
			if (buttonState) {
				buttonState[type](pos)
			}
		}
	})
	eventQueue.length = 0 // clear array
	_.each(buttonStates, buttonState => { buttonState.update(latestMousePos) }) // allow drag processing
}
