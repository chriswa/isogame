import * as camera from './camera.js'


function angleMod(angle) {
	while (angle < 0) { angle += Math.PI * 2 }
	while (angle >= Math.PI * 2) { angle -= Math.PI * 2 }
	return angle
}
function facingToYaw(facing) {
	return angleMod(Math.PI * (facing * (-1 / 2) + (1 / 4)))
}
function shortestRotationToAngle(angle) {
	return angle <= Math.PI ? angle : angle - Math.PI * 2
}

// FACING
// ------

let targetFacing = 0
let yawActive = false
let yawStart = 0
let yawDelta = 0
let yawT = 0
let yawDuration = 0

function yawCalcDuration(yawDelta) {
	const yawDurationPerTurn = 1600
	return Math.abs(yawDelta) / (Math.PI * 2) * yawDurationPerTurn
}

function yawEasing(t) {
	//return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 // easeInOutCubic from https://gist.github.com/gre/1650294
	return (--t) * t * t + 1 // easeOutCubic
}

export function getFacing() {
	return targetFacing
}

export function setTargetFacing(targetFacing_) {
	targetFacing = targetFacing_
	yawActive = true
	yawStart = camera.rotation[1]
	const yawEnd = facingToYaw(targetFacing)
	yawDelta = shortestRotationToAngle(angleMod(yawEnd - yawStart))
	yawT = 0
	yawDuration = yawCalcDuration(yawDelta)
}

function updateYaw(dt) {
	if (yawActive) {
		yawT += dt / yawDuration
		if (yawT < 1) {
			const x = yawEasing(yawT)
			camera.rotation[1] = angleMod(yawStart + yawDelta * x)
		}
		else {
			yawActive = false
			camera.rotation[1] = facingToYaw(targetFacing)
		}
	}
}

// CENTER
// ------

let targetCenter = twgl.v3.create()
let posActive = false
let posStart = twgl.v3.create()
let posDelta = twgl.v3.create()
let posT = 0
let posDuration = 0
const zeroVector = twgl.v3.create()
let workV3 = twgl.v3.create()

function posCalcDuration(posDelta) {
	const distance = twgl.v3.distance(posDelta, zeroVector)
	return Math.max(Math.min(distance * 25, 300), 100)
}

function posEasing(t) {
	return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 // easeInOutCubic from https://gist.github.com/gre/1650294
	//return (--t) * t * t + 1 // easeOutCubic
}

export function setTargetCenter(targetCenter_) {
	twgl.v3.negate(targetCenter_, targetCenter)
	posActive = true
	twgl.v3.copy(camera.position, posStart)
	twgl.v3.subtract(targetCenter, posStart, posDelta) // set posDelta
	posT = 0
	posDuration = posCalcDuration(posDelta)
}

function updatePos(dt) {
	if (posActive) {
		posT += dt / posDuration
		if (posT < 1) {
			const x = posEasing(posT)
			twgl.v3.mulScalar(posDelta, x, workV3)
			twgl.v3.add(workV3, posStart, camera.position)
		}
		else {
			posActive = false
			twgl.v3.copy(targetCenter, camera.position)
		}
	}
}

// UPDATE
// ------

export function update(dt) {
	updateYaw(dt)
	updatePos(dt)
}
