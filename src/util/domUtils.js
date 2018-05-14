export function addRemovableEventListener(target, eventType, listener) {
	target.addEventListener(eventType, listener)
	return () => {
		target.removeEventListener(eventType, listener)
	}
}

export class EventSubscriber {
	constructor() {
		this.destroyCallbacks = []
	}
	unsubscribeAll() {
		this.destroyCallbacks.forEach(callback => { callback() })
	}
	subscribe(target, eventType, listener) {
		target.addEventListener(eventType, listener)
		this.destroyCallbacks.push(() => {
			target.removeEventListener(eventType, listener)
		})
	}
}
