define({
	name: "Castle",
	size: {
		x: 32,
		y: 16
	},
	spawn: {
		x: 4.5,
		y: 9
	},
	map: [
		"_ /#-==",
		"+?@@.||"
	],
	attributes: {
		solid: "#-=|/.",
		nudge: "?",
		break: "",
		front: "=|?",
		animation: {
			"?": [
				[0, 0, 20],
				[1, 0, 6],
				[2, 0, 8],
				[1, 0, 6]
			]
		}
	},
	structure: [
		"                                ",
		"                                ",
		"################################",
		"###################           ##",
		"################### ? ? ? ? ? ##",
		"                ###           ##",
		"                ### ? ? ? ? ? ##",
		"                ###           ##",
		"           ?    ?     ? ? ?     ",
		"#                               ",
		"##  ==                          ",
		"### ||                       /##",
		"#######   #.#   #.#-----------##",
		"#######   ###   ###           ##",
		"#######   ###   ###           ##",
		"#######___###___###___________##",
		"#######+++###+++###+++++++++++##"
	]
})