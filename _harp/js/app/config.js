// Contents are placed in a .js file as opposed to a .json to avoid plugin usage.
// Might fix this if I change my mind.

define(function(){
	var data = {
		init:       function(geometry, audio, video, game, ui){ // Custom function to call after project init
			new ui.Text(new geometry.Vector(24, 16), "Topic").attach();
			new ui.Text(new geometry.Vector(24, 24), data.user.topic).attach();
			ui.box(data.user.greeting);
		},
		resolution: {           // Project screen resolution; note that the properties and [x] and [y], not [width] and [height]
			x: 512,             // - width
			y: 256              // - height
		},
		tileSize:   16,         // Tile size; keep at 16 for most retro NES/GameBoy/SNES games
		path:       "./js/app/", // Path to [app], which contains project-specific files such as sprites and music.
		stage:      "smb",      // The stage skin to use; select from folders in [stage] inside [app]
		char:       "mario",    // The character skin to use; select from folders in [char] inside [app]
		user:       {           // User defined constants
			topic:     "history",
			greeting:      [
				"Welcome to Mario Quiz!",
				"The overworld here contains 15 Question Blocks, each with a value corresponding to its height. The bottom row is worth 100 points, the middle is worth 300, and the top is worth 500.",
				"I haven't added Mario, a functional scoring system, power-ups or sound effects, but rest assured, I'll get to those features soon!",
				"Until then, enjoy clicking on boxes with lit animations.",
				"(Click to close dialog box)"
				// "Contrary to popular belief, \"The Notorious\" Conorambe McGregorilla isn't just any other young silver-backed gorilla. He's dressed like El Chapo in his prime with anacondas at his feet!",
				// "To top it all off, he was even fatally submitted via triangle choke during one fight by the legendary Nate \"Manchild Weed Philosopher\" Diaz from Stockton. (surprise!)",
				// "Remember kids, if at first you don't succeed, just give up and smoke some weed.",
				// "...Don't forget to click this box to close it."
			],
			questions: [
				[
					"Question 11",
					"It's worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 12",
					"It's worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 13",
					"It's worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 14",
					"It's worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 15",
					"It's worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 6",
					"It's worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 7",
					"It's worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 8",
					"It's worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 9",
					"It's worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 10",
					"It's worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 1",
					"It's worth 100 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 2",
					"It's worth 100 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 3",
					"It's worth 100 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 4",
					"It's worth 100 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 5",
					"It's worth 100 points.",
					"(Click to close dialog box)"
				]
			]
		}
	};
	return data;
});