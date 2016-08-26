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
	    	white:   new Color(255, 255, 255),
	    	black:   new Color(  0,   0,   0)
	    },
	    colorkey = colors.magenta,
	    config;

	var display = {
		canvas:   document.createElement("canvas"),
		ctx:      null,
		offset:   new geometry.Vector(0, -8),
		rect:     new geometry.Rect(0, 0, 0, 0),
		surface:  null,
		color:    colors.black,
		children: [],
		init:     function(size){
			this.ctx = this.canvas.getContext("2d");
			this.rect.size.x = size.x;
			this.rect.size.y = size.y + config.tileSize;

			this.surface = new Surface(this.rect.size);

			document.body.appendChild(this.canvas);
			this.canvas.width = size.x;
			this.canvas.height = size.y;
			this.update();
		},
		clear:    function(){
			this.fill(this.color);
		},
		fill:     function(color){
			this.surface.fill(this.color);
		},
		draw:     function(surface, offset){
			offset = offset || new geometry.Vector(0, 0);

			// Draw image if visible flag is set
			if (this instanceof Sprite && this.visible) {
				rect = this.rect.added(offset);
				surface.blit(this.surface, rect);
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

			// Iterate over and draw children
			this.children.some(function(child){
				child.draw(this.surface, this.rect.pos.added(offset));
			}, this);
		},
		update:   function(){
			this.clear();
			this.draw();
			display.ctx.putImageData(this.surface.image, this.offset.x, this.offset.y);
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
			image.onload = function(){
				var x = 0, y = 0, i, j, imageData;
				display.ctx.drawImage(image, x, y);
				imageData = display.ctx.getImageData(x, y, image.width, image.height)
				images[id] = new Surface(imageData);
				if (tileSize) {
					tilesets[id] = [];
					for (i = 0; i < image.height / tileSize; i ++) {
						tilesets[id].push([]);
						for (j = 0; j < image.width / tileSize; j ++) {
							imageData = display.ctx.getImageData(x+j*tileSize, y+i*tileSize, tileSize, tileSize);
							tilesets[id][i].push(new Surface(imageData));
						}
					}
				}
				display.clear();
				if (recursive && index < root.length - 1) {
					index ++;
					loadImage(root[index], true, callback, root, index);
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
		remove: function(parent) {
			parent = parent || display;
			var index = parent.children.indexOf(this);
			if (index != -1)
				parent.children.splice(index, 1);
			return this;
		}
	};

	function Surface(x){
		if (x instanceof ImageData) {
			this.image = x;
			this.size = new geometry.Vector(x.width, x.height);
		} else {
			this.size = x;
			this.image = new ImageData(x.x, x.y);
		}
	}

	Surface.prototype = {
		fill: function(color) {
			for (var i = 0; i < this.image.data.length; i += 4) {
				this.image.data[i  ] = color.r;
				this.image.data[i+1] = color.g;
				this.image.data[i+2] = color.b;
				this.image.data[i+3] = 255;
			}
		},
		blit: function(other, offset) {
			offset = offset || new geometry.Vector(0, 0);
			var x, y, i, j;
			for (y = offset.y; y < offset.y + other.size.y; y ++) {
				for (x = offset.x; x < offset.x + other.size.x; x ++) {
					i = (y * this.size.x + x) * 4;
					j = ((y - offset.y) * other.size.x + (x - offset.x)) * 4;
					if (other.image.data[j+3] === 0 || Color.rgb(other.image.data[j], other.image.data[j+1], other.image.data[j+2]) === colorkey.rgb()) {
						// Skip this pixel.
					} else {
						this.image.data[i  ] = other.image.data[j  ];
						this.image.data[i+1] = other.image.data[j+1];
						this.image.data[i+2] = other.image.data[j+2];
						this.image.data[i+3] = other.image.data[j+3];
					}
				}
			}
		}
	}

	return {
		init: init,
		load: load,
		update: update,
		tilesets: tilesets,
		images: images,
		display: display,
		Sprite: Sprite,
		Surface: Surface,
		Color: Color,
	}
});
