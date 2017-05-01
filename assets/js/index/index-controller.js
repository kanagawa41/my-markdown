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
  });
}

/**
 * ビジュアル更新処理
 */
IndexController.prototype.updateVisual = function() {
  $('#visual-area').html('');

  var content = $('#making-area #content').val();
  if(!content) { return; }

  var elements = this.charAnalysis(content);

  var elementHtml = this.constructHtml(elements);

  // var element = '<div>■タスク</div>';
  $('#visual-area').append(elementHtml);
}

/**
 * HTML変換
 */
IndexController.prototype.constructHtml = function(elements) {
	var allHtml = '';

	for(var key in elements){
		allHtml += this.toHtml(elements[key]);
	}

	return allHtml;
}

/**
 * 要素配列一行分をHTMLへ変換
 */
IndexController.prototype.toHtml = function(element) {
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
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT];

	if(content == null) { return '<div class="row"><br /></div>'; }

	var htmlChar = '';
	htmlChar += '<div class="row">';
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
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT];

	var symbol = 'mark-task';
	var markIcon = 'glyphicon glyphicon-unchecked';

	var htmlChar = '';
	htmlChar += '<div class="row ' + symbol + '">';
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
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT];

	var symbol = 'mark-done';
	var markIcon = 'glyphicon glyphicon-check';

	var htmlChar = '';
	htmlChar += '<div class="row ' + symbol + '">';
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
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT];

	var symbol = 'mark-supplement';
	var markIcon = 'glyphicon glyphicon-arrow-right';

	var htmlChar = '';
	htmlChar += '<div class="row ' + symbol + '">';
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
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT];

	var symbol = 'mark-comment';
	var markIcon = 'glyphicon glyphicon-chevron-down';

	var htmlChar = '';
	htmlChar += '<div class="row ' + symbol + '">';
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
	var indent = element[IndexController.ELEMENT.INDENT];
	var content = element[IndexController.ELEMENT.CONTENT];

	var symbol = 'mark-conclusion';
	var markIcon = 'glyphicon glyphicon-exclamation-sign';

	var htmlChar = '';
	htmlChar += '<div class="row ' + symbol + '">';
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

	var elements = [];
	contents.forEach(function(content){
		var element = controller.toElement(content);

		elements.push(element);
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
