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
