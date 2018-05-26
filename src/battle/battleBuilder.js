import BattleController from './BattleController.js'

const sampleNames = ("Agmund Amleth Asgeir Bertil Bjarte Borphlum Byggvir Dagur Denkli Diederik Dominic Edgo Egon Einherjar Eirik Elof Erland Fenris Fixandu Gjurd Gorla Grendoz Grompl Halvdan Haukur Helheimr Helva Homlur Ignaas Ingefred Isak Jervis Kari Klemenz Kormorflo Leif Lodewijk Lorbo Lund Malto Mikko Morta Nestor Olander Ormur Ragnvald Remur Sigfinnur Smlorg Somerled Sven Tapani Toivo Torstein Trencha Tryggvi Ull Ulrik Urho Valdimar Valgrind Verdl Vihtori Vixja Wendig Wendirgl").split(' ')

export function buildSampleBattleController(decisionCallback) {
	
	const fieldDescriptor = {
		type: "randomwoods",
		seed: 123,
	}
	
	const unitsModel = {
		0: {
			teamId: 0,
			name: "Hanz", spriteSet: "human_red", pos: [11, 11], facing: 0, hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 47, turnbreaker: 0.454563,
			buffs: {
				0: { buffType: "Poison", power: 1, turnsRemaining: 2, },
			},
			abilities: {
				0: { abilityType: "Face", },
				1: { abilityType: "Walk", distance: 16, },
				2: { abilityType: "Fireball", distance: 5, },
			}
		},
		1: {
			teamId: 1,
			name: "Mordeqai", spriteSet: "goblin_purple", pos: [7, 9], facing: 1, hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 69, turnbreaker: 0.873465,
			buffs: {
			},
			abilities: {
				0: { abilityType: "Face", },
				1: { abilityType: "Walk", distance: 3, },
				2: { abilityType: "Fireball", distance: 5, },
			}
		},
	}

	/*for (let i = 2; i < 32; i += 1) {
		const name = sampleNames[Math.floor(Math.random() * sampleNames.length)]
		unitsModel[i] = {
			teamId: 1,
			name: "Rando", spriteSet: "goblin_green", pos: [ Math.floor(Math.random() * 32), Math.floor(Math.random() * 32) ], facing: Math.floor(Math.random() * 4), hp: 7, maxHp: 7, mana: 4, maxMana: 4, time: 69, turnbreaker: 0.873465,
			buffs: {
			},
			abilities: {
				0: { abilityType: "Walk", distance: 7, },
			}
		}
	}*/

	const turnModel = {
		time: 0,
		activeUnitId: 0,
		//movementUsed: 0,
		//actionUsed: false,
	}

	const myTeamId = 0
	
	return new BattleController(fieldDescriptor, unitsModel, turnModel, myTeamId, decisionCallback)
}
