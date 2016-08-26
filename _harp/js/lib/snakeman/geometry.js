define(function(){
	function Vector(x, y){
		this.x = x;
		this.y = y;
	}

	Vector.resolve = function(x, y) {
		if (typeof y === "undefined") {
			var t = typeof x;
			if (x instanceof Vector) {
				y = x.y;
				x = x.x;
			} else if (typeof x === "number") {
				y = 0;
			}
		}
		return {x: x, y: y};
	}

	Vector.prototype = {
		resolve:    Vector.resolve,
		add:        function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			this.x += x;
			this.y += y;
			return this;
		},
		added:      function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			return new Vector(this.x + x, this.y + y);
		},
		subtract:   function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			this.x -= x;
			this.y -= y;
			return this;
		},
		subtracted: function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			return new Vector(this.x - x, this.y - y);
		},
		multiply: function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			this.x *= x;
			this.y *= y;
			return this;
		},
		multiplied: function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			return new Vector(this.x * x, this.y * y);
		},
		divide: function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			this.x /= x;
			this.y /= y;
			return this;
		},
		divided: function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			return new Vector(this.x / x, this.y / y);
		},
		dot: function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			return this.x * x + this.y * y;
		},
		scaled: function(scalar) {
			return new Vector(this.x * scalar, this.y * scalar);
		}
	}

	function Rect(x, y, width, height){

		var pos, size;

		if (typeof width !== "undefined" && typeof height !== "undefined"){
			pos  = new Vector(x, y);
			size = new Vector(width, height);
		} else {
			pos = x;
			size = y;
		}

		this.pos = pos;
		this.size = size;

		var property, obj;

		for (property in this.properties) {
			obj = this.properties[property];
			Object.defineProperty(this, property, obj);
		}
	}

	Rect.prototype = {
		properties: {
			"left": {
				get: function(){
					return this.pos.x;
				},
				set: function(value){
					this.pos.x = value;
				}
			},
			"right": {
				get: function(){
					return this.pos.x + this.size.width;
				},
				set: function(value){
					this.pos.x = value - this.size.width;
				}
			},
			"top": {
				get: function(){
					return this.pos.y;
				},
				set: function(value){
					this.pos.y = value;
				}
			},
			"bottom": {
				get: function(){
					return this.pos.y + this.size.height;
				},
				set: function(value){
					this.pos.y = value - this.size.height;
				}
			},
			"x": {
				get: function(){
					return this.pos.x;
				},
				set: function(value){
					this.pos.x = value;
				}
			},
			"y": {
				get: function(){
					return this.pos.y;
				},
				set: function(value){
					this.pos.y = value;
				}
			},
			"width": {
				get: function(){
					return this.size.x;
				},
				set: function(value){
					this.size.width = value;
				}
			},
			"height": {
				get: function(){
					return this.size.y;
				},
				set: function(value){
					this.size.height = value;
				}
			}
		},
		added:      function(x, y) {
			o = Vector.resolve(x, y);
			x = o.x;
			y = o.y;
			return new Rect(this.pos.x + x, this.pos.y + y, this.size.x, this.size.y);
		},
		intersects: function(other){
			if (other instanceof Vector) {
				return this.left < other.x && this.right > other.x && this.top < other.y && this.bottom > other.y;
			} else if (other instanceof Rect) {
				return this.left < other.right && this.right > other.left && this.top < other.bottom && this.bottom > other.top;
			} else {
				return false;
			}
		},
		contains: function(other){
			if (other instanceof Vector) {
				return other.x > this.left && other.x < this.right && other.y > this.top && other.y < this.bottom;
			} else if (other instanceof Rect) {
				return other.left > this.left && other.right < this.right && other.top > this.top && other.bottom < this.bottom;
			} else {
				return false;
			}
		}
	};

	return {
		Vector: Vector,
		Rect: Rect
	}
});