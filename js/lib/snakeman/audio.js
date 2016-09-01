define(function(){
	var channels = 4,
		sound = {},
		files = {
			bgm: ["smb"],
			sfx: ["pipe", "bump", "coin", "1up", "pause"]
		},
		sequencer,
		bgm,
		config;

	sequencer = {
		ctx:         new (window.AudioContext || window.webkitAudioContext)(),
		channels:    [],
		destination: null,
		init:        function() {
			var i;
			this.destination = this.ctx.createGain();
			this.destination.connect(this.ctx.destination);
			for (i = 0; i < channels; i ++) {
				this.channels.push(new Channel(this, i));
			}
		},
		play: function(audio, type) {
			audio.some(function(buffer, index){
				if (buffer) {
					var channel = this.channels[index];
					channel.play(buffer, type);
				}
			}, this);
		}
	};

	function init(data, callback){
		config = data;
		sequencer.init();

		var thread = [];
		for (var type in files) {
			files[type].some(function(id){
				thread.push({
					id: id,
					type: type
				});
			});
		}

		var index = 0;
		function temp(index) {
			load(thread[index].id, thread[index].type, function(){
				if (index ++ < files[type].length)
					temp(index);
				else {
					exports.initialized = true;
					callback();
				}
			});
		}
		temp(index);
	}

	function load(id, type, callback) {
		var index = 0, data = [], audio;
		function loadSound(id, type, index, callback) {
			var request = new XMLHttpRequest(),
			    url = "./js/app/sound/"+type+"/"+id+"/"+id+"-"+index+".wav";

			function complete(buffer) {
				data.push(buffer);
				if (++index < channels) loadSound(id, type, index, callback);
				else {
					sound[id] = {
						data: data,
						type: type
					};
					callback.call(this, data);
				}
			}

			request.open("GET", url, true);
			request.responseType = "arraybuffer";

			request.onload = function(event) {
				if(event.target.status === 404) {
					complete(null);
				} else {
					sequencer.ctx.decodeAudioData(request.response,
						function(buffer){
							complete(buffer);
						}
					);
				}
			};
			request.send();
		}
		loadSound(id, type, index, callback);
	}

	function play(id) {
		sequencer.play(sound[id].data, sound[id].type);
	}

	function Channel(id) {
		this.id = id;
		this.src = sequencer.ctx.createGain();
		this.bgm = sequencer.ctx.createGain();
		this.sfx = sequencer.ctx.createGain();
		this.src.connect(sequencer.destination);
		this.bgm.connect(this.src);
		this.sfx.connect(this.src);
	}

	Channel.prototype = {
		names: ["Square 1", "Square 2", "Triangle", "Noise"],
		play: function(buffer, type){
			var channel = this,
			    source = sequencer.ctx.createBufferSource();
			source.buffer = buffer;
			source.loop = type === "bgm";
			if (type === "sfx") {
				this.bgm.gain.value = 0;
				source.onended = function(){
					channel.bgm.gain.value = 1;
					source.disconnect(this.sfx);
				};
			}
			source.connect(this[type]);
			source.start(0);
		}
	};

	var exports = {
		initialized: false,
		init: init,
		load: load,
		play: play,
		sequencer: sequencer
	}

	return exports;
});
