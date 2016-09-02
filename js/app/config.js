// Contents are placed in a .js file as opposed to a .json to avoid plugin usage.
// Might fix this if I change my mind.

define(function(){
	var data = {
		init:       function(geometry, audio, video, game, ui){ // Custom function to call after project init
			new ui.Text(new geometry.Vector(24, 16), "Topic").attach();
			new ui.Text(new geometry.Vector(24, 24), data.user.topic).attach();
			ui.box.prompt(data.user.greeting, function(){
				game.spawn();
			});
		},
		resolution: {            // Project screen resolution; note that the properties and [x] and [y], not [width] and [height]
			x: 512,              // - width
			y: 256               // - height
		},
		tileSize:   16,              // Tile size; keep at 16 for most retro NES/GameBoy/SNES games
		path:       "./js/app/",     // Path to [app], which contains project-specific files such as sprites and music.
		stage:      "smb-cave",      // The stage skin to use; select from folders in [stage] inside [app]
		char:       "mario",         // The character skin to use; select from folders in [char] inside [app]
		user:       {                // User defined constants
			topic:     "history",
			greeting:      [
				"Welcome to Mario Quiz v0.1.1!",
				"This update contains a ton of geeky under-the-hood modifications and bug fixes. However, I did fiddle around with the loading screen so you have more text to look at. Oh, and you can bump the normal bricks too yayy",
				"If you're not sure what to do here, know that beyond this screen lies a world full of 15 question blocks with customizable contents. Try clicking on a box to view what's inside!",
				"(...Oh yeah, click on this box to close it.)"

				// "Contrary to popular belief, \"The Notorious\" Conorambe McGregorilla isn't just any other young silver-backed gorilla. He's dressed like El Chapo in his prime with anacondas at his feet!",
				// "To top it all off, he was even fatally submitted via triangle choke during one fight by the legendary Nate \"Manchild Weed Philosopher\" Diaz from Stockton. (surprise!)",
				// "Remember kids, if at first you don't succeed, just give up and smoke some weed.",
				// "...Don't forget to click this box to close it."

				// "Roses are red,",
				// "Violets are blue",
				// "Omae wo mou",
				// "Shindeiru."
			],
			questions: [
				[
					"Question 11",
					"This question is worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 12",
					"This question is worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 13",
					"This question is worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 14",
					"This question is worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 15",
					"This question is worth 500 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 6",
					"This question is worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 7",
					"This question is worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 8",
					"This question is worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 9",
					"This question is worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 10",
					"This question is worth 300 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 1",
					"This question is worth 100 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 2",
					"This question is worth 100 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 3",
					"This question is worth 100 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 4",
					"This question is worth 100 points.",
					"(Click to close dialog box)"
				],
				[
					"Question 5",
					"This question is worth 100 points.",
					"(Click to close dialog box)"
				]
			]
		}
	};
	return data;
});
