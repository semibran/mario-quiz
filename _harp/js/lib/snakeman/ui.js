define(["./geometry", "./video"], function(geometry, video){
	function init(){
		
	}

	function Text(pos, content){
		this.rect = new geometry.Rect(pos.x, pos.y, content.length * 8, 8);
		this.surface = new video.Surface(this.rect.size);
		this.sprite = new video.Sprite(this.rect, this.surface);
		this.sprite.depth = 1;
		this.content = content;
		this.content.split("").some(function(char, i){
			index = this.sequence.indexOf(char.toUpperCase());
			x = index % 10;
			y = (index - x) / 10
			this.surface.blit(video.tilesets["text"][y][x], new geometry.Vector(i*8, 0), true);
		}, this);
	}

	Text.prototype = {
		sequence: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@<> ",
		attach: function(parent){
			this.sprite.attach(parent);
			return this;
		}
	}

	return {
		init: init,
		Text: Text
	};
})