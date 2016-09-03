define(function(){
	var channels = 4,
		sound = {},
		files = {
			bgm: [],
			sfx: ["pipe", "bump", "coin", "1up", "pause", "oops"]
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
		},
		stop: function(audio) {
			this.channels.some(function(channel){
				channel.stop();
			});
		}
	};

	function init(data, callback){
		config = data;
		sequencer.init();

		// files.bgm.push(config.stage);
		// files.bgm = files.bgm.concat(config.stages);

		var type = "sfx", index, thread = [];
		files[type].some(function(id){
			thread.push({
				id: id,
				type: type
			});
		});

		index = 0;
		function temp(index) {	
			load(thread[index].id, thread[index].type, function(){
				if (++ index < thread.length)
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
		if (!sound[id]) {
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
		} else {
			callback.call(this, data);
		}
	}

	function play(id) {
		sequencer.play(sound[id].data, sound[id].type);
	}

	function stop(id) {
		sequencer.stop(sound[id]);
	}

	function gain(value) {
		if (typeof value !== "undefined")
			sequencer.destination.gain.value = value;
		else
			return sequencer.destination.gain.value;
	}

	function mute() {
		gain(0);
	}

	function unmute() {
		gain(1);
	}

	function Channel(id) {
		this.id = id;
		this.src = sequencer.ctx.createGain();
		this.bgm = sequencer.ctx.createGain();
		this.sfx = sequencer.ctx.createGain();
		
		this.bgm.connect(this.src);
		this.sfx.connect(this.src);

		this.bgmsrc = null;
		this.sfxsrc = null;

		this.src.connect(sequencer.destination);
	}

	Channel.prototype = {
		names: ["Square 1", "Square 2", "Triangle", "Noise"],
		play: function(buffer, type){
			var channel = this,
			    source = sequencer.ctx.createBufferSource(),
			    src = this[type+"src"] = source;
			source.buffer = buffer;
			source.loop = type === "bgm";
			if (type === "sfx") {
				this.bgm.gain.value = 0;
				source.onended = function(){
					channel.bgm.gain.value = 1;
					source.disconnect(channel.sfx);
					channel[type+"src"] = null;
				};
			}
			source.connect(this[type]);
			source.start(0);
		},
		stop: function() {
			if (this["bgmsrc"]) {
				this["bgmsrc"].stop();
				this["bgmsrc"] = null;
			}
		}
	};

	var exports = {
		initialized: false,
		init: init,
		load: load,
		play: play,
		stop: stop,
		gain: gain,
		mute: mute,
		unmute: unmute,
		sequencer: sequencer
	}

	return exports;
});
