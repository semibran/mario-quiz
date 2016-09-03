define(["./video", "./geometry", "./input", "./ui", "./audio"], function(video, geometry, input, ui, audio){

	var stage,
	    characters = [],
	    hud = {
	    	offset: new geometry.Vector(24, 16),
	    	size:   null,
	    	rect:   null,
	    	sprite: null,
	    	text:   {
	    		top:    null,
	    		bottom: null,
	    	},
	    	init:   function() {
	    		var rect, surface;
	    		this.size = new geometry.Vector(video.display.size.x - this.offset.x * 2, 16);
				rect = new geometry.Rect(this.offset, this.size);
				surface = new video.Surface(this.size);
				this.sprite = new video.Sprite(rect, surface).attach();
				this.sprite.depth = 2;
	    	},
	    	set:    function(top, bottom) {
				this.clear();
				this.text.top = new ui.Text(new geometry.Vector(0, 0), top).attach(this.sprite);
				this.text.bottom = new ui.Text(new geometry.Vector(0, 8), bottom).attach(this.sprite);
	    	},
	    	clear:  function(){
	    		if (this.text.top)
	    			this.text.top.detach(this.sprite);
	    		if (this.text.bottom)
					this.text.bottom.detach(this.sprite);
				this.text.top = null;
				this.text.bottom = null;
				this.sprite.surface.clear();
	    	}
	    },
	    config;

	function init(data, callback){
		config = data;
		var items = [{
			src:      "./js/app/char/"+config.char+"/"+config.char+".png",
			id:       config.char,
			tile:     new geometry.Vector(16, 16)
		}];
		config.stages.some(function(stage){
			items.push({
				src:      "./js/app/stage/"+stage+"/tileset-"+stage+".png",
				id:       stage,
				tile:     new geometry.Vector(16, 16)
			});
		});
		video.load(items, function(){
			exports.initialized = true;
			callback();
		});
	}

	function start(id, callback) {
		hud.init();
		stage = new Stage(id, callback);
	}

	function spawn() {
		new Character(config.char);
		audio.play("pipe");
		characters.some(function(char){
			input.mouse.mark(char.rect, function(){
				var indent = " - ";
				audio.play("coin");
				ui.box.alert([
					"It's a me, Mario!",
					{
						text: "Toggle sound",
						align: "left",
						indent: indent,
						callback: function(){
							var command = audio.gain() ? "mute" : "unmute";
							audio[command].call();
						}
					},
					{
						text: "Reset questions",
						align: "left",
						indent: indent,
						callback: function(){
							this.collapse(function(){
								game.reset(true);
							});
						}
					},
					{
						text: "Return to menu",
						align: "left",
						indent: indent,
						callback: function() {
							this.collapse();
							clear();
							audio.stop();
							audio.play("oops");
							if (game.reload)
								game.reload();
							else
								throw "SnakemanError: Game reload failed.";
						}
					}
				],
				{
					text:"Return to game",
					align: "left",
					indent: indent
				}
				);
			});
		});
	}

	function reset(init) {
		if (init)
			audio.play("bump");
		stage.tilesTyped["?"].some(function(tile, index){
			if (init) {
				tile.bump(function(){
					tile.reset();
				}, null, false);
			}
			if (!input.mouse.marked(tile.rect)) {
				input.mouse.mark(tile.rect, function(){
					if (!ui.shadowed) {
						tile.bump(
						function(){
							var index = this.stage.attributes["."].index;
							this.sprite.surface = video.tilesets[this.stage.name][index.y][index.x];
						},
						function(){
							var content = [];
							config.user.questions[index].some(function(question){
								content.push({
									text: question,
									align: "center",
								});
							});
							ui.box.alert(content, {
								text:     "(Click here to close.)",
								callback: function(){
									audio.play("bonus");
									this.collapse();
								}
							});
							audio.play("pause");
						}, ".");
						input.mouse.unmark(tile.rect);
					}
				}, function(){
					if (!ui.shadowed) {
						document.body.style.cursor = "pointer";
					}
				});
			}
		});
	}

	function clear() {
		hud.clear();
		characters.some(function(character){
			character.sprite.detach();
			input.mouse.unmark(character.rect);
		});
		characters.length = 0;
		stage.tiles.some(function(tile){
			if (input.mouse.marked(tile.rect))
				input.mouse.unmark(tile.rect);
			if (tile.sprite)
				tile.sprite.detach();
		});
		stage.tiles.length = 0;
		stage.foreground.detach();
		stage.background.detach();
		stage = null;
	}

	function update() {
		if (stage) {
			// stage.foreground.surface.clear();
			stage.update();
		}
		characters.some(function(char) {
			char.update();
		});
	}

	function Stage(name, callback) {
		this.name = name;
		this.tiles = [];
		this.tilesTyped = {};
		this.size = new geometry.Vector(0, 0);
		this.sizeScaled = new geometry.Vector(0, 0);
		this.rect = null;
		this.foreground = null;
		this.background = null;
		this.attributes = {};
		this.config = null;
		var path = config.path+"stage/"+name+"/";
		require([path+"meta.js"], function(data){
			stage.config = data;

			stage.size.x = data.structure[0].length;
			stage.size.y = data.structure.length;

			stage.sizeScaled = stage.size.scaled(config.tileSize);

			stage.rect = new geometry.Rect(0, 0, stage.sizeScaled.x, stage.sizeScaled.y);

			stage.foreground = new video.Sprite(stage.rect, new video.Surface(stage.sizeScaled)).attach();
			stage.foreground.depth = 2;

			stage.background = new video.Sprite(stage.rect, new video.Surface(stage.sizeScaled)).attach();

			var row, char, i, j, a, attribute, value, pos;
			for (i = 0; i < data.map.length; i ++) {
				row = data.map[i];
				for (j = 0; j < row.length; j ++) {
					char = row[j];
					a = {
						char:      char,
						solid:     false,
						nudge:     false,
						break:     false,
						front:     false,
						animation: null,
						index:     new geometry.Vector(j, i)
					}
					if(stage.attributes.hasOwnProperty(char))
						if (Object.prototype.toString.call(stage.attributes[char]) === "[object Array]")
							stage.attributes[char].push(a);
						else
							stage.attributes[char] = [stage.attributes[char], a];
					else
						stage.attributes[char] = a;
				}
			}

			for (attribute in data.attributes) {
				value = data.attributes[attribute];
				if (attribute === "animation") {
					for (char in value) {
						if (Object.prototype.toString.call(stage.attributes[char]) === "[object Array]"){
							for (i = 0; i < stage.attributes[char].length; i ++) {
								stage.attributes[char][i].animation = value[char];
							}
						} else {
							stage.attributes[char].animation = value[char];
						}
					}
				} else {
					value.split("").some(function(char){
						if (stage.attributes[char]) {
							if (Object.prototype.toString.call(stage.attributes[char]) === "[object Array]") {
								for (i = 0; i < stage.attributes[char].length; i ++) {
									stage.attributes[char][i][attribute] = true;
								}
							} else {
								stage.attributes[char][attribute] = true;
							}
						}
					});
				}
			}

			for (i = 0; i < stage.size.y; i ++) {
				row = data.structure[i];
				for (j = 0; j < stage.size.x; j ++) {
					char = row[j];
					pos = new geometry.Vector(j, i);
					a = stage.getAttributes(char, pos.x);
					stage.createTile(pos, char);
					if (a.nudge) {
						stage.createTile(pos, " ");
					}
				}
			}

			stage.tilesTyped["+"].some(function(tile, index){
				input.mouse.mark(tile.rect, function(){
					if (!ui.shadowed) {
						tile.bump();
					}
				}, function(){
					if (!ui.shadowed) {
						document.body.style.cursor = "pointer";
					}
				});
			});
			game.reset();
			callback();
		});
	}

	Stage.prototype = {
		createTile: function(pos, type) {
			var tile = new Tile(this, pos);
			var attributes = stage.getAttributes(type, pos.x);
			tile.init(attributes);
			this.tiles.push(tile);
			if (!this.tilesTyped[type])
				this.tilesTyped[type] = [];
			this.tilesTyped[type].push(tile);
			return tile;
		},
		getAttributes: function(type, x) {
			var a = this.attributes[type];
			if (Object.prototype.toString.call(a) === "[object Array]")
				a = a[x % a.length];
			return a;
		},
		update: function() {
			this.tiles.some(function(tile){
				if (tile.animation || tile.bumping) {
					tile.update();
				}
			});
		}
	};

	function Tile(stage, pos) {
		var t = config.tileSize;
		this.stage = stage;
		this.pos = pos;
		this.rect = new geometry.Rect(t*pos.x, t*pos.y, t, t);
		this.data = null;
		this.char = null;
		this.surface = null;
		this.solid = false;
		this.nudge = false;
		this.break = false;
		this.front = false;
		this.animation = null;
		this.animationTimer = 0;
		this.animationIndex = 0;
		this.bumping = false;
		this.bumpHeight = 2;
		this.bumpCallback = null
		this.gravity = 0.25;
		this.velocity = new geometry.Vector(0, 0);
		this.index = null;
	}

	Tile.prototype = {
		init: function(data) {
			this.data = data;
			this.animationTimer = 0;
			this.animationIndex = 0;
			var attribute;
			for (attribute in data) {
				this[attribute] = data[attribute];
			}
			var sprite = this.stage[this.front ? "foreground" : "background"];
			var surface = video.tilesets[this.stage.name][data.index.y][data.index.x];
			if (!this.animation && !this.nudge && !this.break) {
				sprite.surface.blit(surface, this.rect.pos);
			} else {
				if (!this.sprite)
					this.sprite = new video.Sprite(this.rect, surface).attach(/* sprite */);
			}
		},
		reset: function() {
			this.init(this.data);
		},
		bump: function(before, after, sound){
			if (!this.bumping) {
				if (sound || typeof sound === "undefined")
					audio.play("bump");
				this.velocity.y = -this.bumpHeight;
				this.bumping = true;
				this.animation = null;
				if (before)
					before.call(this);
				this.bumpCallback = after || function(){};
			}
		},
		update: function(){
			if (this.animation) {
				this.animationTimer --;
				if (this.animationTimer <= 0) {
					if (!this.animationTimer) {
						this.animationIndex ++;
						if (this.animationIndex >= this.animation.length) {
							this.animationIndex = 0;
						}
					}
					var phase = this.animation[this.animationIndex];
					var x = this.index.x + phase[0];
					var y = this.index.y + phase[1];
					this.sprite.surface = video.tilesets[this.stage.name][y][x];
					this.animationTimer = phase[2];
				}
			}
			if (this.bumping) {
				if (this.rect.pos.y > this.pos.y * config.tileSize) {
					this.rect.pos.y = this.pos.y * config.tileSize;
					this.bumping = false;
					this.velocity.y = 0;
					this.bumpCallback.call(this);
				} else {
					this.velocity.y += this.gravity;
					this.rect.pos.add(this.velocity);
				}
			}
		}
	};

	function Character(type){
		var t = config.tileSize;
		this.type = type;
		this.spawn = new geometry.Vector(stage.config.spawn.x * t, stage.config.spawn.y * t + 1);
		this.rect = new geometry.Rect(this.spawn.x, this.spawn.y + t * 2, t, t);
		this.surface = new video.Surface(this.rect.size);
		this.surface.blit(video.tilesets[type][0][0], 0, 0);
		this.sprite = new video.Sprite(this.rect, this.surface).attach();
		this.sprite.depth = 1;
		characters.push(this);
	}

	Character.prototype = {
		update: function() {
			if (this.rect.y > this.spawn.y) {
				this.rect.y -= 0.5;
			} else {
				this.sprite.depth = 3;
			}
		}
	};

	var game = exports = {
		initialized: false,
		hud:         hud,
		init:        init,
		start:       start,
		spawn:       spawn,
		reset:       reset,
		update:      update,
		Stage:       Stage,
		Tile:        Tile,
		Character:   Character
	};

	return exports;
});
