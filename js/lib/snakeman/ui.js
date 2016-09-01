define(["./geometry", "./video", "./input"], function(geometry, video, ui) {

	var config;
	var children = [];
	var animations = [];

	function init(data, callback) {
		config = data;
		video.load([
			{
				src:      "./js/app/ui/text.png",
				id:       "text",
				tile:     new geometry.Vector(8, 8)
			},
			{
				src:      "./js/app/ui/box.png",
				id:       "box",
				tile:     new geometry.Vector(16, 16)
			}
		], function(){
			var s = video.tilesets.box;
			Box.prototype.cache = {
				UL: s[0][0],
				U:  s[0][1],
				UR: s[0][2],
				L:  s[1][0],
				C:  s[1][1],
				R:  s[1][2],
				DL: s[2][0],
				D:  s[2][1],
				DR: s[2][2]
			};
			exports.initialized = true;
			callback();
		});
	}

	function box(text, prompt, onclose) {
		box = new Box().attach().text(text).disappear().appear(true);
		if (prompt) {
			input.mouse.mark(box.rect, function(){
				box.disappear(true, onclose);
				input.mouse.unmark(box.rect);
			});
		}
		return box;
	}

	function update() {
		animations.some(function(animation){
			if (animation.running) {
				animation.update();
			}
		});
	}

	function Animation(start, finish, callback){
		callback = callback || function(){};
		this.item = null;
		this.start = start;
		this.finish = finish;
		this.callback = callback;
		this.running = false;
		this.complete = false;
		animations.push(this);
	}

	Animation.prototype = {
		duration: 15,
		init: function(item){
			this.running = true;
			this.item = item;
			this.item.rect.set(this.start);
			return this;
		},
		update: function(){
			var c = video.display.rect.center,  // Center of screen
			    d = this.duration,              // Duration of animation (frames, i.e. 60ths of a second)
			    s = this.start.size,            // Initial animation size
			    f = this.finish.size,           // Final animation size
			    r = this.item.rect,             // Rectangle alias
			    t = config.tileSize,            // Tile size alias
			    v = geometry.Vector,            // Vector alias
			    x, y;                           // i.e. Iterator, index, etc.

			// Check if animation has completed (rectangle has achieved desired size)
			if (Math.round(r.width) == f.x && Math.round(r.height) == f.y) {
				r.size.set(f);
				this.running = false;
				this.complete = true;
				this.callback.call(this.item);
			} else {
				// Animation (increase rectangle size)
				r.size.add((f.x-s.x)/d, (f.y-s.y)/d);
			}

			// Center rectangle based on position
			r.pos.set(c.x - r.width / 2, c.y - r.height / 2);

			this.item.surface.size = r.size;

			this.item.draw();
		}
	};

	function Text(pos, content, shadow) {
		var rect, s = this.glyphSize;

		if (pos instanceof geometry.Rect) {
			rect = pos;
		} else {
			rect = new geometry.Rect(pos.x, pos.y, content.length * s, s);
		}
		var mw = rect.width / s;
		this.rect = rect;
		this.surface = new video.Surface(this.rect.size);
		this.sprite = new video.Sprite(this.rect, this.surface);
		this.sprite.depth = 5;
		this.shadow = shadow;

		var tx = 0, ty = 0, wx;

		this.content = content;

		var t = this.content, word, letters = [];
		for (var i = 0; i < t.length; i ++) {
			while (tx == 0 && t[i] === " ") i ++;
			var c = t[i];
			if (!word || c === " ") {
				word = "";
				var j = i;
				while (j < t.length) {
					if (t[j] !== " ")
						word += t[j];
					else
						break;
					j ++;
				}
				wx = tx;
			}
	
			if (wx + word.length > mw) {
				tx = wx = 0;
				ty ++;
			}

			index = this.sequence.indexOf(c.toUpperCase());
			if (index != -1) {
				x = index % 10;
				y = (index - x) / 10 + (this.shadow ? 5 : 0);
				if (!letters[ty]) letters[ty] = [];
				letters[ty].push({
					char: c,
					surface: video.tilesets.text[y][x],
					pos: tx
				});
			}		
			if (++ tx >= mw) {
				tx = wx = 0;
				ty ++;
			}	
		}

		this.surface.canvas.height = this.surface.size.y = (ty + 1) * (s + 4);

		var prev, surf, x, alignment = "center";
		letters.some(function(line, index){
			surf = new video.Surface(new geometry.Vector(line.length * s, s));
			line.some(function(letter){
				surf.blit(letter.surface, new geometry.Vector(letter.pos * s, 0));
			});
			if (alignment === "left") // Simple enough
				x = 0;
			else if (alignment === "center") // Works like a charm!
				x = this.surface.size.x / 2 - surf.size.x / 2;
			else if (alignment === "right") // PROBLEM: Needs to remove extra right-side spaces?
				x = this.surface.size.x - surf.size.x;
			this.surface.blit(surf, new geometry.Vector(x, index * (s + 4)));
		}, this);

		children.push(this);
	}

	Text.prototype = {
		glyphSize: 8,
		sequence:  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?-'\"<>() ",
		attach:    function(parent) {
			if (parent instanceof Box) {
				parent = parent.sprite;
			}
			this.sprite.attach(parent);
			return this;
		},
		detach:    function(parent) {
			if (parent instanceof Box) {
				parent = parent.sprite;
			}
			this.sprite.detach(parent);
			return this;
		}
	};

	function Box(rect){
		var x, y, w, h, t, s, c, sprite;

		t = config.tileSize;

		x = 2.5;
		y = 2;
		rect = new geometry.Rect(x * t, y * t, (config.resolution.x / t - x * 2)*t, (config.resolution.y / t - y * 2)*t);

		this.size = new geometry.Vector(rect.width / t, rect.height / t);
		this.rect = rect;
		this.surface = new video.Surface(this.rect.size.clone());
		this.sprite = new video.Sprite(this.rect, this.surface);
		this.sprite.depth = 4;
		this.animation = null;
		this.textboxes = [];
		children.push(this);

		exports.shadowed = true;

		c = video.display.rect.center;
		s = new geometry.Vector(config.tileSize, config.tileSize);

		this.draw();

		this.min = {
			size: s,
			rect: new geometry.Rect(c.x - s.x / 2, c.y - s.y / 2, s.x, s.y),
			surface: new video.Surface(s)
		};
		this.max = {
			size: this.rect.size,
			rect: this.rect.clone(),
			surface: this.surface.clone()
		};
	}

	Box.prototype = {
		cache: {},
		childState: function(state) {
			this.sprite.children.some(function(child){ child.visible = state; });
		},
		draw: function(){
			var t = config.tileSize,
			    xf  = this.surface.size.x,
			    yf  = this.surface.size.y,
			    xfr = Math.ceil(xf/t),
			    yfr = Math.ceil(yf/t),
			    c = this.cache,
			    s = this.surface,
			    v = geometry.Vector;

			s.clear();

			for (y = 0; y < yfr; y ++) {
				for (x = 0; x < xfr; x ++) {
					if (x > 0 && x < xfr-1) {
						if (y > 0 && y < yfr-1) {
							s.blit(c.C, new v(x*t, y*t));
						}
						s.blit(c.U, new v(x*t, 0));
						s.blit(c.D, new v(x*t, yf-t));
					}
				}
				if (y > 0 && y < yfr-1) {
					s.blit(c.L, new v(0, y*t));
					s.blit(c.R, new v(xf-t, y*t));
				}
			}
			s.blit(c.UL);
			s.blit(c.UR, new v(xf-t, 0));
			s.blit(c.DL, new v(0, yf-t));
			s.blit(c.DR, new v(xf-t, yf-t));
		},
		text: function(content) {
			if (Object.prototype.toString.call(content) === "[object Array]") {
				content.some(function(entry){
					this.text(entry);
				}, this);
			} else {
				var x, y, rect;
				x = config.tileSize * 2;
				y = config.tileSize;
				this.textboxes.some(function(text){ y += text.rect.height + 8; });
				rect = new geometry.Rect(x, y, this.rect.width - config.tileSize * 4, 0);
				this.textboxes.push(new Text(rect, content, true).attach(this));
			}
			y = config.tileSize * 2 - 12;
			this.textboxes.some(function(text){ y += text.rect.height + 8; });
			this.resize(null, y);
			return this;
		},
		resize: function(x, y){
			this.rect.height  = y;
			this.rect.y       = video.display.rect.center.y - y / 2;
			this.size.y       = y;
			this.surface.size = new geometry.Vector(this.rect.width, y);
			this.max.rect     = this.rect.clone();
			this.max.size     = this.rect.size;
			this.draw();
		},
		attach: function(parent) {
			this.sprite.attach(parent);
			return this;
		},
		disappear: function(animated, callback) {
			this.childState(false);
			if (!animated) {
				this.surface.clear();
				this.sprite.visible = false;
				exports.shadowed = false;
			} else {
				this.sprite.children.some(function(child){ child.detach(this.sprite); });
				this.animation = new Animation(this.max.rect, this.min.rect, function(){
					exports.shadowed = false;
					this.sprite.detach();
					if (callback)
						callback();
				}).init(this);
			}
			return this;
		},
		appear: function(animated, callback) {
			exports.shadowed = true;
			this.sprite.visible = true;
			if (!animated) {
				this.childState(true);
			} else {
				this.surface.clear();
				this.childState(false);
				this.animation = new Animation(this.min.rect, this.max.rect, function(){
					if (callback)
						callback();
					this.childState(true);
				}).init(this);
			}
			return this;
		}
	};

	var exports = {
		shadowed: false,
		initialized: false,
		init: init,
		update: update,
		Text: Text,
		Box: Box,
		box: box
	};

	return exports;
})