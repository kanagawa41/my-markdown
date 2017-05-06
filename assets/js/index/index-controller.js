"use strict";
/**
 * 共通処理群。
 */
var IndexController = function() {
    if(!(this instanceof IndexController)) {
        return new IndexController();
    }

    var lastDocument = store.get(Enum.CONFIG.INDENT_MARK);
    if(lastDocument){
    	$('#making-area #content').val(lastDocument);
    }
}

/**
 * エレメントenum
 */
IndexController.ELEMENT = {
	MARK: 'mark',
	INDENT: 'indent',
	CONTENT: 'content',
	INDEX: 'index',
	DONE_CHILDREN: 'done_children',
}

/**
 * 初期処理
 */
IndexController.prototype.init = function() {
	this.initEvent();
	this.initVisual();

	// 前回の値を表示するようにしたので初期化処理を行う
	this.updateVisual();
	this.setEventAfterDraw();

}

/**
 * ビジュアルの設定
 */
IndexController.prototype.initVisual = function() {
	var windowWidth = $(window).width();
	var partsWidth = windowWidth / 2;
	$('#making-area').width(partsWidth);
	$('#visual-area').width(partsWidth);

	// 高さに影響を与える要素ができた場合、それを引くようにする
	var windowHeight = $(window).height()
		- $('#header').height()
		- $('#making-title-wrapper').height();
	$('#making-area').height(windowHeight);
	$('#visual-area').height(windowHeight);
}

/**
 * イベントの設定
 */
IndexController.prototype.initEvent = function() {
	var controller = this;

	// コンテンツの入力イベント
	var contentOld = "";
	var keyUptimer = false;
 	$('#making-area #content').keyup(function(e) {
	    $('#main #description').text('In the input...');
	    if (keyUptimer !== false) {
	        clearTimeout(keyUptimer);
	    }
	    keyUptimer = setTimeout(function() {
		    var contentNew = $('#making-area #content').val();
	        if(contentNew != contentOld){
	            contentOld = contentNew;
			    controller.updateVisual();
			    controller.setEventAfterDraw();

			    $('#main #description').text('Saved!');
			    store.set(Enum.CONFIG.INDENT_MARK, contentNew);
	        }
	    }, 500); // 値を変更すると反映の間隔を変更できる
	});

	// ヴィジュアルエリアの拡大
	$('.glyphicon-resize-full').on('click', function() {
		if($('#visual-title-wrapper').hasClass('full')){
			var windowWidth = $(window).width();
			var partsWidth = windowWidth / 2;
			$('#visual-title-wrapper').width(partsWidth);
			$('#visual-area').width(partsWidth);
			$('#visual-title-wrapper').removeClass('full');
		} else {
			$('#visual-title-wrapper').width($(window).width());
			$('#visual-area').width($(window).width());
			$('#visual-title-wrapper').addClass('full');
		}

		$('#making-title-wrapper').toggle();
		$('#making-area').toggle();

	    controller.updateVisual();
	    controller.setEventAfterDraw();
	});

	// 画面のリサイズイベント
	var resizeTimer = false;
	$(window).resize(function() {
	    if (resizeTimer !== false) {
	        clearTimeout(resizeTimer);
	    }
	    resizeTimer = setTimeout(function() {
	    	controller.initVisual();
	    }, 200);
	});

/*
    // 各コメントにトグルイベントを設定
	$('.mark-comment .glyphicon').each(function(i){
		var that = this;
		$(that).on('click', function() {
			$(that).parent().find('.my-content').slideToggle();
		});
	});
*/

}


/**
 * 非表示の列を表示状態にする。
 */
IndexController.prototype.openRow = function() {
	$('#sidebar-area .my_row.toggle').each(function(i){
		var that = this;
		var targetRows = $(that).find('[name="target-row"]').val().split(',');

		// 対象の列を表示にする
		targetRows.forEach(function(rowNumber){
			$('#sidebar-area #row_' + rowNumber).css('display', '');
			$('#main-area #row_' + rowNumber).css('display', '');
		});

		$(that).find('.my-mark').removeClass('glyphicon-chevron-up');
		$(that).find('.my-mark').addClass('glyphicon-chevron-down');
		$(that).removeClass('fold');
		$(that).addClass('open');
	});
}

/**
 * 要素が書き出された後のイベントの設定
 */
IndexController.prototype.setEventAfterDraw = function() {
    // 済タスクの折り畳み機能を設定
	$('#sidebar-area .my_row.toggle').each(function(i){
		var that = this;
		$(that).on('click', function() {
			var targetRows = $(that).find('[name="target-row"]').val().split(',');

			if($(that).hasClass('open')){ // 開いている状態
				// 対象の列を非表示にする
				targetRows.forEach(function(rowNumber){
					$('#sidebar-area #row_' + rowNumber).toggle();
					$('#main-area #row_' + rowNumber).toggle();
				});

				$(that).find('.my-mark').removeClass('glyphicon-chevron-down');
				$(that).find('.my-mark').addClass('glyphicon-chevron-up');
				$(that).removeClass('open');
				$(that).addClass('fold');
			} else if($(that).hasClass('fold')){ // 閉じている状態
				// 対象の列を表示にする
				targetRows.forEach(function(rowNumber){
					$('#sidebar-area #row_' + rowNumber).toggle();
					$('#main-area #row_' + rowNumber).toggle();
				});

				$(that).find('.my-mark').removeClass('glyphicon-chevron-up');
				$(that).find('.my-mark').addClass('glyphicon-chevron-down');
				$(that).removeClass('fold');
				$(that).addClass('open');
			}
		});

		// 初期状態は閉じた状態
		$(that).addClass('open');
		$(that).click();
	});

    // 各コメントにトグルイベントを設定
	$('#main-area .my_row').each(function(i){
		var that = this;
		$(that).hover(
			function() { // フォーカスオン
				$(that).removeClass('focusout');
				$(that).addClass('focusin');
			},
			function() { // フォーカスオフ
				$(that).removeClass('focusin');
				$(that).addClass('focusout');
			}
		);
	});

    // sidebarとmainの各行の高さを取得して高さを合わせる。
	$('#main-area .my_row').each(function(i){
		var that = this;
		$('#sidebar-area #row_' + i).height($(this).height());
	});
}

/**
 * ビジュアル更新処理
 */
IndexController.prototype.updateVisual = function() {
	// 初期化に気を付ける
	$('#visual-area').html('<div id="sidebar-area"></div><div id="main-area"></div>');

	var content = $('#making-area #content').val();
	if(!content) { return; }

	var elements = this.charAnalysis(content);

	var elementSideBarHtml = this.constructSidebarHtml(elements);

	var elementMainHtml = this.constructMainHtml(elements);

	$('#sidebar-area').append(elementSideBarHtml);
	$('#main-area').append(elementMainHtml);
}

/**
 * サイドバーのHTML変換
 */
IndexController.prototype.constructSidebarHtml = function(elements) {
	var mainHtml = '';

	for(var key in elements){
		mainHtml += this.toSidebarHtml(elements[key]);
	}

	return mainHtml;
}

/**
 * 要素配列一行分をHTMLへ変換
 */
IndexController.prototype.toSidebarHtml = function(element) {
	var mark = element[IndexController.ELEMENT.MARK];
	var doneChildren = element[IndexController.ELEMENT.DONE_CHILDREN];
	var index = element[IndexController.ELEMENT.INDEX];

	if(mark != Enum.MARK.DONE || doneChildren == null) { 
		return '<div id="row_' + index + '" class="my_row">&nbsp;<br /></div>'; 
	}

	var markIcon = 'glyphicon glyphicon-chevron-down';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="my_row toggle">';
	htmlChar += '  <span class="my-mark ' + markIcon + '"></span>';
	htmlChar += '  <input type="hidden" name="target-row" value="' + doneChildren.join(',') + '">';
	htmlChar += '</div>';

	return htmlChar;
}

/**
 * メインHTML変換
 */
IndexController.prototype.constructMainHtml = function(elements) {
	var mainHtml = '';

	for(var key in elements){
		mainHtml += this.toMainHtml(elements[key]);
	}

	return mainHtml;
}

/**
 * 要素配列一行分をHTMLへ変換
 */
IndexController.prototype.toMainHtml = function(element) {
	var htmlChar = '';

	var mark = element[IndexController.ELEMENT.MARK];

	if(mark == null) { 
		return this.createTitleHtml(element); 
	}

	// TODO: 他のマークの条件分も実装する
	if(mark == Enum.MARK.TASK) {
		htmlChar = this.createTaskHtml(element);
	} else if(mark == Enum.MARK.DONE) {
		htmlChar = this.createDoneHtml(element);
	} else if(mark == Enum.MARK.SUPPLEMENT) {
		htmlChar = this.createSupplementHtml(element);
	} else if(mark == Enum.MARK.COMMENT) {
		htmlChar = this.createCommentHtml(element);
	} else if(mark == Enum.MARK.CONCLUSION) {
		htmlChar = this.createConclusionHtml(element);
	}

	return htmlChar;
}

/**
 * タイトルの要素を作成する
 */
IndexController.prototype.createTitleHtml = function(element) {
	var index = element[IndexController.ELEMENT.INDEX];
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT];

	if(content == null) { 
		var htmlChar = '';

		htmlChar += '<div id="row_' + index + '" class="my_row focusout">';
		// htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
		htmlChar += '  <span class="my-mark"></span>';
		htmlChar += '  <div class="my-content char-font">&nbsp;</div>';
		htmlChar += ' </div>';		
		htmlChar += '</div>';		

		return htmlChar;
	}

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="my_row focusout">';
	// htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
	htmlChar += '  <div class="my-title">';
	htmlChar += '  <div class="my-content char-font">' + content + '</div>';
	htmlChar += ' </div>';		
	htmlChar += '</div>';		

	return htmlChar;
}

/**
 * タスクの要素を作成する
 */
IndexController.prototype.createTaskHtml = function(element) {
	var index = element[IndexController.ELEMENT.INDEX];
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT] != null ? element[IndexController.ELEMENT.CONTENT] : '';

	var symbol = 'mark-task';
	var markIcon = 'glyphicon glyphicon-unchecked';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="my_row ' + symbol + ' focusout">';
	htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
	htmlChar += '  <span class="my-mark ' + markIcon + '"></span>';
	htmlChar += '  <div class="my-content char-font">' + content + '</div>';
	htmlChar += ' </div>';		
	htmlChar += '</div>';		

	return htmlChar;
}

/**
 * 完了タスクの要素を作成する
 */
IndexController.prototype.createDoneHtml = function(element) {
	var index = element[IndexController.ELEMENT.INDEX];
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT] != null ? element[IndexController.ELEMENT.CONTENT] : '';
	var doneChildren = element[IndexController.ELEMENT.DONE_CHILDREN];

	var symbol = 'mark-done';
	var markIcon = 'glyphicon glyphicon-check';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="my_row ' + symbol + ' focusout">';
	htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
	htmlChar += '  <span class="my-mark ' + markIcon + '"></span>';
	htmlChar += '  <div class="my-content char-font">' + content + '</div>';
	htmlChar += ' </div>';		
	htmlChar += '</div>';		

	return htmlChar;
}

/**
 * 補足の要素を作成する
 */
IndexController.prototype.createSupplementHtml = function(element) {
	var index = element[IndexController.ELEMENT.INDEX];
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT] != null ? element[IndexController.ELEMENT.CONTENT] : '';

	var symbol = 'mark-supplement';
	var markIcon = 'glyphicon glyphicon-arrow-right';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="my_row ' + symbol + ' focusout">';
	htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
	htmlChar += '  <span class="my-mark ' + markIcon + '"></span>';
	htmlChar += '  <div class="my-content char-font">' + content + '</div>';
	htmlChar += ' </div>';		
	htmlChar += '</div>';		

	return htmlChar;
}

/**
 * 注釈の要素を作成する
 */
IndexController.prototype.createCommentHtml = function(element) {
	var index = element[IndexController.ELEMENT.INDEX];
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT] != null ? element[IndexController.ELEMENT.CONTENT] : '';

	var symbol = 'mark-comment';
	var markIcon = 'glyphicon glyphicon-asterisk';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="my_row ' + symbol + ' focusout">';
	htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
	htmlChar += '  <span class="my-mark ' + markIcon + '"></span>';
	htmlChar += '  <div class="my-content char-font">' + content + '</div>';
	htmlChar += ' </div>';
	htmlChar += '</div>';		

	return htmlChar;
}

/**
 * 結論の要素を作成する
 */
IndexController.prototype.createConclusionHtml = function(element) {
	var index = element[IndexController.ELEMENT.INDEX];
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT] != null ? element[IndexController.ELEMENT.CONTENT] : '';

	var symbol = 'mark-conclusion';
	var markIcon = 'glyphicon glyphicon-thumbs-up';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="my_row ' + symbol + ' focusout">';
	htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
	htmlChar += '  <span class="my-mark ' + markIcon + '"></span>';
	htmlChar += '  <div class="my-content char-font">' + content + '</div>';
	htmlChar += ' </div>';		
	htmlChar += '</div>';		

	return htmlChar;
}

/**
 * 要素解析
 */
IndexController.prototype.charAnalysis = function(rawContent) {
	var contents = rawContent.split(/\r?\n/g);
	var controller = this;

	var i = 0;
	var elements = [];
	var doneIndent = null;
	var doneChildren = null;
	contents.forEach(function(content){
		var element = controller.toElement(content);

		element[IndexController.ELEMENT.INDEX] = i;

		if(doneChildren != null){
			if(element[IndexController.ELEMENT.MARK] === Enum.MARK.SUPPLEMENT){
				doneChildren.push(i);
			} else if(element[IndexController.ELEMENT.MARK] === Enum.MARK.COMMENT){
				doneChildren.push(i);
			} else if(doneChildren.length > 0) {
				var parentDoneElement = elements[doneIndent];
				parentDoneElement[IndexController.ELEMENT.DONE_CHILDREN] = doneChildren;
				elements[doneIndent] = parentDoneElement;

				doneIndent = null;
				doneChildren = null;
			} else {
				doneIndent = null;
				doneChildren = null;
			}
		}

		// 済マーク以下のインデントのマークが「補足、注釈」があった場合は折り畳みため関連する段落を保持する。
		if(element[IndexController.ELEMENT.MARK] === Enum.MARK.DONE){
			doneChildren = [];
			doneIndent = i;
		}

		elements.push(element);
		i++;
	});

	if(doneChildren != null && doneChildren.length > 0){
		var parentDoneElement = elements[doneIndent];
		parentDoneElement[IndexController.ELEMENT.DONE_CHILDREN] = doneChildren;
		elements[doneIndent] = parentDoneElement;
	}

	return elements;
}

/**
 * 一列の情報を要素オブジェクトに変換する。
 */
IndexController.prototype.toElement = function(content) {
	var element = [];

	// 対象のマークを文字列としてまとめる
	var marks = "";
	for(var key in Enum.MARK){
		marks += Enum.MARK[key];
	}

	var temp = null;
	var regexp = null;

	//指定の記号
	regexp = new RegExp('^[' + marks + ']', 'g');
	temp = content.replace(new RegExp('^' + Enum.CONFIG.INDENT_MARK + '+', 'g'), '').match(regexp);
	element[IndexController.ELEMENT.MARK] = temp != null ? temp[0] : null;

	//インデント(全角半角)
	regexp = new RegExp('^' + Enum.CONFIG.INDENT_MARK + '+', 'g');
	temp = content.match(regexp);
	element[IndexController.ELEMENT.INDENT] = temp != null ? temp[0].length : 0;

	//記載内容
	element[IndexController.ELEMENT.CONTENT] = function(content){
		regexp = new RegExp('(?!\\s+).+$', 'g');
		temp = content.match(regexp);

		if(temp == null) return null;

		// FIXME: 空白と記号は含めないようにする正規表現を完成させる
		// '(?!\\s+)(?![' + marks + ']).+$'
		regexp = new RegExp('^[' + marks + ']', 'g');
		temp = temp[0].replace(regexp, '');

		return myCommon.autoLink(temp, true);
	}(content);


	return element;
}