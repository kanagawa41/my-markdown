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
    TYPE: 'type',
    MARK: 'mark',
    INDENT: 'indent',
    CONTENT: 'content',
    RAW_CONTENT: 'raw_content',
    INDEX: 'index',
    DONE_CHILDREN: 'done_children',
    FOLD_AREA: 'fold_area',
}

/**
 * エレメントタイプenum
 */
IndexController.ELEMENT_TYPE = {
    MARK: 'mark',
    NORMAL: 'normal',
    FOLD_AREA: 'fold_area',
}

/**
 * 折りたたみエレメントenum
 */
IndexController.FOLD_AREA_ELEMENT = {
    INDENT: 'indent',
    CONTENT: 'content',
}

/**
 * 初期処理
 */
IndexController.prototype.init = function() {
    this.initLocalstrage();
    this.initVisual();
    this.initEvent();

    // 前回の値を表示するようにしたので初期化処理を行う
    this.updateVisual();
    this.setEventAfterDraw();

    // マスクを消す
    $("#overlay").fadeOut(400);
}

/**
 * ローカルストレージの設定
 */
IndexController.prototype.initLocalstrage = function() {
    // メモの初期化
    if(!store.get(Enum.STOREKEY.DOCUMENTS)){
        store.set(Enum.STOREKEY.DOCUMENT_TITLES, {0: Enum.CONFIG.DEFAULT_TITLE});
        store.set(Enum.STOREKEY.DOCUMENTS, {0: ""});
        store.set(Enum.STOREKEY.SELECT_DOCUMENT, 0);

        var datas = [];
        var variable = {};
        variable['variable-name'] = $(this).find('[name="variable-name"]').val();
        variable['variable-value'] = $(this).find('[name="variable-value"]').val();
        variable['variable-supplement'] = $(this).find('[name="variable-supplement"]').val();
        datas.push(variable);
        store.set(Enum.STOREKEY.VARIABLES, datas);
    }
}

/**
 * ビジュアルの設定
 */
IndexController.prototype.initVisual = function() {    
    var controller = this;

    this.partsWidth = Math.floor($(window).width() / 2);
    this.windowHeight = Math.floor($(window).height())
        - Math.floor($('#page-wrapper').height())
        - Math.floor($('#making-title-wrapper').height());

    this.resize();

    // コンボボックスの作成
    this.createTitlebox(store.get(Enum.STOREKEY.DOCUMENT_TITLES), store.get(Enum.STOREKEY.SELECT_DOCUMENT));

    var variables = store.get(Enum.STOREKEY.VARIABLES);
    this.createVariableTable(variables);

    // エディタの設定
    this.editor = ace.edit("ace_editor");
    this.editor.setFontSize(14);
    // this.editor.resize(true);
    this.editor.getSession().setUseWrapMode(true);
    // this.editor.getSession().setTabSize(4);
    this.editor.$blockScrolling = Infinity;
    this.Range = ace.require('ace/range').Range;

    var lastDocument = store.get(Enum.STOREKEY.DOCUMENTS);
    if(lastDocument){
        this.editor.setValue(lastDocument[store.get(Enum.STOREKEY.SELECT_DOCUMENT)]);
    }

    var variables = store.get(Enum.STOREKEY.VARIABLES);
    if(variables){
        $('#variables-modal .row-var').each(function(i, content){
            var variable = variables[i];
            $(this).find('[name="variable-name"]').val(variable['variable-name']);
            $(this).find('[name="variable-value"]').val(variable['variable-value']);
            $(this).find('[name="variable-supplement"]').val(variable['variable-supplement']);
        });
    }

    // 値を入れることにより選択状態になるため解除
    this.editor.gotoLine(0, 0, true);
    this.editor.selection.moveCursorRight();
    this.editor.selection.moveCursorLeft();
    this.editor.focus();
}

/**
 * セレクタに追加
 */
IndexController.prototype.createTitlebox = function(characters, targetNum) {
    var $select = $('#target-note');
    var $option;
    var isSelected;

    // コールバック関数の引数の順序が $.each と異なることに注意。
    var options = $.map(characters, function (name, value) {
        isSelected = (value == targetNum);
        $option = $('<option>', { value: value, text: name, selected: isSelected });
        return $option;
    });

    $select.append(options);
};

/**
 * 変数項目を作成
 */
IndexController.prototype.createVariableTable = function(variables) {
    var table = $('#variables-modal table');

    var trs = '';
    trs += '<tr>';
    trs += ' <td></td><td>変数名</td><td>値</td><td>備考</td>';
    trs += '</tr>';

    var firstFlag = true;
    $(variables).each(function(i, content){
        var variable = variables[i];

        var tr = '';
        tr += '<tr class="row-var">';
        // 一行目のアイコンはあらかじめ削除しておく。
        if(firstFlag){
            tr += ' <td>　</td>';
            firstFlag = false;
        } else {
            tr += ' <td><a href="#" data-toggle="tooltip" title="変数を削除"><span class="glyphicon glyphicon-minus-sign" onclick="indexController.removeVariable(this);"></span></a></td>';
        }
        tr += ' <td><input type="input" name="variable-name" value="' + variable['variable-name'] + '"></td>';
        tr += ' <td><input type="input" name="variable-value" value="' + variable['variable-value'] + '"></td>';
        tr += ' <td><input type="input" name="variable-supplement" value="' + variable['variable-supplement'] + '"></td>';
        tr += '</tr>';

        trs += tr;
    });

    trs += '<tr class="row-last-var">';
    trs += ' <td colspan="4"><a href="#" data-toggle="tooltip" title="変数を追加"><span class="glyphicon glyphicon-plus-sign" onclick="indexController.addVariable();"></span></a></td>';
    trs += '</tr>';

    table.html(trs);
};

IndexController.prototype.resize = function() {
    // 高さに影響を与える要素ができた場合、それを引くようにする
    $('#making-area #ace_editor').height(this.windowHeight);
    $('#visual-area').height(this.windowHeight);
}

/**
 * イベントの設定
 */
IndexController.prototype.initEvent = function() {
    var controller = this;

    // コンテンツの入力イベント
    var contentOld = null;
    var keyUptimer = false;
    this.editor.session.on('change', function(){
        controller.outputMessage('In the input...');

        if (keyUptimer !== false) {
            clearTimeout(keyUptimer);
        } else {
            $('#target-note').prop('disabled', true);
        }
        keyUptimer = setTimeout(function() {
            var contentNew = controller.editor.getValue();
            if(contentNew != contentOld){
                contentOld = contentNew;
                controller.updateVisual();
                controller.setEventAfterDraw();

                var tempDocs = store.get(Enum.STOREKEY.DOCUMENTS);
                var targetNum = $('#target-note').val();
                tempDocs[targetNum] = contentNew;

                store.set(Enum.STOREKEY.DOCUMENTS, tempDocs);
                store.set(Enum.STOREKEY.SELECT_DOCUMENT, targetNum);

                controller.outputMessage('Saved!');
            } else {
                // 本当はセーブしていないが内容が変わらないので整合性はある。　
                controller.outputMessage('Saved!');
            }

            $('#target-note').prop('disabled', false);
            clearTimeout(keyUptimer);
            keyUptimer = false;
        }, 2000); // 値を変更すると反映の間隔を変更できる
    });

    controller.editor.selection.on("changeSelection", function(){
        var selectionRange = controller.editor.getSelectionRange();

        var startLine = selectionRange.start.row;
        var endLine = selectionRange.end.row;

        $('#sidebar-area .my_row').each(function(i, content){
            var rowNumber = $(this).attr('id').split('row-')[1];
            $(this).removeClass('none-selected');

            if(rowNumber >= startLine && rowNumber < endLine){
                $(this).addClass('selected');
            } else {
                $(this).addClass('none-selected');
                $(this).removeClass('selected');
            }
        })        
    });

    // セレクトボックスを変更した場合
    $('#target-note').on('change', function(){
        store.set(Enum.STOREKEY.SELECT_DOCUMENT, $(this).val());

        var docs = store.get(Enum.STOREKEY.DOCUMENTS);
        controller.editor.setValue(docs[$(this).val()]);

        // 値を入れることにより選択状態になるため解除
        controller.editor.gotoLine(0, 0, true);
        controller.editor.selection.moveCursorRight();
        controller.editor.selection.moveCursorLeft();
        controller.editor.focus();

        $('#title-edit').val($(this).find('option:selected').text());
        controller.outputMessage('Note changed!');
    });
    $('#target-note').change();

    // ヴィジュアルエリアの拡大
    $('.glyphicon-resize-full').on('click', function() {
        $(this).css('display', 'none');
        $(this).parent().find('.glyphicon-resize-small').css('display', 'block');

        $('#visual-title-wrapper').addClass('full');
        $('#visual-area').addClass('full');

        $('#making-title-wrapper').toggle();
        $('#making-area').toggle();

        controller.updateVisual();
        controller.setEventAfterDraw();
    });

    // ヴィジュアルエリアの縮小
    $('.glyphicon-resize-small').on('click', function() {
        $(this).css('display', 'none');
        $(this).parent().find('.glyphicon-resize-full').css('display', 'block');

        $('#visual-title-wrapper').removeClass('full');
        $('#visual-area').removeClass('full');

        $('#making-title-wrapper').toggle();
        $('#making-area').toggle();

        controller.updateVisual();
        controller.setEventAfterDraw();
    });

    // タイトル変更イベント
    $('#title-edit').blur(function() {
        // タイトルをセレクトボックスORストレージに登録する
        var targetNum = parseInt($('#target-note').val());
        var titles = {};
        $('#target-note option').each(function(i, content){
            if($(this).val() == targetNum){
                var title = $('#title-edit').val();
                if(title){
                    $(this).text(title); // 一行目を取得しタイトルとして設定
                } else {
                    $(this).text(Enum.CONFIG.DEFAULT_TITLE + (targetNum + 1));
                }
            }
            titles[$(this).val()] = $(this).text();
        });

        store.set(Enum.STOREKEY.DOCUMENT_TITLES, titles);
        controller.outputMessage('Title saved!');
    });

    // ファイルアップロードイベント
    $("#fileupload").on('change', function() {
        var input = $('#fileupload').get(0);
        if(input.files.length == 0){ 
            console.log('No selected file!');
            return;
        } else {
            console.log('Selected file!');
        }

        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent){
            var importDatas = JSON.parse(fileReader.result);

            // インポートしたデータを設定
            store.set(Enum.STOREKEY.DOCUMENT_TITLES, importDatas["DOCUMENT_TITLES"]),
            store.set(Enum.STOREKEY.DOCUMENTS, importDatas["DOCUMENTS"]),
            store.set(Enum.STOREKEY.SELECT_DOCUMENT, importDatas["SELECT_DOCUMENT"]),
            store.set(Enum.STOREKEY.VARIABLES, importDatas["VARIABLES"]),

            location.reload();
        };

        var blob = new Blob([input.files[0]], { type: "text/plain" });
        fileReader.readAsText(blob, "UTF-8");
    });

    // 画面のリサイズイベント
    var resizeTimer = false;
    $(window).resize(function() {
        if (resizeTimer !== false) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function() {
            controller.resize();
        }, 200);
    });
}

/**
 * メインHTML変換
 */
IndexController.prototype.saveVaiable = function() {
    if(!confirm('変数を更新しますか？')){
        return false;
    }

    var datas = [];
    $('#variables-modal .row-var').each(function(i, content){
        var variable = {};
        variable['variable-name'] = $(this).find('[name="variable-name"]').val();
        variable['variable-value'] = $(this).find('[name="variable-value"]').val();
        variable['variable-supplement'] = $(this).find('[name="variable-supplement"]').val();
        datas.push(variable);
    });

    store.set(Enum.STOREKEY.VARIABLES, datas);
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
            $('#sidebar-area #row-' + rowNumber).css('display', '');
            $('#main-area #row-' + rowNumber).css('display', '');
        });

        $(that).find('.my-mark').removeClass('glyphicon-chevron-up');
        $(that).find('.my-mark').addClass('glyphicon-chevron-down');
        $(that).removeClass('fold');
        $(that).addClass('open');
    });
}


IndexController.prototype.messageFadetimer = false;
/**
 * イベントメッセージの表示制御を行う。
 */
IndexController.prototype.outputMessage = function(message) {
    var controller = this;

    $('#header #description').css('display', 'block');
    $('#header #description').text(message);

    if (controller.messageFadetimer !== false) {
        clearTimeout(controller.messageFadetimer);
    }

    controller.messageFadetimer = setTimeout(function() {
        $('#header #description').fadeOut();
        clearTimeout(controller.messageFadetimer);
    }, 4000);
}

/**
 * ローカルストレージに保持している値をエクスポートする。
 */
IndexController.prototype.exportData = function() {
    var tasks = {
        "DOCUMENT_TITLES": store.get(Enum.STOREKEY.DOCUMENT_TITLES),
        "DOCUMENTS": store.get(Enum.STOREKEY.DOCUMENTS),
        "SELECT_DOCUMENT": store.get(Enum.STOREKEY.SELECT_DOCUMENT),
        "VARIABLES": store.get(Enum.STOREKEY.VARIABLES),
    };
     
    var data = JSON.stringify(tasks);
    var a = document.getElementById('export-link');
    a.download = 'tasks.json';
    a.href = window.URL.createObjectURL(new Blob([data], { type: 'text/plain' }));
    a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
}

/**
 * 指定のJSONファイルのデータをローカルストレージにインポートする。
 */
IndexController.prototype.importData = function() {
    $('#fileupload').click();
}

/**
 * ノートを追加する。
 */
IndexController.prototype.addNote = function() {
    var controller = this;

    var documents = store.get(Enum.STOREKEY.DOCUMENTS);
    var titles = store.get(Enum.STOREKEY.DOCUMENT_TITLES);
    var selected = parseInt($('#target-note').children('option:last-child').val()) + 1;

    // ノートを追加
    documents[selected] = "";
    titles[selected] = Enum.CONFIG.DEFAULT_TITLE;

    store.set(Enum.STOREKEY.DOCUMENTS, documents);
    store.set(Enum.STOREKEY.DOCUMENT_TITLES, titles);
    store.set(Enum.STOREKEY.SELECT_DOCUMENT, selected);

    // テキストの初期化
    controller.editor.setValue("");
    // コンボボックスの作成
    $('#target-note option').remove('');
    controller.createTitlebox(titles, selected);
    $('#title-edit').val($('#target-note').find('option:selected').text());

    controller.outputMessage('Add a note!');
}


/**
 * TODO: 作成
 * 指定された行をタスク済にする。
 */
IndexController.prototype.checkeTask = function(index) {
    alert('タスク済にしたい。。。。');
}

/**
 * TODO: 作成
 * 指定された行をタスク未にする。
 */
IndexController.prototype.unCheckeTask = function(index) {
    alert('タスク未にしたい。。。。');
}

/**
 * ノートを削除する。
 */
IndexController.prototype.removeNote = function() {
    var controller = this;

    // 最後のノート
    if($('#target-note').children().length == 1){
        controller.outputMessage('Can\'t remove a note!');
        return;
    }

    if(!confirm('ノートを削除しますか？')){
        return false;
    }

    var documents = store.get(Enum.STOREKEY.DOCUMENTS);
    var titles = store.get(Enum.STOREKEY.DOCUMENT_TITLES);
    var selected = $('#target-note').val();

    delete documents[selected];
    delete titles[selected];

    var count = 0;

    var alreadyRemove = false;
    var aheadVal = $('#target-note option:first-child').val();
    var aheadTitle = $('#target-note option:first-child').text();
    $('#target-note option').each(function(i, content){
        if($(this).val() == selected){
            $(this).remove();
            alreadyRemove = true;
            count = i - 1;
        }
    });

    // ラスト一つの場合、初回を選択して削除した場合
    if($('#target-note').children().length == 1 || count < 0){
        count = 0;
    }

    var nextTarget = $('#target-note option').eq(count);
    store.set(Enum.STOREKEY.DOCUMENTS, documents);
    store.set(Enum.STOREKEY.DOCUMENT_TITLES, titles);
    store.set(Enum.STOREKEY.SELECT_DOCUMENT, $(nextTarget).val());

    // テキストの初期化
    controller.editor.setValue(documents[$(nextTarget).val()]);
    $('#title-edit').val($(nextTarget).text());
    $(nextTarget).prop('selected', true);

    controller.outputMessage('Remove a note!');
}

/**
 * ローカルストレージをリセットする。
 */
IndexController.prototype.resetSetting = function() {
    if(!confirm('ノートの情報等をリセットしますか？')){
        return false;
    }

    store.remove(Enum.STOREKEY.DOCUMENT_TITLES);
    store.remove(Enum.STOREKEY.DOCUMENTS);
    store.remove(Enum.STOREKEY.SELECT_DOCUMENT);
    store.remove(Enum.STOREKEY.VARIABLES);

    // 画面初期化
    location.reload();
}


/**
 * 変数列を削除する。
 */
IndexController.prototype.removeVariable = function(row) {
    $(row).parent().parent().parent().remove();
}

/**
 * 変数列を追加する。
 */
IndexController.prototype.addVariable = function() {
    var lastRow = $('#variables-modal table .row-last-var');

    var tr = '';
    tr += '<tr class="row-var">';
    tr += ' <td><a href="#" data-toggle="tooltip" title="変数を削除"><span class="glyphicon glyphicon-minus-sign" onclick="indexController.removeVariable(this);"></span></a></td>';
    tr += ' <td><input type="input" name="variable-name" value=""></td>';
    tr += ' <td><input type="input" name="variable-value" value=""></td>';
    tr += ' <td><input type="input" name="variable-supplement" value=""></td>';
    tr += '</tr>';

    lastRow.before(tr);
}

/**
 * 表示の列を非表示状態にする。
 */
IndexController.prototype.closeRow = function() {
    $('#sidebar-area .my_row.toggle').each(function(i){
        var that = this;
        var targetRows = $(that).find('[name="target-row"]').val().split(',');

        // 対象の列を表示にする
        targetRows.forEach(function(rowNumber){
            $('#sidebar-area #row-' + rowNumber).css('display', 'none');
            $('#main-area #row-' + rowNumber).css('display', 'none');
        });

        $(that).find('.my-mark').removeClass('glyphicon-chevron-down');
        $(that).find('.my-mark').addClass('glyphicon-chevron-up');
        $(that).removeClass('open');
        $(that).addClass('fold');
    });
}

/**
 * 要素が書き出された後のイベントの設定
 */
IndexController.prototype.setEventAfterDraw = function() {
    var controller = this;
    // 済タスクの折り畳み機能を設定
    $('#sidebar-area .my_row.toggle').each(function(i){
        var that = this;
        $(that).on('click', function() {
            var targetRows = $(that).find('[name="target-row"]').val().split(',');

            if($(that).hasClass('open')){ // 開いている状態
                // 対象の列を非表示にする
                targetRows.forEach(function(rowNumber){
                    // もし閉じる列がトグルを保持している場合は閉じる
                    if($('#sidebar-area #row-' + rowNumber).hasClass('toggle') && $('#sidebar-area #row-' + rowNumber).hasClass('open')){
                        $('#sidebar-area #row-' + rowNumber).click();
                    }

                    $('#sidebar-area #row-' + rowNumber).css('display', 'none');
                    $('#main-area #row-' + rowNumber).css('display', 'none');
                });

                $(that).find('.my-mark').removeClass('glyphicon-chevron-down');
                $(that).find('.my-mark').addClass('glyphicon-chevron-up');
                $(that).removeClass('open');
                $(that).addClass('fold');
            } else if($(that).hasClass('fold')){ // 閉じている状態
                // 対象の列を表示にする
                targetRows.forEach(function(rowNumber){
                    $('#sidebar-area #row-' + rowNumber).css('display', '');
                    $('#main-area #row-' + rowNumber).css('display', '');
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

        // ダブルクリック
        $(that).dblclick(function () {
            // 対象の列にカーソルをあてる
            var row = $(that).attr("id").replace('row-', '');
            controller.editor.gotoLine((parseInt(row) + 1), 0, true);
            // エディタで文字を入力するとエラーが発生するため下記のメソッドでリセット？をして解消している
            controller.editor.selection.moveCursorRight();
            controller.editor.selection.moveCursorLeft();
            controller.editor.focus();
        });
    });

    // sidebarとmainの各行の高さを取得して高さを合わせる。
    $('#main-area .my_row').each(function(i){
        var that = this;
        $('#sidebar-area #row-' + i).height($(this).height());
    });
}

/**
 * ビジュアル更新処理
 */
IndexController.prototype.updateVisual = function() {
    // 初期化に気を付ける
    $('#visual-area').html('<div id="sidebar-area"></div><div id="main-area"></div>');

    var content = this.editor.getValue();
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
        if(elements[key] != null){
            mainHtml += this.toSidebarHtml(elements[key]);
        }
    }

    return mainHtml;
}

/**
 * 要素配列一行分をHTMLへ変換
 */
IndexController.prototype.toSidebarHtml = function(element) {
    var mark = element[IndexController.ELEMENT.MARK];
    var foldAreas = element[IndexController.ELEMENT.FOLD_AREA];
    var doneChildren = element[IndexController.ELEMENT.DONE_CHILDREN];
    var index = element[IndexController.ELEMENT.INDEX];

    if(foldAreas != null) { 
        var markIcon = 'glyphicon glyphicon-chevron-down';

        var htmlChar = '';
        htmlChar += '<div id="row-' + index + '" class="my_row toggle">';
        htmlChar += '  <span class="my-mark ' + markIcon + '"></span>';
        htmlChar += '  <input type="hidden" name="target-row" value="' + foldAreas.join(',') + '">';
        htmlChar += '</div>';

        return htmlChar;
    }

    if(mark == Enum.MARK.DONE && doneChildren != null) { 
        var markIcon = 'glyphicon glyphicon-chevron-down';

        var htmlChar = '';
        htmlChar += '<div id="row-' + index + '" class="my_row toggle">';
        htmlChar += '  <span class="my-mark ' + markIcon + '"></span>';
        htmlChar += '  <input type="hidden" name="target-row" value="' + doneChildren.join(',') + '">';
        htmlChar += '</div>';

        return htmlChar;
    }

    return '<div id="row-' + index + '" class="my_row none-selected"><span class="my-mark dummy glyphicon glyphicon-stop"></span></div>'; 
}

/**
 * メインHTML変換
 */
IndexController.prototype.constructMainHtml = function(elements) {
    var mainHtml = '';

    for(var key in elements){
        if(elements[key] != null){
            mainHtml += this.toMainHtml(elements[key]);
        }
    }

    return mainHtml;
}

/**
 * 要素配列一行分をHTMLへ変換
 */
IndexController.prototype.toMainHtml = function(element) {
    var htmlChar = '';

    var type = element[IndexController.ELEMENT.TYPE];

    if(type == IndexController.ELEMENT_TYPE.NORMAL) { 
        var indent = element[IndexController.ELEMENT.INDENT];
        var content = element[IndexController.ELEMENT.CONTENT];

        if(content == null){
            return this.createBlankHtml(element); 
        } else if(indent == 0){
            return this.createTitleHtml(element); 
        } else {
            return this.createNormalCharHtml(element); 
        }
    }

    if(type == IndexController.ELEMENT_TYPE.FOLD_AREA){
        return this.createFoldHtml(element); 
    }

    if(type == IndexController.ELEMENT_TYPE.MARK){
        var mark = element[IndexController.ELEMENT.MARK];
        if(mark == Enum.MARK.TASK) {
            return this.createTaskHtml(element);
        } else if(mark == Enum.MARK.DONE) {
            return this.createDoneHtml(element);
        } else if(mark == Enum.MARK.SUPPLEMENT) {
            return this.createSupplementHtml(element);
        } else if(mark == Enum.MARK.COMMENT) {
            return this.createCommentHtml(element);
        } else if(mark == Enum.MARK.CONCLUSION) {
            return this.createConclusionHtml(element);
        }
    }

}

/**
 * タイトルの要素を作成する
 */
IndexController.prototype.createTitleHtml = function(element) {
    var index = element[IndexController.ELEMENT.INDEX];
    var indent = element[IndexController.ELEMENT.INDENT];
    var content = element[IndexController.ELEMENT.CONTENT];

    var htmlChar = '';
    htmlChar += '<div id="row-' + index + '" class="my_row focusout">';
    htmlChar += ' <div class="my-title">';
    htmlChar += '  <div class="my-content char-font">' + content + '</div>';
    htmlChar += ' </div>';      
    htmlChar += '</div>';       

    return htmlChar;
}

/**
 * 通常文字の要素を作成する
 */
IndexController.prototype.createNormalCharHtml = function(element) {
    var index = element[IndexController.ELEMENT.INDEX];
    var indent = element[IndexController.ELEMENT.INDENT];
    var content = element[IndexController.ELEMENT.CONTENT];

    var htmlChar = '';
    htmlChar += '<div id="row-' + index + '" class="my_row focusout">';
    htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
    htmlChar += '  <div class="my-content char-font">' + content + '</div>';
    htmlChar += ' </div>';      
    htmlChar += '</div>';       

    return htmlChar;
}

/**
 * ブランクの要素を作成する
 */
IndexController.prototype.createBlankHtml = function(element) {
    var index = element[IndexController.ELEMENT.INDEX];

    var htmlChar = '';
    htmlChar += '<div id="row-' + index + '" class="my_row focusout">';
    htmlChar += ' <span class="my-mark"></span>';
    htmlChar += ' <div class="my-content char-font">&nbsp;</div>';
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
    htmlChar += '<div id="row-' + index + '" class="my_row ' + symbol + ' focusout">';
    htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
    htmlChar += '  <span class="my-mark ' + markIcon + '" onclick="indexController.checkeTask(' + index + ');"></span>';
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
    htmlChar += '<div id="row-' + index + '" class="my_row ' + symbol + ' focusout">';
    htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
    htmlChar += '  <span class="my-mark ' + markIcon + '" onclick="indexController.unCheckeTask(' + index + ');"></span>';
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
    htmlChar += '<div id="row-' + index + '" class="my_row ' + symbol + ' focusout">';
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
    htmlChar += '<div id="row-' + index + '" class="my_row ' + symbol + ' focusout">';
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
    htmlChar += '<div id="row-' + index + '" class="my_row ' + symbol + ' focusout">';
    htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
    htmlChar += '  <span class="my-mark ' + markIcon + '"></span>';
    htmlChar += '  <div class="my-content char-font">' + content + '</div>';
    htmlChar += ' </div>';      
    htmlChar += '</div>';       

    return htmlChar;
}

/**
 * 折りたたみの要素を作成する
 */
IndexController.prototype.createFoldHtml = function(element) {
    var index = element[IndexController.ELEMENT.INDEX];
    var indent = element[IndexController.ELEMENT.INDENT];
    var content = element[IndexController.ELEMENT.CONTENT] != null ? element[IndexController.ELEMENT.CONTENT] : '';

    var htmlChar = '';

    htmlChar += '<div id="row-' + index + '" class="my_row focusout">';
    htmlChar += ' <div class="my-indent" style="margin-left:' + indent + 'em;">';
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
    var rowNumber = 0;
    var elements = [];
    var doneIndent = null;
    var doneChildren = null;
    var foldIndent = null;
    var foldAreas = null;
    var variables = store.get(Enum.STOREKEY.VARIABLES);
    contents.forEach(function(content){
        var element = controller.toElement(content, variables);

        element[IndexController.ELEMENT.INDEX] = i;

        if(doneChildren != null) {
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

        if(foldAreas != null){
            if(element[IndexController.ELEMENT.TYPE] === IndexController.ELEMENT_TYPE.FOLD_AREA){ // 折りたたみエリアの終了
                var parentDoneElement = elements[foldIndent];
                parentDoneElement[IndexController.ELEMENT.FOLD_AREA] = foldAreas;
                elements[foldIndent] = parentDoneElement;

                foldIndent = null;
                foldAreas = null;

                // 空行を設定
                elements.push(null);
                i++;

                return true;
            } else {
                foldAreas.push(i);

                element[IndexController.ELEMENT.TYPE] = IndexController.ELEMENT_TYPE.FOLD_AREA;
                element[IndexController.ELEMENT.CONTENT] = element[IndexController.ELEMENT.RAW_CONTENT];
                element[IndexController.ELEMENT.INDENT] = elements[foldIndent][IndexController.ELEMENT.INDENT]; // 親のインデントに合わせる
            }
        }

        // 済マーク以下のインデントのマークが「補足、注釈」があった場合は折り畳みため関連する段落を保持する。
        if(element[IndexController.ELEMENT.MARK] === Enum.MARK.DONE){
            doneChildren = [];
            doneIndent = i;
        }

        // 折りたたみエリアの開始
        if(foldAreas == null && element[IndexController.ELEMENT.TYPE] === IndexController.ELEMENT_TYPE.FOLD_AREA){
            foldAreas = [];
            foldIndent = i - 1;

            // 空行を設定
            elements.push(null);
            i++;

            return true;
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
IndexController.prototype.toElement = function(content, variables) {
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
    if(temp != null){
        element[IndexController.ELEMENT.TYPE] = IndexController.ELEMENT_TYPE.MARK;
        element[IndexController.ELEMENT.MARK] = temp[0];
    } else {
        element[IndexController.ELEMENT.MARK] = null;
    }

    //特殊記号
    regexp = new RegExp('^[' + Enum.SPECIAL_MARK.FOLD_AREA + ']', 'g');
    temp = content.replace(new RegExp('^' + Enum.CONFIG.INDENT_MARK + '+', 'g'), '').match(regexp);
    if(temp != null){
        element[IndexController.ELEMENT.TYPE] = IndexController.ELEMENT_TYPE.FOLD_AREA;
        element[IndexController.ELEMENT.MARK] = temp[0];
    }

    // ノーマル文
    if(element[IndexController.ELEMENT.TYPE] == null){
        element[IndexController.ELEMENT.TYPE] = IndexController.ELEMENT_TYPE.NORMAL;
    }

    //インデント(全角半角)
    regexp = new RegExp('^' + Enum.CONFIG.INDENT_MARK + '+', 'g');
    temp = content.match(regexp);
    element[IndexController.ELEMENT.INDENT] = temp != null ? temp[0].length : 0;

    //記載内容
    element[IndexController.ELEMENT.CONTENT] = function(content){
        regexp = new RegExp('(?!\\s+).+$', 'g');
        var temp = content.match(regexp);

        if(temp == null) return null;

        // FIXME: 空白と記号は含めないようにする正規表現を完成させる
        // '(?!\\s+)(?![' + marks + ']).+$'
        regexp = new RegExp('^[' + marks + ']', 'g');
        temp = temp[0].replace(regexp, '');
        regexp = new RegExp('^[' + Enum.SPECIAL_MARK.FOLD_AREA + ']', 'g');
        temp = temp.replace(regexp, '');

        regexp = new RegExp('｛.+?｝', 'g');
        // 変数があるか確認
        var valiableNames = temp.match(regexp);
        if(valiableNames != null) {
            // 変数の展開
            temp = function(content){
                $(valiableNames).each(function(i, valiableName) {
                    $(variables).each(function(i, variable) {
                        var value = variable['variable-name'] == valiableName.replace(/[｛｝]/g, '') ? variable['variable-value'] : null;
                        if(value == null) { return true; }
                        content = content.replace(valiableName, value);
                    });
                });
                return content;
            }(temp);
        }

        /**
         * 特別指定のURLをアンカーに変換する
         */
        temp = function(content) {
            var regexp_url = /「(.+)」（((?:h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',*!]+))）/g;
            var regexp_makeLink = function(all, text, url, href) {
                return '<a href="h' + href + '" target="_blank">' + text + '</a>';
            }

            return content.replace(regexp_url, regexp_makeLink);
        }(temp);

        /**
         * 通常のURLをアンカーに変換する
         */
        temp = function(content) {
            var regexp_url = /\s+((?:h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',*!]+))/g;
            var regexp_makeLink = function(all, url, href) {
                return '<a href="h' + href + '" target="_blank">' + url + '</a>';
            }

            return content.replace(regexp_url, regexp_makeLink);
        }(temp);

        return temp;
    }(content);

    //生の記載内容
    element[IndexController.ELEMENT.RAW_CONTENT] = content;

    return element;
}