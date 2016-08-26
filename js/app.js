console.log("salut, mah niggas. dabs and kisses from the one and only conor \"harambe\" mcgregor himself");

requirejs.config({
	baseUrl:  "js/lib",
	paths:    {
		app:  "../app"
	},
	packages: [
		"snakeman"
	]
});

require(["jquery", "snakeman", "app/config"], function($, snakeman, config) {
	snakeman.init(config);
});
