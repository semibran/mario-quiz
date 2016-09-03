define(["./geometry", "./video", "./input"], function(geometry, video, ui) {

	var config;
	var children = [];
	var animations = [];

	function init(data, callback) {
		config = data;
		var items = [
			{
				src:      "./js/app/ui/text.png",
				id:       "text",
				tile:     new geometry.Vector(8, 8)
			},
			{
				src:      "./js/app/ui/box.png",
				id:       "box-default",
				tile:     new geometry.Vector(16, 16)
			}
		];
		video.load(items, function(){
			var s = video.tilesets["box-default"];
			box.cache["default"] = {
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

	function load(stage, callback) {
		var id = "box-"+stage;
		var items = [
			{
				src:      "./js/app/stage/"+stage+"/"+id+".png",
				id:       id,
				tile:     new geometry.Vector(16, 16)
			}
		];
		video.load(items, function(){
			var s = video.tilesets[id];
			box.cache[stage] = {
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
			callback();
		});
	}

	var box = {
		offset:     new geometry.Vector(40, 32),
		textOffset: new geometry.Vector(24, 16),
		size:       null,
		surface:    null,
		rect:       null,
		sprite:     null,
		animation:  null,
		item:       null,
		textbox:    null,
		texts:      [],
		queue:      [],
		cache:      {},
		min:        {},
		mid:        {},
		max:        {},
		init:       function() {
			var s = new geometry.Vector(config.tileSize, config.tileSize), c = video.display.rect.center;
			this.size         = new geometry.Vector(video.display.size.x - this.offset.x * 2, video.display.size.y - this.offset.y * 2);
			this.surface      = new video.Surface  (this.size);
			this.rect         = new geometry.Rect  (this.offset, this.size);
			this.sprite       = new video.Sprite   (this.rect, this.surface).attach();
			this.sprite.depth = 4;

			var textSize    = new geometry.Vector(0, 0),
			    textRect    = new geometry.Rect(this.textOffset, textSize),
			    textSurface = new video.Surface(textSize);

			this.textbox = new video.Sprite(textRect, textSurface).attach(this.sprite);
			this.textbox.surface.fill(video.colors.red);
			
			this.min = {
				size: s,
				rect: new geometry.Rect(c.x - s.x / 2, c.y - s.y / 2, s.x, s.y),
				surface: new video.Surface(s)
			};
			this.mid = {
				size: this.rect.size,
				rect: this.rect.clone(),
				surface: this.surface.clone()
			};
			this.max = {
				size: this.rect.size,
				rect: this.rect.clone(),
				surface: this.surface.clone()
			};
		},
		draw:       function() {
			var t = config.tileSize,
			    xf  = this.surface.size.x,
			    yf  = this.surface.size.y,
			    xfr = Math.ceil(xf/t),
			    yfr = Math.ceil(yf/t),
			    c = this.cache[config.stage] || this.cache["default"],
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
		text:     function(content, align) {
			function temp(content, align) {
				align = align || "left";
				var x, y, rect, text, item = null;
				if (content.constructor.name === "Object") {
					item = content;
					content = (item.indent || "") + item.text;
					align = item.align || align;
				}
				x = 0;
				y = 0;
				this.textbox.children.some(function(text){ y += text.rect.height + 8; });
				rect = new geometry.Rect(x, y, this.max.rect.size.x - this.textOffset.x * 2, 0);
				text = new Text(rect, content, align, true);
				if (item)
					text.callback = item.callback;
				text.sprite.attach(this.textbox);
				this.texts.push(text);
			}
			if (content.constructor.name === "Array") {

				content.some(function(entry, index){
					temp.apply(this, [entry, !index ? "center" : align]);
				}, this);
			} else {
				temp(content, align);
			}
			var width = 0,
			    height = 0;
			this.textbox.children.some(function(text){
				if (text.rect.width > width)
					width = text.rect.width;
				height += text.rect.height + 8;
			});
			height -= 12;

			if (width + this.textOffset.x * 2 > this.max.rect.width) {
				width = this.max.rect.width - this.textOffset.x * 2;
			}

			this.textbox.rect.size.set(width, height);
			this.textbox.surface.size = this.textbox.rect.size;

			this.texts.some(function(text){
				if (text.align === "center")
					text.rect.x = width / 2 - text.surface.size.x / 2;
			}, this);

			width += this.textOffset.x * 2;
			height += this.textOffset.y * 2;
			this.resize(width, height);
			return this;
		},
		clearText:  function() {
			this.hideText();
			this.textbox.surface.clear();
			this.textbox.children.some(function(child){
				child.detach(this.textbox);
			}, this);
			this.textbox.children.length = 0;
			this.texts.length = 0;
		},
		hideText:   function() {
			// this.textbox.visible = false;
			this.texts.some(function(child){
				if (child.rectAbsolute)
					input.mouse.unmark(child.rectAbsolute);
			}, this);
		},
		showText:   function() {
			// this.textbox.visible = true;
			this.texts.some(function(child){
				if (child.callback) {
					child.rectAbsolute = child.rect.added(box.offset).added(box.textOffset);
					input.mouse.mark(child.rectAbsolute, function() {
						child.callback.call(box);
					});
				}
			}, this);
		},
		resize:     function(width, height) {
			var c = video.display.rect.center,  // Center of screen
			    r = this.rect,                  // Rectangle alias
			    t = config.tileSize,            // Tile size alias
			    v = geometry.Vector,            // Vector alias
			    x, y;                           // i.e. Iterator, index, etc.

			this.size.set(width, height);
			this.rect.size.set(width, height);
			this.mid.rect     = r.clone();
			this.mid.size     = r.size.clone();
			r.pos.set(c.x - r.width / 2, c.y - r.height / 2);
			this.surface.size = r.size;
			this.draw();
		},
		alert:      function(content, close, callback) {
			var item = {
				type:     "alert",
				content:  content,
				close:    close,
				callback: callback
			};
			this.queue.push(item);
			if (this.queue.length == 1)                                 // If there are no other items in the queue...
				this.process();                                         // Show this message immediately.
			else if(this.item && !this.item.close && !this.animation) { // If a low-pri message is currently active...
				this.collapse();                                        // - Collapse it.
			}
		},
		process:    function(item) {
			if (!this.item && this.queue.length)
				this.item = this.queue[0];
			if (this.item) {
				if (this.item.content.constructor.name === "String")
					this.item.content = [this.item.content];
				var c = this.item.close, content;
				content = [].slice.call(this.item.content);


				if (c) {
					if (c.constructor.name === "Object") {
						content.push({
							text:     c.text,
							align:    c.align || "center",
							indent:   c.indent || "",
							callback: c.callback || function(){
								audio.play("bonus");
								this.collapse(c.callback);
							}
						});
					} else if (c.constructor.name === "String") {
						content.push({
							text:     c,
							align:    "center",
							callback: function(){
								audio.play("bonus");
								this.collapse(this.item.callback);
							}
						});
					} else if (c.constructor.name === "Number") {
						setTimeout(function(){
							var args = [];
							if (box.item.callback) args.push(box.item.callback);
							box.collapse.apply(box, args);
						}, 1000 * box.item.close);
					}
				}

				this.expand(content);
			}
		},
		expand:     function(text, callback) {
			this.clear();
			this.clearText();
			this.text(text);
			this.sprite.visible = true;
			exports.shadowed = true;
			this.animation = new Animation(this.min.rect, this.mid.rect, function(){
				this.animation = null;
				this.showText();
				if (this.item && !this.item.close && this.queue.length > 1)
					this.collapse();
				if (callback)
					callback();
			}).init(this);
		},
		collapse:   function(callback) {
			if (this.animation) throw "SnakemanError: Attempted collapse during animation";
			this.clear();
			this.clearText();
			this.animation = new Animation(this.mid.rect, this.min.rect, function(){
				this.animation = null;
				this.queue.shift();
				this.item = null;
				this.clear();
				this.sprite.visible = false;
				this.process();
				if (callback) {
					// console.log(callback);
					callback();
				}
				exports.shadowed = false;
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
		duration: 10,
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

	function Text(pos, content, align, shadow) {
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
		this.content = content;
		this.align = align || "left";
		this.shadow = shadow;
		this.callback = null;

		var t = content, tx = 0, ty = 0, wx, word, letters = [];
		for (var i = 0; i < t.length; i ++) {
			while (tx == 0 && t[i] === " " && ty > 0) i ++;
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

			if (!letters[ty]) letters[ty] = [];
			letters[ty].push({
				char: c,
				surface: Text.retrieve(c, this.shadow),
				pos: tx
			});

			if (++ tx >= mw) {
				tx = wx = 0;
				ty ++;
			}
		}

		this.surface.canvas.height = this.surface.size.y = (ty + 1) * (s + 4);

		var width = 0;

		letters.some(function(line){
			if(line.length > width) width = line.length;
		});

		var temp = this.rect.size.x;
		this.rect.size.set(width * s, letters.length * (s + 4));
		this.surface.size = this.rect.size;

		var prev, surf, x, gx = 0, y;
		letters.some(function(line, index){
			surf = new video.Surface(new geometry.Vector(line.length * s, s));
			line.some(function(letter){
				surf.blit(letter.surface, new geometry.Vector(letter.pos * s, 0));
			});
			if (this.align == "left")
				x = 0;
			else if (this.align == "center")
				x = this.surface.size.x / 2 - line.length * s / 2;
			y = index * (s + 4);
			this.surface.blit(surf, new geometry.Vector(x, y));
			if (line.length > gx) gx = line.length;
		}, this);

		children.push(this);
	}

	Text.retrieve = function(char, shadow) {
		index = Text.prototype.sequence.indexOf(char.toUpperCase());
		if (index != -1) {
			x = index % 10;
			y = (index - x) / 10 + (shadow ? 5 : 0);
			return video.tilesets.text[y][x];
		} else {
			return null;
		}
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
		load: load,
		update: update,
		box: {
			alert: function(){
				box.alert.apply(box, arguments);
			},
			collapse: function(callback){
				box.collapse.call(box, callback);
			}
		},
		Text: Text
	};

	return exports;
})
