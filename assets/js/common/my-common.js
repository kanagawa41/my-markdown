/**
 * 共通処理群。
 */
var myCommon = {
    /**
     * GETパラメータを配列にセットして返却する。
     */
    getParams: function (){
        var url   = location.href;
        parameters    = url.split("?");
        if(parameters.length < 2) { return []};

        params   = parameters[1].split("&");
        var paramsArray = [];
        for ( i = 0; i < params.length; i++ ) {
            neet = params[i].split("=");
            paramsArray.push(neet[0]);
            paramsArray[neet[0]] = neet[1];
        }
        return paramsArray;
    },

    /**
     * 文字列からDateオブジェクトに変換する。
     * ・日付の区切り文字の置換
     * ・時間補正を行っている
     */
    parseSaftyDate: function (dateStr){
        // 置換をしているのはChromeとsafari対策
        var time = Date.parse(dateStr.replace(/-/g,"/"));
        
        var date = new Date();
        //ミリ秒から日付を求める
        date.setTime(time);
        //UTC基準のため
        date.setHours(date.getHours());
        
        return date;
    },


    /**
     * 日付を指定のフォーマットに変換する。
     * 2016/01/01 (月)
     * ※曜日はフラグで出力変更可能
     */
    formatDate: function (date, daysFLag){
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      var d = date.getDate();
      var w = date.getDay();

      var wNames = ['日', '月', '火', '水', '木', '金', '土'];

      var result = y + '/' + myCommon.zerofill(m) + '/' + myCommon.zerofill(d);

      if(daysFLag){
        result += ' (' + wNames[date.getDay()] + ')';
      }

      return result;
    },

    /**
     * 時間を指定のフォーマットに変換する。
     * 01:01
     */
    formatTime: function (date){
      var h = date.getHours();
      var m = date.getMinutes();

      return myCommon.zerofill(h) + ':' + myCommon.zerofill(m);
    },
    
    /**
     * FIXME ツイッターの時間を確認し、もっとバリエーションを増やす。
     * Twitter風な時間表示を行う。
     */
    parseTwitterDate: function (dispDate) {
        var today = new Date();

        if(dispDate.getYear() != today.getYear()){ // 年が違った場合
            return myCommon.zerofill(dispDate.getMonth()) + '/' + myCommon.zerofill(dispDate.getDate());
        }

        //年内

        if(dispDate.getDay() == today.getDay()){ // 本日の場合
            return myCommon.formatTime(dispDate);
        }

        var yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        if(dispDate.getDay() == yesterday.getDay()){ // 昨日の場合
            return '昨日 ' + myCommon.formatTime(dispDate);
        }
        
        if(dispDate.getDate() != today.getDate()) { // 日付が違った場合
            return myCommon.zerofill(dispDate.getMonth()) + '/' + myCommon.zerofill(dispDate.getDate()) + ' ' + myCommon.formatTime(dispDate);
        }
        
        return null;
    },
    
    /**
     * フルパスのファイル名にサフィックスを付加する
     * 変更前：http://localhost/chat/assets/image/user_image/HxiQ1VdADT0mztp/nlZuAcjzgG/20170429032517.jpg
     * 変更後：http://localhost/chat/assets/image/user_image/HxiQ1VdADT0mztp/nlZuAcjzgG/20170429032517_thumbnail.jpg
     */
    addSuffixOfFileName: function (url, suffixChar) {
      var folderPath = url.split("/").reverse().slice(1).reverse().join("/");

      // 拡張子付きで
      var fileName = url.match(".+/(.+?)([\?#;].*)?$")[1];
      // 拡張子無しで
      var fileNameOnly = url.match(".+/(.+?)\.[a-z]+([\?#;].*)?$")[1];

      var fileInfo = fileName.split('.');
      var fileExtension = fileInfo[fileInfo.length-1];

      return folderPath + '/' + fileNameOnly + suffixChar + '.' + fileExtension;
    },
    
    /**
     * 時間が一桁の場合は先頭にゼロを付与する。
     */
    zerofill: function (value) {
        if(value < 10) {
            value = "0" + value;
        }
        return value;
    },
    
    /**
     * 文字列に対して、httpなどで始まる部分を抽出し、Aタグを張る。
     * https://www.bhnt.co.jp/blog/%E9%96%8B%E7%99%BA%E8%A8%80%E8%AA%9E/javascript/javascript-%E6%96%87%E5%AD%97%E5%88%97%E3%81%8B%E3%82%89url%E3%82%92%E6%8A%BD%E5%87%BA%E3%81%97a%E3%82%BF%E3%82%B0%E3%82%92%E5%BC%B5%E3%82%8B%E9%96%A2%E6%95%B0%E3%80%82/
     */
    autoLink: function (str) {
        var regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
        var regexp_makeLink = function(all, url, h, href) {
            return '<a href="h' + href + '">' + url + '</a>';
        }

        return str.replace(regexp_url, regexp_makeLink);
    },

    /**
     * PHPではhtmlspecialchars()というメソッドでタグなどをエスケープしてタグを無効化できます。
     * http://senoway.hatenablog.com/entry/2013/05/31/235051
     */
    htmlspecialchars: function (ch) {
        ch = ch.replace(/&/g,"&amp;") ;
        ch = ch.replace(/"/g,"&quot;") ;
        ch = ch.replace(/'/g,"&#039;") ;
        ch = ch.replace(/</g,"&lt;") ;
        ch = ch.replace(/>/g,"&gt;") ;
        return ch ;
    },
    
    /**
     * メッセージを表示用に置換する。
     */
    toDisplayMessage: function (message){
        if(!message){ return; }
        message = myCommon.htmlspecialchars(message);
        message = myCommon.autoLink(message);
        message = message.replace(/\n/g, '<br>');

        return message;
    },


    /**
     * リサイズ処理
     * http://www.bokukoko.info/entry/2016/03/28/JavaScript_%E3%81%A7%E7%94%BB%E5%83%8F%E3%82%92%E3%83%AA%E3%82%B5%E3%82%A4%E3%82%BA%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95
     */
    resizeImage: function(base64image, callback) {
        const MIN_SIZE = 1000;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var image = new Image();
        image.crossOrigin = "Anonymous";

        image.onload = function(event){
            // 縦横のどちらかが規定を超えていたらリサイズ。
            if(this.width > MIN_SIZE || this.height > MIN_SIZE){
                var dstWidth, dstHeight;
                if (this.width > this.height) {
                    dstWidth = MIN_SIZE;
                    dstHeight = this.height * MIN_SIZE / this.width;
                } else {
                    dstHeight = MIN_SIZE;
                    dstWidth = this.width * MIN_SIZE / this.height;
                }

            }　else {
                dstWidth = this.width;
                dstHeight = this.height;
            }
            canvas.width = dstWidth;
            canvas.height = dstHeight;
            ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, dstWidth, dstHeight);
            // 圧縮
            callback(canvas.toDataURL("image/jpeg", 0.8));
        };
        image.src = base64image;
    },

    /**
     * URLから送信できるファイルに変換する。
     * 参考)http://stackoverflow.com/questions/6850276/how-to-convert-dataurl-to-file-object-in-javascript
     */
    dataURItoBlob: function(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        var blob = null;
        if(window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder){
          var bb = new (window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder)();
          bb.append(ab);
          blob = bb.getBlob(mimeString);
        } else {
          blob = new Blob([ab], { type: mimeString });
        }

        return blob;
    },

    /**
     * 拡張子なしのファイル名を取得する。
     */
    fileNameOnly: function (fileName){
        var reg=/(.*)(?:\.([^.]+$))/;

        return fileName.match(reg)[1];//demon_uploader
        // console.log(fileName.match(reg)[2]);//jpg
    },

    /**
     * 指定数で文字を切り抜き、指定の文字を付与する
     */
    chop: function(targetString, strLength, char){
        return targetString.length > strLength ? targetString.substring(0, strLength) + char : targetString;
    },
}