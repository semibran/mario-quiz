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
				src:      "./js/app/stage/"+config.stage+"/box-"+config.stage+".png",
				id:       "box",
				tile:     new geometry.Vector(16, 16)
			}
		], function(){
			var s = video.tilesets.box;
			box.cache = {
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
			box.init();
			exports.initialized = true;
			callback();
		});
	}

	var box = {
		offset:     new geometry.Vector(40, 32),
		size:       null,
		surface:    null,
		rect:       null,
		sprite:     null,
		animation:  null,
		cache:      null,
		item:       null,
		queue:      [],
		textboxes:  [],
		cache:      {},
		min:        {},
		max:        {},
		init:       function() {
			var s = new geometry.Vector(config.tileSize, config.tileSize), c = video.display.rect.center;
			this.size         = new geometry.Vector(video.display.size.x - this.offset.x * 2, video.display.size.y - this.offset.y * 2);
			this.surface      = new video.Surface  (this.size);
			this.rect         = new geometry.Rect  (this.offset, this.size);
			this.sprite       = new video.Sprite   (this.rect, this.surface).attach();
			this.sprite.depth = 4;
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
			this.draw();
		},
		draw:       function() {
			var t = config.tileSize,
			    xf  = this.surface.size.x,
			    yf  = this.surface.size.y,
			    xfr = Math.ceil(xf/t),
			    yfr = Math.ceil(yf/t),
			    c = this.cache,
			    s = this.surface,
			    v = geometry.Vector;

			this.clear();

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
		clear:      function() {
			this.surface.clear();
		},
		reset:      function() {
			this.hideText();
			this.sprite.children.some(function(child){ child.detach(this.sprite); }), this;
			this.textboxes.length = 0;
		},
		text:     function(text) {
			if (Object.prototype.toString.call(text) === "[object Array]") {
				text.some(function(entry){
					this.text(entry);
				}, this);
			} else {
				var x, y, rect;
				x = config.tileSize * 2;
				y = config.tileSize;
				this.textboxes.some(function(text){ y += text.rect.height + 8; });
				rect = new geometry.Rect(x, y, this.max.rect.width - x * 2, 0);
				this.textboxes.push(new Text(rect, text, true));
			}
			height = config.tileSize * 2 - 12;
			this.textboxes.some(function(text){ height += text.rect.height + 8; });
			this.resize(this.max.rect.width, height);
			return this;
		},
		hideText:   function(text) {
			this.textboxes.some(function(child){ child.detach(this); }, this);
		},
		showText:   function(text) {
			this.textboxes.some(function(child){ child.attach(this); }, this);
		},
		resize:     function(width, height) {
			var c = video.display.rect.center,  // Center of screen
			    r = this.rect,                  // Rectangle alias
			    t = config.tileSize,            // Tile size alias
			    v = geometry.Vector,            // Vector alias
			    x, y;                           // i.e. Iterator, index, etc.

			this.size.set(width, height);
			this.rect.size.set(width, height);
			this.max.rect     = r.clone();
			this.max.size     = r.size.clone();
			r.pos.set(c.x - r.width / 2, c.y - r.height / 2);
			this.surface.size = r.size;
			this.draw();
		},
		alert:      function(text) {
			var item = {
				type:     "alert",
				text:     text
			},  x = this.queue.length;
			this.queue.push(item);
			if (!x)
				this.process();
			else if (this.item.type === "alert")
				this.collapse(this.item.callback);
		},
		prompt:     function(text, callback) {
			var item = {
				type:     "prompt",
				text:     text,
				callback: callback
			},  x = this.queue.length;
			this.queue.push(item);
			if (!x)
				this.process();
			else if (this.item.type === "alert")
				this.collapse(this.item.callback);
		},
		process:    function(item) {
			if (!this.item && this.queue.length)
				this.item = this.queue[0];
			if (this.item) {
				this.expand(this.item.text);
				if (this.item.type === "prompt") {
					input.mouse.mark(this.rect, function(){
						box.collapse(box.item.callback);
						input.mouse.unmark(box.rect);
					});
				}
			}
		},
		expand:     function(text, callback) {
			this.clear();
			this.reset();
			this.text(text);
			this.sprite.visible = true;
			this.animation = new Animation(this.min.rect, this.max.rect, function(){
				this.showText();
				if (callback)
					callback();
			}).init(this);
		},
		collapse:   function(callback) {
			this.clear();
			this.reset();
			this.animation = new Animation(this.max.rect, this.min.rect, function(){
				this.queue.shift();
				this.item = null;
				this.clear();
				this.sprite.visible = false;
				this.process();
				if (callback)
					callback();
			}).init(this);
		}
	};

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
		sequence:  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?-'\"<>()@ ",
		attach:    function(parent) {
			if (parent === box) {
				parent = parent.sprite;
			}
			this.sprite.attach(parent);
			return this;
		},
		detach:    function(parent) {
			if (parent === box) {
				parent = parent.sprite;
			}
			this.sprite.detach(parent);
			return this;
		}
	};

	var exports = {
		shadowed: false,
		initialized: false,
		init: init,
		update: update,
		box: {
			alert: function(){
				box.alert.apply(box, arguments);
			},
			prompt: function(){
				box.prompt.apply(box, arguments);
			},
			collapse: function(callback){
				box.collapse.call(box, callback);
			}
		},
		Text: Text
	};

	return exports;
})
