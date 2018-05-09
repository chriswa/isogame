export default class FSM {
	constructor(initialStateName, states) {
		this.states = states
		this.stateName = undefined
		this.state = undefined
		this.setState(initialStateName)
	}
	setState(newStateName) {
		const oldStateName = this.stateName
		if (this.state) {
			this.state.onExitState(newStateName)
		}
		this.stateName = newStateName
		this.state = this.states[newStateName]
		if (this.state) {
			this.state.onEnterState(oldStateName)
		}
	}
}

//const sample = new FSM('off', {
//	off: { update() { } },
//	on: { update() { }, onEnterState(oldStateName) { } },
//})

