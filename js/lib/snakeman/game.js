define(["./video", "./geometry", "./input", "./ui", "./audio"], function(video, geometry, input, ui, audio){

	var stage, characters = [], config;

	function init(data, callback){
		config = data;
		video.load([
			{
				src:      "./js/app/char/"+config.char+"/"+config.char+".png",
				id:       config.char,
				tile:     new geometry.Vector(16, 16)
			},
			{
				src:      "./js/app/stage/"+config.stage+"/tileset-"+config.stage+".png",
				id:       config.stage,
				tile:     new geometry.Vector(16, 16)
			}
		], function(){
			exports.initialized = true;
			callback();
		});
	}

	function start(callback) {
		stage = new Stage(config.stage, callback);
	}

	function spawn() {
		new Character(config.char);
		audio.play("pipe");
	}

	function update(){
		if (stage)
			stage.update();
		characters.some(function(char){
			char.update();
		})
	}

	function Stage(name, callback){
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
		require([path+"main.js"], function(data){
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
			stage.tilesTyped["?"].some(function(tile, index){
				input.mouse.mark(tile.rect, function(){
					if (!ui.shadowed) {
						tile.bump(function(){
							audio.play("pause");
							ui.box.prompt(config.user.questions[index]);
						}, true);
						input.mouse.unmark(tile.rect);
					}
				});
			});
			stage.tilesTyped["+"].some(function(tile, index){
				input.mouse.mark(tile.rect, function(){
					if (!ui.shadowed) {
						tile.bump();
					}
				});
			});
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
			var attribute;
			for (attribute in data) {
				this[attribute] = data[attribute];
			}
			var sprite = this.stage[this.front ? "foreground" : "background"];
			var surface = video.tilesets[this.stage.name][data.index.y][data.index.x];
			if (!this.animation && !this.nudge && !this.break) {
				sprite.surface.blit(surface, this.rect.pos);
			} else {
				this.sprite = new video.Sprite(this.rect, surface).attach();
				if (this.front) {
					this.sprite.depth = 2;
				}
			}
		},
		bump: function(callback, question){
			if (!this.bumping) {
				audio.play("bump");
				this.velocity.y = -this.bumpHeight;
				this.bumping = true;
				this.animation = null;
				if (question)
					this.sprite.surface = video.tilesets[this.stage.name][this.index.y][this.index.x+3];
				this.bumpCallback = callback || function(){};
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
		this.rect = new geometry.Rect(this.spawn.x, this.spawn.y + t * 1.5, t, t);
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

	var exports = {
		initialized: false,
		init: init,
		start: start,
		spawn: spawn,
		update: update,
		Stage: Stage,
		Tile: Tile,
		Character: Character
	};

	return exports;
});
