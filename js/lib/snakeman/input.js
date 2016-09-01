define(["./geometry", "./video"], function(geometry){
	var marked = [],
	    listeners = {
		  "move":  [],
		  "down":  [],
		  "up":    [],
		  "click": []
	    };
	function move(e) {
		if (e.target === video.display.foreground.canvas) {
			var pos = new geometry.Vector(e.offsetX, e.offsetY).subtracted(video.display.offset);
			document.body.style.cursor = "";
			listeners.move.some(function(callback){
				callback(pos);
			});
		}
	}
	function down(e) {
		if (e.target === video.display.foreground.canvas) {
			var pos = new geometry.Vector(e.offsetX, e.offsetY).subtracted(video.display.offset);
			mouse.down = true;
			listeners.down.some(function(callback){
				callback(pos);
			});
		}
	}
	function up(e) {
		if (e.target === video.display.foreground.canvas) {
			var pos = new geometry.Vector(e.offsetX, e.offsetY).subtracted(video.display.offset);
			mouse.down = false;
			listeners.up.some(function(callback){
				callback(pos);
			});
		}
	}
	function click(e){
		if (e.target === video.display.foreground.canvas) {
			var pos = new geometry.Vector(e.offsetX, e.offsetY).subtracted(video.display.offset);
			listeners.click.some(function(callback){
				callback(pos);
			});
		}
	}
	function init(){
		mouse.init();
	}
	var mouse = {
		pos: new geometry.Vector(0, 0),
		down: false,
		listen: function(event, callback) {
			listeners[event].push(callback);
		},
		unlisten: function(callback) {
			var index;
			for (var type in listeners) {
				index = listeners[type].indexOf(callback);
				if (index !== -1) {
					listeners[type].splice(index, 1);
					break;
				}
			}
		},
		init: function() {
			document.onmousemove = move;
			document.onmousedown = down;
			document.onmouseup   = up;
			document.onclick     = click;
		},
		over: function(x) {
			return false;
		},
		mark: function(rect, callback) {
			function move(pos) {
				if (rect.contains(pos)) {
					document.body.style.cursor = "pointer";
				}
			}
			function click(pos) {
				if (rect.contains(pos)) {
					callback(pos);
				}
			}
			this.listen("move", move);
			this.listen("click", click);
			marked.push({
				rect: rect,
				move: move,
				click: click
			});
		},
		unmark: function(target){
			var index, rect;
			marked.some(function(obj, i){
				if (obj.rect === target) {
					rect = obj;
					index = i;
				}
			});
			this.unlisten(rect.move);
			this.unlisten(rect.click);
			marked.splice(index, 1);
		},
		getRelativePos: function(element){
			var rect = element.getBoundingClientRect();
			var x = rect.left;
			var y = rect.top;
			var width = rect.right - rect.left;
			var height = rect.bottom - rect.top;
			if (mouse.pos.x < x) {
				mouse.pos.x = x;
			}
			if (mouse.pos.x > width + x) {
				mouse.pos.x = width + x;
			}
			if (mouse.pos.y < y) {
				mouse.pos.y = y;
			}
			if (mouse.pos.y > height + y) {
				mouse.pos.y = height + y;
			}
			return mouse.pos.subtracted(x, y);
		}
	};
	return {
		init: init,
		mouse: mouse
	};
});