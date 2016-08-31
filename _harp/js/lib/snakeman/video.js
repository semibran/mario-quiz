define(["./geometry"], function(geometry){
	function Color(r, g, b){
		this.r = r;
		this.g = g;
		this.b = b;
	}

	Color.rgb = function(r, g, b){
		return "rgb("+r+", "+g+", "+b+")";
	}

	Color.prototype = {
		rgb: function(){
			return "rgb("+this.r+", "+this.g+", "+this.b+")";
		},
		equals: function(other){
			return this.rgb() === other.rgb();
		}
	};

	var images = {},
	    tilesets = {},
	    colors = {
	    	magenta: new Color(255,   0, 255),
	    	red:     new Color(255,   0,   0),
	    	blue:    new Color(  0,   0, 255),
	    	white:   new Color(255, 255, 255),
	    	black:   new Color(  0,   0,   0)
	    },
	    colorkey = colors.magenta,
	    config;

	var display = {
		canvases:      ["buffer", "background", "foreground"],
		offset:        new geometry.Vector(0, -8),
		size:          new geometry.Vector(0,  0),
		rect:          null,
		color:         colors.black,
		children:      [],
		init:          function(size){
			this.size.x = size.x;
			this.size.y = size.y + config.tileSize;

			this.rect = new geometry.Rect(new geometry.Vector(0, 0), size);

			this.foreground = new Surface(size).attach("fg");
			this.background = new Surface(size).attach("bg");
			this.buffer     = new Surface(this.size);

			this.clear();
		},
		clear:    function(){
			this.foreground.clear();
			this.background.clear();
		},
		fill:     function(color){
			this.surface.fill(this.color);
		},
		draw:     function(surface, offset){
			offset = offset || new geometry.Vector(0, 0);

			var rect, image;

			// Draw image if this is not the display and the visible flag is set
			if (this instanceof Sprite && this.visible) {
				pos = this.rect.pos.added(offset);
				surface.blit(this.surface, pos);
			}

			// Sort children by depth
			var childrenSorted = [];
			this.children.some(function(child){
				var d = child.depth;
				if (d >= childrenSorted.length) {
					var i = childrenSorted.length;
					while (i <= d) {
						childrenSorted.push([]);
						i ++;
					}
				}
				childrenSorted[d].push(child);
			});

			this.children = [];
			childrenSorted.some(function(children){
				children.some(function(child){
					this.children.push(child);
				}, this);
			}, this);

			var p, s;

			// Iterate over and draw children
			this.children.some(function(child){
				p = this.offset || null;
				if (this.surface) {
					s = this.surface;
				} else {
					if (child.depth > 0) {
						s = display.foreground;
					} else {
						s = display.background;
					}
				}
				child.draw(s, p);
			}, this);
		},
		update:   function(){
			this.clear();
			this.draw();
		}
	};

	function init(data){
		config = data;
		display.init(config.resolution);
	}

	function load(root, callback) {
		function loadImage(item, recursive){
			var src = item.src;
			var id = item.id;
			var tileSize = item.tileSize;
			var image = new Image();
			image.src = src;
			// image.onerror = function(){
			// 	if (recursive) {
			// 		var i = root[index], s = i.src.length, ext, src;
			// 		while (s > 0) {
			// 			s --;
			// 			if (i.src[s] === "." || i.src[s] === "/")
			// 				break;
			// 			ext += i.src[s];
			// 		}
			// 		if(ext === ext.toUpperCase())
			// 			throw new Error("Image load failed!");
			// 		else
			// 			src = i.src.replace(ext, ext.toUpperCase());
			// 		loadImage({
			// 			src:      src,
			// 			id:       i.id,
			// 			tileSize: i.tileSize
			// 		}, true);
			// 	} else {
			// 		throw new Error("Image load failed!");
			// 	}
			// }
			image.onload = function(){
				var x = 0, y = 0, i, j, imageData, surface;
				images[id] = image;
				if (tileSize) {
					tilesets[id] = [];
					for (i = 0; i < image.height / tileSize; i ++) {
						tilesets[id].push([]);
						for (j = 0; j < image.width / tileSize; j ++) {
							surface = new Surface(new geometry.Vector(tileSize, tileSize));
							surface.ctx.drawImage(image, -j * tileSize, -i * tileSize);
							tilesets[id][i].push(surface);
						}
					}
				}
				if (recursive && index < root.length - 1) {
					index ++;
					loadImage(root[index], true);
				} else {
					callback.call(this);
				}
			}
		}
		if (Object.prototype.toString.call(root) === "[object Array]") {
			index = 0;
			loadImage(root[index], true);
		} else {
			loadImage(root);
		}

	}

	function update(){
		var i;
		display.update();
	}

	function Sprite(rect, surface){
		this.rect = rect;
		this.surface = surface;
		this.offset = new geometry.Vector(0, 0);
		this.depth = 0;
		this.children = [];
		this.visible = true;
	}

	Sprite.prototype = {
		draw:   display.draw,
		attach: function(parent) {
			parent = parent || display;
			if (parent.children.indexOf(this) == -1)
				parent.children.push(this)
			return this;
		},
		detach: function(parent) {
			parent = parent || display;
			var index = parent.children.indexOf(this);
			if (index != -1)
				parent.children.splice(index, 1);
			return this;
		}
	};

	function Surface(size){
		this._size = size;
		this.canvas = document.createElement("canvas");
		this.canvas.width = this._size.x;
		this.canvas.height = this._size.y;

		this.ctx = this.canvas.getContext("2d");
		this.ctx.webkitImageSmoothingEnabled = false;
		this.ctx.mozImageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;

		var property, obj;

		for (property in this.properties) {
			obj = this.properties[property];
			Object.defineProperty(this, property, obj);
		}
	}

	Surface.prototype = {
		properties: {
			"size": {
				get: function(){
					return this._size;
				},
				set: function(value){
					this._size.set(value);
					this.canvas.width = Math.floor(this._size.x);
					this.canvas.height = Math.floor(this._size.y);
				}
			}
		},
		clear: function(){
			this.ctx.clearRect(0, 0, this.size.x, this.size.y);
		},
		clone: function(){
			var clone = new Surface(this.size);
			clone.blit(this, 0, 0);
			return clone;
		},
		fill: function(color){
			this.ctx.fillStyle = color.rgb();
			this.ctx.fillRect(0, 0, this.size.x, this.size.y);
		},
		blit: function(other, offset){
			offset = offset || new geometry.Vector(0, 0);
			this.ctx.drawImage(other.canvas, offset.x, offset.y);
		},
		attach: function(id){
			if (id)
				this.canvas.id = id;
			document.body.appendChild(this.canvas);
			return this;
		}
	};

	return {
		init: init,
		load: load,
		update: update,
		colors: colors,
		tilesets: tilesets,
		images: images,
		display: display,
		Sprite: Sprite,
		Surface: Surface,
		Color: Color,
	}
});
