import BattleSimulator from './BattleSimulator.js'
import WalkPathing from './WalkPathing.js'
import * as v2 from '../util/v2.js'
import Dijkstra from '../util/Dijkstra.js';

export default class AIBattleSimulator extends BattleSimulator {

	advanceWithAI() {
		this.advance()
		// if the next unit is ai-controlled, call makeAIDecision(), advance the simulator, and repeat
		while (true) {
			if (this.model.getVictoryState()) {
				return
			}
			const activeUnitId = this.model.getActiveUnitId()
			const activeUnit = this.model.getUnitById(activeUnitId)
			if (activeUnit.aiType === undefined) { break }
			this.makeAIDecision(activeUnitId, activeUnit)
			this.advance()
		}
	}

	makeAIDecision(activeUnitId, activeUnit) {
		//this.executeDecision(2, activeUnit.pos) // cast fireball on self
		//const newFacing = (activeUnit.facing + 1) % 4 // turn right
		//this.executeDecision(0, newFacing, activeUnit.teamId) // abilityId 0 is always supposed to be the Face ability!

		const FACE_ABILITY_ID = 0
		const MOVE_ABILITY_ID = 1
		const MELEE_ABILITY_ID = 2

		const moveAbility = this.model.getAbilityById(activeUnitId, MOVE_ABILITY_ID)
		const movesLeft = moveAbility.args.maxDistance

		const startCoords = activeUnit.pos
		const maxDistance = Infinity
		const walkPathing = new WalkPathing(this.model, startCoords, maxDistance) // Dijkstra!

		const meleeOptions = []
		_.each(this.model.units, (otherUnit, otherUnitId) => {
			// enemy unit?
			if (otherUnit.teamId !== activeUnit.teamId) {
				// adjacent squares
				v2.eachInRange(otherUnit.pos, 1, 1, (adjacentPos) => {
					const walkDistance = walkPathing.getWalkDistance(adjacentPos)
					if (walkDistance !== undefined) {
						meleeOptions.push({
							pos: v2.clone(adjacentPos),
							distance: walkDistance,
							unitId: otherUnitId,
							unit: otherUnit,
							//relativeEnemyFacing: ???, // TODO:
						})
					}
				})
			}
		})

		// if anyone is within range, attack them this turn
		const immediateOptions = _.filter(meleeOptions, option => option.distance <= movesLeft)
		if (immediateOptions.length) {
			const chosenOption = _.sample(immediateOptions) // choose one at random
			if (v2.manhattan(chosenOption.pos, startCoords) > 0) {
				this.executeDecision(MOVE_ABILITY_ID, chosenOption.pos, activeUnit.teamId)
			}
			this.executeDecision(MELEE_ABILITY_ID, chosenOption.unit.pos, activeUnit.teamId)
		}

		// ... otherwise, move toward a nearby target
		else {
			const closestOption = _.sortBy(meleeOptions, ['distance'])[0]
			if (closestOption) {
				const path = walkPathing.findAppealingPath(closestOption.pos)
				const farthestPos = path[movesLeft - 1]
				this.executeDecision(MOVE_ABILITY_ID, farthestPos, activeUnit.teamId)
			}

			// ... can't path to any target positions, so wander aimlessly
			else {
				console.log(`[AIBattleSimulator] - wander aimlessly?`)
				const randomPositions = []
				v2.eachInRange(activeUnit.pos, 1, movesLeft, (nearbyPos) => {
					const walkDistance = walkPathing.getWalkDistance(nearbyPos)
					if (walkDistance !== undefined && walkDistance <= movesLeft) {
						randomPositions.push(v2.clone(nearbyPos))
					}
				})
				if (randomPositions.length) {
					this.executeDecision(MOVE_ABILITY_ID, _.sample(randomPositions), activeUnit.teamId)
				}
				
				// ... can't move at all!
				else {
					// pass
					console.log(`[AIBattleSimulator] - unit can't move!`)
				}
			}
		}

		// face!
		const lastFacing = activeUnit.facing
		this.executeDecision(FACE_ABILITY_ID, lastFacing, activeUnit.teamId)
	}
	
}

