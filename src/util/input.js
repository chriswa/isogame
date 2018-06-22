//import * as debugCanvas from '../gfx/debugCanvas.js'



export const hasTouch = 'ontouchstart' in window

export const latestMousePos = twgl.v3.create()

export const eventQueue = []

const eventElement = document.getElementById('inputEventHelper')

export function isScreenPosCaptured(screenPos) {
	const elementAtPoint = document.elementFromPoint(screenPos[0], screenPos[1])
	return elementAtPoint !== eventElement
}

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

eventElement.addEventListener('mousedown', e => {
	isButtonDown[buttonNumbersToNames[e.button]] = true
	eventQueue.push({ type: 'mousedown', button: e.button, pos: [e.clientX, e.clientY] })
})

document.addEventListener('mouseup', e => {
	isButtonDown[buttonNumbersToNames[e.button]] = false
	eventQueue.push({ type: 'mouseup', button: e.button, pos: [e.clientX, e.clientY] })
})

eventElement.addEventListener('wheel', e => {
	eventQueue.push({ type: 'wheel', deltaY: e.deltaY, pos: [e.clientX, e.clientY] })
})

function getTouchesAsArray(e) {
	const touches = []
	for (let i = 0; i < e.touches.length; i += 1) {
		const touch = e.touches[i]
		touches.push([touch.pageX, touch.pageY])
	}
	return touches
}

eventElement.addEventListener('touchstart', e => {
	eventQueue.push({ type: 'touchstart', touches: getTouchesAsArray(e) })
	e.preventDefault()
})
document.addEventListener('touchmove', e => {
	eventQueue.push({ type: 'touchmove', touches: getTouchesAsArray(e) })
	e.preventDefault()
})
eventElement.addEventListener('touchend', e => {
	eventQueue.push({ type: 'touchend', touches: getTouchesAsArray(e) })
	e.preventDefault()
})

//setTimeout(() => {
//	eventQueue.push({ type: 'touchstart', touches: [[100, 100]]})
//	eventQueue.push({ type: 'touchstart', touches: [[100, 100], [200, 200]]})
//	eventQueue.push({ type: 'touchmove', touches: [[100, 100], [205, 195]]})
//}, 1000)


// ------------------------------------------------------------------------

const inputLayers = []
export function addInputLayer(layer) {
	layer.active = true
	inputLayers.push(layer)
	inputLayers.sort((a, b) => { return a.layerOrder - b.layerOrder }) // ascending
}
export function removeInputLayer(layer) {
	_.remove(inputLayers, layer)
}
export function disableInputLayer(layer) {
	layer.active = false
	_.each(buttonStates, buttonState => {
		buttonState.disableLayer(layer)
	})
}
export function reenableInputLayer(layer) {
	layer.active = true
}

export class InputLayerInterface { // our interface (consumers do not need to inherit)
	constructor() {
		this.layerOrder = 0 // lower numbers are first
		this.dragThreshold = 4
	}
	onMouseDown(pos, button) { return false } // if true, we "capture" the mousedown event and will be called for onClick or onMouseDrag(s)
	onMouseDrag(deltaPos, button) { }
	onMouseDragStart(button) { }
	onMouseDragEnd(button) { }
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
		this.targetLayer = _.find(inputLayers, inputLayer => { return inputLayer.active && inputLayer.onMouseDown(pos, this.button) })
		this.startPos[0] = pos[0]
		this.startPos[1] = pos[1]
		this.isButtonDown = true
	}
	mouseup(pos) {
		if (this.isButtonDown && this.targetLayer) {
			if (this.isDragging) {
				const deltaPos = [pos[0] - this.startPos[0], pos[1] - this.startPos[1]]
				this.targetLayer.onMouseDrag(deltaPos, this.button)
				this.isDragging = false
				this.targetLayer.onMouseDragEnd(this.button)
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
					this.targetLayer.onMouseDragStart(this.button)
				}
			}
			if (this.isDragging) {
				const deltaPos = [pos[0] - this.startPos[0], pos[1] - this.startPos[1]]
				this.startPos[0] = pos[0] // update drag start? this is to support onMouseDrag expecting delta positions
				this.startPos[1] = pos[1] // "
				this.targetLayer.onMouseDrag(deltaPos, this.button)
			}
		}
	}
	disableLayer(layer) {
		if (this.targetLayer === layer) {
			//console.log(`layer disabled`)
			this.targetLayer = undefined
		}
	}
}

const buttonStates = [
	new ButtonState(0, 'left'),
	new ButtonState(1, 'middle'),
	new ButtonState(2, 'right'),
]

export function update() {
	_.each(eventQueue, (event) => {
		const type = event.type
		if (event.touches) {
			processTouchEvent(type, event.touches)
		}
		else if (type === 'wheel') {
			_.find(inputLayers, inputLayer => { return inputLayer.active && inputLayer.onWheel(event.pos, event.deltaY) }) // stop after the first one returns true
		}
		else {
			const buttonState = buttonStates[event.button]
			if (buttonState) {
				buttonState[type](event.pos)
			}
		}
	})
	eventQueue.length = 0 // clear array
	_.each(buttonStates, buttonState => { buttonState.update(latestMousePos) }) // allow drag processing
}

export function isDraggingAnyButton() {
	return !_.every(buttonStates, (buttonState) => { return !buttonState.isDragging })
}

// =========
//  TOUCHES
// =========

const gestureState = new class {
	constructor() {
		this.reset()
	}
	reset() {
		this.targetLayer = undefined
		this.maxFingerCount = 0
		this.averagePos = [0, 0]
		this.averageAngle = 0
		this.averageDistance = 0
	}
	update(touches, callback) {
		const newAveragePos = [0, 0]
		let newAverageAngle = 0
		let newAverageDistance = 0
		let comboCount = 0
		if (touches.length > 0) {
			for (let i1 = 0; i1 < touches.length; i1 += 1) {
				const touch1 = touches[i1]

				newAveragePos[0] += touch1[0]
				newAveragePos[1] += touch1[1]

				for (let i2 = i1 + 1; i2 < touches.length; i2 += 1) {
					const touch2 = touches[i2]

					comboCount += 1

					const dx = touch2[0] - touch1[0]
					const dy = touch2[1] - touch1[1]

					newAverageAngle += Math.atan2(dy, dx)
					newAverageDistance += Math.sqrt(dx * dx + dy * dy)
				}
			}
			newAveragePos[0] /= touches.length
			newAveragePos[1] /= touches.length
			if (comboCount > 0) {
				newAverageAngle /= comboCount
				newAverageDistance /= comboCount
			}
		}

		if (callback) {
			callback(newAveragePos, newAverageAngle, newAverageDistance)
		}

		this.averagePos = newAveragePos
		this.averageAngle = newAverageAngle
		this.averageDistance = newAverageDistance
	}
}

export function isMultiGestureActive() {
	return gestureState.maxFingerCount > 1
}

export function isTouchActive() {
	return gestureState.maxFingerCount === 1
}



function processTouchEvent(type, touches) {
	if (type === 'touchstart') {
		gestureState.maxFingerCount = Math.max(gestureState.maxFingerCount, touches.length)
		if (gestureState.maxFingerCount === 1) {
			latestMousePos[0] = touches[0][0]
			latestMousePos[1] = touches[0][1]
		}
		if (gestureState.targetLayer === undefined) {
			const pos = touches[0]
			gestureState.targetLayer = _.find(inputLayers, inputLayer => { return inputLayer.active && inputLayer.onGestureStart(pos) })
		}
		gestureState.update(touches)
	}
	else if (type === 'touchmove') {
		if (!gestureState.targetLayer) { return }
		gestureState.maxFingerCount = Math.max(gestureState.maxFingerCount, touches.length)
		// one finger means show the magnifier
		if (gestureState.maxFingerCount === 1) {
			if (isScreenPosCaptured(touches[0])) { // if the finger strays into GUI, stop showing the magnifier
				gestureState.reset()
				latestMousePos[0] = -999 // prevent mousepick from using latestMousePos
			}
			else {
				latestMousePos[0] = touches[0][0]
				latestMousePos[1] = touches[0][1]
			}
		}
		// multiple fingers means panning, rotation, and zooming
		else {
			gestureState.update(touches, (newAveragePos, newAverageAngle, newAverageDistance) => {
				const deltaPos = [newAveragePos[0] - gestureState.averagePos[0], newAveragePos[1] - gestureState.averagePos[1]]
				let deltaAngle = newAverageAngle - gestureState.averageAngle
				while (deltaAngle >= Math.PI) { deltaAngle -= Math.PI * 2 }
				while (deltaAngle < -Math.PI) { deltaAngle += Math.PI * 2 }
				const distanceFactor = gestureState.averageDistance !== 0 ? (newAverageDistance / gestureState.averageDistance) : 1

				gestureState.targetLayer.onGestureMove(deltaPos, deltaAngle, distanceFactor)
			})
		}
	}
	else if (type === 'touchend') {
		if (!gestureState.targetLayer) { return }
		if (touches.length === 0) {
			if (gestureState.maxFingerCount === 1) {
				gestureState.targetLayer.onTouchClick(latestMousePos)
			}
			else {
				gestureState.targetLayer.onGestureEnd()
			}
			gestureState.reset()
			latestMousePos[0] = -999 // prevent mousepick from using latestMousePos
		}
		else {
			gestureState.update(touches)
		}
	}
}

