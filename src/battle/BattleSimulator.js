import ResultAppliers from "./ResultAppliers.js"
import AbilityArchetypes from './AbilityArchetypes.js'

// BattleSimulator public API:
//   battleSimulator = new BattleSimulator(model)
// 	 battleSimulator.advance()
//   const victoryState = battleSimulator.getVictoryState() // check if battle is complete
//   if (!victoryState) {
//     const activeUnitId = model.getActiveUnitId()
//     ;;;
//   }

export default class BattleSimulator {
	constructor(model, resultsQueue) {
		this.model = model
		this.resultsQueue = resultsQueue
		this.victoryState = undefined
	}
	getVictoryState() {
		return this.victoryState
	}
	applyResult(result) { // called from Ability.execute (and this.advance)
		// check if this result should be cancelled/ignored (e.g. if the battle is already victorious)
		if (this.getVictoryState()) { console.log(`ignoring applyResult added after the battle is victorious`); return }
		// immediately update the model with the result
		const resultApplier = ResultAppliers[result.type]
		resultApplier(this.model, result)
		// queue the result
		this.resultsQueue.push(result)
	}
	executeDecision(abilityId, target) {
		if (this.getVictoryState()) { console.log(`ignoring decision made after the battle is victorious`); return }
		//if (this.model.getActiveUnit().teamId !== requestorTeamId) { console.log(`ignoring decision made by incorrect team`) }
		const unitId = this.model.getActiveUnitId()
		const activeUnit = this.model.getUnitById(unitId)
		const abilityType = activeUnit.abilities[abilityId].abilityType
		const abilityArch = AbilityArchetypes[abilityType]
		abilityArch.execute(this.model, unitId, abilityId, target, (result) => {
			this.applyResult(result)
		})
	}




	_checkForVictory() {
		// TODO:
		const victoryState = undefined
		return victoryState
	}
	_executeAndTapNextUntappedActiveUnitEvent(stage) {
		// TODO:
		const didSomethingHappen = false
		return didSomethingHappen
	}
	_isActiveUnitStunned() {
		// TODO:
		return false
	}
	_findEarliestTimedEvent() {
		// TODO:
		const earliestTimedEvent = undefined
		const earliestTimedEventTime = Infinity
		return [ earliestTimedEvent, earliestTimedEventTime ]
	}
	_executeTimedEvent(earliestTimedEvent) {
		// TODO:
		return
	}
	_findEarliestUnitTurn() {
		// TODO:
		let earliestUnitId = undefined
		let earliestTurnTime = Infinity
		_.each(this.model.units, (unit, unitId) => {
			if (unit.nextTurnTime < earliestTurnTime || (unit.nextTurnTime === earliestTurnTime && unit.turnbreaker < this.model.units[earliestUnitId].turnbreaker)) {
				earliestUnitId = unitId
				earliestTurnTime = unit.nextTurnTime
			}
		})
		return [ earliestUnitId, earliestTurnTime ]
	}
	advance() {
		const model = this.model
		while (true) {
			
			// check for victory (or defeat)
			this.victoryState = this._checkForVictory()
			if (this.victoryState) {
				this.applyResult({ type: 'Victory', victoryState: this.victoryState })
				return // caller should check battleSimulator.isBattleComplete() to get victoryState
			}

			// active unit's turn
			if (model.turn.activeUnitId !== undefined) {

				const activeUnit = model.getUnitById(model.turn.activeUnitId)
				if (activeUnit) {

					if (model.turn.stage === 'start') {
						const didSomethingHappen = this._executeAndTapNextUntappedActiveUnitEvent('start') // find the first untapped start-of-turn event, run it, mark it as tapped (or return false)
						if (didSomethingHappen) {
							continue // check for victory and keep going
						}
						this.applyResult({ type: 'Turn', stage: 'middle' })
					}

					if (model.turn.stage === 'middle') {
						if (!this._isActiveUnitStunned()) {
							return // caller should check for victory state, then generate (or prompt for) a decision for the active unit
							// n.b. turn.stage can also be advanced to 'end' by a decision (e.g. Face) or by the TurnTimer
						}
						this.applyResult({ type: 'Turn', stage: 'end' })
					}

					if (model.turn.stage === 'end') {
						const didSomethingHappen = this._executeAndTapNextUntappedActiveUnitEvent('end') // find the first untapped end-of-turn event, run it, mark it as tapped (or return false)
						if (didSomethingHappen) {
							continue // check for victory and keep going
						}
					}
				}

				// either the active unit's turn is complete, or they ceased to exist during their turn
				this.applyResult({ type: 'Turn', clear: true })
				continue // check for victory and keep going
			}

			// there is currently no active unit, so find the next unit, or a timed event, whichever is earliest
			const [ earliestTimedEvent, timedEventTime ] = this._findEarliestTimedEvent()
			const [ earliestUnitId, unitTurnTime ] = this._findEarliestUnitTurn()

			// if there's a timed event next, execute it, remove it, and start over
			if (timedEventTime !== Infinity && timedEventTime <= unitTurnTime) {
				this._executeTimedEvent(earliestTimedEvent)
				continue // check for victory and keep going
			}

			// initialize the next unit's turn, then start over so we can get into the 'start' stage logic
			if (earliestUnitId === undefined) { throw new Error(`BattleSimulator logic error: victory should have triggered since there are no units to take turns`) }
			this.applyResult({ type: 'Turn', activeUnitId: earliestUnitId, stage: 'start' })
			continue // check for victory and keep going (checking for victory is almost certainly redundant, but this simple control flow is preferred)
		}
	}

}
