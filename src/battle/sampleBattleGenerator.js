const sampleNames = ("Agmund Amleth Asgeir Bertil Bjarte Borphlum Byggvir Dagur Denkli Diederik Dominic Edgo Egon Einherjar Eirik Elof Erland Fenris Fixandu Gjurd Gorla Grendoz Grompl Halvdan Haukur Helheimr Helva Homlur Ignaas Ingefred Isak Jervis Kari Klemenz Kormorflo Leif Lodewijk Lorbo Lund Malto Mikko Morta Nestor Olander Ormur Ragnvald Remur Sigfinnur Smlorg Somerled Sven Tapani Toivo Torstein Trencha Tryggvi Ull Ulrik Urho Valdimar Valgrind Verdl Vihtori Vixja Wendig Wendirgl").split(' ')

export function build() {
	
	const fieldDescriptor = {
		type: "randomwoods",
		seed: 123,
	}
	
	const unitsModel = {
		0: {
			teamId: 0,
			name: "Hanz", spriteSet: "human_red", pos: [11, 11], facing: 0, hp: 7, maxHp: 7, mana: 4, maxMana: 4, nextTurnTime: 47, turnbreaker: 0.454563,
			buffs: {
				0: { buffType: "Poison", power: 1, turnsRemaining: 2, },
			},
			abilities: {
				0: { abilityType: "Face", },
				1: { abilityType: "Walk", distance: 7, },
				2: { abilityType: "Fireball", distance: 5, },
			}
		},
		1: {
			teamId: 1,
			name: "Mordeqai", spriteSet: "goblin_purple", pos: [7, 9], facing: 1, hp: 7, maxHp: 7, mana: 4, maxMana: 4, nextTurnTime: 69, turnbreaker: 0.873465,
			buffs: {
			},
			abilities: {
				0: { abilityType: "Face", },
				1: { abilityType: "Walk", distance: 5, },
				2: { abilityType: "Fireball", distance: 5, },
			}
		},
	}

	for (let unitId = 2; unitId < 3; unitId += 1) {
		const name = sampleNames[Math.floor(Math.random() * sampleNames.length)]
		unitsModel[unitId] = {
			teamId: 1,
			name: "Rando", spriteSet: "goblin_green", pos: [ Math.floor(Math.random() * 32), Math.floor(Math.random() * 32) ], facing: Math.floor(Math.random() * 4), hp: 7, maxHp: 7, mana: 4, maxMana: 4, nextTurnTime: 69, turnbreaker: 0.873465,
			buffs: {
			},
			abilities: {
				0: { abilityType: "Face", },
				1: { abilityType: "Walk", distance: 7, },
				2: { abilityType: "Fireball", distance: 5, },
			}
		}
	}

	const turnModel = {
	}

	const myTeamId = 0

	return {
		fieldDescriptor,
		units: unitsModel,
		turn: turnModel,
	}
}
