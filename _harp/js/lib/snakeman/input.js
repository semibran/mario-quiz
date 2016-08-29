define(["./geometry"], function(geometry){
	var listeners = {
		"move":  [],
		"down":  [],
		"up":    [],
		"click": []
	};
	function move(e) {
		mouse.pos.set(e.pageX, e.pageY);
		listeners.move.some(function(callback){
			callback(e);
		})
	}
	function down(e) {
		mouse.down = true;
		listeners.down.some(function(callback){
			callback(e);
		})
	}
	function up(e) {
		mouse.down = false;
		listeners.up.some(function(callback){
			callback(e);
		})
	}
	function click(e){
		listeners.click.some(function(callback){
			callback(e);
		})
	}
	var mouse = {
		pos: new geometry.Vector(0, 0),
		down: false,
		listen: function(event, callback){
			listeners[event].push(callback);
		},
		init: function(){
			document.onmousemove = move;
			document.onmousedown = down;
			document.onmouseup   = up;
			document.onclick     = click;
		},
		over: function(x){
			return false;
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
		mouse: mouse
	};
});