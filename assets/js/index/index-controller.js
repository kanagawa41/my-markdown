"use strict";
/**
 * 共通処理群。
 */
var IndexController = function() {
    if(!(this instanceof IndexController)) {
        return new IndexController();
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
}

/**
 * イベントの設定
 */
IndexController.prototype.initEvent = function() {
	var controller = this;
  $('#making-area').find('#create_btn').on('click', function() {
    controller.updateVisual();

    // 各コメントにトグルイベントを設定
	$('.mark-comment .glyphicon').each(function(i){
		var that = this;
		$(that).on('click', function() {
			$(that).parent().find('.my-content').slideToggle();
		});
	});

    // 済タスクの折り畳み機能を設定
	$('#sidebar-area .row.toggle').each(function(i){
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
		$(that).addClass('open');
		$(that).click();
	});

    // 各コメントにトグルイベントを設定
	$('#main-area .row').each(function(i){
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
		return '<div id="row_' + index + '" class="row">&nbsp;<br /></div>'; 
	}

	var markIcon = 'glyphicon glyphicon-chevron-down';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="row toggle">';
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

	if(content == null) { return '<div id="row_' + index + '" class="row"><br /></div>'; }

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="row focusout">';
	htmlChar += ' <div class="my-title">';
	htmlChar += '  <div class="my-content">' + content + '</div>';
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
	var content = element[IndexController.ELEMENT.CONTENT];

	var symbol = 'mark-task';
	var markIcon = 'glyphicon glyphicon-unchecked';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="row ' + symbol + ' focusout">';
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
	var content = element[IndexController.ELEMENT.CONTENT];
	var doneChildren = element[IndexController.ELEMENT.DONE_CHILDREN];

	var symbol = 'mark-done';
	var markIcon = 'glyphicon glyphicon-check';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="row ' + symbol + ' focusout">';
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
	var content = element[IndexController.ELEMENT.CONTENT];

	var symbol = 'mark-supplement';
	var markIcon = 'glyphicon glyphicon-arrow-right';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="row ' + symbol + ' focusout">';
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
	var content = element[IndexController.ELEMENT.CONTENT];

	var symbol = 'mark-comment';
	var markIcon = 'glyphicon glyphicon-asterisk';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="row ' + symbol + ' focusout">';
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
	var content = element[IndexController.ELEMENT.CONTENT];

	var symbol = 'mark-conclusion';
	var markIcon = 'glyphicon glyphicon-thumbs-up';

	var htmlChar = '';
	htmlChar += '<div id="row_' + index + '" class="row ' + symbol + ' focusout">';
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
	regexp = new RegExp('(?!\\s*[' + marks + ']).+$', 'g');
	temp = content.match(regexp);
	element[IndexController.ELEMENT.CONTENT] = temp != null ? temp[0] : null;

	return element;
}
