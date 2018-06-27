import EventEmitter from 'events'

export default class NullTurnTimer extends EventEmitter {
	constructor(millisecs) {
		super()
		this.millisecs = millisecs
	}
	destroy() {
	}
	start(teamId, freeTimeMs) {
	}
	stop() {
	}
	getTimerDetails() {
		return undefined
	}
}
