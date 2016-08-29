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
				src:      "./js/lib/snakeman/text.PNG",
				id:       "text",
				tileSize: 8
			},
			{
				src:      "./js/app/stage/smb/smb.png",
				id:       "smb",
				tileSize: 16
			}
		], function(){
			game.init(config);
			input.mouse.init();
			config.init.apply({}, args);
			loop();
		});
	}

	function loop(){
		game.update();
		video.update();
		requestAnimationFrame(loop);
	}

	return {
		config: config,
		init:   init
	};
});
