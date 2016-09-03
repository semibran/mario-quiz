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
		var properties = ["init", "tileSize", "resolution", "path", "stage", "stages", "char", "user"] // Properties to copy
		for (prop in data) {
			if (properties.indexOf(prop) !== -1) {
				config[prop] = data[prop];
			}
		}

		video.init(config);
		ui.init(config, function(){
			input.init();
			loop();
			ui.box.alert("Fetching sound effects...");
			audio.init(config, function(){
				ui.box.alert("Sound effects loaded successfully.", 1, load);
			});
		});

		game.reload = load;
	}

	function load(){
		var prompt = ["Which stage would you like to use?"];
		var index = 0;
		function loadStage(index, callback) {
			var id = config.stages[index];
			var path = config.path+"stage/"+id+"/";
			require([path+"main.js"], function(data){
				prompt.push({
					text:     data.name,
					callback: function(){
						this.collapse(function(){
							config.stage = id;
							ui.load(id, function(){
								ui.box.alert("Loading stage data...");
								game.init(config, function(){
									ui.box.alert("Fetching music...");
									audio.load(config.stage, "bgm", function(){
										ui.box.alert("Load all clear!", "OK", function(){
											game.start(id, function(){
												audio.play(id);
												config.init.apply({}, args);
											});
										});
										audio.play("1up");
									});
								});
							});
						});
					}
				});
				if (++index < config.stages.length) {
					loadStage(index, callback);
				} else {
					callback();
				}
			});
		}
		loadStage(index, function(){
			ui.box.alert(prompt);
		});
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
