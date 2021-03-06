"use strict";

var Enum = {
	CONFIG: {
	 // INDENT_WIDTH : 10, ←em単位で設定するため
	 INDENT_MARK : "　",
	 INDENT_WIDTH : 1.9, // FIXME：動的にCSSを参照するようにしたい
	 MAX_URL_LENGTH : 30,
	 SAVE_DOCUMENT_LIMIT : 10,
	 DEFAULT_TITLE : "無題のノート",
 	 CHANGE_VISUAL_DEFALT_SPEED : 2000,
	},

	STOREKEY: {
	 DOCUMENTS : "DOCUMENTS",
	 SELECT_DOCUMENT : "LAST_SELECT_DOCUMENT",
	 VARIABLES : "VARIABLES",
	},

	MARK: {
	 TASK : "□",
	 DONE : "■",
	 SUPPLEMENT : "→",
	 COMMENT : "＊",
	 QUESTION : "？",
	 INFO : "！",
	 CONCLUSION : "＃",
	},

	SPECIAL_MARK: {
	 FOLD_AREA : "”",
	},
}