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
		// TODO: this may be called long after the timer has been started, so it needs to respond with the current time, not the time from when the timer was last started!
		return {
			currentTime: this.value,
			direction: this.direction,
			freeTime: this.freeTime,
			maxTime: this.millisecs,
		}
	}
}
