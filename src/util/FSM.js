export default class FSM {
	constructor(initialStateName, stateDefaults, states) {
		this.states = _.mapValues(states, state => { return _.defaults(state, stateDefaults) })
		this.stateName = undefined
		this.state = undefined
		this.setState(initialStateName)
	}
	setState(newStateName) {
		if (newStateName !== undefined && this.states[newStateName] === undefined) {
			throw new Error(`(FSM) unregistered state name '${newStateName}'`)
		}
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
//...
//sample.state.update()
//sample.setState('on')
//sample.state.update()
