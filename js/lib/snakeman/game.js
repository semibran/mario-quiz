define(["./video", "./geometry"], function(video, geometry){

	var config;
	var stage;

	function init(data){
		config = data;
		stage = new Stage(data.stage);
	}

	function update(){
		if (stage) {
			stage.update();
		}
	}

	function Stage(name){
		this.name = name;
		this.tiles = [];
		this.size = new geometry.Vector(0, 0);
		this.rect = null;
		this.surface = null;
		var path = config.path+"stage/"+name+"/";
		require([path+"main.js"], function(data){
			stage.size.x = data.structure[0].length;
			stage.size.y = data.structure.length;
			stage.rect = new geometry.Rect(0, 0, stage.size.x, stage.size.y);
			stage.surface = new video.Surface(stage.size.scaled(config.tileSize));
			stage.sprite = new video.Sprite(stage.rect, stage.surface).attach();

			var row, char, i, j, a, attributes = {}, attribute, value;
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
					if(attributes.hasOwnProperty(char))
						if (Object.prototype.toString.call(attributes[char]) === "[object Array]")
							attributes[char].push(a);
						else
							attributes[char] = [attributes[char], a];
					else
						attributes[char] = a
				}
			}

			for (attribute in data.attributes) {
				value = data.attributes[attribute];
				if (attribute === "animation") {
					for (char in value) {
						if (Object.prototype.toString.call(attributes[char]) === "[object Array]"){
							for (i = 0; i < attributes[char].length; i ++) {
								attributes[char][i].animation = value[char];
							}
						} else {
							attributes[char].animation = value[char];
						}
					}
				} else {
					value.split("").some(function(char){
						if (attributes[char]) {
							if (Object.prototype.toString.call(attributes[char]) === "[object Array]") {
								for (i = 0; i < attributes[char].length; i ++) {
									attributes[char][i][attribute] = true;
								}
							} else {
								attributes[char][attribute] = true;
							}
						}
					});
				}
			}

			for (i = 0; i < stage.size.y; i ++) {
				row = data.structure[i];
				for (j = 0; j < stage.size.x; j ++) {
					char = row[j];
					a = attributes[char];
					if (Object.prototype.toString.call(a) === "[object Array]") {
						a = a[j % a.length];
					}
					tile = new Tile(stage, new geometry.Vector(j, i));
					tile.init(a);
					stage.tiles.push(tile);
				}
			}
		});
	}

	Stage.prototype = {
		update: function(){
			this.tiles.some(function(tile){
				if (tile.animation) {
					tile.update();
				}
			});
		}
	};

	function Tile(stage, pos){
		var t = config.tileSize;
		this.stage = stage;
		this.rect = new geometry.Rect(t*pos.x, t*pos.y, t, t);
		this.surface = null;
		this.solid = false;
		this.nudge = false;
		this.break = false;
		this.front = false;
		this.animation = null;
		this.animationTimer = 0;
		this.animationIndex = 0;
		this.index = null;
	}

	Tile.prototype = {
		init: function(data) {
			var attribute;
			for (attribute in data) {
				this[attribute] = data[attribute];
			}
			if (!this.animation) {
				this.stage.sprite.surface.blit(video.tilesets[this.stage.name][data.index.y][data.index.x], this.rect.pos);

			} else {
				this.sprite = new video.Sprite(this.rect, video.tilesets[this.stage.name][data.index.y][data.index.x]).attach(this.stage.sprite);
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
		}
	};

	function Character(){

	}

	return {
		init: init,
		update: update,

		Stage: Stage,
		Tile: Tile,
		Character: Character
	};
});