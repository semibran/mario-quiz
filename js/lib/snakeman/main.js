var imports = (function(){
	var package = "snakeman",
	    imports = [];
	["geometry", "audio", "video", "game", "ui"].some(function(module){
		imports.push(package + "/" + module);
	});
	return imports
})();

define(imports, function(geometry, audio, video, game, ui) {

	var snakeman = this;
	var config = {
		tileSize:   16,
		fps:        60, 
		resolution: {
			x: 256,
			y: 224
		},
		path:       "/js/app/",
		stage:      null,
		char:       null
	};

	function init(data){
		var properties = ["init", "tileSize", "resolution", "path", "stage", "char"] // Properties to copy

		for (prop in data) {
			if (properties.indexOf(prop) !== -1) {
				config[prop] = data[prop];
			}
		}

		video.init(config);

		// throw new Error("Debug mode!");

		video.load([
			{
				src:      "js/lib/snakeman/text.PNG",
				id:       "text",
				tileSize: 8
			},
			{
				src:      "js/app/stage/smb/smb.PNG",
				id:       "smb",
				tileSize: 16
			}
		], function(){
			game.init(config);
			config.init.call({}, geometry, audio, video, game, ui)
			loop();
		});
	}

	function loop(){
		game.update();
		video.update();
		// throw new Error("Debug mode!");
		setTimeout(loop, 1000 / config.fps);
	}

	return {
		config: config,
		init:   init
	};
});
