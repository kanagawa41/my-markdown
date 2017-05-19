"use strict";

var Enum = {
	CONFIG: {
	 // INDENT_WIDTH : 10, ←em単位で設定するため
	 INDENT_MARK : "　",
	 SAVE_DOCUMENT_LIMIT : 10,
	 DEFAULT_TITLE : "無題のノート",
	},

	STOREKEY: {
	 DOCUMENT_TITLES : "DOCUMENT_TITLES",
	 DOCUMENTS : "LAST_WRITE_DOCUMENT",
	 SELECT_DOCUMENT : "LAST_SELECT_DOCUMENT",
	 VARIABLES : "VARIABLES",
	},

	MARK: {
	 TASK : "□",
	 DONE : "■",
	 SUPPLEMENT : "→",
	 COMMENT : "＊",
	 CONCLUSION : "＃",
	},

	SPECIAL_MARK: {
	 FOLD_AREA : "”",
	},
}