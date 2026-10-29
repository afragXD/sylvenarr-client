export type UnitSfxSlot = 1 | 2 | 3 | 4 | 5;

export type UnitSfxEntry = {
	/** Stem файла в `/static/sfx/heroes/{code}/` (без расширения). */
	slots: Partial<Record<UnitSfxSlot, string>>;
	death?: string;
};

/**
 * Звуки способностей по слоту боя.
 *
 * Слот выбран по смыслу английского имени исходника, а не по его номеру:
 * нумерация в `SFX_clean` местами устарела. Файлы без уверенного соответствия
 * текущей способности сюда не попадают — для слота играет тишина.
 */
export const UNIT_SFX: Record<string, UnitSfxEntry> = {
	Abbess: {
		slots: {
			1: 'Sun_Spear',
			2: 'Divine_Hand',
			3: 'Holy_Armor',
			4: 'Rebirth',
			5: 'Call_To_Arms',
		},
		death: 'death',
	},
	Angel: {
		slots: {
			1: 'Touch_Of_Bliss',
			2: 'Concealment',
			3: 'Where_Are_Your_Wings',
			4: 'Moment_Of_Glory',
			5: 'Day_Of_The_Gods',
		},
		death: 'death',
	},
	Antipaladin: {
		slots: {
			1: 'Black_Axe',
			2: 'Flurry_Of_Blows',
			3: 'Sadist',
			5: 'Taran',
		},
	},
	Archlich: {
		slots: {
			1: 'Death_Cloud',
			2: 'Birth_Of_A_New_One',
			3: 'Priest_Of_Darkness',
			4: 'Terrifying_Scream',
			5: 'Soul_Torment',
		},
		death: 'death',
	},
	Assassin: {
		slots: {
			1: 'Assassins_Stiletto',
			2: 'Face_Cutter',
			3: 'Shinigamis_Verdict',
			5: 'Psychopaths_Evil_Laughter',
		},
		death: 'death',
	},
	BeerElemental: {
		slots: {
			1: 'Homie_De_Flanders',
			2: 'Emergency_Services_Classic',
			3: 'Cucumber_Beer',
			4: 'Torpedo',
			5: 'Pear_Cake',
		},
		death: 'death',
	},
	Demiurge: {
		slots: {
			1: 'Fire_Whip',
			2: 'Doppelganger_Creation',
			3: 'Molochs_Tentacle',
			4: 'Shadow_Mentor',
			5: 'Burning_Blood',
		},
	},
	DemonLord: {
		slots: {
			1: 'Flaming_Tornado',
			2: 'Abyss_Blade',
			3: 'Acid_Spit',
			4: 'Equilibrium',
			5: 'Pandemonium',
		},
	},
	Detective: {
		slots: {
			1: 'Flurry_Of_Blows',
			2: 'Sabotage',
			3: 'Chameleon_Cloak',
			4: 'Auxiliary_Blade',
			5: 'Bandits_Sawed_Off_Shotgun',
		},
	},
	Dracolich: {
		slots: {
			1: 'Death_Breath',
			2: 'Rotten_Fumes',
			4: 'Greater_Necromancy',
			5: 'Cobra_Strike',
		},
	},
	Ectoplasm: {
		slots: {
			1: 'Slime_Slap',
			2: 'Primordial_Energy',
			3: 'Corrosion',
		},
	},
	EvilTree: {
		slots: {
			1: 'Lament_Of_The_Forests',
			2: 'Corrupted_Roots',
			3: 'Invulnerability_Charm',
			4: 'Elven_Wisdom',
		},
		death: 'death',
	},
	GhostWarrior: {
		slots: {
			1: 'Ghostly_Katana',
			2: 'Seppuku',
			3: 'Horn_Of_The_Dead',
			4: 'Archons_Duty',
			5: 'Blitz_Attack',
		},
		death: 'death',
	},
	GoblinShaman: {
		slots: {
			1: 'Steppe_Storm',
			2: 'Mole_Broth_And_A_Tasty_Bun',
			3: 'Living_Battery',
			4: 'Leprechauns_Pot',
		},
		death: 'death',
	},
	GoblinTrapper: {
		slots: {
			1: 'Chitin_Bow',
			2: 'Petty_Thief',
			4: 'Sweet_Delights',
		},
		death: 'death',
	},
	GoldGolem: {
		slots: {
			1: 'Giants_Sword',
			2: 'Eye_Beam',
			3: 'Suppressing_Dome',
			4: 'Sigma_Protocol',
			5: 'Suppression_Of_Will',
		},
		death: 'death',
	},
	Herbalist: {
		slots: {
			1: 'Rune_Of_Vigor',
			2: 'Invigorating_Vapors',
			3: 'Dwarven_Compote',
			4: 'Field_Alchemy',
			5: 'Chicken_Broth',
		},
		death: 'death',
	},
	Imp: {
		slots: { 1: 'Imps_Revenge' },
	},
	Incub: {
		slots: {
			1: 'Runes_Of_Strength',
			3: 'Sculptor_Of_Lies',
			5: 'Rune_Of_Birth',
		},
		death: 'death',
	},
	Inquisitor: {
		slots: {
			1: 'Mace_Of_Order',
			2: 'Torture_Lightning',
			3: 'Telekinesis',
			4: 'Pacification',
			5: 'Crystal_Hail',
		},
		death: 'death',
	},
	Knight: {
		slots: {
			1: 'Striking_Spear',
			2: 'Leveled_Pike_Strike',
			3: 'Battle_Ballad',
		},
		death: 'death',
	},
	Marauder: {
		slots: {
			1: 'Composite_Bow',
			2: 'Suppressing_Fire',
			3: 'Piercing_Shot',
			4: 'Desperate_To_Be_First',
			5: 'Defiled_Fire',
		},
	},
	Mermaid: {
		slots: {
			1: 'Sea_Breeze',
			2: 'Ice_Storm',
			3: 'Yearning_Heart',
			4: 'Deep_Anchor',
			5: 'Ocean_Womb',
		},
		death: 'death',
	},
	Oracle: {
		slots: {
			1: 'Green_Pact',
			2: 'Moment_Of_Might',
			3: 'Enlightenment',
			4: 'Arcanum',
		},
		death: 'death',
	},
	OrcKing: {
		slots: {
			1: 'Captains_Flail',
			2: 'Goblin_Muster',
			3: 'Spiked_Knuckles',
			4: 'Psycho_Orc',
			5: 'Strength_Of_Family',
		},
		death: 'death',
	},
	Paladin: {
		slots: {
			1: 'Holy_Blades',
			2: 'Eternal_Fire',
			3: 'Disintegration_Beam',
			4: 'Cavalry_Charge',
			5: 'Endless_Prayer',
		},
		death: 'death',
	},
	Patriarch: {
		slots: {
			1: 'Sideons_Wrath',
			2: 'Glory_Of_The_Sun',
			3: 'Ladys_Mercy',
			4: 'Heroes_Never_Die',
		},
	},
	Pyro: {
		slots: {
			1: 'Mad_Genius_Flamethrower',
			2: 'Steam_Crossbow',
			3: 'Incendiary_Mixture',
			4: 'Ripper',
		},
	},
	SkeletonChampion: {
		slots: {
			1: 'Champions_Blade',
			4: 'Velotian_Butcher',
		},
	},
	Specter: {
		slots: {
			1: 'Whisper',
			2: 'Dark_Ritual',
			3: 'Accusation',
			4: 'Flay_Skin',
			5: 'Ghostly_Form',
		},
	},
	Titan: {
		slots: {
			1: 'Titans_Lightning',
			2: 'Meteor_Shower',
			3: 'Mighty_Fist',
			4: 'Emperors_Triumph',
			5: 'Electrical_Saturation',
		},
		death: 'death',
	},
	Werewolf: {
		slots: {
			1: 'Rend_Flesh',
			2: 'Lycanthropes_Onslaught',
			3: 'Calming',
		},
	},
	Witch: {
		slots: {
			1: 'Ladys_Revolver_Or_Sharpened_Heel',
			2: 'Milk_Fangs',
			3: 'Death_Sentence',
			4: 'Soul_Decay',
			5: 'Demonic_Form',
		},
		death: 'death',
	},
	Zombie: {
		slots: {
			1: 'Blind_Bite',
			2: 'Vomit_Blast',
		},
	},
};
