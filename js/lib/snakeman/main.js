var modules = ["geometry", "audio", "video", "game", "ui", "input"];
var imports = (function(){
	var package = "snakeman",
	    imports = [];
	modules.some(function(module){
		imports.push(package + "/" + module);
	});
	return imports;
})();

define(imports, function() {
	var args = [].slice.call(arguments);

	args.some(function(module, index){
		this[modules[index]] = args[index];
	}, this);

	var snakeman = this;
	var config = {
		tileSize:   16,
		fps:        60,
		resolution: {
			x: 256,
			y: 224
		},
		path:       "./js/app/",
		stage:      null,
		char:       null
	};

	function init(data){

		// Config setup
		var properties = ["init", "tileSize", "resolution", "path", "stage", "char", "user"] // Properties to copy
		for (prop in data) {
			if (properties.indexOf(prop) !== -1) {
				config[prop] = data[prop];
			}
		}

		video.init(config);
		ui.init(config, function(){
			ui.box.alert("Loading skins...");
			loop();
			game.init(config, function(){
				ui.box.alert("Fetching music...");
				audio.init(config, function(){
					input.init();
					ui.box.prompt(["Load complete!", "Click this box to start."], function(){
						game.start(function(){
							audio.play(config.stage);
							config.init.apply({}, args);
						});
					});
					audio.play("1up");
				});
			});
		});

		// });
	}

	function loop(){
		game.update();
		ui.update();
		video.update();
		// setTimeout(loop, 1000/10);
		requestAnimationFrame(loop);
	}

	return {
		config: config,
		init:   init
	};
});
