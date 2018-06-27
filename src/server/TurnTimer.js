import EventEmitter from 'events'

export default class TurnTimer extends EventEmitter {
	constructor(millisecs) {
		super()
		this.millisecs = millisecs
		this.value = 0
		this.freeTime = 0
		this.direction = -1
		this.isRunning = false
		this.isTriggered = false

		this.startTime = undefined
		this.timeoutHandle = undefined
	}
	destroy() {
		this.stop()
	}
	start(teamId, freeTimeMs) {
		if (this.isTriggered) { return }
		if (this.isRunning) {
			this.stop()
		}

		this.direction = teamId === 0 ? -1 : 1
		this.isRunning = true
		this.startTime = Date.now()
		this.freeTime = freeTimeMs

		const remainingTime = this.millisecs - this.value * this.direction + this.freeTime
		console.log(`(TurnTimer) currently ${this.value} - remaining: ${remainingTime} (${this.freeTime} of that is free time)`)
		this.timeoutHandle = setTimeout(() => {
			this.isTriggered = true
			this.emit('timeout', teamId)
		}, remainingTime)
	}
	stop() {
		if (this.isTriggered) { return }
		if (!this.isRunning) { return }

		clearTimeout(this.timeoutHandle)

		this.isRunning = false
		const elapsedTime = Date.now() - this.startTime - this.freeTime
		if (elapsedTime > 0) {
			this.value += this.direction * elapsedTime
		}
		// in case stop() was called before the timeout had a chance to run, dial the clock back to keep it in range [-1..1]
		if (this.value < -this.millisecs) {
			this.value = -this.millisecs
		}
		else if (this.value > this.millisecs) {
			this.value = this.millisecs
		}
	}
	getTimerDetails() {
		const elapsedTime = Date.now() - this.startTime - this.freeTime
		let currentTime = this.value
		let freeTime = 0
		if (elapsedTime <= 0) {
			freeTime = -elapsedTime
		}
		else {
			freeTime = 0
			currentTime = this.value + this.direction * elapsedTime
		}

		return {
			currentTime: currentTime,
			direction: this.direction,
			freeTime: freeTime,
			maxTime: this.millisecs,
		}
	}
}
