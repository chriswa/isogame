export function addRemovableEventListener(target, eventType, listener) {
	target.addEventListener(eventType, listener)
	return () => {
		target.removeEventListener(eventType, listener)
	}
}
