export default class FSM {
	constructor(states) {
		this.states = states
		this.stateName = undefined
		this.state = undefined
	}
	setState(newStateName) {
		if (newStateName !== undefined && this.states[newStateName] === undefined) {
			throw new Error(`(FSM) unregistered state name '${newStateName}'`)
		}
		const oldStateName = this.stateName
		if (this.state) {
			const onExitState = this.state.onExitState
			if (onExitState) {
				onExitState(newStateName)
			}
		}
		this.stateName = newStateName
		this.state = this.states[newStateName]
		if (this.state) {
			const onEnterState = this.state.onEnterState
			if (onEnterState) {
				onEnterState(oldStateName)
			}
		}
	}
}

//const sample = new FSM('off', {
//	off: { update() { } },
//	on: { update() { }, onEnterState(oldStateName) { } },
//})
//...
//sample.state.update()
//sample.setState('on')
//sample.state.update()
