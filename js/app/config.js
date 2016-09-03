// Contents are placed in a .js file as opposed to a .json to avoid plugin usage.
// Might fix this if I change my mind.

define(function(){
	var data = {
		init:       function(geometry, audio, video, game, ui){ // Custom function to call after project init
			// new ui.Text(new geometry.Vector(24, 16), "Topic").attach();
			// new ui.Text(new geometry.Vector(24, 24), data.user.topic).attach();
			ui.box.alert(data.user.greeting, "OK", function() {
				game.spawn();
			});
		},
		resolution: {                              // Project screen resolution; note that the properties and [x] and [y], not [width] and [height]
			x: 512,                                // - width
			y: 256                                 // - height
		},
		tileSize:   16,                            // Tile size; keep at 16 for most retro NES/GameBoy/SNES games
		path:       "./js/app/",                   // Path to [app], which contains project-specific files such as sprites and music.
		stage:      "smb-overworld",               // The stage skin to use; select from folders in [stage] inside [app]
		stages:     ["smb-overworld", "smb-cave"], // The stage skins available.
		char:       "mario",                       // The character skin to use; select from folders in [char] inside [app]
		user:       {                              // User defined constants
			topic:     "unknown",
			greeting:      [
				"-Welcome to Mario Quiz version 0.2.0!-",
				"In this update, I added a rough settings menu. Can you find it?",
				"(Also, plenty of bug fixes and restructuring went on behind the scenes, too.)",
				"If you're not sure what to do here, know that beyond this screen lies a world full of 15 question blocks with custom text. Click on a box to view its contents!"

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
					"By the way, this is -not- Question 1! It might look a little strange, but that's just how it works around here.",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 12",
					"Anyways, all the sprites are copied directly from Nestopia, a popular emulator for the original Nintendo Entertainment System.",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 13",
					"This question is worth 500 points.",
					"That means all the sprites and their colors are pretty much just how they would look on an actual Nintendo!",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 14",
					"This question is worth 500 points.",
					"Hm, that's all I have to say about this project, to be honest.",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 15",
					"This question is worth 500 points.",
					"Did you just click all fifteen boxes? ...Well, I'm not about to give you anything for it. Congrats, I guess?",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 6",
					"This question is worth 300 points.",
					"Did you know that all these sounds are ripped directly from Super Mario Bros. 3?",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 7",
					"This question is worth 300 points.",
					"I downloaded some Nintendo Sound Files off the net and made some .WAV's out of them.",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 8",
					"This question is worth 300 points.",
					"These sounds are all uncompressed, meaning that they take up over 60 MB of space!",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 9",
					"This question is worth 300 points.",
					"Yep, that's why this app takes so long to load.",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 10",
					"This question is worth 300 points.",
					"I plan to add some more gimmicks to the loading screen to make it more interesting, though.",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 1",
					"This question is worth 100 points.",
					"What question, you ask?",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 2",
					"This question is worth 100 points.",
					"Actually, none of these \"questions\" have anything interesting to see. Move along, now!",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 3",
					"This question is worth 100 points.",
					"Each one of these has different text, though.",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 4",
					"This question is worth 100 points.",
					"Have you tried clicking on Mario yet?",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				],
				[
					"Question 5",
					"This question is worth 100 points.",
					"This is the last question in this row. In case you're wondering, Question 6 is the leftmost question on the row above this one.",
					{
						text:     "(Click here to close this box.)",
						callback: function(){
							this.collapse();
						}
					}
				]
			]
		}
	};
	return data;
});
