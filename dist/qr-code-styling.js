(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["QRCodeStyling"] = factory();
	else
		root["QRCodeStyling"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/qrcode-generator/qrcode.js":
/*!*************************************************!*\
  !*** ./node_modules/qrcode-generator/qrcode.js ***!
  \*************************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (true) {
      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(function () {
    return qrcode;
}));


/***/ }),

/***/ "./src/constants/cornerDotTypes.ts":
/*!*****************************************!*\
  !*** ./src/constants/cornerDotTypes.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dot: "dot",
    square: "square"
});


/***/ }),

/***/ "./src/constants/cornerSquareTypes.ts":
/*!********************************************!*\
  !*** ./src/constants/cornerSquareTypes.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dot: "dot",
    square: "square",
    extraRounded: "extra-rounded"
});


/***/ }),

/***/ "./src/constants/dotTypes.ts":
/*!***********************************!*\
  !*** ./src/constants/dotTypes.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dots: "dots",
    rounded: "rounded",
    classy: "classy",
    classyRounded: "classy-rounded",
    square: "square",
    extraRounded: "extra-rounded"
});


/***/ }),

/***/ "./src/constants/drawTypes.ts":
/*!************************************!*\
  !*** ./src/constants/drawTypes.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    canvas: "canvas",
    svg: "svg"
});


/***/ }),

/***/ "./src/constants/errorCorrectionLevels.ts":
/*!************************************************!*\
  !*** ./src/constants/errorCorrectionLevels.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    L: "L",
    M: "M",
    Q: "Q",
    H: "H"
});


/***/ }),

/***/ "./src/constants/errorCorrectionPercents.ts":
/*!**************************************************!*\
  !*** ./src/constants/errorCorrectionPercents.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    L: 0.07,
    M: 0.15,
    Q: 0.25,
    H: 0.3
});


/***/ }),

/***/ "./src/constants/gradientTypes.ts":
/*!****************************************!*\
  !*** ./src/constants/gradientTypes.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    radial: "radial",
    linear: "linear"
});


/***/ }),

/***/ "./src/constants/modes.ts":
/*!********************************!*\
  !*** ./src/constants/modes.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    numeric: "Numeric",
    alphanumeric: "Alphanumeric",
    byte: "Byte",
    kanji: "Kanji"
});


/***/ }),

/***/ "./src/constants/qrTypes.ts":
/*!**********************************!*\
  !*** ./src/constants/qrTypes.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const qrTypes = {};
for (let type = 0; type <= 40; type++) {
    qrTypes[type] = type;
}
// 0 types is autodetect
// types = {
//     0: 0,
//     1: 1,
//     ...
//     40: 40
// }
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (qrTypes);


/***/ }),

/***/ "./src/constants/shapeTypes.ts":
/*!*************************************!*\
  !*** ./src/constants/shapeTypes.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    square: "square",
    circle: "circle"
});


/***/ }),

/***/ "./src/core/QRCodeStyling.ts":
/*!***********************************!*\
  !*** ./src/core/QRCodeStyling.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ QRCodeStyling)
/* harmony export */ });
/* harmony import */ var _tools_getMode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/getMode */ "./src/tools/getMode.ts");
/* harmony import */ var _tools_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tools/merge */ "./src/tools/merge.ts");
/* harmony import */ var _tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../tools/downloadURI */ "./src/tools/downloadURI.ts");
/* harmony import */ var _QRSVG__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./QRSVG */ "./src/core/QRSVG.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _QROptions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./QROptions */ "./src/core/QROptions.ts");
/* harmony import */ var _tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../tools/sanitizeOptions */ "./src/tools/sanitizeOptions.ts");
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! qrcode-generator */ "./node_modules/qrcode-generator/qrcode.js");
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(qrcode_generator__WEBPACK_IMPORTED_MODULE_7__);








class QRCodeStyling {
    _options;
    _container;
    _canvas;
    _svg;
    _qr;
    _extension;
    _canvasDrawingPromise;
    _svgDrawingPromise;
    constructor(options) {
        this._options = options ? (0,_tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_tools_merge__WEBPACK_IMPORTED_MODULE_1__["default"])(_QROptions__WEBPACK_IMPORTED_MODULE_5__["default"], options)) : _QROptions__WEBPACK_IMPORTED_MODULE_5__["default"];
        this.update();
    }
    static _clearContainer(container) {
        if (container) {
            container.innerHTML = "";
        }
    }
    _setupSvg() {
        if (!this._qr) {
            return;
        }
        const qrSVG = new _QRSVG__WEBPACK_IMPORTED_MODULE_3__["default"](this._options);
        this._svg = qrSVG.getElement();
        this._svgDrawingPromise = qrSVG.drawQR(this._qr).then(() => {
            if (!this._svg)
                return;
            this._extension?.(qrSVG.getElement(), this._options);
        });
    }
    _setupCanvas() {
        if (!this._qr) {
            return;
        }
        this._canvas = document.createElement("canvas");
        this._canvas.width = this._options.width;
        this._canvas.height = this._options.height;
        this._setupSvg();
        this._canvasDrawingPromise = this._svgDrawingPromise?.then(() => {
            if (!this._svg)
                return;
            const svg = this._svg;
            const xml = new XMLSerializer().serializeToString(svg);
            const svg64 = btoa(xml);
            const image64 = "data:image/svg+xml;base64," + svg64;
            const image = new Image();
            return new Promise((resolve) => {
                image.onload = () => {
                    this._canvas?.getContext("2d")?.drawImage(image, 0, 0);
                    resolve();
                };
                image.src = image64;
            });
        });
    }
    async _getElement(extension = "png") {
        if (!this._qr)
            throw "QR code is empty";
        if (extension.toLowerCase() === "svg") {
            if (!this._svg || !this._svgDrawingPromise) {
                this._setupSvg();
            }
            await this._svgDrawingPromise;
            return this._svg;
        }
        else {
            if (!this._canvas || !this._canvasDrawingPromise) {
                this._setupCanvas();
            }
            await this._canvasDrawingPromise;
            return this._canvas;
        }
    }
    update(options) {
        QRCodeStyling._clearContainer(this._container);
        this._options = options ? (0,_tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_tools_merge__WEBPACK_IMPORTED_MODULE_1__["default"])(this._options, options)) : this._options;
        if (!this._options.data) {
            return;
        }
        this._qr = qrcode_generator__WEBPACK_IMPORTED_MODULE_7___default()(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
        this._qr.addData(this._options.data, this._options.qrOptions.mode || (0,_tools_getMode__WEBPACK_IMPORTED_MODULE_0__["default"])(this._options.data));
        this._qr.make();
        if (this._options.type === _constants_drawTypes__WEBPACK_IMPORTED_MODULE_4__["default"].canvas) {
            this._setupCanvas();
        }
        else {
            this._setupSvg();
        }
        this.append(this._container);
    }
    append(container) {
        if (!container) {
            return;
        }
        if (typeof container.appendChild !== "function") {
            throw "Container should be a single DOM node";
        }
        if (this._options.type === _constants_drawTypes__WEBPACK_IMPORTED_MODULE_4__["default"].canvas) {
            if (this._canvas) {
                container.appendChild(this._canvas);
            }
        }
        else {
            if (this._svg) {
                container.appendChild(this._svg);
            }
        }
        this._container = container;
    }
    applyExtension(extension) {
        if (!extension) {
            throw "Extension function should be defined.";
        }
        this._extension = extension;
        this.update();
    }
    deleteExtension() {
        this._extension = undefined;
        this.update();
    }
    async getRawData(extension = "png") {
        if (!this._qr)
            throw "QR code is empty";
        const element = await this._getElement(extension);
        if (!element) {
            return null;
        }
        if (extension.toLowerCase() === "svg") {
            const serializer = new XMLSerializer();
            const source = serializer.serializeToString(element);
            return new Blob(['<?xml version="1.0" standalone="no"?>\r\n' + source], { type: "image/svg+xml" });
        }
        else {
            return new Promise((resolve) => element.toBlob(resolve, `image/${extension}`, 1));
        }
    }
    async download(downloadOptions) {
        if (!this._qr)
            throw "QR code is empty";
        let extension = "png";
        let name = "qr";
        //TODO remove deprecated code in the v2
        if (typeof downloadOptions === "string") {
            extension = downloadOptions;
            console.warn("Extension is deprecated as argument for 'download' method, please pass object { name: '...', extension: '...' } as argument");
        }
        else if (typeof downloadOptions === "object" && downloadOptions !== null) {
            if (downloadOptions.name) {
                name = downloadOptions.name;
            }
            if (downloadOptions.extension) {
                extension = downloadOptions.extension;
            }
        }
        const element = await this._getElement(extension);
        if (!element) {
            return;
        }
        if (extension.toLowerCase() === "svg") {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(element);
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
            const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            (0,_tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__["default"])(url, `${name}.svg`);
        }
        else {
            const url = element.toDataURL(`image/${extension}`);
            (0,_tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__["default"])(url, `${name}.${extension}`);
        }
    }
}


/***/ }),

/***/ "./src/core/QROptions.ts":
/*!*******************************!*\
  !*** ./src/core/QROptions.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_qrTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/qrTypes */ "./src/constants/qrTypes.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/shapeTypes */ "./src/constants/shapeTypes.ts");
/* harmony import */ var _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants/errorCorrectionLevels */ "./src/constants/errorCorrectionLevels.ts");




const defaultOptions = {
    type: _constants_drawTypes__WEBPACK_IMPORTED_MODULE_1__["default"].canvas,
    shape: _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_2__["default"].square,
    width: 300,
    height: 300,
    data: "",
    margin: 0,
    qrOptions: {
        typeNumber: _constants_qrTypes__WEBPACK_IMPORTED_MODULE_0__["default"][0],
        mode: undefined,
        errorCorrectionLevel: _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_3__["default"].Q
    },
    imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        crossOrigin: undefined,
        margin: 0
    },
    dotsOptions: {
        type: "square",
        color: "#000"
    },
    backgroundOptions: {
        round: 0,
        color: "#fff"
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (defaultOptions);


/***/ }),

/***/ "./src/core/QRSVG.ts":
/*!***************************!*\
  !*** ./src/core/QRSVG.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ QRSVG)
/* harmony export */ });
/* harmony import */ var _tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/calculateImageSize */ "./src/tools/calculateImageSize.ts");
/* harmony import */ var _tools_toDataUrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tools/toDataUrl */ "./src/tools/toDataUrl.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _figures_dot_QRDot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../figures/dot/QRDot */ "./src/figures/dot/QRDot.ts");
/* harmony import */ var _figures_cornerSquare_QRCornerSquare__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../figures/cornerSquare/QRCornerSquare */ "./src/figures/cornerSquare/QRCornerSquare.ts");
/* harmony import */ var _figures_cornerDot_QRCornerDot__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../figures/cornerDot/QRCornerDot */ "./src/figures/cornerDot/QRCornerDot.ts");
/* harmony import */ var _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants/gradientTypes */ "./src/constants/gradientTypes.ts");
/* harmony import */ var _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../constants/shapeTypes */ "./src/constants/shapeTypes.ts");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");









const squareMask = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
];
const dotMask = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
];
class QRSVG {
    _element;
    _defs;
    _backgroundClipPath;
    _dotsClipPath;
    _cornersSquareClipPath;
    _cornersDotClipPath;
    _options;
    _qr;
    _image;
    //TODO don't pass all options to this class
    constructor(options) {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])());
        this._element.setAttribute("width", String(options.width));
        this._element.setAttribute("height", String(options.height));
        if (options.shapeRendering) {
            this._element.setAttribute("shape-rendering", options.shapeRendering);
        }
        this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this._defs.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])());
        this._element.appendChild(this._defs);
        this._options = options;
    }
    get width() {
        return this._options.width;
    }
    get height() {
        return this._options.height;
    }
    getElement() {
        return this._element;
    }
    async drawQR(qr) {
        const count = qr.getModuleCount();
        const minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2;
        const realQRSize = this._options.shape === _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__["default"].circle ? minSize / Math.sqrt(2) : minSize;
        const dotSize = Math.floor(realQRSize / count);
        const { imageOptions, qrOptions } = this._options;
        const isCircleShape = imageOptions.shape === "circle";
        // Stays 0 if `isCircleShape` is false
        // Value is a radius/dotSize
        let circleRadiusSquared = 0;
        let drawImageSize = {
            hideXDots: 0,
            hideYDots: 0,
            width: 0,
            height: 0
        };
        const imageCenterX = count / 2;
        const imageCenterY = count / 2;
        // A rectangle where we consider hiding QR code dots.
        // Used only if there's an image and it succesfully loaded.
        // Each coordinate is not a pixel value but an x,y of a QR code dot.
        // e.g. a 500x500 QR code may have 36x36 number of dots,
        // `xStart` and `yStart` could be set to 18 and `xEnd`, `yEnd` to 21 (in case of small image).
        let qrCodeFreeRectangle = {
            xStart: 0,
            yStart: 0,
            xEnd: 0,
            yEnd: 0
        };
        this._qr = qr;
        if (this._options.image) {
            //We need it to get image size
            await this.loadImage();
            if (!this._image)
                return;
            const coverLevel = imageOptions.imageSize * _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_2__["default"][qrOptions.errorCorrectionLevel];
            let maxHiddenDots = 0;
            let imageWidth = this._image.width;
            let imageHeight = this._image.height;
            const maxSize = Math.max(this._image.width, this._image.height);
            if (isCircleShape) {
                imageWidth = maxSize;
                imageHeight = maxSize;
            }
            maxHiddenDots =
                imageHeight === imageWidth
                    ? Math.floor(coverLevel * count * count)
                    : (maxSize - Math.min(this._image.width, this._image.height)) / 2;
            drawImageSize = (0,_tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__["default"])({
                originalWidth: imageWidth,
                originalHeight: imageHeight,
                maxHiddenDots,
                maxHiddenAxisDots: count - 14,
                dotSize
            });
            if (isCircleShape) {
                circleRadiusSquared = Math.pow(drawImageSize.height / dotSize / 2, 2);
            }
            qrCodeFreeRectangle = {
                xStart: (count - drawImageSize.hideXDots) / 2,
                yStart: (count - drawImageSize.hideYDots) / 2,
                xEnd: (count + drawImageSize.hideXDots) / 2,
                yEnd: (count + drawImageSize.hideYDots) / 2
            };
        }
        this.drawBackground();
        this.drawDots((x, y) => {
            if (this._image && this._options.imageOptions.hideBackgroundDots) {
                if (x >= qrCodeFreeRectangle.xStart &&
                    x < qrCodeFreeRectangle.xEnd &&
                    y >= qrCodeFreeRectangle.yStart &&
                    y < qrCodeFreeRectangle.yEnd) {
                    if (isCircleShape) {
                        return !(Math.pow(x - imageCenterX, 2) + Math.pow(y - imageCenterY, 2) <= circleRadiusSquared);
                    }
                    return false;
                }
            }
            if (squareMask[x]?.[y] || squareMask[x - count + 7]?.[y] || squareMask[x]?.[y - count + 7]) {
                return false;
            }
            if (dotMask[x]?.[y] || dotMask[x - count + 7]?.[y] || dotMask[x]?.[y - count + 7]) {
                return false;
            }
            return true;
        });
        this.drawCorners();
        if (this._options.image && this._image) {
            await this.drawImage({ originalImage: this._image, width: drawImageSize.width, height: drawImageSize.height });
        }
    }
    drawBackground() {
        const element = this._element;
        const options = this._options;
        if (element) {
            const gradientOptions = options.backgroundOptions?.gradient;
            const color = options.backgroundOptions?.color;
            if (gradientOptions || color) {
                this._createColor({
                    options: gradientOptions,
                    color: color,
                    additionalRotation: 0,
                    x: 0,
                    y: 0,
                    height: options.height,
                    width: options.width,
                    id: "background-color"
                });
            }
            if (options.backgroundOptions?.round) {
                const size = Math.min(options.width, options.height);
                const element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                this._backgroundClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                this._backgroundClipPath.setAttribute("id", "clip-path-background-color");
                this._defs.appendChild(this._backgroundClipPath);
                element.setAttribute("x", String((options.width - size) / 2));
                element.setAttribute("y", String((options.height - size) / 2));
                element.setAttribute("width", String(size));
                element.setAttribute("height", String(size));
                element.setAttribute("rx", String((size / 2) * options.backgroundOptions.round));
                this._backgroundClipPath.appendChild(element);
            }
        }
    }
    drawDots(filter) {
        if (!this._qr) {
            throw "QR code is not defined";
        }
        const options = this._options;
        const count = this._qr.getModuleCount();
        if (count > options.width || count > options.height) {
            throw "The canvas is too small.";
        }
        const minSize = Math.min(options.width, options.height) - options.margin * 2;
        const realQRSize = options.shape === _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__["default"].circle ? minSize / Math.sqrt(2) : minSize;
        const dotSize = Math.floor(realQRSize / count);
        const xBeginning = Math.floor((options.width - count * dotSize) / 2);
        const yBeginning = Math.floor((options.height - count * dotSize) / 2);
        const dot = new _figures_dot_QRDot__WEBPACK_IMPORTED_MODULE_3__["default"]({ svg: this._element, type: options.dotsOptions.type });
        this._dotsClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        const id = (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])();
        this._dotsClipPath.setAttribute("id", id);
        this._defs.appendChild(this._dotsClipPath);
        this._createColor({
            options: options.dotsOptions?.gradient,
            color: options.dotsOptions.color,
            additionalRotation: 0,
            x: 0,
            y: 0,
            height: options.height,
            width: options.width,
            id: id
        });
        for (let x = 0; x < count; x++) {
            for (let y = 0; y < count; y++) {
                if (filter && !filter(x, y)) {
                    continue;
                }
                if (!this._qr?.isDark(x, y)) {
                    continue;
                }
                dot.draw(xBeginning + x * dotSize, yBeginning + y * dotSize, dotSize, (xOffset, yOffset) => {
                    if (x + xOffset < 0 || y + yOffset < 0 || x + xOffset >= count || y + yOffset >= count)
                        return false;
                    if (filter && !filter(x + xOffset, y + yOffset))
                        return false;
                    return !!this._qr && this._qr.isDark(x + xOffset, y + yOffset);
                });
                if (dot._element && this._dotsClipPath) {
                    this._dotsClipPath.appendChild(dot._element);
                }
            }
        }
        if (options.shape === _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__["default"].circle) {
            const additionalDots = Math.floor((minSize / dotSize - count) / 2);
            const fakeCount = count + additionalDots * 2;
            const xFakeBeginning = xBeginning - additionalDots * dotSize;
            const yFakeBeginning = yBeginning - additionalDots * dotSize;
            const fakeMatrix = [];
            const center = Math.floor(fakeCount / 2);
            for (let i = 0; i < fakeCount; i++) {
                fakeMatrix[i] = [];
                for (let j = 0; j < fakeCount; j++) {
                    if (i >= additionalDots - 1 &&
                        i <= fakeCount - additionalDots &&
                        j >= additionalDots - 1 &&
                        j <= fakeCount - additionalDots) {
                        fakeMatrix[i][j] = 0;
                        continue;
                    }
                    if (Math.sqrt((i - center) * (i - center) + (j - center) * (j - center)) > center) {
                        fakeMatrix[i][j] = 0;
                        continue;
                    }
                    //Get random dots from QR code to show it outside of QR code
                    fakeMatrix[i][j] = this._qr.isDark(j - 2 * additionalDots < 0 ? j : j >= count ? j - 2 * additionalDots : j - additionalDots, i - 2 * additionalDots < 0 ? i : i >= count ? i - 2 * additionalDots : i - additionalDots)
                        ? 1
                        : 0;
                }
            }
            for (let i = 0; i < fakeCount; i++) {
                for (let j = 0; j < fakeCount; j++) {
                    if (!fakeMatrix[i][j])
                        continue;
                    dot.draw(xFakeBeginning + i * dotSize, yFakeBeginning + j * dotSize, dotSize, (xOffset, yOffset) => {
                        return !!fakeMatrix[i + xOffset]?.[j + yOffset];
                    });
                    if (dot._element && this._dotsClipPath) {
                        this._dotsClipPath.appendChild(dot._element);
                    }
                }
            }
        }
    }
    drawCorners() {
        if (!this._qr) {
            throw "QR code is not defined";
        }
        const element = this._element;
        const options = this._options;
        if (!element) {
            throw "Element code is not defined";
        }
        const count = this._qr.getModuleCount();
        const minSize = Math.min(options.width, options.height) - options.margin * 2;
        const realQRSize = options.shape === _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_7__["default"].circle ? minSize / Math.sqrt(2) : minSize;
        const dotSize = Math.floor(realQRSize / count);
        const cornersSquareSize = dotSize * 7;
        const cornersDotSize = dotSize * 3;
        const xBeginning = Math.floor((options.width - count * dotSize) / 2);
        const yBeginning = Math.floor((options.height - count * dotSize) / 2);
        [
            [0, 0, 0],
            [1, 0, Math.PI / 2],
            [0, 1, -Math.PI / 2]
        ].forEach(([column, row, rotation]) => {
            const x = xBeginning + column * dotSize * (count - 7);
            const y = yBeginning + row * dotSize * (count - 7);
            let cornersSquareClipPath = this._dotsClipPath;
            let cornersDotClipPath = this._dotsClipPath;
            if (options.cornersSquareOptions?.gradient || options.cornersSquareOptions?.color) {
                cornersSquareClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                const id = (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])();
                cornersSquareClipPath.setAttribute("id", id);
                this._defs.appendChild(cornersSquareClipPath);
                this._cornersSquareClipPath = this._cornersDotClipPath = cornersDotClipPath = cornersSquareClipPath;
                this._createColor({
                    options: options.cornersSquareOptions?.gradient,
                    color: options.cornersSquareOptions?.color,
                    additionalRotation: rotation,
                    x,
                    y,
                    height: cornersSquareSize,
                    width: cornersSquareSize,
                    id: id
                });
            }
            if (options.cornersSquareOptions?.type) {
                const cornersSquare = new _figures_cornerSquare_QRCornerSquare__WEBPACK_IMPORTED_MODULE_4__["default"]({ svg: this._element, type: options.cornersSquareOptions.type });
                cornersSquare.draw(x, y, cornersSquareSize, rotation);
                if (cornersSquare._element && cornersSquareClipPath) {
                    cornersSquareClipPath.appendChild(cornersSquare._element);
                }
            }
            else {
                const dot = new _figures_dot_QRDot__WEBPACK_IMPORTED_MODULE_3__["default"]({ svg: this._element, type: options.dotsOptions.type });
                for (let i = 0; i < squareMask.length; i++) {
                    for (let j = 0; j < squareMask[i].length; j++) {
                        if (!squareMask[i]?.[j]) {
                            continue;
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, (xOffset, yOffset) => !!squareMask[i + xOffset]?.[j + yOffset]);
                        if (dot._element && cornersSquareClipPath) {
                            cornersSquareClipPath.appendChild(dot._element);
                        }
                    }
                }
            }
            if (options.cornersDotOptions?.gradient || options.cornersDotOptions?.color) {
                cornersDotClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                const id = (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])();
                cornersDotClipPath.setAttribute("id", id);
                this._defs.appendChild(cornersDotClipPath);
                this._cornersDotClipPath = cornersDotClipPath;
                this._createColor({
                    options: options.cornersDotOptions?.gradient,
                    color: options.cornersDotOptions?.color,
                    additionalRotation: rotation,
                    x: x + dotSize * 2,
                    y: y + dotSize * 2,
                    height: cornersDotSize,
                    width: cornersDotSize,
                    id: id
                });
            }
            if (options.cornersDotOptions?.type) {
                const cornersDot = new _figures_cornerDot_QRCornerDot__WEBPACK_IMPORTED_MODULE_5__["default"]({ svg: this._element, type: options.cornersDotOptions.type });
                cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);
                if (cornersDot._element && cornersDotClipPath) {
                    cornersDotClipPath.appendChild(cornersDot._element);
                }
            }
            else {
                const dot = new _figures_dot_QRDot__WEBPACK_IMPORTED_MODULE_3__["default"]({ svg: this._element, type: options.dotsOptions.type });
                for (let i = 0; i < dotMask.length; i++) {
                    for (let j = 0; j < dotMask[i].length; j++) {
                        if (!dotMask[i]?.[j]) {
                            continue;
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, (xOffset, yOffset) => !!dotMask[i + xOffset]?.[j + yOffset]);
                        if (dot._element && cornersDotClipPath) {
                            cornersDotClipPath.appendChild(dot._element);
                        }
                    }
                }
            }
        });
    }
    loadImage() {
        return new Promise((resolve, reject) => {
            const options = this._options;
            const image = new Image();
            if (!options.image) {
                return reject("Image is not defined");
            }
            if (typeof options.imageOptions.crossOrigin === "string") {
                image.crossOrigin = options.imageOptions.crossOrigin;
            }
            this._image = image;
            image.onload = () => {
                resolve();
            };
            image.src = options.image;
        });
    }
    async drawImage({ originalImage, width, height }) {
        const options = this._options;
        const imageOptions = this._options.imageOptions;
        // Calculate the dimensions for the SVG element, accounting for margin and border width
        const borderWidth = imageOptions.borderWidth || 0; // Use 0 if borderWidth is not provided
        const totalMargin = 2 * imageOptions.margin;
        let imageWidth = width;
        let imageHeight = height;
        // Calculate the dimensions of the square (based on the greater of imageWidth or imageHeight)
        const squareSize = Math.max(imageWidth, imageHeight);
        let xImageOffset = 0;
        let yImageOffset = 0;
        const isCircleShape = imageOptions.shape === "circle";
        if (isCircleShape) {
            const aspectRatio = originalImage.width / originalImage.height;
            if (aspectRatio > 1) {
                imageHeight = squareSize;
                const _imageWidth = imageHeight * aspectRatio;
                xImageOffset = -(_imageWidth - imageWidth) / 2;
                imageWidth = _imageWidth;
            }
            else {
                imageWidth = squareSize;
                const _imageHeight = imageWidth / aspectRatio;
                yImageOffset = -(_imageHeight - imageHeight) / 2;
                imageHeight = _imageHeight;
            }
        }
        // Calculate the position of the SVG element
        const svgRootXPosition = Math.floor(Math.abs(options.width - imageWidth) / 2);
        const svgRootYPosition = Math.floor(Math.abs(options.height - imageHeight) / 2);
        // Calculate the center and radius of the image/circle based on the size
        const circleX = imageWidth / 2;
        const circleY = imageHeight / 2;
        const circleRadius = squareSize / 2 - borderWidth / 2;
        // Create an SVG element for the square
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])());
        svg.setAttribute("width", `${imageWidth}px`); // Set the SVG width to the square size
        svg.setAttribute("height", `${imageHeight}px`); // Set the SVG height to the square size
        svg.setAttribute("x", String(svgRootXPosition)); // Set X position
        svg.setAttribute("y", String(svgRootYPosition)); // Set Y position
        // Create an image element
        const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        const imageUrl = await (0,_tools_toDataUrl__WEBPACK_IMPORTED_MODULE_1__["default"])(options.image || "");
        image.setAttribute("href", imageUrl || "");
        image.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])());
        image.setAttribute("width", `${imageWidth}px`); // Set the image width to the square size
        image.setAttribute("height", `${imageHeight}px`); // Set the image height to the square size
        image.setAttribute("x", String(xImageOffset));
        image.setAttribute("y", String(yImageOffset));
        if (isCircleShape) {
            // Define a circular clip path
            const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
            const circleClipId = (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])();
            clipPath.setAttribute("id", circleClipId);
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])());
            circle.setAttribute("cx", String(circleX));
            circle.setAttribute("cy", String(circleY));
            circle.setAttribute("r", String(circleRadius - totalMargin / 2)); // Adjust for margin
            clipPath.appendChild(circle);
            image.setAttribute("clip-path", `url(#${circleClipId})`);
            // Append the elements to the SVG in the correct order
            svg.appendChild(clipPath);
        }
        svg.appendChild(image);
        if (borderWidth > 0) {
            let borderElement;
            if (isCircleShape) {
                borderElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                borderElement.setAttribute("cx", String(circleX));
                borderElement.setAttribute("cy", String(circleY));
                borderElement.setAttribute("r", String(circleRadius));
            }
            else {
                borderElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            }
            borderElement.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])());
            borderElement.setAttribute("width", `${imageWidth}px`); // Set the SVG width to the square size
            borderElement.setAttribute("height", `${imageHeight}px`); // Set the SVG height to the square size
            borderElement.setAttribute("stroke", imageOptions.borderColor || "black"); // Border color
            borderElement.setAttribute("stroke-width", String(borderWidth)); // Border width
            borderElement.setAttribute("fill", "none"); // Transparent fill
            svg.appendChild(borderElement); // Add the circular border after the image
        }
        // Append the SVG to the container
        this._element.appendChild(svg);
    }
    _createColor({ options, color, additionalRotation, x, y, height, width, id }) {
        const size = width > height ? width : height;
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(y));
        rect.setAttribute("height", String(height));
        rect.setAttribute("width", String(width));
        rect.setAttribute("clip-path", `url('#${id}')`);
        if (options) {
            let gradient;
            const gradientId = (0,uuid__WEBPACK_IMPORTED_MODULE_8__["default"])();
            if (options.type === _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_6__["default"].radial) {
                gradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
                gradient.setAttribute("id", gradientId);
                gradient.setAttribute("gradientUnits", "userSpaceOnUse");
                gradient.setAttribute("fx", String(x + width / 2));
                gradient.setAttribute("fy", String(y + height / 2));
                gradient.setAttribute("cx", String(x + width / 2));
                gradient.setAttribute("cy", String(y + height / 2));
                gradient.setAttribute("r", String(size / 2));
            }
            else {
                const rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
                const positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
                let x0 = x + width / 2;
                let y0 = y + height / 2;
                let x1 = x + width / 2;
                let y1 = y + height / 2;
                if ((positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
                    (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)) {
                    x0 = x0 - width / 2;
                    y0 = y0 - (height / 2) * Math.tan(rotation);
                    x1 = x1 + width / 2;
                    y1 = y1 + (height / 2) * Math.tan(rotation);
                }
                else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
                    y0 = y0 - height / 2;
                    x0 = x0 - width / 2 / Math.tan(rotation);
                    y1 = y1 + height / 2;
                    x1 = x1 + width / 2 / Math.tan(rotation);
                }
                else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
                    x0 = x0 + width / 2;
                    y0 = y0 + (height / 2) * Math.tan(rotation);
                    x1 = x1 - width / 2;
                    y1 = y1 - (height / 2) * Math.tan(rotation);
                }
                else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
                    y0 = y0 + height / 2;
                    x0 = x0 + width / 2 / Math.tan(rotation);
                    y1 = y1 - height / 2;
                    x1 = x1 - width / 2 / Math.tan(rotation);
                }
                gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
                gradient.setAttribute("gradientUnits", "userSpaceOnUse");
                gradient.setAttribute("x1", String(Math.round(x0)));
                gradient.setAttribute("y1", String(Math.round(y0)));
                gradient.setAttribute("x2", String(Math.round(x1)));
                gradient.setAttribute("y2", String(Math.round(y1)));
            }
            gradient.setAttribute("id", gradientId);
            options.colorStops.forEach(({ offset, color }) => {
                const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                stop.setAttribute("offset", `${100 * offset}%`);
                stop.setAttribute("stop-color", color);
                gradient.appendChild(stop);
            });
            rect.setAttribute("fill", `url('#${gradientId}')`);
            this._defs.appendChild(gradient);
        }
        else if (color) {
            rect.setAttribute("fill", color);
        }
        this._element.appendChild(rect);
    }
}


/***/ }),

/***/ "./src/figures/cornerDot/QRCornerDot.ts":
/*!**********************************************!*\
  !*** ./src/figures/cornerDot/QRCornerDot.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ QRCornerDot)
/* harmony export */ });
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");


class QRCornerDot {
    _element;
    _svg;
    _type;
    constructor({ svg, type }) {
        this._svg = svg;
        this._type = type;
    }
    draw(x, y, size, rotation) {
        const type = this._type;
        let drawFunction;
        switch (type) {
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x, y, size, rotation });
    }
    _rotateFigure({ x, y, size, rotation = 0, draw }) {
        const cx = x + size / 2;
        const cy = y + size / 2;
        draw();
        this._element?.setAttribute("transform", `rotate(${(180 * rotation) / Math.PI},${cx},${cy})`);
    }
    _basicDot(args) {
        const { size, x, y } = args;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("cx", String(x + size / 2));
                this._element.setAttribute("cy", String(y + size / 2));
                this._element.setAttribute("r", String(size / 2));
            }
        });
    }
    _basicSquare(args) {
        const { size, x, y } = args;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("x", String(x));
                this._element.setAttribute("y", String(y));
                this._element.setAttribute("width", String(size));
                this._element.setAttribute("height", String(size));
            }
        });
    }
    _drawDot({ x, y, size, rotation }) {
        this._basicDot({ x, y, size, rotation });
    }
    _drawSquare({ x, y, size, rotation }) {
        this._basicSquare({ x, y, size, rotation });
    }
}


/***/ }),

/***/ "./src/figures/cornerSquare/QRCornerSquare.ts":
/*!****************************************************!*\
  !*** ./src/figures/cornerSquare/QRCornerSquare.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ QRCornerSquare)
/* harmony export */ });
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");


class QRCornerSquare {
    _element;
    _svg;
    _type;
    constructor({ svg, type }) {
        this._svg = svg;
        this._type = type;
    }
    draw(x, y, size, rotation) {
        const type = this._type;
        let drawFunction;
        switch (type) {
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x, y, size, rotation });
    }
    _rotateFigure({ x, y, size, rotation = 0, draw }) {
        const cx = x + size / 2;
        const cy = y + size / 2;
        draw();
        this._element?.setAttribute("transform", `rotate(${(180 * rotation) / Math.PI},${cx},${cy})`);
    }
    _basicDot(args) {
        const { size, x, y } = args;
        const dotSize = size / 7;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("clip-rule", "evenodd");
                this._element.setAttribute("d", `M ${x + size / 2} ${y}` + // M cx, y //  Move to top of ring
                    `a ${size / 2} ${size / 2} 0 1 0 0.1 0` + // a outerRadius, outerRadius, 0, 1, 0, 1, 0 // Draw outer arc, but don't close it
                    `z` + // Z // Close the outer shape
                    `m 0 ${dotSize}` + // m -1 outerRadius-innerRadius // Move to top point of inner radius
                    `a ${size / 2 - dotSize} ${size / 2 - dotSize} 0 1 1 -0.1 0` + // a innerRadius, innerRadius, 0, 1, 1, -1, 0 // Draw inner arc, but don't close it
                    `Z` // Z // Close the inner ring. Actually will still work without, but inner ring will have one unit missing in stroke
                );
            }
        });
    }
    _basicSquare(args) {
        const { size, x, y } = args;
        const dotSize = size / 7;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("clip-rule", "evenodd");
                this._element.setAttribute("d", `M ${x} ${y}` +
                    `v ${size}` +
                    `h ${size}` +
                    `v ${-size}` +
                    `z` +
                    `M ${x + dotSize} ${y + dotSize}` +
                    `h ${size - 2 * dotSize}` +
                    `v ${size - 2 * dotSize}` +
                    `h ${-size + 2 * dotSize}` +
                    `z`);
            }
        });
    }
    _basicExtraRounded(args) {
        const { size, x, y } = args;
        const dotSize = size / 7;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("clip-rule", "evenodd");
                this._element.setAttribute("d", `M ${x} ${y + 2.5 * dotSize}` +
                    `v ${2 * dotSize}` +
                    `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${dotSize * 2.5}` +
                    `h ${2 * dotSize}` +
                    `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${dotSize * 2.5} ${-dotSize * 2.5}` +
                    `v ${-2 * dotSize}` +
                    `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${-dotSize * 2.5}` +
                    `h ${-2 * dotSize}` +
                    `a ${2.5 * dotSize} ${2.5 * dotSize}, 0, 0, 0, ${-dotSize * 2.5} ${dotSize * 2.5}` +
                    `M ${x + 2.5 * dotSize} ${y + dotSize}` +
                    `h ${2 * dotSize}` +
                    `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${dotSize * 1.5} ${dotSize * 1.5}` +
                    `v ${2 * dotSize}` +
                    `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${-dotSize * 1.5} ${dotSize * 1.5}` +
                    `h ${-2 * dotSize}` +
                    `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${-dotSize * 1.5} ${-dotSize * 1.5}` +
                    `v ${-2 * dotSize}` +
                    `a ${1.5 * dotSize} ${1.5 * dotSize}, 0, 0, 1, ${dotSize * 1.5} ${-dotSize * 1.5}`);
            }
        });
    }
    _drawDot({ x, y, size, rotation }) {
        this._basicDot({ x, y, size, rotation });
    }
    _drawSquare({ x, y, size, rotation }) {
        this._basicSquare({ x, y, size, rotation });
    }
    _drawExtraRounded({ x, y, size, rotation }) {
        this._basicExtraRounded({ x, y, size, rotation });
    }
}


/***/ }),

/***/ "./src/figures/dot/QRDot.ts":
/*!**********************************!*\
  !*** ./src/figures/dot/QRDot.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ QRDot)
/* harmony export */ });
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../constants/dotTypes */ "./src/constants/dotTypes.ts");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");


class QRDot {
    _element;
    _svg;
    _type;
    constructor({ svg, type }) {
        this._svg = svg;
        this._type = type;
    }
    draw(x, y, size, getNeighbor) {
        const type = this._type;
        let drawFunction;
        switch (type) {
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dots:
                drawFunction = this._drawDot;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classy:
                drawFunction = this._drawClassy;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classyRounded:
                drawFunction = this._drawClassyRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].rounded:
                drawFunction = this._drawRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
            default:
                drawFunction = this._drawSquare;
        }
        drawFunction.call(this, { x, y, size, getNeighbor });
    }
    _rotateFigure({ x, y, size, rotation = 0, draw }) {
        const cx = x + size / 2;
        const cy = y + size / 2;
        draw();
        this._element?.setAttribute("transform", `rotate(${(180 * rotation) / Math.PI},${cx},${cy})`);
    }
    _basicDot(args) {
        const { size, x, y } = args;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("cx", String(x + size / 2));
                this._element.setAttribute("cy", String(y + size / 2));
                this._element.setAttribute("r", String(size / 2));
            }
        });
    }
    _basicSquare(args) {
        const { size, x, y } = args;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("x", String(x));
                this._element.setAttribute("y", String(y));
                this._element.setAttribute("width", String(size));
                this._element.setAttribute("height", String(size));
            }
        });
    }
    //if rotation === 0 - right side is rounded
    _basicSideRounded(args) {
        const { size, x, y } = args;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("d", `M ${x} ${y}` + //go to top left position
                    `v ${size}` + //draw line to left bottom corner
                    `h ${size / 2}` + //draw line to left bottom corner + half of size right
                    `a ${size / 2} ${size / 2}, 0, 0, 0, 0 ${-size}` // draw rounded corner
                );
            }
        });
    }
    //if rotation === 0 - top right corner is rounded
    _basicCornerRounded(args) {
        const { size, x, y } = args;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("d", `M ${x} ${y}` + //go to top left position
                    `v ${size}` + //draw line to left bottom corner
                    `h ${size}` + //draw line to right bottom corner
                    `v ${-size / 2}` + //draw line to right bottom corner + half of size top
                    `a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}` // draw rounded corner
                );
            }
        });
    }
    //if rotation === 0 - top right corner is rounded
    _basicCornerExtraRounded(args) {
        const { size, x, y } = args;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("d", `M ${x} ${y}` + //go to top left position
                    `v ${size}` + //draw line to left bottom corner
                    `h ${size}` + //draw line to right bottom corner
                    `a ${size} ${size}, 0, 0, 0, ${-size} ${-size}` // draw rounded top right corner
                );
            }
        });
    }
    //if rotation === 0 - left bottom and right top corners are rounded
    _basicCornersRounded(args) {
        const { size, x, y } = args;
        this._rotateFigure({
            ...args,
            draw: () => {
                this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this._element.setAttribute("id", (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
                this._element.setAttribute("d", `M ${x} ${y}` + //go to left top position
                    `v ${size / 2}` + //draw line to left top corner + half of size bottom
                    `a ${size / 2} ${size / 2}, 0, 0, 0, ${size / 2} ${size / 2}` + // draw rounded left bottom corner
                    `h ${size / 2}` + //draw line to right bottom corner
                    `v ${-size / 2}` + //draw line to right bottom corner + half of size top
                    `a ${size / 2} ${size / 2}, 0, 0, 0, ${-size / 2} ${-size / 2}` // draw rounded right top corner
                );
            }
        });
    }
    _drawDot({ x, y, size }) {
        this._basicDot({ x, y, size, rotation: 0 });
    }
    _drawSquare({ x, y, size }) {
        this._basicSquare({ x, y, size, rotation: 0 });
    }
    _drawRounded({ x, y, size, getNeighbor }) {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x, y, size, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x, y, size, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            let rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerRounded({ x, y, size, rotation });
            return;
        }
        if (neighborsCount === 1) {
            let rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x, y, size, rotation });
            return;
        }
    }
    _drawExtraRounded({ x, y, size, getNeighbor }) {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x, y, size, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x, y, size, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            let rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerExtraRounded({ x, y, size, rotation });
            return;
        }
        if (neighborsCount === 1) {
            let rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x, y, size, rotation });
            return;
        }
    }
    _drawClassy({ x, y, size, getNeighbor }) {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x, y, size, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerRounded({ x, y, size, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerRounded({ x, y, size, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x, y, size, rotation: 0 });
    }
    _drawClassyRounded({ x, y, size, getNeighbor }) {
        const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x, y, size, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerExtraRounded({ x, y, size, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerExtraRounded({ x, y, size, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x, y, size, rotation: 0 });
    }
}


/***/ }),

/***/ "./src/tools/calculateImageSize.ts":
/*!*****************************************!*\
  !*** ./src/tools/calculateImageSize.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ calculateImageSize)
/* harmony export */ });
function calculateImageSize({ originalHeight, originalWidth, maxHiddenDots, maxHiddenAxisDots, dotSize }) {
    const hideDots = { x: 0, y: 0 };
    const imageSize = { x: 0, y: 0 };
    if (originalHeight <= 0 || originalWidth <= 0 || maxHiddenDots <= 0 || dotSize <= 0) {
        return {
            height: 0,
            width: 0,
            hideYDots: 0,
            hideXDots: 0
        };
    }
    const k = originalHeight / originalWidth;
    //Getting the maximum possible axis hidden dots
    hideDots.x = Math.floor(Math.sqrt(maxHiddenDots / k));
    //The count of hidden dot's can't be less than 1
    if (hideDots.x <= 0)
        hideDots.x = 1;
    //Check the limit of the maximum allowed axis hidden dots
    if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.x)
        hideDots.x = maxHiddenAxisDots;
    //The count of dots should be odd
    if (hideDots.x % 2 === 0)
        hideDots.x--;
    imageSize.x = hideDots.x * dotSize;
    //Calculate opposite axis hidden dots based on axis value.
    //The value will be odd.
    //We use ceil to prevent dots covering by the image.
    hideDots.y = 1 + 2 * Math.ceil((hideDots.x * k - 1) / 2);
    imageSize.y = Math.round(imageSize.x * k);
    //If the result dots count is bigger than max - then decrease size and calculate again
    if (hideDots.y * hideDots.x > maxHiddenDots || (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y)) {
        if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y) {
            hideDots.y = maxHiddenAxisDots;
            if (hideDots.y % 2 === 0)
                hideDots.x--;
        }
        else {
            hideDots.y -= 2;
        }
        imageSize.y = hideDots.y * dotSize;
        hideDots.x = 1 + 2 * Math.ceil((hideDots.y / k - 1) / 2);
        imageSize.x = Math.round(imageSize.y / k);
    }
    return {
        height: imageSize.y,
        width: imageSize.x,
        hideYDots: hideDots.y,
        hideXDots: hideDots.x
    };
}


/***/ }),

/***/ "./src/tools/downloadURI.ts":
/*!**********************************!*\
  !*** ./src/tools/downloadURI.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ downloadURI)
/* harmony export */ });
function downloadURI(uri, name) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


/***/ }),

/***/ "./src/tools/getMode.ts":
/*!******************************!*\
  !*** ./src/tools/getMode.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getMode)
/* harmony export */ });
/* harmony import */ var _constants_modes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/modes */ "./src/constants/modes.ts");

function getMode(data) {
    switch (true) {
        case /^[0-9]*$/.test(data):
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].numeric;
        case /^[0-9A-Z $%*+\-./:]*$/.test(data):
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].alphanumeric;
        default:
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].byte;
    }
}


/***/ }),

/***/ "./src/tools/merge.ts":
/*!****************************!*\
  !*** ./src/tools/merge.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ mergeDeep)
/* harmony export */ });
const isObject = (obj) => !!obj && typeof obj === "object" && !Array.isArray(obj);
function mergeDeep(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (source === undefined || !isObject(target) || !isObject(source))
        return target;
    target = { ...target };
    Object.keys(source).forEach((key) => {
        const targetValue = target[key];
        const sourceValue = source[key];
        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = sourceValue;
        }
        else if (isObject(targetValue) && isObject(sourceValue)) {
            target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
        }
        else {
            target[key] = sourceValue;
        }
    });
    return mergeDeep(target, ...sources);
}


/***/ }),

/***/ "./src/tools/sanitizeOptions.ts":
/*!**************************************!*\
  !*** ./src/tools/sanitizeOptions.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ sanitizeOptions)
/* harmony export */ });
function sanitizeGradient(gradient) {
    const newGradient = { ...gradient };
    if (!newGradient.colorStops || !newGradient.colorStops.length) {
        throw "Field 'colorStops' is required in gradient";
    }
    if (newGradient.rotation) {
        newGradient.rotation = Number(newGradient.rotation);
    }
    else {
        newGradient.rotation = 0;
    }
    newGradient.colorStops = newGradient.colorStops.map((colorStop) => ({
        ...colorStop,
        offset: Number(colorStop.offset)
    }));
    return newGradient;
}
function sanitizeOptions(options) {
    const newOptions = { ...options };
    newOptions.width = Number(newOptions.width);
    newOptions.height = Number(newOptions.height);
    newOptions.margin = Number(newOptions.margin);
    newOptions.imageOptions = {
        ...newOptions.imageOptions,
        hideBackgroundDots: Boolean(newOptions.imageOptions.hideBackgroundDots),
        imageSize: Number(newOptions.imageOptions.imageSize),
        margin: Number(newOptions.imageOptions.margin)
    };
    if (newOptions.margin > Math.min(newOptions.width, newOptions.height)) {
        newOptions.margin = Math.min(newOptions.width, newOptions.height);
    }
    newOptions.dotsOptions = {
        ...newOptions.dotsOptions
    };
    if (newOptions.dotsOptions.gradient) {
        newOptions.dotsOptions.gradient = sanitizeGradient(newOptions.dotsOptions.gradient);
    }
    if (newOptions.cornersSquareOptions) {
        newOptions.cornersSquareOptions = {
            ...newOptions.cornersSquareOptions
        };
        if (newOptions.cornersSquareOptions.gradient) {
            newOptions.cornersSquareOptions.gradient = sanitizeGradient(newOptions.cornersSquareOptions.gradient);
        }
    }
    if (newOptions.cornersDotOptions) {
        newOptions.cornersDotOptions = {
            ...newOptions.cornersDotOptions
        };
        if (newOptions.cornersDotOptions.gradient) {
            newOptions.cornersDotOptions.gradient = sanitizeGradient(newOptions.cornersDotOptions.gradient);
        }
    }
    if (newOptions.backgroundOptions) {
        newOptions.backgroundOptions = {
            ...newOptions.backgroundOptions
        };
        if (newOptions.backgroundOptions.gradient) {
            newOptions.backgroundOptions.gradient = sanitizeGradient(newOptions.backgroundOptions.gradient);
        }
    }
    return newOptions;
}


/***/ }),

/***/ "./src/tools/toDataUrl.ts":
/*!********************************!*\
  !*** ./src/tools/toDataUrl.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toDataURL)
/* harmony export */ });
async function toDataURL(url) {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
                resolve(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
    });
}


/***/ }),

/***/ "./src/types/index.ts":
/*!****************************!*\
  !*** ./src/types/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/native.js":
/*!******************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/native.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  randomUUID
});

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   unsafeStringify: () => (/* binding */ unsafeStringify)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _native_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./native.js */ "./node_modules/uuid/dist/esm-browser/native.js");
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");




function v4(options, buf, offset) {
  if (_native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID && !buf && !options) {
    return _native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_1__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.unsafeStringify)(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cornerDotTypes: () => (/* reexport safe */ _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   cornerSquareTypes: () => (/* reexport safe */ _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   dotTypes: () => (/* reexport safe */ _constants_dotTypes__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   drawTypes: () => (/* reexport safe */ _constants_drawTypes__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   errorCorrectionLevels: () => (/* reexport safe */ _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   errorCorrectionPercents: () => (/* reexport safe */ _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   gradientTypes: () => (/* reexport safe */ _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_10__["default"]),
/* harmony export */   modes: () => (/* reexport safe */ _constants_modes__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   qrTypes: () => (/* reexport safe */ _constants_qrTypes__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   shapeTypes: () => (/* reexport safe */ _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_9__["default"])
/* harmony export */ });
/* harmony import */ var _core_QRCodeStyling__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/QRCodeStyling */ "./src/core/QRCodeStyling.ts");
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants/dotTypes */ "./src/constants/dotTypes.ts");
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
/* harmony import */ var _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants/errorCorrectionLevels */ "./src/constants/errorCorrectionLevels.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _constants_modes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./constants/modes */ "./src/constants/modes.ts");
/* harmony import */ var _constants_qrTypes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants/qrTypes */ "./src/constants/qrTypes.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _constants_shapeTypes__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./constants/shapeTypes */ "./src/constants/shapeTypes.ts");
/* harmony import */ var _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./constants/gradientTypes */ "./src/constants/gradientTypes.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./types */ "./src/types/index.ts");













/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_core_QRCodeStyling__WEBPACK_IMPORTED_MODULE_0__["default"]);

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQix3QkFBd0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFROztBQUVSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUTs7QUFFUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsd0JBQXdCLG1CQUFtQjtBQUMzQywwQkFBMEIsbUJBQW1COztBQUU3QztBQUNBOztBQUVBLDJCQUEyQixRQUFROztBQUVuQztBQUNBO0FBQ0E7O0FBRUEsNkJBQTZCLFFBQVE7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLHdCQUF3Qix1QkFBdUI7QUFDL0MsMEJBQTBCLHVCQUF1QjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQix1QkFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQix1QkFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQixtQkFBbUI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTtBQUNBLG9CQUFvQixTQUFTO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsU0FBUztBQUM3QjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IseUJBQXlCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxzQkFBc0IsdUJBQXVCO0FBQzdDLHdCQUF3QixtQkFBbUI7QUFDM0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0Esc0JBQXNCLHVCQUF1QjtBQUM3QztBQUNBOztBQUVBLHNCQUFzQixtQkFBbUI7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxzQkFBc0IsWUFBWTs7QUFFbEM7QUFDQTtBQUNBOztBQUVBLHdCQUF3QixXQUFXO0FBQ25DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0IsWUFBWTtBQUNsQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLG1CQUFtQjtBQUN6QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixTQUFTO0FBQy9CO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLG1CQUFtQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsWUFBWTtBQUNwQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDJCQUEyQjtBQUMzQjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdCQUF3QjtBQUN4Qjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsc0JBQXNCLGVBQWU7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxVQUFVOztBQUVWOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9CQUFv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Q3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3RCLENBQUM7QUFFRixNQUFNLE9BQU8sR0FBRztJQUNkLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3RCLENBQUM7QUFFYSxNQUFNLEtBQUs7SUFDeEIsUUFBUSxDQUFhO0lBQ3JCLEtBQUssQ0FBYTtJQUNsQixtQkFBbUIsQ0FBYztJQUNqQyxhQUFhLENBQWM7SUFDM0Isc0JBQXNCLENBQWM7SUFDcEMsbUJBQW1CLENBQWM7SUFDakMsUUFBUSxDQUFrQjtJQUMxQixHQUFHLENBQVU7SUFDYixNQUFNLENBQW9CO0lBRTFCLDJDQUEyQztJQUMzQyxZQUFZLE9BQXdCO1FBQ2xDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsZ0RBQU0sRUFBRSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzdELElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtZQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDdkU7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGdEQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUM3QixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztJQUM5QixDQUFDO0lBRUQsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFVO1FBQ3JCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNsQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQy9GLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLDZEQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ2hHLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQy9DLE1BQU0sRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNsRCxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQztRQUN0RCxzQ0FBc0M7UUFDdEMsNEJBQTRCO1FBQzVCLElBQUksbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksYUFBYSxHQUFHO1lBQ2xCLFNBQVMsRUFBRSxDQUFDO1lBQ1osU0FBUyxFQUFFLENBQUM7WUFDWixLQUFLLEVBQUUsQ0FBQztZQUNSLE1BQU0sRUFBRSxDQUFDO1NBQ1YsQ0FBQztRQUNGLE1BQU0sWUFBWSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDL0IsTUFBTSxZQUFZLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUMvQixxREFBcUQ7UUFDckQsMkRBQTJEO1FBQzNELG9FQUFvRTtRQUNwRSx3REFBd0Q7UUFDeEQsOEZBQThGO1FBQzlGLElBQUksbUJBQW1CLEdBQUc7WUFDeEIsTUFBTSxFQUFFLENBQUM7WUFDVCxNQUFNLEVBQUUsQ0FBQztZQUNULElBQUksRUFBRSxDQUFDO1lBQ1AsSUFBSSxFQUFFLENBQUM7U0FDUixDQUFDO1FBRUYsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFFZCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO1lBQ3ZCLDhCQUE4QjtZQUM5QixNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUN6QixNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsU0FBUyxHQUFHLDBFQUF1QixDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3BHLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztZQUN0QixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNuQyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUVyQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEUsSUFBSSxhQUFhLEVBQUU7Z0JBQ2pCLFVBQVUsR0FBRyxPQUFPLENBQUM7Z0JBQ3JCLFdBQVcsR0FBRyxPQUFPLENBQUM7YUFDdkI7WUFFRCxhQUFhO2dCQUNYLFdBQVcsS0FBSyxVQUFVO29CQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQztvQkFDeEMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV0RSxhQUFhLEdBQUcscUVBQWtCLENBQUM7Z0JBQ2pDLGFBQWEsRUFBRSxVQUFVO2dCQUN6QixjQUFjLEVBQUUsV0FBVztnQkFDM0IsYUFBYTtnQkFDYixpQkFBaUIsRUFBRSxLQUFLLEdBQUcsRUFBRTtnQkFDN0IsT0FBTzthQUNSLENBQUMsQ0FBQztZQUVILElBQUksYUFBYSxFQUFFO2dCQUNqQixtQkFBbUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2RTtZQUVELG1CQUFtQixHQUFHO2dCQUNwQixNQUFNLEVBQUUsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7Z0JBQzdDLE1BQU0sRUFBRSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztnQkFDN0MsSUFBSSxFQUFFLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO2dCQUMzQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7YUFDNUMsQ0FBQztTQUNIO1FBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFXLEVBQUU7WUFDOUMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLGtCQUFrQixFQUFFO2dCQUNoRSxJQUNFLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNO29CQUMvQixDQUFDLEdBQUcsbUJBQW1CLENBQUMsSUFBSTtvQkFDNUIsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLE1BQU07b0JBQy9CLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLEVBQzVCO29CQUNBLElBQUksYUFBYSxFQUFFO3dCQUNqQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLENBQUM7cUJBQ2hHO29CQUNELE9BQU8sS0FBSyxDQUFDO2lCQUNkO2FBQ0Y7WUFFRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDMUYsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUNqRixPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVuQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDdEMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ2hIO0lBQ0gsQ0FBQztJQUVELGNBQWM7UUFDWixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFOUIsSUFBSSxPQUFPLEVBQUU7WUFDWCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDO1lBQzVELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUM7WUFFL0MsSUFBSSxlQUFlLElBQUksS0FBSyxFQUFFO2dCQUM1QixJQUFJLENBQUMsWUFBWSxDQUFDO29CQUNoQixPQUFPLEVBQUUsZUFBZTtvQkFDeEIsS0FBSyxFQUFFLEtBQUs7b0JBQ1osa0JBQWtCLEVBQUUsQ0FBQztvQkFDckIsQ0FBQyxFQUFFLENBQUM7b0JBQ0osQ0FBQyxFQUFFLENBQUM7b0JBQ0osTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO29CQUN0QixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7b0JBQ3BCLEVBQUUsRUFBRSxrQkFBa0I7aUJBQ3ZCLENBQUMsQ0FBQzthQUNKO1lBRUQsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxFQUFFO2dCQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDOUYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztnQkFDMUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBRWpELE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUQsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDNUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFFakYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMvQztTQUNGO0lBQ0gsQ0FBQztJQUVELFFBQVEsQ0FBQyxNQUF1QjtRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNiLE1BQU0sd0JBQXdCLENBQUM7U0FDaEM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFeEMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUNuRCxNQUFNLDBCQUEwQixDQUFDO1NBQ2xDO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUM3RSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxLQUFLLDZEQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQzFGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQy9DLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEUsTUFBTSxHQUFHLEdBQUcsSUFBSSwwREFBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUU5RSxJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEYsTUFBTSxFQUFFLEdBQUcsZ0RBQU0sRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFM0MsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNoQixPQUFPLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxRQUFRO1lBQ3RDLEtBQUssRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUs7WUFDaEMsa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixDQUFDLEVBQUUsQ0FBQztZQUNKLENBQUMsRUFBRSxDQUFDO1lBQ0osTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1lBQ3RCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztZQUNwQixFQUFFLEVBQUUsRUFBRTtTQUNQLENBQUMsQ0FBQztRQUVILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUIsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUMzQixTQUFTO2lCQUNWO2dCQUNELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQzNCLFNBQVM7aUJBQ1Y7Z0JBRUQsR0FBRyxDQUFDLElBQUksQ0FDTixVQUFVLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFDeEIsVUFBVSxHQUFHLENBQUMsR0FBRyxPQUFPLEVBQ3hCLE9BQU8sRUFDUCxDQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVcsRUFBRTtvQkFDNUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxJQUFJLEtBQUs7d0JBQUUsT0FBTyxLQUFLLENBQUM7b0JBQ3JHLElBQUksTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQzt3QkFBRSxPQUFPLEtBQUssQ0FBQztvQkFDOUQsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDakUsQ0FBQyxDQUNGLENBQUM7Z0JBRUYsSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7b0JBQ3RDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDOUM7YUFDRjtTQUNGO1FBRUQsSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLDZEQUFVLENBQUMsTUFBTSxFQUFFO1lBQ3ZDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sU0FBUyxHQUFHLEtBQUssR0FBRyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sY0FBYyxHQUFHLFVBQVUsR0FBRyxjQUFjLEdBQUcsT0FBTyxDQUFDO1lBQzdELE1BQU0sY0FBYyxHQUFHLFVBQVUsR0FBRyxjQUFjLEdBQUcsT0FBTyxDQUFDO1lBQzdELE1BQU0sVUFBVSxHQUFlLEVBQUUsQ0FBQztZQUNsQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUV6QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNsQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNsQyxJQUNFLENBQUMsSUFBSSxjQUFjLEdBQUcsQ0FBQzt3QkFDdkIsQ0FBQyxJQUFJLFNBQVMsR0FBRyxjQUFjO3dCQUMvQixDQUFDLElBQUksY0FBYyxHQUFHLENBQUM7d0JBQ3ZCLENBQUMsSUFBSSxTQUFTLEdBQUcsY0FBYyxFQUMvQjt3QkFDQSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNyQixTQUFTO3FCQUNWO29CQUVELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sRUFBRTt3QkFDakYsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDckIsU0FBUztxQkFDVjtvQkFFRCw0REFBNEQ7b0JBQzVELFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FDaEMsQ0FBQyxHQUFHLENBQUMsR0FBRyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsY0FBYyxFQUN6RixDQUFDLEdBQUcsQ0FBQyxHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQzFGO3dCQUNDLENBQUMsQ0FBQyxDQUFDO3dCQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ1A7YUFDRjtZQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2xDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUFFLFNBQVM7b0JBRWhDLEdBQUcsQ0FBQyxJQUFJLENBQ04sY0FBYyxHQUFHLENBQUMsR0FBRyxPQUFPLEVBQzVCLGNBQWMsR0FBRyxDQUFDLEdBQUcsT0FBTyxFQUM1QixPQUFPLEVBQ1AsQ0FBQyxPQUFlLEVBQUUsT0FBZSxFQUFXLEVBQUU7d0JBQzVDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7b0JBQ2xELENBQUMsQ0FDRixDQUFDO29CQUNGLElBQUksR0FBRyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO3dCQUN0QyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQzlDO2lCQUNGO2FBQ0Y7U0FDRjtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDYixNQUFNLHdCQUF3QixDQUFDO1NBQ2hDO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUM5QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBRTlCLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLDZCQUE2QixDQUFDO1NBQ3JDO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN4QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzdFLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEtBQUssNkRBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDMUYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDL0MsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sY0FBYyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDbkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUV0RTtZQUNFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDckIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxNQUFNLENBQUMsR0FBRyxVQUFVLEdBQUcsTUFBTSxHQUFHLE9BQU8sR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsR0FBRyxVQUFVLEdBQUcsR0FBRyxHQUFHLE9BQU8sR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLHFCQUFxQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDL0MsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBRTVDLElBQUksT0FBTyxDQUFDLG9CQUFvQixFQUFFLFFBQVEsSUFBSSxPQUFPLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFO2dCQUNqRixxQkFBcUIsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUMzRixNQUFNLEVBQUUsR0FBRyxnREFBTSxFQUFFLENBQUM7Z0JBQ3BCLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7Z0JBRXBHLElBQUksQ0FBQyxZQUFZLENBQUM7b0JBQ2hCLE9BQU8sRUFBRSxPQUFPLENBQUMsb0JBQW9CLEVBQUUsUUFBUTtvQkFDL0MsS0FBSyxFQUFFLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxLQUFLO29CQUMxQyxrQkFBa0IsRUFBRSxRQUFRO29CQUM1QixDQUFDO29CQUNELENBQUM7b0JBQ0QsTUFBTSxFQUFFLGlCQUFpQjtvQkFDekIsS0FBSyxFQUFFLGlCQUFpQjtvQkFDeEIsRUFBRSxFQUFFLEVBQUU7aUJBQ1AsQ0FBQyxDQUFDO2FBQ0o7WUFFRCxJQUFJLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUU7Z0JBQ3RDLE1BQU0sYUFBYSxHQUFHLElBQUksNEVBQWMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFFMUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUV0RCxJQUFJLGFBQWEsQ0FBQyxRQUFRLElBQUkscUJBQXFCLEVBQUU7b0JBQ25ELHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzNEO2FBQ0Y7aUJBQU07Z0JBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSwwREFBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFFOUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUM3QyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7NEJBQ3ZCLFNBQVM7eUJBQ1Y7d0JBRUQsR0FBRyxDQUFDLElBQUksQ0FDTixDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFDZixDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFDZixPQUFPLEVBQ1AsQ0FBQyxPQUFlLEVBQUUsT0FBZSxFQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FDeEYsQ0FBQzt3QkFFRixJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUkscUJBQXFCLEVBQUU7NEJBQ3pDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7eUJBQ2pEO3FCQUNGO2lCQUNGO2FBQ0Y7WUFFRCxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRTtnQkFDM0Usa0JBQWtCLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDeEYsTUFBTSxFQUFFLEdBQUcsZ0RBQU0sRUFBRSxDQUFDO2dCQUNwQixrQkFBa0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7Z0JBRTlDLElBQUksQ0FBQyxZQUFZLENBQUM7b0JBQ2hCLE9BQU8sRUFBRSxPQUFPLENBQUMsaUJBQWlCLEVBQUUsUUFBUTtvQkFDNUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxLQUFLO29CQUN2QyxrQkFBa0IsRUFBRSxRQUFRO29CQUM1QixDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDO29CQUNsQixDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDO29CQUNsQixNQUFNLEVBQUUsY0FBYztvQkFDdEIsS0FBSyxFQUFFLGNBQWM7b0JBQ3JCLEVBQUUsRUFBRSxFQUFFO2lCQUNQLENBQUMsQ0FBQzthQUNKO1lBRUQsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFO2dCQUNuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLHNFQUFXLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBRWpHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUU1RSxJQUFJLFVBQVUsQ0FBQyxRQUFRLElBQUksa0JBQWtCLEVBQUU7b0JBQzdDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3JEO2FBQ0Y7aUJBQU07Z0JBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSwwREFBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFFOUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUMxQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7NEJBQ3BCLFNBQVM7eUJBQ1Y7d0JBRUQsR0FBRyxDQUFDLElBQUksQ0FDTixDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFDZixDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFDZixPQUFPLEVBQ1AsQ0FBQyxPQUFlLEVBQUUsT0FBZSxFQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FDckYsQ0FBQzt3QkFFRixJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksa0JBQWtCLEVBQUU7NEJBQ3RDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7eUJBQzlDO3FCQUNGO2lCQUNGO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNyQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFFMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQ2xCLE9BQU8sTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUM7YUFDdkM7WUFFRCxJQUFJLE9BQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxXQUFXLEtBQUssUUFBUSxFQUFFO2dCQUN4RCxLQUFLLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDO2FBQ3REO1lBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFTLEVBQUU7Z0JBQ3hCLE9BQU8sRUFBRSxDQUFDO1lBQ1osQ0FBQyxDQUFDO1lBQ0YsS0FBSyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsRUFDZCxhQUFhLEVBQ2IsS0FBSyxFQUNMLE1BQU0sRUFLUDtRQUNDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFFaEQsdUZBQXVGO1FBQ3ZGLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUMsdUNBQXVDO1FBQzFGLE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQzVDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN2QixJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUM7UUFFekIsNkZBQTZGO1FBQzdGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3JELElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7UUFFckIsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUM7UUFFdEQsSUFBSSxhQUFhLEVBQUU7WUFDakIsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDO1lBQy9ELElBQUksV0FBVyxHQUFHLENBQUMsRUFBRTtnQkFDbkIsV0FBVyxHQUFHLFVBQVUsQ0FBQztnQkFDekIsTUFBTSxXQUFXLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQztnQkFDOUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQyxVQUFVLEdBQUcsV0FBVyxDQUFDO2FBQzFCO2lCQUFNO2dCQUNMLFVBQVUsR0FBRyxVQUFVLENBQUM7Z0JBQ3hCLE1BQU0sWUFBWSxHQUFHLFVBQVUsR0FBRyxXQUFXLENBQUM7Z0JBQzlDLFlBQVksR0FBRyxDQUFDLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakQsV0FBVyxHQUFHLFlBQVksQ0FBQzthQUM1QjtTQUNGO1FBRUQsNENBQTRDO1FBQzVDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDOUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVoRix3RUFBd0U7UUFDeEUsTUFBTSxPQUFPLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUMvQixNQUFNLE9BQU8sR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sWUFBWSxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUV0RCx1Q0FBdUM7UUFDdkMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxnREFBTSxFQUFFLENBQUMsQ0FBQztRQUNqQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyx1Q0FBdUM7UUFDckYsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsR0FBRyxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUMsd0NBQXdDO1FBQ3hGLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7UUFDbEUsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtRQUVsRSwwQkFBMEI7UUFDMUIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RSxNQUFNLFFBQVEsR0FBRyxNQUFNLDREQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0RCxLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7UUFDM0MsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsZ0RBQU0sRUFBRSxDQUFDLENBQUM7UUFDbkMsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMseUNBQXlDO1FBQ3pGLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEdBQUcsV0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLDBDQUEwQztRQUM1RixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUM5QyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUU5QyxJQUFJLGFBQWEsRUFBRTtZQUNqQiw4QkFBOEI7WUFDOUIsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNwRixNQUFNLFlBQVksR0FBRyxnREFBTSxFQUFFLENBQUM7WUFDOUIsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFMUMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNoRixNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxnREFBTSxFQUFFLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CO1lBRXRGLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsUUFBUSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBRXpELHNEQUFzRDtZQUN0RCxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzNCO1FBRUQsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV2QixJQUFJLFdBQVcsR0FBRyxDQUFDLEVBQUU7WUFDbkIsSUFBSSxhQUF5QixDQUFDO1lBQzlCLElBQUksYUFBYSxFQUFFO2dCQUNqQixhQUFhLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDakYsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2xELGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxhQUFhLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzthQUN2RDtpQkFBTTtnQkFDTCxhQUFhLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNoRjtZQUNELGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGdEQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzNDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLHVDQUF1QztZQUMvRixhQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLFdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyx3Q0FBd0M7WUFDbEcsYUFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWU7WUFDMUYsYUFBYSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlO1lBQ2hGLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsbUJBQW1CO1lBQy9ELEdBQUcsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQywwQ0FBMEM7U0FDM0U7UUFFRCxrQ0FBa0M7UUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELFlBQVksQ0FBQyxFQUNYLE9BQU8sRUFDUCxLQUFLLEVBQ0wsa0JBQWtCLEVBQ2xCLENBQUMsRUFDRCxDQUFDLEVBQ0QsTUFBTSxFQUNOLEtBQUssRUFDTCxFQUFFLEVBVUg7UUFDQyxNQUFNLElBQUksR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM3QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVoRCxJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksUUFBb0IsQ0FBQztZQUN6QixNQUFNLFVBQVUsR0FBRyxnREFBTSxFQUFFLENBQUM7WUFDNUIsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLGdFQUFhLENBQUMsTUFBTSxFQUFFO2dCQUN6QyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNwRixRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDeEMsUUFBUSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFDekQsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzlDO2lCQUFNO2dCQUNMLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRixNQUFNLGdCQUFnQixHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFeEIsSUFDRSxDQUFDLGdCQUFnQixJQUFJLENBQUMsSUFBSSxnQkFBZ0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDN0QsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUN0RTtvQkFDQSxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7b0JBQ3BCLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDNUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO29CQUNwQixFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzdDO3FCQUFNLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksZ0JBQWdCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUU7b0JBQ2xGLEVBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDckIsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3pDLEVBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDckIsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzFDO3FCQUFNLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksZ0JBQWdCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUU7b0JBQ2xGLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztvQkFDcEIsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUM1QyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7b0JBQ3BCLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDN0M7cUJBQU0sSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxnQkFBZ0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRTtvQkFDbEYsRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUNyQixFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDekMsRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUNyQixFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDMUM7Z0JBRUQsUUFBUSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFDcEYsUUFBUSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFDekQsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3JEO1lBQ0QsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDeEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQXFDLEVBQUUsRUFBRTtnQkFDbEYsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLFVBQVUsSUFBSSxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDbEM7YUFBTSxJQUFJLEtBQUssRUFBRTtZQUNoQixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNsQztRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcHJCMkQ7QUFFeEI7QUFFckIsTUFBTSxXQUFXO0lBQzlCLFFBQVEsQ0FBYztJQUN0QixJQUFJLENBQWE7SUFDakIsS0FBSyxDQUFnQjtJQUVyQixZQUFZLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBNEM7UUFDakUsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUVELElBQUksQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLElBQVksRUFBRSxRQUFnQjtRQUN2RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksWUFBWSxDQUFDO1FBRWpCLFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSyxpRUFBYyxDQUFDLE1BQU07Z0JBQ3hCLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUNoQyxNQUFNO1lBQ1IsS0FBSyxpRUFBYyxDQUFDLEdBQUcsQ0FBQztZQUN4QjtnQkFDRSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUNoQztRQUVELFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsYUFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQW9CO1FBQ2hFLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRXhCLElBQUksRUFBRSxDQUFDO1FBQ1AsSUFBSSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRUQsU0FBUyxDQUFDLElBQXlCO1FBQ2pDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUU1QixJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLEdBQUcsSUFBSTtZQUNQLElBQUksRUFBRSxHQUFHLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNqRixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsZ0RBQU0sRUFBRSxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFlBQVksQ0FBQyxJQUF5QjtRQUNwQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixHQUFHLElBQUk7WUFDUCxJQUFJLEVBQUUsR0FBRyxFQUFFO2dCQUNULElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGdEQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQVk7UUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBWTtRQUM1QyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM5QyxDQUFDO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVFaUU7QUFFOUI7QUFFckIsTUFBTSxjQUFjO0lBQ2pDLFFBQVEsQ0FBYztJQUN0QixJQUFJLENBQWE7SUFDakIsS0FBSyxDQUFtQjtJQUV4QixZQUFZLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBK0M7UUFDcEUsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUVELElBQUksQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLElBQVksRUFBRSxRQUFnQjtRQUN2RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksWUFBWSxDQUFDO1FBRWpCLFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSyxvRUFBaUIsQ0FBQyxNQUFNO2dCQUMzQixZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDaEMsTUFBTTtZQUNSLEtBQUssb0VBQWlCLENBQUMsWUFBWTtnQkFDakMsWUFBWSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztnQkFDdEMsTUFBTTtZQUNSLEtBQUssb0VBQWlCLENBQUMsR0FBRyxDQUFDO1lBQzNCO2dCQUNFLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ2hDO1FBRUQsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxhQUFhLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBb0I7UUFDaEUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7UUFDeEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7UUFFeEIsSUFBSSxFQUFFLENBQUM7UUFDUCxJQUFJLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBeUI7UUFDakMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7UUFFekIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixHQUFHLElBQUk7WUFDUCxJQUFJLEVBQUUsR0FBRyxFQUFFO2dCQUNULElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGdEQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN4QixHQUFHLEVBQ0gsS0FBSyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxrQ0FBa0M7b0JBQzNELEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxjQUFjLEdBQUcsa0ZBQWtGO29CQUM1SCxHQUFHLEdBQUcsNkJBQTZCO29CQUNuQyxPQUFPLE9BQU8sRUFBRSxHQUFHLG9FQUFvRTtvQkFDdkYsS0FBSyxJQUFJLEdBQUcsQ0FBQyxHQUFHLE9BQU8sSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLE9BQU8sZUFBZSxHQUFHLG1GQUFtRjtvQkFDbEosR0FBRyxDQUFDLG1IQUFtSDtpQkFDMUgsQ0FBQztZQUNKLENBQUM7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsWUFBWSxDQUFDLElBQXlCO1FBQ3BDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRXpCLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsR0FBRyxJQUFJO1lBQ1AsSUFBSSxFQUFFLEdBQUcsRUFBRTtnQkFDVCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxnREFBTSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDeEIsR0FBRyxFQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDWCxLQUFLLElBQUksRUFBRTtvQkFDWCxLQUFLLElBQUksRUFBRTtvQkFDWCxLQUFLLENBQUMsSUFBSSxFQUFFO29CQUNaLEdBQUc7b0JBQ0gsS0FBSyxDQUFDLEdBQUcsT0FBTyxJQUFJLENBQUMsR0FBRyxPQUFPLEVBQUU7b0JBQ2pDLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxPQUFPLEVBQUU7b0JBQ3pCLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxPQUFPLEVBQUU7b0JBQ3pCLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFBRTtvQkFDMUIsR0FBRyxDQUNOLENBQUM7WUFDSixDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGtCQUFrQixDQUFDLElBQXlCO1FBQzFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRXpCLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsR0FBRyxJQUFJO1lBQ1AsSUFBSSxFQUFFLEdBQUcsRUFBRTtnQkFDVCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxnREFBTSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDeEIsR0FBRyxFQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxFQUFFO29CQUMzQixLQUFLLENBQUMsR0FBRyxPQUFPLEVBQUU7b0JBQ2xCLEtBQUssR0FBRyxHQUFHLE9BQU8sSUFBSSxHQUFHLEdBQUcsT0FBTyxjQUFjLE9BQU8sR0FBRyxHQUFHLElBQUksT0FBTyxHQUFHLEdBQUcsRUFBRTtvQkFDakYsS0FBSyxDQUFDLEdBQUcsT0FBTyxFQUFFO29CQUNsQixLQUFLLEdBQUcsR0FBRyxPQUFPLElBQUksR0FBRyxHQUFHLE9BQU8sY0FBYyxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRTtvQkFDbEYsS0FBSyxDQUFDLENBQUMsR0FBRyxPQUFPLEVBQUU7b0JBQ25CLEtBQUssR0FBRyxHQUFHLE9BQU8sSUFBSSxHQUFHLEdBQUcsT0FBTyxjQUFjLENBQUMsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUU7b0JBQ25GLEtBQUssQ0FBQyxDQUFDLEdBQUcsT0FBTyxFQUFFO29CQUNuQixLQUFLLEdBQUcsR0FBRyxPQUFPLElBQUksR0FBRyxHQUFHLE9BQU8sY0FBYyxDQUFDLE9BQU8sR0FBRyxHQUFHLElBQUksT0FBTyxHQUFHLEdBQUcsRUFBRTtvQkFDbEYsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sSUFBSSxDQUFDLEdBQUcsT0FBTyxFQUFFO29CQUN2QyxLQUFLLENBQUMsR0FBRyxPQUFPLEVBQUU7b0JBQ2xCLEtBQUssR0FBRyxHQUFHLE9BQU8sSUFBSSxHQUFHLEdBQUcsT0FBTyxjQUFjLE9BQU8sR0FBRyxHQUFHLElBQUksT0FBTyxHQUFHLEdBQUcsRUFBRTtvQkFDakYsS0FBSyxDQUFDLEdBQUcsT0FBTyxFQUFFO29CQUNsQixLQUFLLEdBQUcsR0FBRyxPQUFPLElBQUksR0FBRyxHQUFHLE9BQU8sY0FBYyxDQUFDLE9BQU8sR0FBRyxHQUFHLElBQUksT0FBTyxHQUFHLEdBQUcsRUFBRTtvQkFDbEYsS0FBSyxDQUFDLENBQUMsR0FBRyxPQUFPLEVBQUU7b0JBQ25CLEtBQUssR0FBRyxHQUFHLE9BQU8sSUFBSSxHQUFHLEdBQUcsT0FBTyxjQUFjLENBQUMsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUU7b0JBQ25GLEtBQUssQ0FBQyxDQUFDLEdBQUcsT0FBTyxFQUFFO29CQUNuQixLQUFLLEdBQUcsR0FBRyxPQUFPLElBQUksR0FBRyxHQUFHLE9BQU8sY0FBYyxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxDQUNyRixDQUFDO1lBQ0osQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQVk7UUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBWTtRQUM1QyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsaUJBQWlCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQVk7UUFDbEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pJK0M7QUFFWjtBQUVyQixNQUFNLEtBQUs7SUFDeEIsUUFBUSxDQUFjO0lBQ3RCLElBQUksQ0FBYTtJQUNqQixLQUFLLENBQVU7SUFFZixZQUFZLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBc0M7UUFDM0QsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUVELElBQUksQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLElBQVksRUFBRSxXQUF3QjtRQUMvRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksWUFBWSxDQUFDO1FBRWpCLFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSywyREFBUSxDQUFDLElBQUk7Z0JBQ2hCLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUM3QixNQUFNO1lBQ1IsS0FBSywyREFBUSxDQUFDLE1BQU07Z0JBQ2xCLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUNoQyxNQUFNO1lBQ1IsS0FBSywyREFBUSxDQUFDLGFBQWE7Z0JBQ3pCLFlBQVksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7Z0JBQ3ZDLE1BQU07WUFDUixLQUFLLDJEQUFRLENBQUMsT0FBTztnQkFDbkIsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ2pDLE1BQU07WUFDUixLQUFLLDJEQUFRLENBQUMsWUFBWTtnQkFDeEIsWUFBWSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztnQkFDdEMsTUFBTTtZQUNSLEtBQUssMkRBQVEsQ0FBQyxNQUFNLENBQUM7WUFDckI7Z0JBQ0UsWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7U0FDbkM7UUFFRCxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELGFBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFvQjtRQUNoRSxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUN4QixNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUV4QixJQUFJLEVBQUUsQ0FBQztRQUNQLElBQUksQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEcsQ0FBQztJQUVELFNBQVMsQ0FBQyxJQUF5QjtRQUNqQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixHQUFHLElBQUk7WUFDUCxJQUFJLEVBQUUsR0FBRyxFQUFFO2dCQUNULElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDakYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGdEQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEQsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBeUI7UUFDcEMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRTVCLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsR0FBRyxJQUFJO1lBQ1AsSUFBSSxFQUFFLEdBQUcsRUFBRTtnQkFDVCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxnREFBTSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JELENBQUM7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLGlCQUFpQixDQUFDLElBQXlCO1FBQ3pDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUU1QixJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2pCLEdBQUcsSUFBSTtZQUNQLElBQUksRUFBRSxHQUFHLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsZ0RBQU0sRUFBRSxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUN4QixHQUFHLEVBQ0gsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcseUJBQXlCO29CQUN2QyxLQUFLLElBQUksRUFBRSxHQUFHLGlDQUFpQztvQkFDL0MsS0FBSyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsc0RBQXNEO29CQUN4RSxLQUFLLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUMsc0JBQXNCO2lCQUMxRSxDQUFDO1lBQ0osQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxpREFBaUQ7SUFDakQsbUJBQW1CLENBQUMsSUFBeUI7UUFDM0MsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRTVCLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDakIsR0FBRyxJQUFJO1lBQ1AsSUFBSSxFQUFFLEdBQUcsRUFBRTtnQkFDVCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxnREFBTSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQ3hCLEdBQUcsRUFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyx5QkFBeUI7b0JBQ3ZDLEtBQUssSUFBSSxFQUFFLEdBQUcsaUNBQWlDO29CQUMvQyxLQUFLLElBQUksRUFBRSxHQUFHLGtDQUFrQztvQkFDaEQsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxxREFBcUQ7b0JBQ3hFLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0I7aUJBQ3pGLENBQUM7WUFDSixDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGlEQUFpRDtJQUNqRCx3QkFBd0IsQ0FBQyxJQUF5QjtRQUNoRCxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixHQUFHLElBQUk7WUFDUCxJQUFJLEVBQUUsR0FBRyxFQUFFO2dCQUNULElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGdEQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDeEIsR0FBRyxFQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLHlCQUF5QjtvQkFDdkMsS0FBSyxJQUFJLEVBQUUsR0FBRyxpQ0FBaUM7b0JBQy9DLEtBQUssSUFBSSxFQUFFLEdBQUcsa0NBQWtDO29CQUNoRCxLQUFLLElBQUksSUFBSSxJQUFJLGNBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxnQ0FBZ0M7aUJBQ25GLENBQUM7WUFDSixDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELG1FQUFtRTtJQUNuRSxvQkFBb0IsQ0FBQyxJQUF5QjtRQUM1QyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNqQixHQUFHLElBQUk7WUFDUCxJQUFJLEVBQUUsR0FBRyxFQUFFO2dCQUNULElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyw0QkFBNEIsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGdEQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FDeEIsR0FBRyxFQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLHlCQUF5QjtvQkFDdkMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsb0RBQW9EO29CQUN0RSxLQUFLLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsY0FBYyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxrQ0FBa0M7b0JBQ2xHLEtBQUssSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLGtDQUFrQztvQkFDcEQsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxxREFBcUQ7b0JBQ3hFLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxnQ0FBZ0M7aUJBQ25HLENBQUM7WUFDSixDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFZO1FBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQVk7UUFDbEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQVk7UUFDaEQsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELE1BQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFELE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUQsTUFBTSxjQUFjLEdBQUcsWUFBWSxHQUFHLGFBQWEsR0FBRyxXQUFXLEdBQUcsY0FBYyxDQUFDO1FBRW5GLElBQUksY0FBYyxLQUFLLENBQUMsRUFBRTtZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUMsT0FBTztTQUNSO1FBRUQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLGNBQWMsQ0FBQyxFQUFFO1lBQzVGLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvQyxPQUFPO1NBQ1I7UUFFRCxJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7WUFDeEIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBRWpCLElBQUksWUFBWSxJQUFJLFdBQVcsRUFBRTtnQkFDL0IsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCO2lCQUFNLElBQUksV0FBVyxJQUFJLGFBQWEsRUFBRTtnQkFDdkMsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDcEI7aUJBQU0sSUFBSSxhQUFhLElBQUksY0FBYyxFQUFFO2dCQUMxQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUN6QjtZQUVELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDbkQsT0FBTztTQUNSO1FBRUQsSUFBSSxjQUFjLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztZQUVqQixJQUFJLFdBQVcsRUFBRTtnQkFDZixRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDeEI7aUJBQU0sSUFBSSxhQUFhLEVBQUU7Z0JBQ3hCLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO2FBQ3BCO2lCQUFNLElBQUksY0FBYyxFQUFFO2dCQUN6QixRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUN6QjtZQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDakQsT0FBTztTQUNSO0lBQ0gsQ0FBQztJQUVELGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFZO1FBQ3JELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVELE1BQU0sY0FBYyxHQUFHLFlBQVksR0FBRyxhQUFhLEdBQUcsV0FBVyxHQUFHLGNBQWMsQ0FBQztRQUVuRixJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7WUFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLE9BQU87U0FDUjtRQUVELElBQUksY0FBYyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxjQUFjLENBQUMsRUFBRTtZQUM1RixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0MsT0FBTztTQUNSO1FBRUQsSUFBSSxjQUFjLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztZQUVqQixJQUFJLFlBQVksSUFBSSxXQUFXLEVBQUU7Z0JBQy9CLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUN4QjtpQkFBTSxJQUFJLFdBQVcsSUFBSSxhQUFhLEVBQUU7Z0JBQ3ZDLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO2FBQ3BCO2lCQUFNLElBQUksYUFBYSxJQUFJLGNBQWMsRUFBRTtnQkFDMUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDekI7WUFFRCxJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE9BQU87U0FDUjtRQUVELElBQUksY0FBYyxLQUFLLENBQUMsRUFBRTtZQUN4QixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFFakIsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCO2lCQUFNLElBQUksYUFBYSxFQUFFO2dCQUN4QixRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUNwQjtpQkFBTSxJQUFJLGNBQWMsRUFBRTtnQkFDekIsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDekI7WUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELE9BQU87U0FDUjtJQUNILENBQUM7SUFFRCxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQVk7UUFDL0MsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELE1BQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFELE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUQsTUFBTSxjQUFjLEdBQUcsWUFBWSxHQUFHLGFBQWEsR0FBRyxXQUFXLEdBQUcsY0FBYyxDQUFDO1FBRW5GLElBQUksY0FBYyxLQUFLLENBQUMsRUFBRTtZQUN4QixJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDakMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDckMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoRSxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFZO1FBQ3RELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVELE1BQU0sY0FBYyxHQUFHLFlBQVksR0FBRyxhQUFhLEdBQUcsV0FBVyxHQUFHLGNBQWMsQ0FBQztRQUVuRixJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7WUFDeEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqRSxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2pDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0RSxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3JDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckUsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7OztBQ2xUYyxTQUFTLGtCQUFrQixDQUFDLEVBQ3pDLGNBQWMsRUFDZCxhQUFhLEVBQ2IsYUFBYSxFQUNiLGlCQUFpQixFQUNqQixPQUFPLEVBQ1U7SUFDakIsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUNoQyxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBRWpDLElBQUksY0FBYyxJQUFJLENBQUMsSUFBSSxhQUFhLElBQUksQ0FBQyxJQUFJLGFBQWEsSUFBSSxDQUFDLElBQUksT0FBTyxJQUFJLENBQUMsRUFBRTtRQUNuRixPQUFPO1lBQ0wsTUFBTSxFQUFFLENBQUM7WUFDVCxLQUFLLEVBQUUsQ0FBQztZQUNSLFNBQVMsRUFBRSxDQUFDO1lBQ1osU0FBUyxFQUFFLENBQUM7U0FDYixDQUFDO0tBQ0g7SUFFRCxNQUFNLENBQUMsR0FBRyxjQUFjLEdBQUcsYUFBYSxDQUFDO0lBRXpDLCtDQUErQztJQUMvQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RCxnREFBZ0Q7SUFDaEQsSUFBSSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyx5REFBeUQ7SUFDekQsSUFBSSxpQkFBaUIsSUFBSSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsQ0FBQztRQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLENBQUM7SUFDeEYsaUNBQWlDO0lBQ2pDLElBQUksUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUN2QyxTQUFTLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0lBQ25DLDBEQUEwRDtJQUMxRCx3QkFBd0I7SUFDeEIsb0RBQW9EO0lBQ3BELFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDekQsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUMsc0ZBQXNGO0lBQ3RGLElBQUksUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLGFBQWEsSUFBSSxDQUFDLGlCQUFpQixJQUFJLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNwRyxJQUFJLGlCQUFpQixJQUFJLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUU7WUFDdkQsUUFBUSxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztZQUMvQixJQUFJLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQ3hDO2FBQU07WUFDTCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqQjtRQUNELFNBQVMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDbkMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RCxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUMzQztJQUVELE9BQU87UUFDTCxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbkIsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2xCLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyQixTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDdEIsQ0FBQztBQUNKLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyRWMsU0FBUyxXQUFXLENBQUMsR0FBVyxFQUFFLElBQVk7SUFDM0QsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztJQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUNoQixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDYixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ1BzQztBQUd4QixTQUFTLE9BQU8sQ0FBQyxJQUFZO0lBQzFDLFFBQVEsSUFBSSxFQUFFO1FBQ1osS0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN4QixPQUFPLHdEQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3ZCLEtBQUssdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNyQyxPQUFPLHdEQUFLLENBQUMsWUFBWSxDQUFDO1FBQzVCO1lBQ0UsT0FBTyx3REFBSyxDQUFDLElBQUksQ0FBQztLQUNyQjtBQUNILENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNWRCxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQTRCLEVBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUVyRyxTQUFTLFNBQVMsQ0FBQyxNQUFxQixFQUFFLEdBQUcsT0FBd0I7SUFDbEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNO1FBQUUsT0FBTyxNQUFNLENBQUM7SUFDbkMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQy9CLElBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFBRSxPQUFPLE1BQU0sQ0FBQztJQUNsRixNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBVyxFQUFRLEVBQUU7UUFDaEQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVoQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM1RCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDO1NBQzNCO2FBQU0sSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3pELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDdEU7YUFBTTtZQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUM7U0FDM0I7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNwQkQsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFrQjtJQUMxQyxNQUFNLFdBQVcsR0FBRyxFQUFFLEdBQUcsUUFBUSxFQUFFLENBQUM7SUFFcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtRQUM3RCxNQUFNLDRDQUE0QyxDQUFDO0tBQ3BEO0lBRUQsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFO1FBQ3hCLFdBQVcsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNyRDtTQUFNO1FBQ0wsV0FBVyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7S0FDMUI7SUFFRCxXQUFXLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBNEMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRyxHQUFHLFNBQVM7UUFDWixNQUFNLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7S0FDakMsQ0FBQyxDQUFDLENBQUM7SUFFSixPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDO0FBRWMsU0FBUyxlQUFlLENBQUMsT0FBd0I7SUFDOUQsTUFBTSxVQUFVLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDO0lBRWxDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QyxVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLFVBQVUsQ0FBQyxZQUFZLEdBQUc7UUFDeEIsR0FBRyxVQUFVLENBQUMsWUFBWTtRQUMxQixrQkFBa0IsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQztRQUN2RSxTQUFTLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDO1FBQ3BELE1BQU0sRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7S0FDL0MsQ0FBQztJQUVGLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3JFLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuRTtJQUVELFVBQVUsQ0FBQyxXQUFXLEdBQUc7UUFDdkIsR0FBRyxVQUFVLENBQUMsV0FBVztLQUMxQixDQUFDO0lBQ0YsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTtRQUNuQyxVQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3JGO0lBRUQsSUFBSSxVQUFVLENBQUMsb0JBQW9CLEVBQUU7UUFDbkMsVUFBVSxDQUFDLG9CQUFvQixHQUFHO1lBQ2hDLEdBQUcsVUFBVSxDQUFDLG9CQUFvQjtTQUNuQyxDQUFDO1FBQ0YsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFO1lBQzVDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZHO0tBQ0Y7SUFFRCxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRTtRQUNoQyxVQUFVLENBQUMsaUJBQWlCLEdBQUc7WUFDN0IsR0FBRyxVQUFVLENBQUMsaUJBQWlCO1NBQ2hDLENBQUM7UUFDRixJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUU7WUFDekMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDakc7S0FDRjtJQUVELElBQUksVUFBVSxDQUFDLGlCQUFpQixFQUFFO1FBQ2hDLFVBQVUsQ0FBQyxpQkFBaUIsR0FBRztZQUM3QixHQUFHLFVBQVUsQ0FBQyxpQkFBaUI7U0FDaEMsQ0FBQztRQUNGLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRTtZQUN6QyxVQUFVLENBQUMsaUJBQWlCLENBQUMsUUFBUSxHQUFHLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNqRztLQUNGO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQzVFYyxLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQVc7SUFDakQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQzdCLE1BQU0sR0FBRyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDakMsR0FBRyxDQUFDLE1BQU0sR0FBRztZQUNYLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7WUFDaEMsTUFBTSxDQUFDLFNBQVMsR0FBRztnQkFDakIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFnQixDQUFDLENBQUM7WUFDbkMsQ0FBQyxDQUFDO1lBQ0YsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDO1FBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckIsR0FBRyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7UUFDMUIsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2IsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBRWREO0FBQ0EsaUVBQWU7QUFDZjtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ0hELGlFQUFlLGNBQWMsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsR0FBRyx5Q0FBeUM7Ozs7Ozs7Ozs7Ozs7OztBQ0FwSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2U7QUFDZjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2pCcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsZ0JBQWdCLFNBQVM7QUFDekI7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU8sd0RBQVE7QUFDZjtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsaUVBQWUsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaENTO0FBQ047QUFDc0I7O0FBRWpEO0FBQ0EsTUFBTSxrREFBTTtBQUNaLFdBQVcsa0RBQU07QUFDakI7O0FBRUE7QUFDQSxpREFBaUQsK0NBQUcsS0FBSzs7QUFFekQ7QUFDQSxtQ0FBbUM7O0FBRW5DO0FBQ0E7O0FBRUEsb0JBQW9CLFFBQVE7QUFDNUI7QUFDQTs7QUFFQTtBQUNBOztBQUVBLFNBQVMsOERBQWU7QUFDeEI7O0FBRUEsaUVBQWUsRUFBRTs7Ozs7Ozs7Ozs7Ozs7OztBQzVCYzs7QUFFL0I7QUFDQSxxQ0FBcUMsaURBQUs7QUFDMUM7O0FBRUEsaUVBQWUsUUFBUTs7Ozs7O1VDTnZCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTmlEO0FBQ0w7QUFDWTtBQUNNO0FBQ1E7QUFDSTtBQUNwQztBQUNJO0FBQ0k7QUFDRTtBQUNNO0FBRTlCO0FBYXRCO0FBRUYsaUVBQWUsMkRBQWEsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9ub2RlX21vZHVsZXMvcXJjb2RlLWdlbmVyYXRvci9xcmNvZGUuanMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvY29ybmVyRG90VHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvY29ybmVyU3F1YXJlVHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvZG90VHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvZHJhd1R5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvbkxldmVscy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25QZXJjZW50cy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvbnN0YW50cy9ncmFkaWVudFR5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL21vZGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL3FyVHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvc2hhcGVUeXBlcy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvcmUvUVJDb2RlU3R5bGluZy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvcmUvUVJPcHRpb25zLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29yZS9RUlNWRy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2ZpZ3VyZXMvY29ybmVyRG90L1FSQ29ybmVyRG90LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9jb3JuZXJTcXVhcmUvUVJDb3JuZXJTcXVhcmUudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9maWd1cmVzL2RvdC9RUkRvdC50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL3Rvb2xzL2NhbGN1bGF0ZUltYWdlU2l6ZS50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL3Rvb2xzL2Rvd25sb2FkVVJJLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdG9vbHMvZ2V0TW9kZS50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL3Rvb2xzL21lcmdlLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdG9vbHMvc2FuaXRpemVPcHRpb25zLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdG9vbHMvdG9EYXRhVXJsLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdHlwZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvbmF0aXZlLmpzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JlZ2V4LmpzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JuZy5qcyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9zdHJpbmdpZnkuanMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjQuanMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdmFsaWRhdGUuanMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJRUkNvZGVTdHlsaW5nXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIlFSQ29kZVN0eWxpbmdcIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCAoKSA9PiB7XG5yZXR1cm4gIiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyBRUiBDb2RlIEdlbmVyYXRvciBmb3IgSmF2YVNjcmlwdFxuLy9cbi8vIENvcHlyaWdodCAoYykgMjAwOSBLYXp1aGlrbyBBcmFzZVxuLy9cbi8vIFVSTDogaHR0cDovL3d3dy5kLXByb2plY3QuY29tL1xuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbi8vICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuLy9cbi8vIFRoZSB3b3JkICdRUiBDb2RlJyBpcyByZWdpc3RlcmVkIHRyYWRlbWFyayBvZlxuLy8gREVOU08gV0FWRSBJTkNPUlBPUkFURURcbi8vICBodHRwOi8vd3d3LmRlbnNvLXdhdmUuY29tL3FyY29kZS9mYXFwYXRlbnQtZS5odG1sXG4vL1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHFyY29kZSA9IGZ1bmN0aW9uKCkge1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyY29kZVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qKlxuICAgKiBxcmNvZGVcbiAgICogQHBhcmFtIHR5cGVOdW1iZXIgMSB0byA0MFxuICAgKiBAcGFyYW0gZXJyb3JDb3JyZWN0aW9uTGV2ZWwgJ0wnLCdNJywnUScsJ0gnXG4gICAqL1xuICB2YXIgcXJjb2RlID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcblxuICAgIHZhciBQQUQwID0gMHhFQztcbiAgICB2YXIgUEFEMSA9IDB4MTE7XG5cbiAgICB2YXIgX3R5cGVOdW1iZXIgPSB0eXBlTnVtYmVyO1xuICAgIHZhciBfZXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBRUkVycm9yQ29ycmVjdGlvbkxldmVsW2Vycm9yQ29ycmVjdGlvbkxldmVsXTtcbiAgICB2YXIgX21vZHVsZXMgPSBudWxsO1xuICAgIHZhciBfbW9kdWxlQ291bnQgPSAwO1xuICAgIHZhciBfZGF0YUNhY2hlID0gbnVsbDtcbiAgICB2YXIgX2RhdGFMaXN0ID0gW107XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIHZhciBtYWtlSW1wbCA9IGZ1bmN0aW9uKHRlc3QsIG1hc2tQYXR0ZXJuKSB7XG5cbiAgICAgIF9tb2R1bGVDb3VudCA9IF90eXBlTnVtYmVyICogNCArIDE3O1xuICAgICAgX21vZHVsZXMgPSBmdW5jdGlvbihtb2R1bGVDb3VudCkge1xuICAgICAgICB2YXIgbW9kdWxlcyA9IG5ldyBBcnJheShtb2R1bGVDb3VudCk7XG4gICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50OyByb3cgKz0gMSkge1xuICAgICAgICAgIG1vZHVsZXNbcm93XSA9IG5ldyBBcnJheShtb2R1bGVDb3VudCk7XG4gICAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICBtb2R1bGVzW3Jvd11bY29sXSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtb2R1bGVzO1xuICAgICAgfShfbW9kdWxlQ291bnQpO1xuXG4gICAgICBzZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKDAsIDApO1xuICAgICAgc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybihfbW9kdWxlQ291bnQgLSA3LCAwKTtcbiAgICAgIHNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4oMCwgX21vZHVsZUNvdW50IC0gNyk7XG4gICAgICBzZXR1cFBvc2l0aW9uQWRqdXN0UGF0dGVybigpO1xuICAgICAgc2V0dXBUaW1pbmdQYXR0ZXJuKCk7XG4gICAgICBzZXR1cFR5cGVJbmZvKHRlc3QsIG1hc2tQYXR0ZXJuKTtcblxuICAgICAgaWYgKF90eXBlTnVtYmVyID49IDcpIHtcbiAgICAgICAgc2V0dXBUeXBlTnVtYmVyKHRlc3QpO1xuICAgICAgfVxuXG4gICAgICBpZiAoX2RhdGFDYWNoZSA9PSBudWxsKSB7XG4gICAgICAgIF9kYXRhQ2FjaGUgPSBjcmVhdGVEYXRhKF90eXBlTnVtYmVyLCBfZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIF9kYXRhTGlzdCk7XG4gICAgICB9XG5cbiAgICAgIG1hcERhdGEoX2RhdGFDYWNoZSwgbWFza1BhdHRlcm4pO1xuICAgIH07XG5cbiAgICB2YXIgc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybiA9IGZ1bmN0aW9uKHJvdywgY29sKSB7XG5cbiAgICAgIGZvciAodmFyIHIgPSAtMTsgciA8PSA3OyByICs9IDEpIHtcblxuICAgICAgICBpZiAocm93ICsgciA8PSAtMSB8fCBfbW9kdWxlQ291bnQgPD0gcm93ICsgcikgY29udGludWU7XG5cbiAgICAgICAgZm9yICh2YXIgYyA9IC0xOyBjIDw9IDc7IGMgKz0gMSkge1xuXG4gICAgICAgICAgaWYgKGNvbCArIGMgPD0gLTEgfHwgX21vZHVsZUNvdW50IDw9IGNvbCArIGMpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgaWYgKCAoMCA8PSByICYmIHIgPD0gNiAmJiAoYyA9PSAwIHx8IGMgPT0gNikgKVxuICAgICAgICAgICAgICB8fCAoMCA8PSBjICYmIGMgPD0gNiAmJiAociA9PSAwIHx8IHIgPT0gNikgKVxuICAgICAgICAgICAgICB8fCAoMiA8PSByICYmIHIgPD0gNCAmJiAyIDw9IGMgJiYgYyA8PSA0KSApIHtcbiAgICAgICAgICAgIF9tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX21vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGdldEJlc3RNYXNrUGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgbWluTG9zdFBvaW50ID0gMDtcbiAgICAgIHZhciBwYXR0ZXJuID0gMDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpICs9IDEpIHtcblxuICAgICAgICBtYWtlSW1wbCh0cnVlLCBpKTtcblxuICAgICAgICB2YXIgbG9zdFBvaW50ID0gUVJVdGlsLmdldExvc3RQb2ludChfdGhpcyk7XG5cbiAgICAgICAgaWYgKGkgPT0gMCB8fCBtaW5Mb3N0UG9pbnQgPiBsb3N0UG9pbnQpIHtcbiAgICAgICAgICBtaW5Mb3N0UG9pbnQgPSBsb3N0UG9pbnQ7XG4gICAgICAgICAgcGF0dGVybiA9IGk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhdHRlcm47XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFRpbWluZ1BhdHRlcm4gPSBmdW5jdGlvbigpIHtcblxuICAgICAgZm9yICh2YXIgciA9IDg7IHIgPCBfbW9kdWxlQ291bnQgLSA4OyByICs9IDEpIHtcbiAgICAgICAgaWYgKF9tb2R1bGVzW3JdWzZdICE9IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBfbW9kdWxlc1tyXVs2XSA9IChyICUgMiA9PSAwKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgYyA9IDg7IGMgPCBfbW9kdWxlQ291bnQgLSA4OyBjICs9IDEpIHtcbiAgICAgICAgaWYgKF9tb2R1bGVzWzZdW2NdICE9IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBfbW9kdWxlc1s2XVtjXSA9IChjICUgMiA9PSAwKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNldHVwUG9zaXRpb25BZGp1c3RQYXR0ZXJuID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBwb3MgPSBRUlV0aWwuZ2V0UGF0dGVyblBvc2l0aW9uKF90eXBlTnVtYmVyKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb3MubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvcy5sZW5ndGg7IGogKz0gMSkge1xuXG4gICAgICAgICAgdmFyIHJvdyA9IHBvc1tpXTtcbiAgICAgICAgICB2YXIgY29sID0gcG9zW2pdO1xuXG4gICAgICAgICAgaWYgKF9tb2R1bGVzW3Jvd11bY29sXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKHZhciByID0gLTI7IHIgPD0gMjsgciArPSAxKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGMgPSAtMjsgYyA8PSAyOyBjICs9IDEpIHtcblxuICAgICAgICAgICAgICBpZiAociA9PSAtMiB8fCByID09IDIgfHwgYyA9PSAtMiB8fCBjID09IDJcbiAgICAgICAgICAgICAgICAgIHx8IChyID09IDAgJiYgYyA9PSAwKSApIHtcbiAgICAgICAgICAgICAgICBfbW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX21vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0dXBUeXBlTnVtYmVyID0gZnVuY3Rpb24odGVzdCkge1xuXG4gICAgICB2YXIgYml0cyA9IFFSVXRpbC5nZXRCQ0hUeXBlTnVtYmVyKF90eXBlTnVtYmVyKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxODsgaSArPSAxKSB7XG4gICAgICAgIHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuICAgICAgICBfbW9kdWxlc1tNYXRoLmZsb29yKGkgLyAzKV1baSAlIDMgKyBfbW9kdWxlQ291bnQgLSA4IC0gM10gPSBtb2Q7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcbiAgICAgICAgX21vZHVsZXNbaSAlIDMgKyBfbW9kdWxlQ291bnQgLSA4IC0gM11bTWF0aC5mbG9vcihpIC8gMyldID0gbW9kO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0dXBUeXBlSW5mbyA9IGZ1bmN0aW9uKHRlc3QsIG1hc2tQYXR0ZXJuKSB7XG5cbiAgICAgIHZhciBkYXRhID0gKF9lcnJvckNvcnJlY3Rpb25MZXZlbCA8PCAzKSB8IG1hc2tQYXR0ZXJuO1xuICAgICAgdmFyIGJpdHMgPSBRUlV0aWwuZ2V0QkNIVHlwZUluZm8oZGF0YSk7XG5cbiAgICAgIC8vIHZlcnRpY2FsXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE1OyBpICs9IDEpIHtcblxuICAgICAgICB2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcblxuICAgICAgICBpZiAoaSA8IDYpIHtcbiAgICAgICAgICBfbW9kdWxlc1tpXVs4XSA9IG1vZDtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgOCkge1xuICAgICAgICAgIF9tb2R1bGVzW2kgKyAxXVs4XSA9IG1vZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfbW9kdWxlc1tfbW9kdWxlQ291bnQgLSAxNSArIGldWzhdID0gbW9kO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGhvcml6b250YWxcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTU7IGkgKz0gMSkge1xuXG4gICAgICAgIHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuXG4gICAgICAgIGlmIChpIDwgOCkge1xuICAgICAgICAgIF9tb2R1bGVzWzhdW19tb2R1bGVDb3VudCAtIGkgLSAxXSA9IG1vZDtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgOSkge1xuICAgICAgICAgIF9tb2R1bGVzWzhdWzE1IC0gaSAtIDEgKyAxXSA9IG1vZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfbW9kdWxlc1s4XVsxNSAtIGkgLSAxXSA9IG1vZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBmaXhlZCBtb2R1bGVcbiAgICAgIF9tb2R1bGVzW19tb2R1bGVDb3VudCAtIDhdWzhdID0gKCF0ZXN0KTtcbiAgICB9O1xuXG4gICAgdmFyIG1hcERhdGEgPSBmdW5jdGlvbihkYXRhLCBtYXNrUGF0dGVybikge1xuXG4gICAgICB2YXIgaW5jID0gLTE7XG4gICAgICB2YXIgcm93ID0gX21vZHVsZUNvdW50IC0gMTtcbiAgICAgIHZhciBiaXRJbmRleCA9IDc7XG4gICAgICB2YXIgYnl0ZUluZGV4ID0gMDtcbiAgICAgIHZhciBtYXNrRnVuYyA9IFFSVXRpbC5nZXRNYXNrRnVuY3Rpb24obWFza1BhdHRlcm4pO1xuXG4gICAgICBmb3IgKHZhciBjb2wgPSBfbW9kdWxlQ291bnQgLSAxOyBjb2wgPiAwOyBjb2wgLT0gMikge1xuXG4gICAgICAgIGlmIChjb2wgPT0gNikgY29sIC09IDE7XG5cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcblxuICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgMjsgYyArPSAxKSB7XG5cbiAgICAgICAgICAgIGlmIChfbW9kdWxlc1tyb3ddW2NvbCAtIGNdID09IG51bGwpIHtcblxuICAgICAgICAgICAgICB2YXIgZGFyayA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIGlmIChieXRlSW5kZXggPCBkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGRhcmsgPSAoICggKGRhdGFbYnl0ZUluZGV4XSA+Pj4gYml0SW5kZXgpICYgMSkgPT0gMSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB2YXIgbWFzayA9IG1hc2tGdW5jKHJvdywgY29sIC0gYyk7XG5cbiAgICAgICAgICAgICAgaWYgKG1hc2spIHtcbiAgICAgICAgICAgICAgICBkYXJrID0gIWRhcms7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBfbW9kdWxlc1tyb3ddW2NvbCAtIGNdID0gZGFyaztcbiAgICAgICAgICAgICAgYml0SW5kZXggLT0gMTtcblxuICAgICAgICAgICAgICBpZiAoYml0SW5kZXggPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBieXRlSW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICBiaXRJbmRleCA9IDc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByb3cgKz0gaW5jO1xuXG4gICAgICAgICAgaWYgKHJvdyA8IDAgfHwgX21vZHVsZUNvdW50IDw9IHJvdykge1xuICAgICAgICAgICAgcm93IC09IGluYztcbiAgICAgICAgICAgIGluYyA9IC1pbmM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0ZUJ5dGVzID0gZnVuY3Rpb24oYnVmZmVyLCByc0Jsb2Nrcykge1xuXG4gICAgICB2YXIgb2Zmc2V0ID0gMDtcblxuICAgICAgdmFyIG1heERjQ291bnQgPSAwO1xuICAgICAgdmFyIG1heEVjQ291bnQgPSAwO1xuXG4gICAgICB2YXIgZGNkYXRhID0gbmV3IEFycmF5KHJzQmxvY2tzLmxlbmd0aCk7XG4gICAgICB2YXIgZWNkYXRhID0gbmV3IEFycmF5KHJzQmxvY2tzLmxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgcnNCbG9ja3MubGVuZ3RoOyByICs9IDEpIHtcblxuICAgICAgICB2YXIgZGNDb3VudCA9IHJzQmxvY2tzW3JdLmRhdGFDb3VudDtcbiAgICAgICAgdmFyIGVjQ291bnQgPSByc0Jsb2Nrc1tyXS50b3RhbENvdW50IC0gZGNDb3VudDtcblxuICAgICAgICBtYXhEY0NvdW50ID0gTWF0aC5tYXgobWF4RGNDb3VudCwgZGNDb3VudCk7XG4gICAgICAgIG1heEVjQ291bnQgPSBNYXRoLm1heChtYXhFY0NvdW50LCBlY0NvdW50KTtcblxuICAgICAgICBkY2RhdGFbcl0gPSBuZXcgQXJyYXkoZGNDb3VudCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkY2RhdGFbcl0ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBkY2RhdGFbcl1baV0gPSAweGZmICYgYnVmZmVyLmdldEJ1ZmZlcigpW2kgKyBvZmZzZXRdO1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldCArPSBkY0NvdW50O1xuXG4gICAgICAgIHZhciByc1BvbHkgPSBRUlV0aWwuZ2V0RXJyb3JDb3JyZWN0UG9seW5vbWlhbChlY0NvdW50KTtcbiAgICAgICAgdmFyIHJhd1BvbHkgPSBxclBvbHlub21pYWwoZGNkYXRhW3JdLCByc1BvbHkuZ2V0TGVuZ3RoKCkgLSAxKTtcblxuICAgICAgICB2YXIgbW9kUG9seSA9IHJhd1BvbHkubW9kKHJzUG9seSk7XG4gICAgICAgIGVjZGF0YVtyXSA9IG5ldyBBcnJheShyc1BvbHkuZ2V0TGVuZ3RoKCkgLSAxKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlY2RhdGFbcl0ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICB2YXIgbW9kSW5kZXggPSBpICsgbW9kUG9seS5nZXRMZW5ndGgoKSAtIGVjZGF0YVtyXS5sZW5ndGg7XG4gICAgICAgICAgZWNkYXRhW3JdW2ldID0gKG1vZEluZGV4ID49IDApPyBtb2RQb2x5LmdldEF0KG1vZEluZGV4KSA6IDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHRvdGFsQ29kZUNvdW50ID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnNCbG9ja3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdG90YWxDb2RlQ291bnQgKz0gcnNCbG9ja3NbaV0udG90YWxDb3VudDtcbiAgICAgIH1cblxuICAgICAgdmFyIGRhdGEgPSBuZXcgQXJyYXkodG90YWxDb2RlQ291bnQpO1xuICAgICAgdmFyIGluZGV4ID0gMDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXhEY0NvdW50OyBpICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIgKz0gMSkge1xuICAgICAgICAgIGlmIChpIDwgZGNkYXRhW3JdLmxlbmd0aCkge1xuICAgICAgICAgICAgZGF0YVtpbmRleF0gPSBkY2RhdGFbcl1baV07XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1heEVjQ291bnQ7IGkgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IHJzQmxvY2tzLmxlbmd0aDsgciArPSAxKSB7XG4gICAgICAgICAgaWYgKGkgPCBlY2RhdGFbcl0ubGVuZ3RoKSB7XG4gICAgICAgICAgICBkYXRhW2luZGV4XSA9IGVjZGF0YVtyXVtpXTtcbiAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlRGF0YSA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsLCBkYXRhTGlzdCkge1xuXG4gICAgICB2YXIgcnNCbG9ja3MgPSBRUlJTQmxvY2suZ2V0UlNCbG9ja3ModHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwpO1xuXG4gICAgICB2YXIgYnVmZmVyID0gcXJCaXRCdWZmZXIoKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhTGlzdC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgZGF0YSA9IGRhdGFMaXN0W2ldO1xuICAgICAgICBidWZmZXIucHV0KGRhdGEuZ2V0TW9kZSgpLCA0KTtcbiAgICAgICAgYnVmZmVyLnB1dChkYXRhLmdldExlbmd0aCgpLCBRUlV0aWwuZ2V0TGVuZ3RoSW5CaXRzKGRhdGEuZ2V0TW9kZSgpLCB0eXBlTnVtYmVyKSApO1xuICAgICAgICBkYXRhLndyaXRlKGJ1ZmZlcik7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbGMgbnVtIG1heCBkYXRhLlxuICAgICAgdmFyIHRvdGFsRGF0YUNvdW50ID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnNCbG9ja3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdG90YWxEYXRhQ291bnQgKz0gcnNCbG9ja3NbaV0uZGF0YUNvdW50O1xuICAgICAgfVxuXG4gICAgICBpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpID4gdG90YWxEYXRhQ291bnQgKiA4KSB7XG4gICAgICAgIHRocm93ICdjb2RlIGxlbmd0aCBvdmVyZmxvdy4gKCdcbiAgICAgICAgICArIGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKVxuICAgICAgICAgICsgJz4nXG4gICAgICAgICAgKyB0b3RhbERhdGFDb3VudCAqIDhcbiAgICAgICAgICArICcpJztcbiAgICAgIH1cblxuICAgICAgLy8gZW5kIGNvZGVcbiAgICAgIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgKyA0IDw9IHRvdGFsRGF0YUNvdW50ICogOCkge1xuICAgICAgICBidWZmZXIucHV0KDAsIDQpO1xuICAgICAgfVxuXG4gICAgICAvLyBwYWRkaW5nXG4gICAgICB3aGlsZSAoYnVmZmVyLmdldExlbmd0aEluQml0cygpICUgOCAhPSAwKSB7XG4gICAgICAgIGJ1ZmZlci5wdXRCaXQoZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICAvLyBwYWRkaW5nXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuXG4gICAgICAgIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPj0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnVmZmVyLnB1dChQQUQwLCA4KTtcblxuICAgICAgICBpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpID49IHRvdGFsRGF0YUNvdW50ICogOCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJ1ZmZlci5wdXQoUEFEMSwgOCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjcmVhdGVCeXRlcyhidWZmZXIsIHJzQmxvY2tzKTtcbiAgICB9O1xuXG4gICAgX3RoaXMuYWRkRGF0YSA9IGZ1bmN0aW9uKGRhdGEsIG1vZGUpIHtcblxuICAgICAgbW9kZSA9IG1vZGUgfHwgJ0J5dGUnO1xuXG4gICAgICB2YXIgbmV3RGF0YSA9IG51bGw7XG5cbiAgICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICBjYXNlICdOdW1lcmljJyA6XG4gICAgICAgIG5ld0RhdGEgPSBxck51bWJlcihkYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdBbHBoYW51bWVyaWMnIDpcbiAgICAgICAgbmV3RGF0YSA9IHFyQWxwaGFOdW0oZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQnl0ZScgOlxuICAgICAgICBuZXdEYXRhID0gcXI4Qml0Qnl0ZShkYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdLYW5qaScgOlxuICAgICAgICBuZXdEYXRhID0gcXJLYW5qaShkYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0IDpcbiAgICAgICAgdGhyb3cgJ21vZGU6JyArIG1vZGU7XG4gICAgICB9XG5cbiAgICAgIF9kYXRhTGlzdC5wdXNoKG5ld0RhdGEpO1xuICAgICAgX2RhdGFDYWNoZSA9IG51bGw7XG4gICAgfTtcblxuICAgIF90aGlzLmlzRGFyayA9IGZ1bmN0aW9uKHJvdywgY29sKSB7XG4gICAgICBpZiAocm93IDwgMCB8fCBfbW9kdWxlQ291bnQgPD0gcm93IHx8IGNvbCA8IDAgfHwgX21vZHVsZUNvdW50IDw9IGNvbCkge1xuICAgICAgICB0aHJvdyByb3cgKyAnLCcgKyBjb2w7XG4gICAgICB9XG4gICAgICByZXR1cm4gX21vZHVsZXNbcm93XVtjb2xdO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRNb2R1bGVDb3VudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9tb2R1bGVDb3VudDtcbiAgICB9O1xuXG4gICAgX3RoaXMubWFrZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKF90eXBlTnVtYmVyIDwgMSkge1xuICAgICAgICB2YXIgdHlwZU51bWJlciA9IDE7XG5cbiAgICAgICAgZm9yICg7IHR5cGVOdW1iZXIgPCA0MDsgdHlwZU51bWJlcisrKSB7XG4gICAgICAgICAgdmFyIHJzQmxvY2tzID0gUVJSU0Jsb2NrLmdldFJTQmxvY2tzKHR5cGVOdW1iZXIsIF9lcnJvckNvcnJlY3Rpb25MZXZlbCk7XG4gICAgICAgICAgdmFyIGJ1ZmZlciA9IHFyQml0QnVmZmVyKCk7XG5cbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9kYXRhTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBfZGF0YUxpc3RbaV07XG4gICAgICAgICAgICBidWZmZXIucHV0KGRhdGEuZ2V0TW9kZSgpLCA0KTtcbiAgICAgICAgICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRMZW5ndGgoKSwgUVJVdGlsLmdldExlbmd0aEluQml0cyhkYXRhLmdldE1vZGUoKSwgdHlwZU51bWJlcikgKTtcbiAgICAgICAgICAgIGRhdGEud3JpdGUoYnVmZmVyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgdG90YWxEYXRhQ291bnQgPSAwO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnNCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRvdGFsRGF0YUNvdW50ICs9IHJzQmxvY2tzW2ldLmRhdGFDb3VudDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpIDw9IHRvdGFsRGF0YUNvdW50ICogOCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgX3R5cGVOdW1iZXIgPSB0eXBlTnVtYmVyO1xuICAgICAgfVxuXG4gICAgICBtYWtlSW1wbChmYWxzZSwgZ2V0QmVzdE1hc2tQYXR0ZXJuKCkgKTtcbiAgICB9O1xuXG4gICAgX3RoaXMuY3JlYXRlVGFibGVUYWcgPSBmdW5jdGlvbihjZWxsU2l6ZSwgbWFyZ2luKSB7XG5cbiAgICAgIGNlbGxTaXplID0gY2VsbFNpemUgfHwgMjtcbiAgICAgIG1hcmdpbiA9ICh0eXBlb2YgbWFyZ2luID09ICd1bmRlZmluZWQnKT8gY2VsbFNpemUgKiA0IDogbWFyZ2luO1xuXG4gICAgICB2YXIgcXJIdG1sID0gJyc7XG5cbiAgICAgIHFySHRtbCArPSAnPHRhYmxlIHN0eWxlPVwiJztcbiAgICAgIHFySHRtbCArPSAnIGJvcmRlci13aWR0aDogMHB4OyBib3JkZXItc3R5bGU6IG5vbmU7JztcbiAgICAgIHFySHRtbCArPSAnIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7JztcbiAgICAgIHFySHRtbCArPSAnIHBhZGRpbmc6IDBweDsgbWFyZ2luOiAnICsgbWFyZ2luICsgJ3B4Oyc7XG4gICAgICBxckh0bWwgKz0gJ1wiPic7XG4gICAgICBxckh0bWwgKz0gJzx0Ym9keT4nO1xuXG4gICAgICBmb3IgKHZhciByID0gMDsgciA8IF90aGlzLmdldE1vZHVsZUNvdW50KCk7IHIgKz0gMSkge1xuXG4gICAgICAgIHFySHRtbCArPSAnPHRyPic7XG5cbiAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCBfdGhpcy5nZXRNb2R1bGVDb3VudCgpOyBjICs9IDEpIHtcbiAgICAgICAgICBxckh0bWwgKz0gJzx0ZCBzdHlsZT1cIic7XG4gICAgICAgICAgcXJIdG1sICs9ICcgYm9yZGVyLXdpZHRoOiAwcHg7IGJvcmRlci1zdHlsZTogbm9uZTsnO1xuICAgICAgICAgIHFySHRtbCArPSAnIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7JztcbiAgICAgICAgICBxckh0bWwgKz0gJyBwYWRkaW5nOiAwcHg7IG1hcmdpbjogMHB4Oyc7XG4gICAgICAgICAgcXJIdG1sICs9ICcgd2lkdGg6ICcgKyBjZWxsU2l6ZSArICdweDsnO1xuICAgICAgICAgIHFySHRtbCArPSAnIGhlaWdodDogJyArIGNlbGxTaXplICsgJ3B4Oyc7XG4gICAgICAgICAgcXJIdG1sICs9ICcgYmFja2dyb3VuZC1jb2xvcjogJztcbiAgICAgICAgICBxckh0bWwgKz0gX3RoaXMuaXNEYXJrKHIsIGMpPyAnIzAwMDAwMCcgOiAnI2ZmZmZmZic7XG4gICAgICAgICAgcXJIdG1sICs9ICc7JztcbiAgICAgICAgICBxckh0bWwgKz0gJ1wiLz4nO1xuICAgICAgICB9XG5cbiAgICAgICAgcXJIdG1sICs9ICc8L3RyPic7XG4gICAgICB9XG5cbiAgICAgIHFySHRtbCArPSAnPC90Ym9keT4nO1xuICAgICAgcXJIdG1sICs9ICc8L3RhYmxlPic7XG5cbiAgICAgIHJldHVybiBxckh0bWw7XG4gICAgfTtcblxuICAgIF90aGlzLmNyZWF0ZVN2Z1RhZyA9IGZ1bmN0aW9uKGNlbGxTaXplLCBtYXJnaW4sIGFsdCwgdGl0bGUpIHtcblxuICAgICAgdmFyIG9wdHMgPSB7fTtcbiAgICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIENhbGxlZCBieSBvcHRpb25zLlxuICAgICAgICBvcHRzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAvLyBvdmVyd3JpdGUgY2VsbFNpemUgYW5kIG1hcmdpbi5cbiAgICAgICAgY2VsbFNpemUgPSBvcHRzLmNlbGxTaXplO1xuICAgICAgICBtYXJnaW4gPSBvcHRzLm1hcmdpbjtcbiAgICAgICAgYWx0ID0gb3B0cy5hbHQ7XG4gICAgICAgIHRpdGxlID0gb3B0cy50aXRsZTtcbiAgICAgIH1cblxuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAyO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDQgOiBtYXJnaW47XG5cbiAgICAgIC8vIENvbXBvc2UgYWx0IHByb3BlcnR5IHN1cnJvZ2F0ZVxuICAgICAgYWx0ID0gKHR5cGVvZiBhbHQgPT09ICdzdHJpbmcnKSA/IHt0ZXh0OiBhbHR9IDogYWx0IHx8IHt9O1xuICAgICAgYWx0LnRleHQgPSBhbHQudGV4dCB8fCBudWxsO1xuICAgICAgYWx0LmlkID0gKGFsdC50ZXh0KSA/IGFsdC5pZCB8fCAncXJjb2RlLWRlc2NyaXB0aW9uJyA6IG51bGw7XG5cbiAgICAgIC8vIENvbXBvc2UgdGl0bGUgcHJvcGVydHkgc3Vycm9nYXRlXG4gICAgICB0aXRsZSA9ICh0eXBlb2YgdGl0bGUgPT09ICdzdHJpbmcnKSA/IHt0ZXh0OiB0aXRsZX0gOiB0aXRsZSB8fCB7fTtcbiAgICAgIHRpdGxlLnRleHQgPSB0aXRsZS50ZXh0IHx8IG51bGw7XG4gICAgICB0aXRsZS5pZCA9ICh0aXRsZS50ZXh0KSA/IHRpdGxlLmlkIHx8ICdxcmNvZGUtdGl0bGUnIDogbnVsbDtcblxuICAgICAgdmFyIHNpemUgPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpICogY2VsbFNpemUgKyBtYXJnaW4gKiAyO1xuICAgICAgdmFyIGMsIG1jLCByLCBtciwgcXJTdmc9JycsIHJlY3Q7XG5cbiAgICAgIHJlY3QgPSAnbCcgKyBjZWxsU2l6ZSArICcsMCAwLCcgKyBjZWxsU2l6ZSArXG4gICAgICAgICcgLScgKyBjZWxsU2l6ZSArICcsMCAwLC0nICsgY2VsbFNpemUgKyAneiAnO1xuXG4gICAgICBxclN2ZyArPSAnPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiJztcbiAgICAgIHFyU3ZnICs9ICFvcHRzLnNjYWxhYmxlID8gJyB3aWR0aD1cIicgKyBzaXplICsgJ3B4XCIgaGVpZ2h0PVwiJyArIHNpemUgKyAncHhcIicgOiAnJztcbiAgICAgIHFyU3ZnICs9ICcgdmlld0JveD1cIjAgMCAnICsgc2l6ZSArICcgJyArIHNpemUgKyAnXCIgJztcbiAgICAgIHFyU3ZnICs9ICcgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaW5ZTWluIG1lZXRcIic7XG4gICAgICBxclN2ZyArPSAodGl0bGUudGV4dCB8fCBhbHQudGV4dCkgPyAnIHJvbGU9XCJpbWdcIiBhcmlhLWxhYmVsbGVkYnk9XCInICtcbiAgICAgICAgICBlc2NhcGVYbWwoW3RpdGxlLmlkLCBhbHQuaWRdLmpvaW4oJyAnKS50cmltKCkgKSArICdcIicgOiAnJztcbiAgICAgIHFyU3ZnICs9ICc+JztcbiAgICAgIHFyU3ZnICs9ICh0aXRsZS50ZXh0KSA/ICc8dGl0bGUgaWQ9XCInICsgZXNjYXBlWG1sKHRpdGxlLmlkKSArICdcIj4nICtcbiAgICAgICAgICBlc2NhcGVYbWwodGl0bGUudGV4dCkgKyAnPC90aXRsZT4nIDogJyc7XG4gICAgICBxclN2ZyArPSAoYWx0LnRleHQpID8gJzxkZXNjcmlwdGlvbiBpZD1cIicgKyBlc2NhcGVYbWwoYWx0LmlkKSArICdcIj4nICtcbiAgICAgICAgICBlc2NhcGVYbWwoYWx0LnRleHQpICsgJzwvZGVzY3JpcHRpb24+JyA6ICcnO1xuICAgICAgcXJTdmcgKz0gJzxyZWN0IHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiBmaWxsPVwid2hpdGVcIiBjeD1cIjBcIiBjeT1cIjBcIi8+JztcbiAgICAgIHFyU3ZnICs9ICc8cGF0aCBkPVwiJztcblxuICAgICAgZm9yIChyID0gMDsgciA8IF90aGlzLmdldE1vZHVsZUNvdW50KCk7IHIgKz0gMSkge1xuICAgICAgICBtciA9IHIgKiBjZWxsU2l6ZSArIG1hcmdpbjtcbiAgICAgICAgZm9yIChjID0gMDsgYyA8IF90aGlzLmdldE1vZHVsZUNvdW50KCk7IGMgKz0gMSkge1xuICAgICAgICAgIGlmIChfdGhpcy5pc0RhcmsociwgYykgKSB7XG4gICAgICAgICAgICBtYyA9IGMqY2VsbFNpemUrbWFyZ2luO1xuICAgICAgICAgICAgcXJTdmcgKz0gJ00nICsgbWMgKyAnLCcgKyBtciArIHJlY3Q7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHFyU3ZnICs9ICdcIiBzdHJva2U9XCJ0cmFuc3BhcmVudFwiIGZpbGw9XCJibGFja1wiLz4nO1xuICAgICAgcXJTdmcgKz0gJzwvc3ZnPic7XG5cbiAgICAgIHJldHVybiBxclN2ZztcbiAgICB9O1xuXG4gICAgX3RoaXMuY3JlYXRlRGF0YVVSTCA9IGZ1bmN0aW9uKGNlbGxTaXplLCBtYXJnaW4pIHtcblxuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAyO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDQgOiBtYXJnaW47XG5cbiAgICAgIHZhciBzaXplID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKSAqIGNlbGxTaXplICsgbWFyZ2luICogMjtcbiAgICAgIHZhciBtaW4gPSBtYXJnaW47XG4gICAgICB2YXIgbWF4ID0gc2l6ZSAtIG1hcmdpbjtcblxuICAgICAgcmV0dXJuIGNyZWF0ZURhdGFVUkwoc2l6ZSwgc2l6ZSwgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICBpZiAobWluIDw9IHggJiYgeCA8IG1heCAmJiBtaW4gPD0geSAmJiB5IDwgbWF4KSB7XG4gICAgICAgICAgdmFyIGMgPSBNYXRoLmZsb29yKCAoeCAtIG1pbikgLyBjZWxsU2l6ZSk7XG4gICAgICAgICAgdmFyIHIgPSBNYXRoLmZsb29yKCAoeSAtIG1pbikgLyBjZWxsU2l6ZSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmlzRGFyayhyLCBjKT8gMCA6IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9O1xuXG4gICAgX3RoaXMuY3JlYXRlSW1nVGFnID0gZnVuY3Rpb24oY2VsbFNpemUsIG1hcmdpbiwgYWx0KSB7XG5cbiAgICAgIGNlbGxTaXplID0gY2VsbFNpemUgfHwgMjtcbiAgICAgIG1hcmdpbiA9ICh0eXBlb2YgbWFyZ2luID09ICd1bmRlZmluZWQnKT8gY2VsbFNpemUgKiA0IDogbWFyZ2luO1xuXG4gICAgICB2YXIgc2l6ZSA9IF90aGlzLmdldE1vZHVsZUNvdW50KCkgKiBjZWxsU2l6ZSArIG1hcmdpbiAqIDI7XG5cbiAgICAgIHZhciBpbWcgPSAnJztcbiAgICAgIGltZyArPSAnPGltZyc7XG4gICAgICBpbWcgKz0gJ1xcdTAwMjBzcmM9XCInO1xuICAgICAgaW1nICs9IF90aGlzLmNyZWF0ZURhdGFVUkwoY2VsbFNpemUsIG1hcmdpbik7XG4gICAgICBpbWcgKz0gJ1wiJztcbiAgICAgIGltZyArPSAnXFx1MDAyMHdpZHRoPVwiJztcbiAgICAgIGltZyArPSBzaXplO1xuICAgICAgaW1nICs9ICdcIic7XG4gICAgICBpbWcgKz0gJ1xcdTAwMjBoZWlnaHQ9XCInO1xuICAgICAgaW1nICs9IHNpemU7XG4gICAgICBpbWcgKz0gJ1wiJztcbiAgICAgIGlmIChhbHQpIHtcbiAgICAgICAgaW1nICs9ICdcXHUwMDIwYWx0PVwiJztcbiAgICAgICAgaW1nICs9IGVzY2FwZVhtbChhbHQpO1xuICAgICAgICBpbWcgKz0gJ1wiJztcbiAgICAgIH1cbiAgICAgIGltZyArPSAnLz4nO1xuXG4gICAgICByZXR1cm4gaW1nO1xuICAgIH07XG5cbiAgICB2YXIgZXNjYXBlWG1sID0gZnVuY3Rpb24ocykge1xuICAgICAgdmFyIGVzY2FwZWQgPSAnJztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgYyA9IHMuY2hhckF0KGkpO1xuICAgICAgICBzd2l0Y2goYykge1xuICAgICAgICBjYXNlICc8JzogZXNjYXBlZCArPSAnJmx0Oyc7IGJyZWFrO1xuICAgICAgICBjYXNlICc+JzogZXNjYXBlZCArPSAnJmd0Oyc7IGJyZWFrO1xuICAgICAgICBjYXNlICcmJzogZXNjYXBlZCArPSAnJmFtcDsnOyBicmVhaztcbiAgICAgICAgY2FzZSAnXCInOiBlc2NhcGVkICs9ICcmcXVvdDsnOyBicmVhaztcbiAgICAgICAgZGVmYXVsdCA6IGVzY2FwZWQgKz0gYzsgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBlc2NhcGVkO1xuICAgIH07XG5cbiAgICB2YXIgX2NyZWF0ZUhhbGZBU0NJSSA9IGZ1bmN0aW9uKG1hcmdpbikge1xuICAgICAgdmFyIGNlbGxTaXplID0gMTtcbiAgICAgIG1hcmdpbiA9ICh0eXBlb2YgbWFyZ2luID09ICd1bmRlZmluZWQnKT8gY2VsbFNpemUgKiAyIDogbWFyZ2luO1xuXG4gICAgICB2YXIgc2l6ZSA9IF90aGlzLmdldE1vZHVsZUNvdW50KCkgKiBjZWxsU2l6ZSArIG1hcmdpbiAqIDI7XG4gICAgICB2YXIgbWluID0gbWFyZ2luO1xuICAgICAgdmFyIG1heCA9IHNpemUgLSBtYXJnaW47XG5cbiAgICAgIHZhciB5LCB4LCByMSwgcjIsIHA7XG5cbiAgICAgIHZhciBibG9ja3MgPSB7XG4gICAgICAgICfilojilognOiAn4paIJyxcbiAgICAgICAgJ+KWiCAnOiAn4paAJyxcbiAgICAgICAgJyDilognOiAn4paEJyxcbiAgICAgICAgJyAgJzogJyAnXG4gICAgICB9O1xuXG4gICAgICB2YXIgYmxvY2tzTGFzdExpbmVOb01hcmdpbiA9IHtcbiAgICAgICAgJ+KWiOKWiCc6ICfiloAnLFxuICAgICAgICAn4paIICc6ICfiloAnLFxuICAgICAgICAnIOKWiCc6ICcgJyxcbiAgICAgICAgJyAgJzogJyAnXG4gICAgICB9O1xuXG4gICAgICB2YXIgYXNjaWkgPSAnJztcbiAgICAgIGZvciAoeSA9IDA7IHkgPCBzaXplOyB5ICs9IDIpIHtcbiAgICAgICAgcjEgPSBNYXRoLmZsb29yKCh5IC0gbWluKSAvIGNlbGxTaXplKTtcbiAgICAgICAgcjIgPSBNYXRoLmZsb29yKCh5ICsgMSAtIG1pbikgLyBjZWxsU2l6ZSk7XG4gICAgICAgIGZvciAoeCA9IDA7IHggPCBzaXplOyB4ICs9IDEpIHtcbiAgICAgICAgICBwID0gJ+KWiCc7XG5cbiAgICAgICAgICBpZiAobWluIDw9IHggJiYgeCA8IG1heCAmJiBtaW4gPD0geSAmJiB5IDwgbWF4ICYmIF90aGlzLmlzRGFyayhyMSwgTWF0aC5mbG9vcigoeCAtIG1pbikgLyBjZWxsU2l6ZSkpKSB7XG4gICAgICAgICAgICBwID0gJyAnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtaW4gPD0geCAmJiB4IDwgbWF4ICYmIG1pbiA8PSB5KzEgJiYgeSsxIDwgbWF4ICYmIF90aGlzLmlzRGFyayhyMiwgTWF0aC5mbG9vcigoeCAtIG1pbikgLyBjZWxsU2l6ZSkpKSB7XG4gICAgICAgICAgICBwICs9ICcgJztcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwICs9ICfilognO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE91dHB1dCAyIGNoYXJhY3RlcnMgcGVyIHBpeGVsLCB0byBjcmVhdGUgZnVsbCBzcXVhcmUuIDEgY2hhcmFjdGVyIHBlciBwaXhlbHMgZ2l2ZXMgb25seSBoYWxmIHdpZHRoIG9mIHNxdWFyZS5cbiAgICAgICAgICBhc2NpaSArPSAobWFyZ2luIDwgMSAmJiB5KzEgPj0gbWF4KSA/IGJsb2Nrc0xhc3RMaW5lTm9NYXJnaW5bcF0gOiBibG9ja3NbcF07XG4gICAgICAgIH1cblxuICAgICAgICBhc2NpaSArPSAnXFxuJztcbiAgICAgIH1cblxuICAgICAgaWYgKHNpemUgJSAyICYmIG1hcmdpbiA+IDApIHtcbiAgICAgICAgcmV0dXJuIGFzY2lpLnN1YnN0cmluZygwLCBhc2NpaS5sZW5ndGggLSBzaXplIC0gMSkgKyBBcnJheShzaXplKzEpLmpvaW4oJ+KWgCcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYXNjaWkuc3Vic3RyaW5nKDAsIGFzY2lpLmxlbmd0aC0xKTtcbiAgICB9O1xuXG4gICAgX3RoaXMuY3JlYXRlQVNDSUkgPSBmdW5jdGlvbihjZWxsU2l6ZSwgbWFyZ2luKSB7XG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDE7XG5cbiAgICAgIGlmIChjZWxsU2l6ZSA8IDIpIHtcbiAgICAgICAgcmV0dXJuIF9jcmVhdGVIYWxmQVNDSUkobWFyZ2luKTtcbiAgICAgIH1cblxuICAgICAgY2VsbFNpemUgLT0gMTtcbiAgICAgIG1hcmdpbiA9ICh0eXBlb2YgbWFyZ2luID09ICd1bmRlZmluZWQnKT8gY2VsbFNpemUgKiAyIDogbWFyZ2luO1xuXG4gICAgICB2YXIgc2l6ZSA9IF90aGlzLmdldE1vZHVsZUNvdW50KCkgKiBjZWxsU2l6ZSArIG1hcmdpbiAqIDI7XG4gICAgICB2YXIgbWluID0gbWFyZ2luO1xuICAgICAgdmFyIG1heCA9IHNpemUgLSBtYXJnaW47XG5cbiAgICAgIHZhciB5LCB4LCByLCBwO1xuXG4gICAgICB2YXIgd2hpdGUgPSBBcnJheShjZWxsU2l6ZSsxKS5qb2luKCfilojilognKTtcbiAgICAgIHZhciBibGFjayA9IEFycmF5KGNlbGxTaXplKzEpLmpvaW4oJyAgJyk7XG5cbiAgICAgIHZhciBhc2NpaSA9ICcnO1xuICAgICAgdmFyIGxpbmUgPSAnJztcbiAgICAgIGZvciAoeSA9IDA7IHkgPCBzaXplOyB5ICs9IDEpIHtcbiAgICAgICAgciA9IE1hdGguZmxvb3IoICh5IC0gbWluKSAvIGNlbGxTaXplKTtcbiAgICAgICAgbGluZSA9ICcnO1xuICAgICAgICBmb3IgKHggPSAwOyB4IDwgc2l6ZTsgeCArPSAxKSB7XG4gICAgICAgICAgcCA9IDE7XG5cbiAgICAgICAgICBpZiAobWluIDw9IHggJiYgeCA8IG1heCAmJiBtaW4gPD0geSAmJiB5IDwgbWF4ICYmIF90aGlzLmlzRGFyayhyLCBNYXRoLmZsb29yKCh4IC0gbWluKSAvIGNlbGxTaXplKSkpIHtcbiAgICAgICAgICAgIHAgPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE91dHB1dCAyIGNoYXJhY3RlcnMgcGVyIHBpeGVsLCB0byBjcmVhdGUgZnVsbCBzcXVhcmUuIDEgY2hhcmFjdGVyIHBlciBwaXhlbHMgZ2l2ZXMgb25seSBoYWxmIHdpZHRoIG9mIHNxdWFyZS5cbiAgICAgICAgICBsaW5lICs9IHAgPyB3aGl0ZSA6IGJsYWNrO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChyID0gMDsgciA8IGNlbGxTaXplOyByICs9IDEpIHtcbiAgICAgICAgICBhc2NpaSArPSBsaW5lICsgJ1xcbic7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFzY2lpLnN1YnN0cmluZygwLCBhc2NpaS5sZW5ndGgtMSk7XG4gICAgfTtcblxuICAgIF90aGlzLnJlbmRlclRvMmRDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dCwgY2VsbFNpemUpIHtcbiAgICAgIGNlbGxTaXplID0gY2VsbFNpemUgfHwgMjtcbiAgICAgIHZhciBsZW5ndGggPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpO1xuICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbGVuZ3RoOyByb3crKykge1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBsZW5ndGg7IGNvbCsrKSB7XG4gICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBfdGhpcy5pc0Rhcmsocm93LCBjb2wpID8gJ2JsYWNrJyA6ICd3aGl0ZSc7XG4gICAgICAgICAgY29udGV4dC5maWxsUmVjdChyb3cgKiBjZWxsU2l6ZSwgY29sICogY2VsbFNpemUsIGNlbGxTaXplLCBjZWxsU2l6ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJjb2RlLnN0cmluZ1RvQnl0ZXNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBxcmNvZGUuc3RyaW5nVG9CeXRlc0Z1bmNzID0ge1xuICAgICdkZWZhdWx0JyA6IGZ1bmN0aW9uKHMpIHtcbiAgICAgIHZhciBieXRlcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBjID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgICAgICBieXRlcy5wdXNoKGMgJiAweGZmKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9XG4gIH07XG5cbiAgcXJjb2RlLnN0cmluZ1RvQnl0ZXMgPSBxcmNvZGUuc3RyaW5nVG9CeXRlc0Z1bmNzWydkZWZhdWx0J107XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJjb2RlLmNyZWF0ZVN0cmluZ1RvQnl0ZXNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvKipcbiAgICogQHBhcmFtIHVuaWNvZGVEYXRhIGJhc2U2NCBzdHJpbmcgb2YgYnl0ZSBhcnJheS5cbiAgICogWzE2Yml0IFVuaWNvZGVdLFsxNmJpdCBCeXRlc10sIC4uLlxuICAgKiBAcGFyYW0gbnVtQ2hhcnNcbiAgICovXG4gIHFyY29kZS5jcmVhdGVTdHJpbmdUb0J5dGVzID0gZnVuY3Rpb24odW5pY29kZURhdGEsIG51bUNoYXJzKSB7XG5cbiAgICAvLyBjcmVhdGUgY29udmVyc2lvbiBtYXAuXG5cbiAgICB2YXIgdW5pY29kZU1hcCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgYmluID0gYmFzZTY0RGVjb2RlSW5wdXRTdHJlYW0odW5pY29kZURhdGEpO1xuICAgICAgdmFyIHJlYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGIgPSBiaW4ucmVhZCgpO1xuICAgICAgICBpZiAoYiA9PSAtMSkgdGhyb3cgJ2VvZic7XG4gICAgICAgIHJldHVybiBiO1xuICAgICAgfTtcblxuICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgIHZhciB1bmljb2RlTWFwID0ge307XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgYjAgPSBiaW4ucmVhZCgpO1xuICAgICAgICBpZiAoYjAgPT0gLTEpIGJyZWFrO1xuICAgICAgICB2YXIgYjEgPSByZWFkKCk7XG4gICAgICAgIHZhciBiMiA9IHJlYWQoKTtcbiAgICAgICAgdmFyIGIzID0gcmVhZCgpO1xuICAgICAgICB2YXIgayA9IFN0cmluZy5mcm9tQ2hhckNvZGUoIChiMCA8PCA4KSB8IGIxKTtcbiAgICAgICAgdmFyIHYgPSAoYjIgPDwgOCkgfCBiMztcbiAgICAgICAgdW5pY29kZU1hcFtrXSA9IHY7XG4gICAgICAgIGNvdW50ICs9IDE7XG4gICAgICB9XG4gICAgICBpZiAoY291bnQgIT0gbnVtQ2hhcnMpIHtcbiAgICAgICAgdGhyb3cgY291bnQgKyAnICE9ICcgKyBudW1DaGFycztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHVuaWNvZGVNYXA7XG4gICAgfSgpO1xuXG4gICAgdmFyIHVua25vd25DaGFyID0gJz8nLmNoYXJDb2RlQXQoMCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ocykge1xuICAgICAgdmFyIGJ5dGVzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGMgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDwgMTI4KSB7XG4gICAgICAgICAgYnl0ZXMucHVzaChjKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgYiA9IHVuaWNvZGVNYXBbcy5jaGFyQXQoaSldO1xuICAgICAgICAgIGlmICh0eXBlb2YgYiA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgaWYgKCAoYiAmIDB4ZmYpID09IGIpIHtcbiAgICAgICAgICAgICAgLy8gMWJ5dGVcbiAgICAgICAgICAgICAgYnl0ZXMucHVzaChiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIDJieXRlc1xuICAgICAgICAgICAgICBieXRlcy5wdXNoKGIgPj4+IDgpO1xuICAgICAgICAgICAgICBieXRlcy5wdXNoKGIgJiAweGZmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnl0ZXMucHVzaCh1bmtub3duQ2hhcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUk1vZGVcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJNb2RlID0ge1xuICAgIE1PREVfTlVNQkVSIDogICAgMSA8PCAwLFxuICAgIE1PREVfQUxQSEFfTlVNIDogMSA8PCAxLFxuICAgIE1PREVfOEJJVF9CWVRFIDogMSA8PCAyLFxuICAgIE1PREVfS0FOSkkgOiAgICAgMSA8PCAzXG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUVJFcnJvckNvcnJlY3Rpb25MZXZlbFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBRUkVycm9yQ29ycmVjdGlvbkxldmVsID0ge1xuICAgIEwgOiAxLFxuICAgIE0gOiAwLFxuICAgIFEgOiAzLFxuICAgIEggOiAyXG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUVJNYXNrUGF0dGVyblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBRUk1hc2tQYXR0ZXJuID0ge1xuICAgIFBBVFRFUk4wMDAgOiAwLFxuICAgIFBBVFRFUk4wMDEgOiAxLFxuICAgIFBBVFRFUk4wMTAgOiAyLFxuICAgIFBBVFRFUk4wMTEgOiAzLFxuICAgIFBBVFRFUk4xMDAgOiA0LFxuICAgIFBBVFRFUk4xMDEgOiA1LFxuICAgIFBBVFRFUk4xMTAgOiA2LFxuICAgIFBBVFRFUk4xMTEgOiA3XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUVJVdGlsXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSVXRpbCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIFBBVFRFUk5fUE9TSVRJT05fVEFCTEUgPSBbXG4gICAgICBbXSxcbiAgICAgIFs2LCAxOF0sXG4gICAgICBbNiwgMjJdLFxuICAgICAgWzYsIDI2XSxcbiAgICAgIFs2LCAzMF0sXG4gICAgICBbNiwgMzRdLFxuICAgICAgWzYsIDIyLCAzOF0sXG4gICAgICBbNiwgMjQsIDQyXSxcbiAgICAgIFs2LCAyNiwgNDZdLFxuICAgICAgWzYsIDI4LCA1MF0sXG4gICAgICBbNiwgMzAsIDU0XSxcbiAgICAgIFs2LCAzMiwgNThdLFxuICAgICAgWzYsIDM0LCA2Ml0sXG4gICAgICBbNiwgMjYsIDQ2LCA2Nl0sXG4gICAgICBbNiwgMjYsIDQ4LCA3MF0sXG4gICAgICBbNiwgMjYsIDUwLCA3NF0sXG4gICAgICBbNiwgMzAsIDU0LCA3OF0sXG4gICAgICBbNiwgMzAsIDU2LCA4Ml0sXG4gICAgICBbNiwgMzAsIDU4LCA4Nl0sXG4gICAgICBbNiwgMzQsIDYyLCA5MF0sXG4gICAgICBbNiwgMjgsIDUwLCA3MiwgOTRdLFxuICAgICAgWzYsIDI2LCA1MCwgNzQsIDk4XSxcbiAgICAgIFs2LCAzMCwgNTQsIDc4LCAxMDJdLFxuICAgICAgWzYsIDI4LCA1NCwgODAsIDEwNl0sXG4gICAgICBbNiwgMzIsIDU4LCA4NCwgMTEwXSxcbiAgICAgIFs2LCAzMCwgNTgsIDg2LCAxMTRdLFxuICAgICAgWzYsIDM0LCA2MiwgOTAsIDExOF0sXG4gICAgICBbNiwgMjYsIDUwLCA3NCwgOTgsIDEyMl0sXG4gICAgICBbNiwgMzAsIDU0LCA3OCwgMTAyLCAxMjZdLFxuICAgICAgWzYsIDI2LCA1MiwgNzgsIDEwNCwgMTMwXSxcbiAgICAgIFs2LCAzMCwgNTYsIDgyLCAxMDgsIDEzNF0sXG4gICAgICBbNiwgMzQsIDYwLCA4NiwgMTEyLCAxMzhdLFxuICAgICAgWzYsIDMwLCA1OCwgODYsIDExNCwgMTQyXSxcbiAgICAgIFs2LCAzNCwgNjIsIDkwLCAxMTgsIDE0Nl0sXG4gICAgICBbNiwgMzAsIDU0LCA3OCwgMTAyLCAxMjYsIDE1MF0sXG4gICAgICBbNiwgMjQsIDUwLCA3NiwgMTAyLCAxMjgsIDE1NF0sXG4gICAgICBbNiwgMjgsIDU0LCA4MCwgMTA2LCAxMzIsIDE1OF0sXG4gICAgICBbNiwgMzIsIDU4LCA4NCwgMTEwLCAxMzYsIDE2Ml0sXG4gICAgICBbNiwgMjYsIDU0LCA4MiwgMTEwLCAxMzgsIDE2Nl0sXG4gICAgICBbNiwgMzAsIDU4LCA4NiwgMTE0LCAxNDIsIDE3MF1cbiAgICBdO1xuICAgIHZhciBHMTUgPSAoMSA8PCAxMCkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgNCkgfCAoMSA8PCAyKSB8ICgxIDw8IDEpIHwgKDEgPDwgMCk7XG4gICAgdmFyIEcxOCA9ICgxIDw8IDEyKSB8ICgxIDw8IDExKSB8ICgxIDw8IDEwKSB8ICgxIDw8IDkpIHwgKDEgPDwgOCkgfCAoMSA8PCA1KSB8ICgxIDw8IDIpIHwgKDEgPDwgMCk7XG4gICAgdmFyIEcxNV9NQVNLID0gKDEgPDwgMTQpIHwgKDEgPDwgMTIpIHwgKDEgPDwgMTApIHwgKDEgPDwgNCkgfCAoMSA8PCAxKTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgdmFyIGdldEJDSERpZ2l0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGRpZ2l0ID0gMDtcbiAgICAgIHdoaWxlIChkYXRhICE9IDApIHtcbiAgICAgICAgZGlnaXQgKz0gMTtcbiAgICAgICAgZGF0YSA+Pj49IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGlnaXQ7XG4gICAgfTtcblxuICAgIF90aGlzLmdldEJDSFR5cGVJbmZvID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGQgPSBkYXRhIDw8IDEwO1xuICAgICAgd2hpbGUgKGdldEJDSERpZ2l0KGQpIC0gZ2V0QkNIRGlnaXQoRzE1KSA+PSAwKSB7XG4gICAgICAgIGQgXj0gKEcxNSA8PCAoZ2V0QkNIRGlnaXQoZCkgLSBnZXRCQ0hEaWdpdChHMTUpICkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoIChkYXRhIDw8IDEwKSB8IGQpIF4gRzE1X01BU0s7XG4gICAgfTtcblxuICAgIF90aGlzLmdldEJDSFR5cGVOdW1iZXIgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgZCA9IGRhdGEgPDwgMTI7XG4gICAgICB3aGlsZSAoZ2V0QkNIRGlnaXQoZCkgLSBnZXRCQ0hEaWdpdChHMTgpID49IDApIHtcbiAgICAgICAgZCBePSAoRzE4IDw8IChnZXRCQ0hEaWdpdChkKSAtIGdldEJDSERpZ2l0KEcxOCkgKSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChkYXRhIDw8IDEyKSB8IGQ7XG4gICAgfTtcblxuICAgIF90aGlzLmdldFBhdHRlcm5Qb3NpdGlvbiA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIpIHtcbiAgICAgIHJldHVybiBQQVRURVJOX1BPU0lUSU9OX1RBQkxFW3R5cGVOdW1iZXIgLSAxXTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TWFza0Z1bmN0aW9uID0gZnVuY3Rpb24obWFza1BhdHRlcm4pIHtcblxuICAgICAgc3dpdGNoIChtYXNrUGF0dGVybikge1xuXG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAwMCA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiAoaSArIGopICUgMiA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMDEgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gaSAlIDIgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDEwIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIGogJSAzID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAxMSA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiAoaSArIGopICUgMyA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMDAgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKE1hdGguZmxvb3IoaSAvIDIpICsgTWF0aC5mbG9vcihqIC8gMykgKSAlIDIgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTAxIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIChpICogaikgJSAyICsgKGkgKiBqKSAlIDMgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTEwIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuICggKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMykgJSAyID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjExMSA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiAoIChpICogaikgJSAzICsgKGkgKyBqKSAlIDIpICUgMiA9PSAwOyB9O1xuXG4gICAgICBkZWZhdWx0IDpcbiAgICAgICAgdGhyb3cgJ2JhZCBtYXNrUGF0dGVybjonICsgbWFza1BhdHRlcm47XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLmdldEVycm9yQ29ycmVjdFBvbHlub21pYWwgPSBmdW5jdGlvbihlcnJvckNvcnJlY3RMZW5ndGgpIHtcbiAgICAgIHZhciBhID0gcXJQb2x5bm9taWFsKFsxXSwgMCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVycm9yQ29ycmVjdExlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGEgPSBhLm11bHRpcGx5KHFyUG9seW5vbWlhbChbMSwgUVJNYXRoLmdleHAoaSldLCAwKSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGE7XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aEluQml0cyA9IGZ1bmN0aW9uKG1vZGUsIHR5cGUpIHtcblxuICAgICAgaWYgKDEgPD0gdHlwZSAmJiB0eXBlIDwgMTApIHtcblxuICAgICAgICAvLyAxIC0gOVxuXG4gICAgICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfTlVNQkVSICAgIDogcmV0dXJuIDEwO1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTSA6IHJldHVybiA5O1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURSA6IHJldHVybiA4O1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX0tBTkpJICAgICA6IHJldHVybiA4O1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICB0aHJvdyAnbW9kZTonICsgbW9kZTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPCAyNykge1xuXG4gICAgICAgIC8vIDEwIC0gMjZcblxuICAgICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX05VTUJFUiAgICA6IHJldHVybiAxMjtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9BTFBIQV9OVU0gOiByZXR1cm4gMTE7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfOEJJVF9CWVRFIDogcmV0dXJuIDE2O1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX0tBTkpJICAgICA6IHJldHVybiAxMDtcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgdGhyb3cgJ21vZGU6JyArIG1vZGU7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmICh0eXBlIDwgNDEpIHtcblxuICAgICAgICAvLyAyNyAtIDQwXG5cbiAgICAgICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9OVU1CRVIgICAgOiByZXR1cm4gMTQ7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNIDogcmV0dXJuIDEzO1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURSA6IHJldHVybiAxNjtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9LQU5KSSAgICAgOiByZXR1cm4gMTI7XG4gICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgIHRocm93ICdtb2RlOicgKyBtb2RlO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICd0eXBlOicgKyB0eXBlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMb3N0UG9pbnQgPSBmdW5jdGlvbihxcmNvZGUpIHtcblxuICAgICAgdmFyIG1vZHVsZUNvdW50ID0gcXJjb2RlLmdldE1vZHVsZUNvdW50KCk7XG5cbiAgICAgIHZhciBsb3N0UG9pbnQgPSAwO1xuXG4gICAgICAvLyBMRVZFTDFcblxuICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wgKz0gMSkge1xuXG4gICAgICAgICAgdmFyIHNhbWVDb3VudCA9IDA7XG4gICAgICAgICAgdmFyIGRhcmsgPSBxcmNvZGUuaXNEYXJrKHJvdywgY29sKTtcblxuICAgICAgICAgIGZvciAodmFyIHIgPSAtMTsgciA8PSAxOyByICs9IDEpIHtcblxuICAgICAgICAgICAgaWYgKHJvdyArIHIgPCAwIHx8IG1vZHVsZUNvdW50IDw9IHJvdyArIHIpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGMgPSAtMTsgYyA8PSAxOyBjICs9IDEpIHtcblxuICAgICAgICAgICAgICBpZiAoY29sICsgYyA8IDAgfHwgbW9kdWxlQ291bnQgPD0gY29sICsgYykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHIgPT0gMCAmJiBjID09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChkYXJrID09IHFyY29kZS5pc0Rhcmsocm93ICsgciwgY29sICsgYykgKSB7XG4gICAgICAgICAgICAgICAgc2FtZUNvdW50ICs9IDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2FtZUNvdW50ID4gNSkge1xuICAgICAgICAgICAgbG9zdFBvaW50ICs9ICgzICsgc2FtZUNvdW50IC0gNSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBMRVZFTDJcblxuICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQgLSAxOyByb3cgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudCAtIDE7IGNvbCArPSAxKSB7XG4gICAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3csIGNvbCkgKSBjb3VudCArPSAxO1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdyArIDEsIGNvbCkgKSBjb3VudCArPSAxO1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgMSkgKSBjb3VudCArPSAxO1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdyArIDEsIGNvbCArIDEpICkgY291bnQgKz0gMTtcbiAgICAgICAgICBpZiAoY291bnQgPT0gMCB8fCBjb3VudCA9PSA0KSB7XG4gICAgICAgICAgICBsb3N0UG9pbnQgKz0gMztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTEVWRUwzXG5cbiAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50OyByb3cgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudCAtIDY7IGNvbCArPSAxKSB7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93LCBjb2wpXG4gICAgICAgICAgICAgICYmICFxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgMSlcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyAyKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDMpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgNClcbiAgICAgICAgICAgICAgJiYgIXFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyA1KVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDYpICkge1xuICAgICAgICAgICAgbG9zdFBvaW50ICs9IDQwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudDsgY29sICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQgLSA2OyByb3cgKz0gMSkge1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdywgY29sKVxuICAgICAgICAgICAgICAmJiAhcXJjb2RlLmlzRGFyayhyb3cgKyAxLCBjb2wpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdyArIDIsIGNvbClcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93ICsgMywgY29sKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3cgKyA0LCBjb2wpXG4gICAgICAgICAgICAgICYmICFxcmNvZGUuaXNEYXJrKHJvdyArIDUsIGNvbClcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93ICsgNiwgY29sKSApIHtcbiAgICAgICAgICAgIGxvc3RQb2ludCArPSA0MDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTEVWRUw0XG5cbiAgICAgIHZhciBkYXJrQ291bnQgPSAwO1xuXG4gICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudDsgY29sICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdyArPSAxKSB7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93LCBjb2wpICkge1xuICAgICAgICAgICAgZGFya0NvdW50ICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciByYXRpbyA9IE1hdGguYWJzKDEwMCAqIGRhcmtDb3VudCAvIG1vZHVsZUNvdW50IC8gbW9kdWxlQ291bnQgLSA1MCkgLyA1O1xuICAgICAgbG9zdFBvaW50ICs9IHJhdGlvICogMTA7XG5cbiAgICAgIHJldHVybiBsb3N0UG9pbnQ7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfSgpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSTWF0aFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBRUk1hdGggPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBFWFBfVEFCTEUgPSBuZXcgQXJyYXkoMjU2KTtcbiAgICB2YXIgTE9HX1RBQkxFID0gbmV3IEFycmF5KDI1Nik7XG5cbiAgICAvLyBpbml0aWFsaXplIHRhYmxlc1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSArPSAxKSB7XG4gICAgICBFWFBfVEFCTEVbaV0gPSAxIDw8IGk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSA4OyBpIDwgMjU2OyBpICs9IDEpIHtcbiAgICAgIEVYUF9UQUJMRVtpXSA9IEVYUF9UQUJMRVtpIC0gNF1cbiAgICAgICAgXiBFWFBfVEFCTEVbaSAtIDVdXG4gICAgICAgIF4gRVhQX1RBQkxFW2kgLSA2XVxuICAgICAgICBeIEVYUF9UQUJMRVtpIC0gOF07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU1OyBpICs9IDEpIHtcbiAgICAgIExPR19UQUJMRVtFWFBfVEFCTEVbaV0gXSA9IGk7XG4gICAgfVxuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nbG9nID0gZnVuY3Rpb24obikge1xuXG4gICAgICBpZiAobiA8IDEpIHtcbiAgICAgICAgdGhyb3cgJ2dsb2coJyArIG4gKyAnKSc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBMT0dfVEFCTEVbbl07XG4gICAgfTtcblxuICAgIF90aGlzLmdleHAgPSBmdW5jdGlvbihuKSB7XG5cbiAgICAgIHdoaWxlIChuIDwgMCkge1xuICAgICAgICBuICs9IDI1NTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKG4gPj0gMjU2KSB7XG4gICAgICAgIG4gLT0gMjU1O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gRVhQX1RBQkxFW25dO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH0oKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxclBvbHlub21pYWxcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBmdW5jdGlvbiBxclBvbHlub21pYWwobnVtLCBzaGlmdCkge1xuXG4gICAgaWYgKHR5cGVvZiBudW0ubGVuZ3RoID09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBudW0ubGVuZ3RoICsgJy8nICsgc2hpZnQ7XG4gICAgfVxuXG4gICAgdmFyIF9udW0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvZmZzZXQgPSAwO1xuICAgICAgd2hpbGUgKG9mZnNldCA8IG51bS5sZW5ndGggJiYgbnVtW29mZnNldF0gPT0gMCkge1xuICAgICAgICBvZmZzZXQgKz0gMTtcbiAgICAgIH1cbiAgICAgIHZhciBfbnVtID0gbmV3IEFycmF5KG51bS5sZW5ndGggLSBvZmZzZXQgKyBzaGlmdCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bS5sZW5ndGggLSBvZmZzZXQ7IGkgKz0gMSkge1xuICAgICAgICBfbnVtW2ldID0gbnVtW2kgKyBvZmZzZXRdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9udW07XG4gICAgfSgpO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRBdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICByZXR1cm4gX251bVtpbmRleF07XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9udW0ubGVuZ3RoO1xuICAgIH07XG5cbiAgICBfdGhpcy5tdWx0aXBseSA9IGZ1bmN0aW9uKGUpIHtcblxuICAgICAgdmFyIG51bSA9IG5ldyBBcnJheShfdGhpcy5nZXRMZW5ndGgoKSArIGUuZ2V0TGVuZ3RoKCkgLSAxKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdGhpcy5nZXRMZW5ndGgoKTsgaSArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZS5nZXRMZW5ndGgoKTsgaiArPSAxKSB7XG4gICAgICAgICAgbnVtW2kgKyBqXSBePSBRUk1hdGguZ2V4cChRUk1hdGguZ2xvZyhfdGhpcy5nZXRBdChpKSApICsgUVJNYXRoLmdsb2coZS5nZXRBdChqKSApICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHFyUG9seW5vbWlhbChudW0sIDApO1xuICAgIH07XG5cbiAgICBfdGhpcy5tb2QgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAgIGlmIChfdGhpcy5nZXRMZW5ndGgoKSAtIGUuZ2V0TGVuZ3RoKCkgPCAwKSB7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIHJhdGlvID0gUVJNYXRoLmdsb2coX3RoaXMuZ2V0QXQoMCkgKSAtIFFSTWF0aC5nbG9nKGUuZ2V0QXQoMCkgKTtcblxuICAgICAgdmFyIG51bSA9IG5ldyBBcnJheShfdGhpcy5nZXRMZW5ndGgoKSApO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdGhpcy5nZXRMZW5ndGgoKTsgaSArPSAxKSB7XG4gICAgICAgIG51bVtpXSA9IF90aGlzLmdldEF0KGkpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGUuZ2V0TGVuZ3RoKCk7IGkgKz0gMSkge1xuICAgICAgICBudW1baV0gXj0gUVJNYXRoLmdleHAoUVJNYXRoLmdsb2coZS5nZXRBdChpKSApICsgcmF0aW8pO1xuICAgICAgfVxuXG4gICAgICAvLyByZWN1cnNpdmUgY2FsbFxuICAgICAgcmV0dXJuIHFyUG9seW5vbWlhbChudW0sIDApLm1vZChlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSUlNCbG9ja1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBRUlJTQmxvY2sgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBSU19CTE9DS19UQUJMRSA9IFtcblxuICAgICAgLy8gTFxuICAgICAgLy8gTVxuICAgICAgLy8gUVxuICAgICAgLy8gSFxuXG4gICAgICAvLyAxXG4gICAgICBbMSwgMjYsIDE5XSxcbiAgICAgIFsxLCAyNiwgMTZdLFxuICAgICAgWzEsIDI2LCAxM10sXG4gICAgICBbMSwgMjYsIDldLFxuXG4gICAgICAvLyAyXG4gICAgICBbMSwgNDQsIDM0XSxcbiAgICAgIFsxLCA0NCwgMjhdLFxuICAgICAgWzEsIDQ0LCAyMl0sXG4gICAgICBbMSwgNDQsIDE2XSxcblxuICAgICAgLy8gM1xuICAgICAgWzEsIDcwLCA1NV0sXG4gICAgICBbMSwgNzAsIDQ0XSxcbiAgICAgIFsyLCAzNSwgMTddLFxuICAgICAgWzIsIDM1LCAxM10sXG5cbiAgICAgIC8vIDRcbiAgICAgIFsxLCAxMDAsIDgwXSxcbiAgICAgIFsyLCA1MCwgMzJdLFxuICAgICAgWzIsIDUwLCAyNF0sXG4gICAgICBbNCwgMjUsIDldLFxuXG4gICAgICAvLyA1XG4gICAgICBbMSwgMTM0LCAxMDhdLFxuICAgICAgWzIsIDY3LCA0M10sXG4gICAgICBbMiwgMzMsIDE1LCAyLCAzNCwgMTZdLFxuICAgICAgWzIsIDMzLCAxMSwgMiwgMzQsIDEyXSxcblxuICAgICAgLy8gNlxuICAgICAgWzIsIDg2LCA2OF0sXG4gICAgICBbNCwgNDMsIDI3XSxcbiAgICAgIFs0LCA0MywgMTldLFxuICAgICAgWzQsIDQzLCAxNV0sXG5cbiAgICAgIC8vIDdcbiAgICAgIFsyLCA5OCwgNzhdLFxuICAgICAgWzQsIDQ5LCAzMV0sXG4gICAgICBbMiwgMzIsIDE0LCA0LCAzMywgMTVdLFxuICAgICAgWzQsIDM5LCAxMywgMSwgNDAsIDE0XSxcblxuICAgICAgLy8gOFxuICAgICAgWzIsIDEyMSwgOTddLFxuICAgICAgWzIsIDYwLCAzOCwgMiwgNjEsIDM5XSxcbiAgICAgIFs0LCA0MCwgMTgsIDIsIDQxLCAxOV0sXG4gICAgICBbNCwgNDAsIDE0LCAyLCA0MSwgMTVdLFxuXG4gICAgICAvLyA5XG4gICAgICBbMiwgMTQ2LCAxMTZdLFxuICAgICAgWzMsIDU4LCAzNiwgMiwgNTksIDM3XSxcbiAgICAgIFs0LCAzNiwgMTYsIDQsIDM3LCAxN10sXG4gICAgICBbNCwgMzYsIDEyLCA0LCAzNywgMTNdLFxuXG4gICAgICAvLyAxMFxuICAgICAgWzIsIDg2LCA2OCwgMiwgODcsIDY5XSxcbiAgICAgIFs0LCA2OSwgNDMsIDEsIDcwLCA0NF0sXG4gICAgICBbNiwgNDMsIDE5LCAyLCA0NCwgMjBdLFxuICAgICAgWzYsIDQzLCAxNSwgMiwgNDQsIDE2XSxcblxuICAgICAgLy8gMTFcbiAgICAgIFs0LCAxMDEsIDgxXSxcbiAgICAgIFsxLCA4MCwgNTAsIDQsIDgxLCA1MV0sXG4gICAgICBbNCwgNTAsIDIyLCA0LCA1MSwgMjNdLFxuICAgICAgWzMsIDM2LCAxMiwgOCwgMzcsIDEzXSxcblxuICAgICAgLy8gMTJcbiAgICAgIFsyLCAxMTYsIDkyLCAyLCAxMTcsIDkzXSxcbiAgICAgIFs2LCA1OCwgMzYsIDIsIDU5LCAzN10sXG4gICAgICBbNCwgNDYsIDIwLCA2LCA0NywgMjFdLFxuICAgICAgWzcsIDQyLCAxNCwgNCwgNDMsIDE1XSxcblxuICAgICAgLy8gMTNcbiAgICAgIFs0LCAxMzMsIDEwN10sXG4gICAgICBbOCwgNTksIDM3LCAxLCA2MCwgMzhdLFxuICAgICAgWzgsIDQ0LCAyMCwgNCwgNDUsIDIxXSxcbiAgICAgIFsxMiwgMzMsIDExLCA0LCAzNCwgMTJdLFxuXG4gICAgICAvLyAxNFxuICAgICAgWzMsIDE0NSwgMTE1LCAxLCAxNDYsIDExNl0sXG4gICAgICBbNCwgNjQsIDQwLCA1LCA2NSwgNDFdLFxuICAgICAgWzExLCAzNiwgMTYsIDUsIDM3LCAxN10sXG4gICAgICBbMTEsIDM2LCAxMiwgNSwgMzcsIDEzXSxcblxuICAgICAgLy8gMTVcbiAgICAgIFs1LCAxMDksIDg3LCAxLCAxMTAsIDg4XSxcbiAgICAgIFs1LCA2NSwgNDEsIDUsIDY2LCA0Ml0sXG4gICAgICBbNSwgNTQsIDI0LCA3LCA1NSwgMjVdLFxuICAgICAgWzExLCAzNiwgMTIsIDcsIDM3LCAxM10sXG5cbiAgICAgIC8vIDE2XG4gICAgICBbNSwgMTIyLCA5OCwgMSwgMTIzLCA5OV0sXG4gICAgICBbNywgNzMsIDQ1LCAzLCA3NCwgNDZdLFxuICAgICAgWzE1LCA0MywgMTksIDIsIDQ0LCAyMF0sXG4gICAgICBbMywgNDUsIDE1LCAxMywgNDYsIDE2XSxcblxuICAgICAgLy8gMTdcbiAgICAgIFsxLCAxMzUsIDEwNywgNSwgMTM2LCAxMDhdLFxuICAgICAgWzEwLCA3NCwgNDYsIDEsIDc1LCA0N10sXG4gICAgICBbMSwgNTAsIDIyLCAxNSwgNTEsIDIzXSxcbiAgICAgIFsyLCA0MiwgMTQsIDE3LCA0MywgMTVdLFxuXG4gICAgICAvLyAxOFxuICAgICAgWzUsIDE1MCwgMTIwLCAxLCAxNTEsIDEyMV0sXG4gICAgICBbOSwgNjksIDQzLCA0LCA3MCwgNDRdLFxuICAgICAgWzE3LCA1MCwgMjIsIDEsIDUxLCAyM10sXG4gICAgICBbMiwgNDIsIDE0LCAxOSwgNDMsIDE1XSxcblxuICAgICAgLy8gMTlcbiAgICAgIFszLCAxNDEsIDExMywgNCwgMTQyLCAxMTRdLFxuICAgICAgWzMsIDcwLCA0NCwgMTEsIDcxLCA0NV0sXG4gICAgICBbMTcsIDQ3LCAyMSwgNCwgNDgsIDIyXSxcbiAgICAgIFs5LCAzOSwgMTMsIDE2LCA0MCwgMTRdLFxuXG4gICAgICAvLyAyMFxuICAgICAgWzMsIDEzNSwgMTA3LCA1LCAxMzYsIDEwOF0sXG4gICAgICBbMywgNjcsIDQxLCAxMywgNjgsIDQyXSxcbiAgICAgIFsxNSwgNTQsIDI0LCA1LCA1NSwgMjVdLFxuICAgICAgWzE1LCA0MywgMTUsIDEwLCA0NCwgMTZdLFxuXG4gICAgICAvLyAyMVxuICAgICAgWzQsIDE0NCwgMTE2LCA0LCAxNDUsIDExN10sXG4gICAgICBbMTcsIDY4LCA0Ml0sXG4gICAgICBbMTcsIDUwLCAyMiwgNiwgNTEsIDIzXSxcbiAgICAgIFsxOSwgNDYsIDE2LCA2LCA0NywgMTddLFxuXG4gICAgICAvLyAyMlxuICAgICAgWzIsIDEzOSwgMTExLCA3LCAxNDAsIDExMl0sXG4gICAgICBbMTcsIDc0LCA0Nl0sXG4gICAgICBbNywgNTQsIDI0LCAxNiwgNTUsIDI1XSxcbiAgICAgIFszNCwgMzcsIDEzXSxcblxuICAgICAgLy8gMjNcbiAgICAgIFs0LCAxNTEsIDEyMSwgNSwgMTUyLCAxMjJdLFxuICAgICAgWzQsIDc1LCA0NywgMTQsIDc2LCA0OF0sXG4gICAgICBbMTEsIDU0LCAyNCwgMTQsIDU1LCAyNV0sXG4gICAgICBbMTYsIDQ1LCAxNSwgMTQsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDI0XG4gICAgICBbNiwgMTQ3LCAxMTcsIDQsIDE0OCwgMTE4XSxcbiAgICAgIFs2LCA3MywgNDUsIDE0LCA3NCwgNDZdLFxuICAgICAgWzExLCA1NCwgMjQsIDE2LCA1NSwgMjVdLFxuICAgICAgWzMwLCA0NiwgMTYsIDIsIDQ3LCAxN10sXG5cbiAgICAgIC8vIDI1XG4gICAgICBbOCwgMTMyLCAxMDYsIDQsIDEzMywgMTA3XSxcbiAgICAgIFs4LCA3NSwgNDcsIDEzLCA3NiwgNDhdLFxuICAgICAgWzcsIDU0LCAyNCwgMjIsIDU1LCAyNV0sXG4gICAgICBbMjIsIDQ1LCAxNSwgMTMsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDI2XG4gICAgICBbMTAsIDE0MiwgMTE0LCAyLCAxNDMsIDExNV0sXG4gICAgICBbMTksIDc0LCA0NiwgNCwgNzUsIDQ3XSxcbiAgICAgIFsyOCwgNTAsIDIyLCA2LCA1MSwgMjNdLFxuICAgICAgWzMzLCA0NiwgMTYsIDQsIDQ3LCAxN10sXG5cbiAgICAgIC8vIDI3XG4gICAgICBbOCwgMTUyLCAxMjIsIDQsIDE1MywgMTIzXSxcbiAgICAgIFsyMiwgNzMsIDQ1LCAzLCA3NCwgNDZdLFxuICAgICAgWzgsIDUzLCAyMywgMjYsIDU0LCAyNF0sXG4gICAgICBbMTIsIDQ1LCAxNSwgMjgsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDI4XG4gICAgICBbMywgMTQ3LCAxMTcsIDEwLCAxNDgsIDExOF0sXG4gICAgICBbMywgNzMsIDQ1LCAyMywgNzQsIDQ2XSxcbiAgICAgIFs0LCA1NCwgMjQsIDMxLCA1NSwgMjVdLFxuICAgICAgWzExLCA0NSwgMTUsIDMxLCA0NiwgMTZdLFxuXG4gICAgICAvLyAyOVxuICAgICAgWzcsIDE0NiwgMTE2LCA3LCAxNDcsIDExN10sXG4gICAgICBbMjEsIDczLCA0NSwgNywgNzQsIDQ2XSxcbiAgICAgIFsxLCA1MywgMjMsIDM3LCA1NCwgMjRdLFxuICAgICAgWzE5LCA0NSwgMTUsIDI2LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzMFxuICAgICAgWzUsIDE0NSwgMTE1LCAxMCwgMTQ2LCAxMTZdLFxuICAgICAgWzE5LCA3NSwgNDcsIDEwLCA3NiwgNDhdLFxuICAgICAgWzE1LCA1NCwgMjQsIDI1LCA1NSwgMjVdLFxuICAgICAgWzIzLCA0NSwgMTUsIDI1LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzMVxuICAgICAgWzEzLCAxNDUsIDExNSwgMywgMTQ2LCAxMTZdLFxuICAgICAgWzIsIDc0LCA0NiwgMjksIDc1LCA0N10sXG4gICAgICBbNDIsIDU0LCAyNCwgMSwgNTUsIDI1XSxcbiAgICAgIFsyMywgNDUsIDE1LCAyOCwgNDYsIDE2XSxcblxuICAgICAgLy8gMzJcbiAgICAgIFsxNywgMTQ1LCAxMTVdLFxuICAgICAgWzEwLCA3NCwgNDYsIDIzLCA3NSwgNDddLFxuICAgICAgWzEwLCA1NCwgMjQsIDM1LCA1NSwgMjVdLFxuICAgICAgWzE5LCA0NSwgMTUsIDM1LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzM1xuICAgICAgWzE3LCAxNDUsIDExNSwgMSwgMTQ2LCAxMTZdLFxuICAgICAgWzE0LCA3NCwgNDYsIDIxLCA3NSwgNDddLFxuICAgICAgWzI5LCA1NCwgMjQsIDE5LCA1NSwgMjVdLFxuICAgICAgWzExLCA0NSwgMTUsIDQ2LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzNFxuICAgICAgWzEzLCAxNDUsIDExNSwgNiwgMTQ2LCAxMTZdLFxuICAgICAgWzE0LCA3NCwgNDYsIDIzLCA3NSwgNDddLFxuICAgICAgWzQ0LCA1NCwgMjQsIDcsIDU1LCAyNV0sXG4gICAgICBbNTksIDQ2LCAxNiwgMSwgNDcsIDE3XSxcblxuICAgICAgLy8gMzVcbiAgICAgIFsxMiwgMTUxLCAxMjEsIDcsIDE1MiwgMTIyXSxcbiAgICAgIFsxMiwgNzUsIDQ3LCAyNiwgNzYsIDQ4XSxcbiAgICAgIFszOSwgNTQsIDI0LCAxNCwgNTUsIDI1XSxcbiAgICAgIFsyMiwgNDUsIDE1LCA0MSwgNDYsIDE2XSxcblxuICAgICAgLy8gMzZcbiAgICAgIFs2LCAxNTEsIDEyMSwgMTQsIDE1MiwgMTIyXSxcbiAgICAgIFs2LCA3NSwgNDcsIDM0LCA3NiwgNDhdLFxuICAgICAgWzQ2LCA1NCwgMjQsIDEwLCA1NSwgMjVdLFxuICAgICAgWzIsIDQ1LCAxNSwgNjQsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDM3XG4gICAgICBbMTcsIDE1MiwgMTIyLCA0LCAxNTMsIDEyM10sXG4gICAgICBbMjksIDc0LCA0NiwgMTQsIDc1LCA0N10sXG4gICAgICBbNDksIDU0LCAyNCwgMTAsIDU1LCAyNV0sXG4gICAgICBbMjQsIDQ1LCAxNSwgNDYsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDM4XG4gICAgICBbNCwgMTUyLCAxMjIsIDE4LCAxNTMsIDEyM10sXG4gICAgICBbMTMsIDc0LCA0NiwgMzIsIDc1LCA0N10sXG4gICAgICBbNDgsIDU0LCAyNCwgMTQsIDU1LCAyNV0sXG4gICAgICBbNDIsIDQ1LCAxNSwgMzIsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDM5XG4gICAgICBbMjAsIDE0NywgMTE3LCA0LCAxNDgsIDExOF0sXG4gICAgICBbNDAsIDc1LCA0NywgNywgNzYsIDQ4XSxcbiAgICAgIFs0MywgNTQsIDI0LCAyMiwgNTUsIDI1XSxcbiAgICAgIFsxMCwgNDUsIDE1LCA2NywgNDYsIDE2XSxcblxuICAgICAgLy8gNDBcbiAgICAgIFsxOSwgMTQ4LCAxMTgsIDYsIDE0OSwgMTE5XSxcbiAgICAgIFsxOCwgNzUsIDQ3LCAzMSwgNzYsIDQ4XSxcbiAgICAgIFszNCwgNTQsIDI0LCAzNCwgNTUsIDI1XSxcbiAgICAgIFsyMCwgNDUsIDE1LCA2MSwgNDYsIDE2XVxuICAgIF07XG5cbiAgICB2YXIgcXJSU0Jsb2NrID0gZnVuY3Rpb24odG90YWxDb3VudCwgZGF0YUNvdW50KSB7XG4gICAgICB2YXIgX3RoaXMgPSB7fTtcbiAgICAgIF90aGlzLnRvdGFsQ291bnQgPSB0b3RhbENvdW50O1xuICAgICAgX3RoaXMuZGF0YUNvdW50ID0gZGF0YUNvdW50O1xuICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH07XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIHZhciBnZXRSc0Jsb2NrVGFibGUgPSBmdW5jdGlvbih0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuXG4gICAgICBzd2l0Y2goZXJyb3JDb3JyZWN0aW9uTGV2ZWwpIHtcbiAgICAgIGNhc2UgUVJFcnJvckNvcnJlY3Rpb25MZXZlbC5MIDpcbiAgICAgICAgcmV0dXJuIFJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgMF07XG4gICAgICBjYXNlIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWwuTSA6XG4gICAgICAgIHJldHVybiBSU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDFdO1xuICAgICAgY2FzZSBRUkVycm9yQ29ycmVjdGlvbkxldmVsLlEgOlxuICAgICAgICByZXR1cm4gUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAyXTtcbiAgICAgIGNhc2UgUVJFcnJvckNvcnJlY3Rpb25MZXZlbC5IIDpcbiAgICAgICAgcmV0dXJuIFJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgM107XG4gICAgICBkZWZhdWx0IDpcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0UlNCbG9ja3MgPSBmdW5jdGlvbih0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuXG4gICAgICB2YXIgcnNCbG9jayA9IGdldFJzQmxvY2tUYWJsZSh0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3Rpb25MZXZlbCk7XG5cbiAgICAgIGlmICh0eXBlb2YgcnNCbG9jayA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyAnYmFkIHJzIGJsb2NrIEAgdHlwZU51bWJlcjonICsgdHlwZU51bWJlciArXG4gICAgICAgICAgICAnL2Vycm9yQ29ycmVjdGlvbkxldmVsOicgKyBlcnJvckNvcnJlY3Rpb25MZXZlbDtcbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IHJzQmxvY2subGVuZ3RoIC8gMztcblxuICAgICAgdmFyIGxpc3QgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuXG4gICAgICAgIHZhciBjb3VudCA9IHJzQmxvY2tbaSAqIDMgKyAwXTtcbiAgICAgICAgdmFyIHRvdGFsQ291bnQgPSByc0Jsb2NrW2kgKiAzICsgMV07XG4gICAgICAgIHZhciBkYXRhQ291bnQgPSByc0Jsb2NrW2kgKiAzICsgMl07XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb3VudDsgaiArPSAxKSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHFyUlNCbG9jayh0b3RhbENvdW50LCBkYXRhQ291bnQpICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfSgpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyQml0QnVmZmVyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIHFyQml0QnVmZmVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgX2J1ZmZlciA9IFtdO1xuICAgIHZhciBfbGVuZ3RoID0gMDtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX2J1ZmZlcjtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0QXQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgdmFyIGJ1ZkluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIDgpO1xuICAgICAgcmV0dXJuICggKF9idWZmZXJbYnVmSW5kZXhdID4+PiAoNyAtIGluZGV4ICUgOCkgKSAmIDEpID09IDE7XG4gICAgfTtcblxuICAgIF90aGlzLnB1dCA9IGZ1bmN0aW9uKG51bSwgbGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIF90aGlzLnB1dEJpdCggKCAobnVtID4+PiAobGVuZ3RoIC0gaSAtIDEpICkgJiAxKSA9PSAxKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoSW5CaXRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX2xlbmd0aDtcbiAgICB9O1xuXG4gICAgX3RoaXMucHV0Qml0ID0gZnVuY3Rpb24oYml0KSB7XG5cbiAgICAgIHZhciBidWZJbmRleCA9IE1hdGguZmxvb3IoX2xlbmd0aCAvIDgpO1xuICAgICAgaWYgKF9idWZmZXIubGVuZ3RoIDw9IGJ1ZkluZGV4KSB7XG4gICAgICAgIF9idWZmZXIucHVzaCgwKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGJpdCkge1xuICAgICAgICBfYnVmZmVyW2J1ZkluZGV4XSB8PSAoMHg4MCA+Pj4gKF9sZW5ndGggJSA4KSApO1xuICAgICAgfVxuXG4gICAgICBfbGVuZ3RoICs9IDE7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxck51bWJlclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBxck51bWJlciA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIHZhciBfbW9kZSA9IFFSTW9kZS5NT0RFX05VTUJFUjtcbiAgICB2YXIgX2RhdGEgPSBkYXRhO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRNb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX21vZGU7XG4gICAgfTtcblxuICAgIF90aGlzLmdldExlbmd0aCA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgcmV0dXJuIF9kYXRhLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGUgPSBmdW5jdGlvbihidWZmZXIpIHtcblxuICAgICAgdmFyIGRhdGEgPSBfZGF0YTtcblxuICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICB3aGlsZSAoaSArIDIgPCBkYXRhLmxlbmd0aCkge1xuICAgICAgICBidWZmZXIucHV0KHN0clRvTnVtKGRhdGEuc3Vic3RyaW5nKGksIGkgKyAzKSApLCAxMCk7XG4gICAgICAgIGkgKz0gMztcbiAgICAgIH1cblxuICAgICAgaWYgKGkgPCBkYXRhLmxlbmd0aCkge1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggLSBpID09IDEpIHtcbiAgICAgICAgICBidWZmZXIucHV0KHN0clRvTnVtKGRhdGEuc3Vic3RyaW5nKGksIGkgKyAxKSApLCA0KTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhLmxlbmd0aCAtIGkgPT0gMikge1xuICAgICAgICAgIGJ1ZmZlci5wdXQoc3RyVG9OdW0oZGF0YS5zdWJzdHJpbmcoaSwgaSArIDIpICksIDcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzdHJUb051bSA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgIHZhciBudW0gPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIG51bSA9IG51bSAqIDEwICsgY2hhdFRvTnVtKHMuY2hhckF0KGkpICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVtO1xuICAgIH07XG5cbiAgICB2YXIgY2hhdFRvTnVtID0gZnVuY3Rpb24oYykge1xuICAgICAgaWYgKCcwJyA8PSBjICYmIGMgPD0gJzknKSB7XG4gICAgICAgIHJldHVybiBjLmNoYXJDb2RlQXQoMCkgLSAnMCcuY2hhckNvZGVBdCgwKTtcbiAgICAgIH1cbiAgICAgIHRocm93ICdpbGxlZ2FsIGNoYXIgOicgKyBjO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJBbHBoYU51bVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBxckFscGhhTnVtID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgdmFyIF9tb2RlID0gUVJNb2RlLk1PREVfQUxQSEFfTlVNO1xuICAgIHZhciBfZGF0YSA9IGRhdGE7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdldE1vZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbW9kZTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICByZXR1cm4gX2RhdGEubGVuZ3RoO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuXG4gICAgICB2YXIgcyA9IF9kYXRhO1xuXG4gICAgICB2YXIgaSA9IDA7XG5cbiAgICAgIHdoaWxlIChpICsgMSA8IHMubGVuZ3RoKSB7XG4gICAgICAgIGJ1ZmZlci5wdXQoXG4gICAgICAgICAgZ2V0Q29kZShzLmNoYXJBdChpKSApICogNDUgK1xuICAgICAgICAgIGdldENvZGUocy5jaGFyQXQoaSArIDEpICksIDExKTtcbiAgICAgICAgaSArPSAyO1xuICAgICAgfVxuXG4gICAgICBpZiAoaSA8IHMubGVuZ3RoKSB7XG4gICAgICAgIGJ1ZmZlci5wdXQoZ2V0Q29kZShzLmNoYXJBdChpKSApLCA2KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGdldENvZGUgPSBmdW5jdGlvbihjKSB7XG5cbiAgICAgIGlmICgnMCcgPD0gYyAmJiBjIDw9ICc5Jykge1xuICAgICAgICByZXR1cm4gYy5jaGFyQ29kZUF0KDApIC0gJzAnLmNoYXJDb2RlQXQoMCk7XG4gICAgICB9IGVsc2UgaWYgKCdBJyA8PSBjICYmIGMgPD0gJ1onKSB7XG4gICAgICAgIHJldHVybiBjLmNoYXJDb2RlQXQoMCkgLSAnQScuY2hhckNvZGVBdCgwKSArIDEwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpdGNoIChjKSB7XG4gICAgICAgIGNhc2UgJyAnIDogcmV0dXJuIDM2O1xuICAgICAgICBjYXNlICckJyA6IHJldHVybiAzNztcbiAgICAgICAgY2FzZSAnJScgOiByZXR1cm4gMzg7XG4gICAgICAgIGNhc2UgJyonIDogcmV0dXJuIDM5O1xuICAgICAgICBjYXNlICcrJyA6IHJldHVybiA0MDtcbiAgICAgICAgY2FzZSAnLScgOiByZXR1cm4gNDE7XG4gICAgICAgIGNhc2UgJy4nIDogcmV0dXJuIDQyO1xuICAgICAgICBjYXNlICcvJyA6IHJldHVybiA0MztcbiAgICAgICAgY2FzZSAnOicgOiByZXR1cm4gNDQ7XG4gICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgIHRocm93ICdpbGxlZ2FsIGNoYXIgOicgKyBjO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxcjhCaXRCeXRlXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIHFyOEJpdEJ5dGUgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICB2YXIgX21vZGUgPSBRUk1vZGUuTU9ERV84QklUX0JZVEU7XG4gICAgdmFyIF9kYXRhID0gZGF0YTtcbiAgICB2YXIgX2J5dGVzID0gcXJjb2RlLnN0cmluZ1RvQnl0ZXMoZGF0YSk7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdldE1vZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbW9kZTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICByZXR1cm4gX2J5dGVzLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGUgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2J5dGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGJ1ZmZlci5wdXQoX2J5dGVzW2ldLCA4KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyS2FuamlcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcXJLYW5qaSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIHZhciBfbW9kZSA9IFFSTW9kZS5NT0RFX0tBTkpJO1xuICAgIHZhciBfZGF0YSA9IGRhdGE7XG5cbiAgICB2YXIgc3RyaW5nVG9CeXRlcyA9IHFyY29kZS5zdHJpbmdUb0J5dGVzRnVuY3NbJ1NKSVMnXTtcbiAgICBpZiAoIXN0cmluZ1RvQnl0ZXMpIHtcbiAgICAgIHRocm93ICdzamlzIG5vdCBzdXBwb3J0ZWQuJztcbiAgICB9XG4gICAgIWZ1bmN0aW9uKGMsIGNvZGUpIHtcbiAgICAgIC8vIHNlbGYgdGVzdCBmb3Igc2ppcyBzdXBwb3J0LlxuICAgICAgdmFyIHRlc3QgPSBzdHJpbmdUb0J5dGVzKGMpO1xuICAgICAgaWYgKHRlc3QubGVuZ3RoICE9IDIgfHwgKCAodGVzdFswXSA8PCA4KSB8IHRlc3RbMV0pICE9IGNvZGUpIHtcbiAgICAgICAgdGhyb3cgJ3NqaXMgbm90IHN1cHBvcnRlZC4nO1xuICAgICAgfVxuICAgIH0oJ1xcdTUzY2InLCAweDk3NDYpO1xuXG4gICAgdmFyIF9ieXRlcyA9IHN0cmluZ1RvQnl0ZXMoZGF0YSk7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdldE1vZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbW9kZTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICByZXR1cm4gfn4oX2J5dGVzLmxlbmd0aCAvIDIpO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuXG4gICAgICB2YXIgZGF0YSA9IF9ieXRlcztcblxuICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICB3aGlsZSAoaSArIDEgPCBkYXRhLmxlbmd0aCkge1xuXG4gICAgICAgIHZhciBjID0gKCAoMHhmZiAmIGRhdGFbaV0pIDw8IDgpIHwgKDB4ZmYgJiBkYXRhW2kgKyAxXSk7XG5cbiAgICAgICAgaWYgKDB4ODE0MCA8PSBjICYmIGMgPD0gMHg5RkZDKSB7XG4gICAgICAgICAgYyAtPSAweDgxNDA7XG4gICAgICAgIH0gZWxzZSBpZiAoMHhFMDQwIDw9IGMgJiYgYyA8PSAweEVCQkYpIHtcbiAgICAgICAgICBjIC09IDB4QzE0MDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyAnaWxsZWdhbCBjaGFyIGF0ICcgKyAoaSArIDEpICsgJy8nICsgYztcbiAgICAgICAgfVxuXG4gICAgICAgIGMgPSAoIChjID4+PiA4KSAmIDB4ZmYpICogMHhDMCArIChjICYgMHhmZik7XG5cbiAgICAgICAgYnVmZmVyLnB1dChjLCAxMyk7XG5cbiAgICAgICAgaSArPSAyO1xuICAgICAgfVxuXG4gICAgICBpZiAoaSA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIHRocm93ICdpbGxlZ2FsIGNoYXIgYXQgJyArIChpICsgMSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBHSUYgU3VwcG9ydCBldGMuXG4gIC8vXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gYnl0ZUFycmF5T3V0cHV0U3RyZWFtXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIGJ5dGVBcnJheU91dHB1dFN0cmVhbSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIF9ieXRlcyA9IFtdO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy53cml0ZUJ5dGUgPSBmdW5jdGlvbihiKSB7XG4gICAgICBfYnl0ZXMucHVzaChiICYgMHhmZik7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlU2hvcnQgPSBmdW5jdGlvbihpKSB7XG4gICAgICBfdGhpcy53cml0ZUJ5dGUoaSk7XG4gICAgICBfdGhpcy53cml0ZUJ5dGUoaSA+Pj4gOCk7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlQnl0ZXMgPSBmdW5jdGlvbihiLCBvZmYsIGxlbikge1xuICAgICAgb2ZmID0gb2ZmIHx8IDA7XG4gICAgICBsZW4gPSBsZW4gfHwgYi5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgIF90aGlzLndyaXRlQnl0ZShiW2kgKyBvZmZdKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGVTdHJpbmcgPSBmdW5jdGlvbihzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgX3RoaXMud3JpdGVCeXRlKHMuY2hhckNvZGVBdChpKSApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy50b0J5dGVBcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9ieXRlcztcbiAgICB9O1xuXG4gICAgX3RoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzID0gJyc7XG4gICAgICBzICs9ICdbJztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2J5dGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgIHMgKz0gJywnO1xuICAgICAgICB9XG4gICAgICAgIHMgKz0gX2J5dGVzW2ldO1xuICAgICAgfVxuICAgICAgcyArPSAnXSc7XG4gICAgICByZXR1cm4gcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGJhc2U2NEVuY29kZU91dHB1dFN0cmVhbVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBiYXNlNjRFbmNvZGVPdXRwdXRTdHJlYW0gPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBfYnVmZmVyID0gMDtcbiAgICB2YXIgX2J1ZmxlbiA9IDA7XG4gICAgdmFyIF9sZW5ndGggPSAwO1xuICAgIHZhciBfYmFzZTY0ID0gJyc7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIHZhciB3cml0ZUVuY29kZWQgPSBmdW5jdGlvbihiKSB7XG4gICAgICBfYmFzZTY0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoZW5jb2RlKGIgJiAweDNmKSApO1xuICAgIH07XG5cbiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24obikge1xuICAgICAgaWYgKG4gPCAwKSB7XG4gICAgICAgIC8vIGVycm9yLlxuICAgICAgfSBlbHNlIGlmIChuIDwgMjYpIHtcbiAgICAgICAgcmV0dXJuIDB4NDEgKyBuO1xuICAgICAgfSBlbHNlIGlmIChuIDwgNTIpIHtcbiAgICAgICAgcmV0dXJuIDB4NjEgKyAobiAtIDI2KTtcbiAgICAgIH0gZWxzZSBpZiAobiA8IDYyKSB7XG4gICAgICAgIHJldHVybiAweDMwICsgKG4gLSA1Mik7XG4gICAgICB9IGVsc2UgaWYgKG4gPT0gNjIpIHtcbiAgICAgICAgcmV0dXJuIDB4MmI7XG4gICAgICB9IGVsc2UgaWYgKG4gPT0gNjMpIHtcbiAgICAgICAgcmV0dXJuIDB4MmY7XG4gICAgICB9XG4gICAgICB0aHJvdyAnbjonICsgbjtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGVCeXRlID0gZnVuY3Rpb24obikge1xuXG4gICAgICBfYnVmZmVyID0gKF9idWZmZXIgPDwgOCkgfCAobiAmIDB4ZmYpO1xuICAgICAgX2J1ZmxlbiArPSA4O1xuICAgICAgX2xlbmd0aCArPSAxO1xuXG4gICAgICB3aGlsZSAoX2J1ZmxlbiA+PSA2KSB7XG4gICAgICAgIHdyaXRlRW5jb2RlZChfYnVmZmVyID4+PiAoX2J1ZmxlbiAtIDYpICk7XG4gICAgICAgIF9idWZsZW4gLT0gNjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMuZmx1c2ggPSBmdW5jdGlvbigpIHtcblxuICAgICAgaWYgKF9idWZsZW4gPiAwKSB7XG4gICAgICAgIHdyaXRlRW5jb2RlZChfYnVmZmVyIDw8ICg2IC0gX2J1ZmxlbikgKTtcbiAgICAgICAgX2J1ZmZlciA9IDA7XG4gICAgICAgIF9idWZsZW4gPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoX2xlbmd0aCAlIDMgIT0gMCkge1xuICAgICAgICAvLyBwYWRkaW5nXG4gICAgICAgIHZhciBwYWRsZW4gPSAzIC0gX2xlbmd0aCAlIDM7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFkbGVuOyBpICs9IDEpIHtcbiAgICAgICAgICBfYmFzZTY0ICs9ICc9JztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9iYXNlNjQ7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBiYXNlNjREZWNvZGVJbnB1dFN0cmVhbVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBiYXNlNjREZWNvZGVJbnB1dFN0cmVhbSA9IGZ1bmN0aW9uKHN0cikge1xuXG4gICAgdmFyIF9zdHIgPSBzdHI7XG4gICAgdmFyIF9wb3MgPSAwO1xuICAgIHZhciBfYnVmZmVyID0gMDtcbiAgICB2YXIgX2J1ZmxlbiA9IDA7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLnJlYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgd2hpbGUgKF9idWZsZW4gPCA4KSB7XG5cbiAgICAgICAgaWYgKF9wb3MgPj0gX3N0ci5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAoX2J1ZmxlbiA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93ICd1bmV4cGVjdGVkIGVuZCBvZiBmaWxlLi8nICsgX2J1ZmxlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjID0gX3N0ci5jaGFyQXQoX3Bvcyk7XG4gICAgICAgIF9wb3MgKz0gMTtcblxuICAgICAgICBpZiAoYyA9PSAnPScpIHtcbiAgICAgICAgICBfYnVmbGVuID0gMDtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSBpZiAoYy5tYXRjaCgvXlxccyQvKSApIHtcbiAgICAgICAgICAvLyBpZ25vcmUgaWYgd2hpdGVzcGFjZS5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF9idWZmZXIgPSAoX2J1ZmZlciA8PCA2KSB8IGRlY29kZShjLmNoYXJDb2RlQXQoMCkgKTtcbiAgICAgICAgX2J1ZmxlbiArPSA2O1xuICAgICAgfVxuXG4gICAgICB2YXIgbiA9IChfYnVmZmVyID4+PiAoX2J1ZmxlbiAtIDgpICkgJiAweGZmO1xuICAgICAgX2J1ZmxlbiAtPSA4O1xuICAgICAgcmV0dXJuIG47XG4gICAgfTtcblxuICAgIHZhciBkZWNvZGUgPSBmdW5jdGlvbihjKSB7XG4gICAgICBpZiAoMHg0MSA8PSBjICYmIGMgPD0gMHg1YSkge1xuICAgICAgICByZXR1cm4gYyAtIDB4NDE7XG4gICAgICB9IGVsc2UgaWYgKDB4NjEgPD0gYyAmJiBjIDw9IDB4N2EpIHtcbiAgICAgICAgcmV0dXJuIGMgLSAweDYxICsgMjY7XG4gICAgICB9IGVsc2UgaWYgKDB4MzAgPD0gYyAmJiBjIDw9IDB4MzkpIHtcbiAgICAgICAgcmV0dXJuIGMgLSAweDMwICsgNTI7XG4gICAgICB9IGVsc2UgaWYgKGMgPT0gMHgyYikge1xuICAgICAgICByZXR1cm4gNjI7XG4gICAgICB9IGVsc2UgaWYgKGMgPT0gMHgyZikge1xuICAgICAgICByZXR1cm4gNjM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyAnYzonICsgYztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGdpZkltYWdlIChCL1cpXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIGdpZkltYWdlID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXG4gICAgdmFyIF93aWR0aCA9IHdpZHRoO1xuICAgIHZhciBfaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHZhciBfZGF0YSA9IG5ldyBBcnJheSh3aWR0aCAqIGhlaWdodCk7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLnNldFBpeGVsID0gZnVuY3Rpb24oeCwgeSwgcGl4ZWwpIHtcbiAgICAgIF9kYXRhW3kgKiBfd2lkdGggKyB4XSA9IHBpeGVsO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZSA9IGZ1bmN0aW9uKG91dCkge1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gR0lGIFNpZ25hdHVyZVxuXG4gICAgICBvdXQud3JpdGVTdHJpbmcoJ0dJRjg3YScpO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gU2NyZWVuIERlc2NyaXB0b3JcblxuICAgICAgb3V0LndyaXRlU2hvcnQoX3dpZHRoKTtcbiAgICAgIG91dC53cml0ZVNob3J0KF9oZWlnaHQpO1xuXG4gICAgICBvdXQud3JpdGVCeXRlKDB4ODApOyAvLyAyYml0XG4gICAgICBvdXQud3JpdGVCeXRlKDApO1xuICAgICAgb3V0LndyaXRlQnl0ZSgwKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIEdsb2JhbCBDb2xvciBNYXBcblxuICAgICAgLy8gYmxhY2tcbiAgICAgIG91dC53cml0ZUJ5dGUoMHgwMCk7XG4gICAgICBvdXQud3JpdGVCeXRlKDB4MDApO1xuICAgICAgb3V0LndyaXRlQnl0ZSgweDAwKTtcblxuICAgICAgLy8gd2hpdGVcbiAgICAgIG91dC53cml0ZUJ5dGUoMHhmZik7XG4gICAgICBvdXQud3JpdGVCeXRlKDB4ZmYpO1xuICAgICAgb3V0LndyaXRlQnl0ZSgweGZmKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIEltYWdlIERlc2NyaXB0b3JcblxuICAgICAgb3V0LndyaXRlU3RyaW5nKCcsJyk7XG4gICAgICBvdXQud3JpdGVTaG9ydCgwKTtcbiAgICAgIG91dC53cml0ZVNob3J0KDApO1xuICAgICAgb3V0LndyaXRlU2hvcnQoX3dpZHRoKTtcbiAgICAgIG91dC53cml0ZVNob3J0KF9oZWlnaHQpO1xuICAgICAgb3V0LndyaXRlQnl0ZSgwKTtcblxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIExvY2FsIENvbG9yIE1hcFxuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gUmFzdGVyIERhdGFcblxuICAgICAgdmFyIGx6d01pbkNvZGVTaXplID0gMjtcbiAgICAgIHZhciByYXN0ZXIgPSBnZXRMWldSYXN0ZXIobHp3TWluQ29kZVNpemUpO1xuXG4gICAgICBvdXQud3JpdGVCeXRlKGx6d01pbkNvZGVTaXplKTtcblxuICAgICAgdmFyIG9mZnNldCA9IDA7XG5cbiAgICAgIHdoaWxlIChyYXN0ZXIubGVuZ3RoIC0gb2Zmc2V0ID4gMjU1KSB7XG4gICAgICAgIG91dC53cml0ZUJ5dGUoMjU1KTtcbiAgICAgICAgb3V0LndyaXRlQnl0ZXMocmFzdGVyLCBvZmZzZXQsIDI1NSk7XG4gICAgICAgIG9mZnNldCArPSAyNTU7XG4gICAgICB9XG5cbiAgICAgIG91dC53cml0ZUJ5dGUocmFzdGVyLmxlbmd0aCAtIG9mZnNldCk7XG4gICAgICBvdXQud3JpdGVCeXRlcyhyYXN0ZXIsIG9mZnNldCwgcmFzdGVyLmxlbmd0aCAtIG9mZnNldCk7XG4gICAgICBvdXQud3JpdGVCeXRlKDB4MDApO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gR0lGIFRlcm1pbmF0b3JcbiAgICAgIG91dC53cml0ZVN0cmluZygnOycpO1xuICAgIH07XG5cbiAgICB2YXIgYml0T3V0cHV0U3RyZWFtID0gZnVuY3Rpb24ob3V0KSB7XG5cbiAgICAgIHZhciBfb3V0ID0gb3V0O1xuICAgICAgdmFyIF9iaXRMZW5ndGggPSAwO1xuICAgICAgdmFyIF9iaXRCdWZmZXIgPSAwO1xuXG4gICAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgICAgX3RoaXMud3JpdGUgPSBmdW5jdGlvbihkYXRhLCBsZW5ndGgpIHtcblxuICAgICAgICBpZiAoIChkYXRhID4+PiBsZW5ndGgpICE9IDApIHtcbiAgICAgICAgICB0aHJvdyAnbGVuZ3RoIG92ZXInO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKF9iaXRMZW5ndGggKyBsZW5ndGggPj0gOCkge1xuICAgICAgICAgIF9vdXQud3JpdGVCeXRlKDB4ZmYgJiAoIChkYXRhIDw8IF9iaXRMZW5ndGgpIHwgX2JpdEJ1ZmZlcikgKTtcbiAgICAgICAgICBsZW5ndGggLT0gKDggLSBfYml0TGVuZ3RoKTtcbiAgICAgICAgICBkYXRhID4+Pj0gKDggLSBfYml0TGVuZ3RoKTtcbiAgICAgICAgICBfYml0QnVmZmVyID0gMDtcbiAgICAgICAgICBfYml0TGVuZ3RoID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIF9iaXRCdWZmZXIgPSAoZGF0YSA8PCBfYml0TGVuZ3RoKSB8IF9iaXRCdWZmZXI7XG4gICAgICAgIF9iaXRMZW5ndGggPSBfYml0TGVuZ3RoICsgbGVuZ3RoO1xuICAgICAgfTtcblxuICAgICAgX3RoaXMuZmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF9iaXRMZW5ndGggPiAwKSB7XG4gICAgICAgICAgX291dC53cml0ZUJ5dGUoX2JpdEJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBfdGhpcztcbiAgICB9O1xuXG4gICAgdmFyIGdldExaV1Jhc3RlciA9IGZ1bmN0aW9uKGx6d01pbkNvZGVTaXplKSB7XG5cbiAgICAgIHZhciBjbGVhckNvZGUgPSAxIDw8IGx6d01pbkNvZGVTaXplO1xuICAgICAgdmFyIGVuZENvZGUgPSAoMSA8PCBsendNaW5Db2RlU2l6ZSkgKyAxO1xuICAgICAgdmFyIGJpdExlbmd0aCA9IGx6d01pbkNvZGVTaXplICsgMTtcblxuICAgICAgLy8gU2V0dXAgTFpXVGFibGVcbiAgICAgIHZhciB0YWJsZSA9IGx6d1RhYmxlKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xlYXJDb2RlOyBpICs9IDEpIHtcbiAgICAgICAgdGFibGUuYWRkKFN0cmluZy5mcm9tQ2hhckNvZGUoaSkgKTtcbiAgICAgIH1cbiAgICAgIHRhYmxlLmFkZChTdHJpbmcuZnJvbUNoYXJDb2RlKGNsZWFyQ29kZSkgKTtcbiAgICAgIHRhYmxlLmFkZChTdHJpbmcuZnJvbUNoYXJDb2RlKGVuZENvZGUpICk7XG5cbiAgICAgIHZhciBieXRlT3V0ID0gYnl0ZUFycmF5T3V0cHV0U3RyZWFtKCk7XG4gICAgICB2YXIgYml0T3V0ID0gYml0T3V0cHV0U3RyZWFtKGJ5dGVPdXQpO1xuXG4gICAgICAvLyBjbGVhciBjb2RlXG4gICAgICBiaXRPdXQud3JpdGUoY2xlYXJDb2RlLCBiaXRMZW5ndGgpO1xuXG4gICAgICB2YXIgZGF0YUluZGV4ID0gMDtcblxuICAgICAgdmFyIHMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKF9kYXRhW2RhdGFJbmRleF0pO1xuICAgICAgZGF0YUluZGV4ICs9IDE7XG5cbiAgICAgIHdoaWxlIChkYXRhSW5kZXggPCBfZGF0YS5sZW5ndGgpIHtcblxuICAgICAgICB2YXIgYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoX2RhdGFbZGF0YUluZGV4XSk7XG4gICAgICAgIGRhdGFJbmRleCArPSAxO1xuXG4gICAgICAgIGlmICh0YWJsZS5jb250YWlucyhzICsgYykgKSB7XG5cbiAgICAgICAgICBzID0gcyArIGM7XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIGJpdE91dC53cml0ZSh0YWJsZS5pbmRleE9mKHMpLCBiaXRMZW5ndGgpO1xuXG4gICAgICAgICAgaWYgKHRhYmxlLnNpemUoKSA8IDB4ZmZmKSB7XG5cbiAgICAgICAgICAgIGlmICh0YWJsZS5zaXplKCkgPT0gKDEgPDwgYml0TGVuZ3RoKSApIHtcbiAgICAgICAgICAgICAgYml0TGVuZ3RoICs9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRhYmxlLmFkZChzICsgYyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcyA9IGM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYml0T3V0LndyaXRlKHRhYmxlLmluZGV4T2YocyksIGJpdExlbmd0aCk7XG5cbiAgICAgIC8vIGVuZCBjb2RlXG4gICAgICBiaXRPdXQud3JpdGUoZW5kQ29kZSwgYml0TGVuZ3RoKTtcblxuICAgICAgYml0T3V0LmZsdXNoKCk7XG5cbiAgICAgIHJldHVybiBieXRlT3V0LnRvQnl0ZUFycmF5KCk7XG4gICAgfTtcblxuICAgIHZhciBsendUYWJsZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgX21hcCA9IHt9O1xuICAgICAgdmFyIF9zaXplID0gMDtcblxuICAgICAgdmFyIF90aGlzID0ge307XG5cbiAgICAgIF90aGlzLmFkZCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBpZiAoX3RoaXMuY29udGFpbnMoa2V5KSApIHtcbiAgICAgICAgICB0aHJvdyAnZHVwIGtleTonICsga2V5O1xuICAgICAgICB9XG4gICAgICAgIF9tYXBba2V5XSA9IF9zaXplO1xuICAgICAgICBfc2l6ZSArPSAxO1xuICAgICAgfTtcblxuICAgICAgX3RoaXMuc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3NpemU7XG4gICAgICB9O1xuXG4gICAgICBfdGhpcy5pbmRleE9mID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHJldHVybiBfbWFwW2tleV07XG4gICAgICB9O1xuXG4gICAgICBfdGhpcy5jb250YWlucyA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIF9tYXBba2V5XSAhPSAndW5kZWZpbmVkJztcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBfdGhpcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIHZhciBjcmVhdGVEYXRhVVJMID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgZ2V0UGl4ZWwpIHtcbiAgICB2YXIgZ2lmID0gZ2lmSW1hZ2Uod2lkdGgsIGhlaWdodCk7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkgKz0gMSkge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCArPSAxKSB7XG4gICAgICAgIGdpZi5zZXRQaXhlbCh4LCB5LCBnZXRQaXhlbCh4LCB5KSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBiID0gYnl0ZUFycmF5T3V0cHV0U3RyZWFtKCk7XG4gICAgZ2lmLndyaXRlKGIpO1xuXG4gICAgdmFyIGJhc2U2NCA9IGJhc2U2NEVuY29kZU91dHB1dFN0cmVhbSgpO1xuICAgIHZhciBieXRlcyA9IGIudG9CeXRlQXJyYXkoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBiYXNlNjQud3JpdGVCeXRlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgYmFzZTY0LmZsdXNoKCk7XG5cbiAgICByZXR1cm4gJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCwnICsgYmFzZTY0O1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHJldHVybnMgcXJjb2RlIGZ1bmN0aW9uLlxuXG4gIHJldHVybiBxcmNvZGU7XG59KCk7XG5cbi8vIG11bHRpYnl0ZSBzdXBwb3J0XG4hZnVuY3Rpb24oKSB7XG5cbiAgcXJjb2RlLnN0cmluZ1RvQnl0ZXNGdW5jc1snVVRGLTgnXSA9IGZ1bmN0aW9uKHMpIHtcbiAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE4NzI5NDA1L2hvdy10by1jb252ZXJ0LXV0Zjgtc3RyaW5nLXRvLWJ5dGUtYXJyYXlcbiAgICBmdW5jdGlvbiB0b1VURjhBcnJheShzdHIpIHtcbiAgICAgIHZhciB1dGY4ID0gW107XG4gICAgICBmb3IgKHZhciBpPTA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoYXJjb2RlID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjaGFyY29kZSA8IDB4ODApIHV0ZjgucHVzaChjaGFyY29kZSk7XG4gICAgICAgIGVsc2UgaWYgKGNoYXJjb2RlIDwgMHg4MDApIHtcbiAgICAgICAgICB1dGY4LnB1c2goMHhjMCB8IChjaGFyY29kZSA+PiA2KSxcbiAgICAgICAgICAgICAgMHg4MCB8IChjaGFyY29kZSAmIDB4M2YpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaGFyY29kZSA8IDB4ZDgwMCB8fCBjaGFyY29kZSA+PSAweGUwMDApIHtcbiAgICAgICAgICB1dGY4LnB1c2goMHhlMCB8IChjaGFyY29kZSA+PiAxMiksXG4gICAgICAgICAgICAgIDB4ODAgfCAoKGNoYXJjb2RlPj42KSAmIDB4M2YpLFxuICAgICAgICAgICAgICAweDgwIHwgKGNoYXJjb2RlICYgMHgzZikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICAvLyBVVEYtMTYgZW5jb2RlcyAweDEwMDAwLTB4MTBGRkZGIGJ5XG4gICAgICAgICAgLy8gc3VidHJhY3RpbmcgMHgxMDAwMCBhbmQgc3BsaXR0aW5nIHRoZVxuICAgICAgICAgIC8vIDIwIGJpdHMgb2YgMHgwLTB4RkZGRkYgaW50byB0d28gaGFsdmVzXG4gICAgICAgICAgY2hhcmNvZGUgPSAweDEwMDAwICsgKCgoY2hhcmNvZGUgJiAweDNmZik8PDEwKVxuICAgICAgICAgICAgfCAoc3RyLmNoYXJDb2RlQXQoaSkgJiAweDNmZikpO1xuICAgICAgICAgIHV0ZjgucHVzaCgweGYwIHwgKGNoYXJjb2RlID4+MTgpLFxuICAgICAgICAgICAgICAweDgwIHwgKChjaGFyY29kZT4+MTIpICYgMHgzZiksXG4gICAgICAgICAgICAgIDB4ODAgfCAoKGNoYXJjb2RlPj42KSAmIDB4M2YpLFxuICAgICAgICAgICAgICAweDgwIHwgKGNoYXJjb2RlICYgMHgzZikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdXRmODtcbiAgICB9XG4gICAgcmV0dXJuIHRvVVRGOEFycmF5KHMpO1xuICB9O1xuXG59KCk7XG5cbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH1cbn0oZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBxcmNvZGU7XG59KSk7XG4iLCJpbXBvcnQgeyBDb3JuZXJEb3RUeXBlcyB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRvdDogXCJkb3RcIixcbiAgc3F1YXJlOiBcInNxdWFyZVwiXG59IGFzIENvcm5lckRvdFR5cGVzO1xuIiwiaW1wb3J0IHsgQ29ybmVyU3F1YXJlVHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkb3Q6IFwiZG90XCIsXG4gIHNxdWFyZTogXCJzcXVhcmVcIixcbiAgZXh0cmFSb3VuZGVkOiBcImV4dHJhLXJvdW5kZWRcIlxufSBhcyBDb3JuZXJTcXVhcmVUeXBlcztcbiIsImltcG9ydCB7IERvdFR5cGVzIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZG90czogXCJkb3RzXCIsXG4gIHJvdW5kZWQ6IFwicm91bmRlZFwiLFxuICBjbGFzc3k6IFwiY2xhc3N5XCIsXG4gIGNsYXNzeVJvdW5kZWQ6IFwiY2xhc3N5LXJvdW5kZWRcIixcbiAgc3F1YXJlOiBcInNxdWFyZVwiLFxuICBleHRyYVJvdW5kZWQ6IFwiZXh0cmEtcm91bmRlZFwiXG59IGFzIERvdFR5cGVzO1xuIiwiaW1wb3J0IHsgRHJhd1R5cGVzIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY2FudmFzOiBcImNhbnZhc1wiLFxuICBzdmc6IFwic3ZnXCJcbn0gYXMgRHJhd1R5cGVzO1xuIiwiaW1wb3J0IHsgRXJyb3JDb3JyZWN0aW9uTGV2ZWwgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuaW50ZXJmYWNlIEVycm9yQ29ycmVjdGlvbkxldmVscyB7XG4gIFtrZXk6IHN0cmluZ106IEVycm9yQ29ycmVjdGlvbkxldmVsO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIEw6IFwiTFwiLFxuICBNOiBcIk1cIixcbiAgUTogXCJRXCIsXG4gIEg6IFwiSFwiXG59IGFzIEVycm9yQ29ycmVjdGlvbkxldmVscztcbiIsImludGVyZmFjZSBFcnJvckNvcnJlY3Rpb25QZXJjZW50cyB7XG4gIFtrZXk6IHN0cmluZ106IG51bWJlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBMOiAwLjA3LFxuICBNOiAwLjE1LFxuICBROiAwLjI1LFxuICBIOiAwLjNcbn0gYXMgRXJyb3JDb3JyZWN0aW9uUGVyY2VudHM7XG4iLCJpbXBvcnQgeyBHcmFkaWVudFR5cGVzIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmFkaWFsOiBcInJhZGlhbFwiLFxuICBsaW5lYXI6IFwibGluZWFyXCJcbn0gYXMgR3JhZGllbnRUeXBlcztcbiIsImltcG9ydCB7IE1vZGUgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuaW50ZXJmYWNlIE1vZGVzIHtcbiAgW2tleTogc3RyaW5nXTogTW9kZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBudW1lcmljOiBcIk51bWVyaWNcIixcbiAgYWxwaGFudW1lcmljOiBcIkFscGhhbnVtZXJpY1wiLFxuICBieXRlOiBcIkJ5dGVcIixcbiAga2Fuamk6IFwiS2FuamlcIlxufSBhcyBNb2RlcztcbiIsImltcG9ydCB7IFR5cGVOdW1iZXIgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuaW50ZXJmYWNlIFR5cGVzTWFwIHtcbiAgW2tleTogbnVtYmVyXTogVHlwZU51bWJlcjtcbn1cblxuY29uc3QgcXJUeXBlczogVHlwZXNNYXAgPSB7fTtcblxuZm9yIChsZXQgdHlwZSA9IDA7IHR5cGUgPD0gNDA7IHR5cGUrKykge1xuICBxclR5cGVzW3R5cGVdID0gdHlwZSBhcyBUeXBlTnVtYmVyO1xufVxuXG4vLyAwIHR5cGVzIGlzIGF1dG9kZXRlY3RcblxuLy8gdHlwZXMgPSB7XG4vLyAgICAgMDogMCxcbi8vICAgICAxOiAxLFxuLy8gICAgIC4uLlxuLy8gICAgIDQwOiA0MFxuLy8gfVxuXG5leHBvcnQgZGVmYXVsdCBxclR5cGVzO1xuIiwiaW1wb3J0IHsgU2hhcGVUeXBlcyB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHNxdWFyZTogXCJzcXVhcmVcIixcbiAgY2lyY2xlOiBcImNpcmNsZVwiXG59IGFzIFNoYXBlVHlwZXM7XG4iLCJpbXBvcnQgZ2V0TW9kZSBmcm9tIFwiLi4vdG9vbHMvZ2V0TW9kZVwiO1xuaW1wb3J0IG1lcmdlRGVlcCBmcm9tIFwiLi4vdG9vbHMvbWVyZ2VcIjtcbmltcG9ydCBkb3dubG9hZFVSSSBmcm9tIFwiLi4vdG9vbHMvZG93bmxvYWRVUklcIjtcbmltcG9ydCBRUlNWRyBmcm9tIFwiLi9RUlNWR1wiO1xuaW1wb3J0IGRyYXdUeXBlcyBmcm9tIFwiLi4vY29uc3RhbnRzL2RyYXdUeXBlc1wiO1xuXG5pbXBvcnQgZGVmYXVsdE9wdGlvbnMsIHsgUmVxdWlyZWRPcHRpb25zIH0gZnJvbSBcIi4vUVJPcHRpb25zXCI7XG5pbXBvcnQgc2FuaXRpemVPcHRpb25zIGZyb20gXCIuLi90b29scy9zYW5pdGl6ZU9wdGlvbnNcIjtcbmltcG9ydCB7IEZpbGVFeHRlbnNpb24sIFFSQ29kZSwgT3B0aW9ucywgRG93bmxvYWRPcHRpb25zLCBFeHRlbnNpb25GdW5jdGlvbiB9IGZyb20gXCIuLi90eXBlc1wiO1xuaW1wb3J0IHFyY29kZSBmcm9tIFwicXJjb2RlLWdlbmVyYXRvclwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRUkNvZGVTdHlsaW5nIHtcbiAgX29wdGlvbnM6IFJlcXVpcmVkT3B0aW9ucztcbiAgX2NvbnRhaW5lcj86IEhUTUxFbGVtZW50O1xuICBfY2FudmFzPzogSFRNTENhbnZhc0VsZW1lbnQ7XG4gIF9zdmc/OiBTVkdFbGVtZW50O1xuICBfcXI/OiBRUkNvZGU7XG4gIF9leHRlbnNpb24/OiBFeHRlbnNpb25GdW5jdGlvbjtcbiAgX2NhbnZhc0RyYXdpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPjtcbiAgX3N2Z0RyYXdpbmdQcm9taXNlPzogUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogUGFydGlhbDxPcHRpb25zPikge1xuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zID8gc2FuaXRpemVPcHRpb25zKG1lcmdlRGVlcChkZWZhdWx0T3B0aW9ucywgb3B0aW9ucykgYXMgUmVxdWlyZWRPcHRpb25zKSA6IGRlZmF1bHRPcHRpb25zO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBzdGF0aWMgX2NsZWFyQ29udGFpbmVyKGNvbnRhaW5lcj86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgfVxuICB9XG5cbiAgX3NldHVwU3ZnKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcXJTVkcgPSBuZXcgUVJTVkcodGhpcy5fb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9zdmcgPSBxclNWRy5nZXRFbGVtZW50KCk7XG4gICAgdGhpcy5fc3ZnRHJhd2luZ1Byb21pc2UgPSBxclNWRy5kcmF3UVIodGhpcy5fcXIpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9zdmcpIHJldHVybjtcbiAgICAgIHRoaXMuX2V4dGVuc2lvbj8uKHFyU1ZHLmdldEVsZW1lbnQoKSwgdGhpcy5fb3B0aW9ucyk7XG4gICAgfSk7XG4gIH1cblxuICBfc2V0dXBDYW52YXMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9xcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgdGhpcy5fY2FudmFzLndpZHRoID0gdGhpcy5fb3B0aW9ucy53aWR0aDtcbiAgICB0aGlzLl9jYW52YXMuaGVpZ2h0ID0gdGhpcy5fb3B0aW9ucy5oZWlnaHQ7XG5cbiAgICB0aGlzLl9zZXR1cFN2ZygpO1xuICAgIHRoaXMuX2NhbnZhc0RyYXdpbmdQcm9taXNlID0gdGhpcy5fc3ZnRHJhd2luZ1Byb21pc2U/LnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9zdmcpIHJldHVybjtcblxuICAgICAgY29uc3Qgc3ZnID0gdGhpcy5fc3ZnO1xuICAgICAgY29uc3QgeG1sID0gbmV3IFhNTFNlcmlhbGl6ZXIoKS5zZXJpYWxpemVUb1N0cmluZyhzdmcpO1xuICAgICAgY29uc3Qgc3ZnNjQgPSBidG9hKHhtbCk7XG4gICAgICBjb25zdCBpbWFnZTY0ID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFwiICsgc3ZnNjQ7XG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgaW1hZ2Uub25sb2FkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICAgIHRoaXMuX2NhbnZhcz8uZ2V0Q29udGV4dChcIjJkXCIpPy5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpbWFnZS5zcmMgPSBpbWFnZTY0O1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfZ2V0RWxlbWVudChleHRlbnNpb246IEZpbGVFeHRlbnNpb24gPSBcInBuZ1wiKTogUHJvbWlzZTxTVkdFbGVtZW50IHwgSFRNTENhbnZhc0VsZW1lbnQgfCB1bmRlZmluZWQ+IHtcbiAgICBpZiAoIXRoaXMuX3FyKSB0aHJvdyBcIlFSIGNvZGUgaXMgZW1wdHlcIjtcblxuICAgIGlmIChleHRlbnNpb24udG9Mb3dlckNhc2UoKSA9PT0gXCJzdmdcIikge1xuICAgICAgaWYgKCF0aGlzLl9zdmcgfHwgIXRoaXMuX3N2Z0RyYXdpbmdQcm9taXNlKSB7XG4gICAgICAgIHRoaXMuX3NldHVwU3ZnKCk7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLl9zdmdEcmF3aW5nUHJvbWlzZTtcbiAgICAgIHJldHVybiB0aGlzLl9zdmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5fY2FudmFzIHx8ICF0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZSkge1xuICAgICAgICB0aGlzLl9zZXR1cENhbnZhcygpO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5fY2FudmFzRHJhd2luZ1Byb21pc2U7XG4gICAgICByZXR1cm4gdGhpcy5fY2FudmFzO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZShvcHRpb25zPzogUGFydGlhbDxPcHRpb25zPik6IHZvaWQge1xuICAgIFFSQ29kZVN0eWxpbmcuX2NsZWFyQ29udGFpbmVyKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnMgPyBzYW5pdGl6ZU9wdGlvbnMobWVyZ2VEZWVwKHRoaXMuX29wdGlvbnMsIG9wdGlvbnMpIGFzIFJlcXVpcmVkT3B0aW9ucykgOiB0aGlzLl9vcHRpb25zO1xuXG4gICAgaWYgKCF0aGlzLl9vcHRpb25zLmRhdGEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9xciA9IHFyY29kZSh0aGlzLl9vcHRpb25zLnFyT3B0aW9ucy50eXBlTnVtYmVyLCB0aGlzLl9vcHRpb25zLnFyT3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbCk7XG4gICAgdGhpcy5fcXIuYWRkRGF0YSh0aGlzLl9vcHRpb25zLmRhdGEsIHRoaXMuX29wdGlvbnMucXJPcHRpb25zLm1vZGUgfHwgZ2V0TW9kZSh0aGlzLl9vcHRpb25zLmRhdGEpKTtcbiAgICB0aGlzLl9xci5tYWtlKCk7XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy50eXBlID09PSBkcmF3VHlwZXMuY2FudmFzKSB7XG4gICAgICB0aGlzLl9zZXR1cENhbnZhcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXR1cFN2ZygpO1xuICAgIH1cblxuICAgIHRoaXMuYXBwZW5kKHRoaXMuX2NvbnRhaW5lcik7XG4gIH1cblxuICBhcHBlbmQoY29udGFpbmVyPzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY29udGFpbmVyLmFwcGVuZENoaWxkICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IFwiQ29udGFpbmVyIHNob3VsZCBiZSBhIHNpbmdsZSBET00gbm9kZVwiO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9vcHRpb25zLnR5cGUgPT09IGRyYXdUeXBlcy5jYW52YXMpIHtcbiAgICAgIGlmICh0aGlzLl9jYW52YXMpIHtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2NhbnZhcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9zdmcpIHtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3N2Zyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuICB9XG5cbiAgYXBwbHlFeHRlbnNpb24oZXh0ZW5zaW9uOiBFeHRlbnNpb25GdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICghZXh0ZW5zaW9uKSB7XG4gICAgICB0aHJvdyBcIkV4dGVuc2lvbiBmdW5jdGlvbiBzaG91bGQgYmUgZGVmaW5lZC5cIjtcbiAgICB9XG5cbiAgICB0aGlzLl9leHRlbnNpb24gPSBleHRlbnNpb247XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIGRlbGV0ZUV4dGVuc2lvbigpOiB2b2lkIHtcbiAgICB0aGlzLl9leHRlbnNpb24gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIGFzeW5jIGdldFJhd0RhdGEoZXh0ZW5zaW9uOiBGaWxlRXh0ZW5zaW9uID0gXCJwbmdcIik6IFByb21pc2U8QmxvYiB8IG51bGw+IHtcbiAgICBpZiAoIXRoaXMuX3FyKSB0aHJvdyBcIlFSIGNvZGUgaXMgZW1wdHlcIjtcbiAgICBjb25zdCBlbGVtZW50ID0gYXdhaXQgdGhpcy5fZ2V0RWxlbWVudChleHRlbnNpb24pO1xuXG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoZXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkgPT09IFwic3ZnXCIpIHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZXIgPSBuZXcgWE1MU2VyaWFsaXplcigpO1xuICAgICAgY29uc3Qgc291cmNlID0gc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhlbGVtZW50KTtcblxuICAgICAgcmV0dXJuIG5ldyBCbG9iKFsnPD94bWwgdmVyc2lvbj1cIjEuMFwiIHN0YW5kYWxvbmU9XCJub1wiPz5cXHJcXG4nICsgc291cmNlXSwgeyB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIiB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiAoZWxlbWVudCBhcyBIVE1MQ2FudmFzRWxlbWVudCkudG9CbG9iKHJlc29sdmUsIGBpbWFnZS8ke2V4dGVuc2lvbn1gLCAxKSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZG93bmxvYWQoZG93bmxvYWRPcHRpb25zPzogUGFydGlhbDxEb3dubG9hZE9wdGlvbnM+IHwgc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLl9xcikgdGhyb3cgXCJRUiBjb2RlIGlzIGVtcHR5XCI7XG4gICAgbGV0IGV4dGVuc2lvbiA9IFwicG5nXCIgYXMgRmlsZUV4dGVuc2lvbjtcbiAgICBsZXQgbmFtZSA9IFwicXJcIjtcblxuICAgIC8vVE9ETyByZW1vdmUgZGVwcmVjYXRlZCBjb2RlIGluIHRoZSB2MlxuICAgIGlmICh0eXBlb2YgZG93bmxvYWRPcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBleHRlbnNpb24gPSBkb3dubG9hZE9wdGlvbnMgYXMgRmlsZUV4dGVuc2lvbjtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgXCJFeHRlbnNpb24gaXMgZGVwcmVjYXRlZCBhcyBhcmd1bWVudCBmb3IgJ2Rvd25sb2FkJyBtZXRob2QsIHBsZWFzZSBwYXNzIG9iamVjdCB7IG5hbWU6ICcuLi4nLCBleHRlbnNpb246ICcuLi4nIH0gYXMgYXJndW1lbnRcIlxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb3dubG9hZE9wdGlvbnMgPT09IFwib2JqZWN0XCIgJiYgZG93bmxvYWRPcHRpb25zICE9PSBudWxsKSB7XG4gICAgICBpZiAoZG93bmxvYWRPcHRpb25zLm5hbWUpIHtcbiAgICAgICAgbmFtZSA9IGRvd25sb2FkT3B0aW9ucy5uYW1lO1xuICAgICAgfVxuICAgICAgaWYgKGRvd25sb2FkT3B0aW9ucy5leHRlbnNpb24pIHtcbiAgICAgICAgZXh0ZW5zaW9uID0gZG93bmxvYWRPcHRpb25zLmV4dGVuc2lvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gYXdhaXQgdGhpcy5fZ2V0RWxlbWVudChleHRlbnNpb24pO1xuXG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcbiAgICAgIGxldCBzb3VyY2UgPSBzZXJpYWxpemVyLnNlcmlhbGl6ZVRvU3RyaW5nKGVsZW1lbnQpO1xuXG4gICAgICBzb3VyY2UgPSAnPD94bWwgdmVyc2lvbj1cIjEuMFwiIHN0YW5kYWxvbmU9XCJub1wiPz5cXHJcXG4nICsgc291cmNlO1xuICAgICAgY29uc3QgdXJsID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudChzb3VyY2UpO1xuICAgICAgZG93bmxvYWRVUkkodXJsLCBgJHtuYW1lfS5zdmdgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdXJsID0gKGVsZW1lbnQgYXMgSFRNTENhbnZhc0VsZW1lbnQpLnRvRGF0YVVSTChgaW1hZ2UvJHtleHRlbnNpb259YCk7XG4gICAgICBkb3dubG9hZFVSSSh1cmwsIGAke25hbWV9LiR7ZXh0ZW5zaW9ufWApO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHFyVHlwZXMgZnJvbSBcIi4uL2NvbnN0YW50cy9xclR5cGVzXCI7XG5pbXBvcnQgZHJhd1R5cGVzIGZyb20gXCIuLi9jb25zdGFudHMvZHJhd1R5cGVzXCI7XG5pbXBvcnQgc2hhcGVUeXBlcyBmcm9tIFwiLi4vY29uc3RhbnRzL3NoYXBlVHlwZXNcIjtcbmltcG9ydCBlcnJvckNvcnJlY3Rpb25MZXZlbHMgZnJvbSBcIi4uL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25MZXZlbHNcIjtcbmltcG9ydCB7IFNoYXBlVHlwZSwgRG90VHlwZSwgT3B0aW9ucywgVHlwZU51bWJlciwgRXJyb3JDb3JyZWN0aW9uTGV2ZWwsIE1vZGUsIERyYXdUeXBlLCBHcmFkaWVudCB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVpcmVkT3B0aW9ucyBleHRlbmRzIE9wdGlvbnMge1xuICB0eXBlOiBEcmF3VHlwZTtcbiAgc2hhcGU6IFNoYXBlVHlwZTtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIG1hcmdpbjogbnVtYmVyO1xuICBkYXRhOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvU1ZHL0F0dHJpYnV0ZS9zaGFwZS1yZW5kZXJpbmcjdXNhZ2Vfbm90ZXNcbiAgICovXG4gIHNoYXBlUmVuZGVyaW5nPzogc3RyaW5nO1xuICBxck9wdGlvbnM6IHtcbiAgICB0eXBlTnVtYmVyOiBUeXBlTnVtYmVyO1xuICAgIG1vZGU/OiBNb2RlO1xuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiBFcnJvckNvcnJlY3Rpb25MZXZlbDtcbiAgfTtcbiAgaW1hZ2VPcHRpb25zOiB7XG4gICAgaGlkZUJhY2tncm91bmREb3RzOiBib29sZWFuO1xuICAgIGltYWdlU2l6ZTogbnVtYmVyO1xuICAgIGNyb3NzT3JpZ2luPzogc3RyaW5nO1xuICAgIG1hcmdpbjogbnVtYmVyO1xuICAgIHNoYXBlPzogc3RyaW5nO1xuICAgIGJvcmRlcldpZHRoPzogbnVtYmVyO1xuICAgIGJvcmRlckNvbG9yPzogc3RyaW5nO1xuICB9O1xuICBkb3RzT3B0aW9uczoge1xuICAgIHR5cGU6IERvdFR5cGU7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBncmFkaWVudD86IEdyYWRpZW50O1xuICB9O1xuICBiYWNrZ3JvdW5kT3B0aW9uczoge1xuICAgIHJvdW5kOiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBncmFkaWVudD86IEdyYWRpZW50O1xuICB9O1xufVxuXG5jb25zdCBkZWZhdWx0T3B0aW9uczogUmVxdWlyZWRPcHRpb25zID0ge1xuICB0eXBlOiBkcmF3VHlwZXMuY2FudmFzLFxuICBzaGFwZTogc2hhcGVUeXBlcy5zcXVhcmUsXG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogMzAwLFxuICBkYXRhOiBcIlwiLFxuICBtYXJnaW46IDAsXG4gIHFyT3B0aW9uczoge1xuICAgIHR5cGVOdW1iZXI6IHFyVHlwZXNbMF0sXG4gICAgbW9kZTogdW5kZWZpbmVkLFxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiBlcnJvckNvcnJlY3Rpb25MZXZlbHMuUVxuICB9LFxuICBpbWFnZU9wdGlvbnM6IHtcbiAgICBoaWRlQmFja2dyb3VuZERvdHM6IHRydWUsXG4gICAgaW1hZ2VTaXplOiAwLjQsXG4gICAgY3Jvc3NPcmlnaW46IHVuZGVmaW5lZCxcbiAgICBtYXJnaW46IDBcbiAgfSxcbiAgZG90c09wdGlvbnM6IHtcbiAgICB0eXBlOiBcInNxdWFyZVwiLFxuICAgIGNvbG9yOiBcIiMwMDBcIlxuICB9LFxuICBiYWNrZ3JvdW5kT3B0aW9uczoge1xuICAgIHJvdW5kOiAwLFxuICAgIGNvbG9yOiBcIiNmZmZcIlxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0T3B0aW9ucztcbiIsImltcG9ydCBjYWxjdWxhdGVJbWFnZVNpemUgZnJvbSBcIi4uL3Rvb2xzL2NhbGN1bGF0ZUltYWdlU2l6ZVwiO1xuaW1wb3J0IHRvRGF0YVVybCBmcm9tIFwiLi4vdG9vbHMvdG9EYXRhVXJsXCI7XG5pbXBvcnQgZXJyb3JDb3JyZWN0aW9uUGVyY2VudHMgZnJvbSBcIi4uL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25QZXJjZW50c1wiO1xuaW1wb3J0IFFSRG90IGZyb20gXCIuLi9maWd1cmVzL2RvdC9RUkRvdFwiO1xuaW1wb3J0IFFSQ29ybmVyU3F1YXJlIGZyb20gXCIuLi9maWd1cmVzL2Nvcm5lclNxdWFyZS9RUkNvcm5lclNxdWFyZVwiO1xuaW1wb3J0IFFSQ29ybmVyRG90IGZyb20gXCIuLi9maWd1cmVzL2Nvcm5lckRvdC9RUkNvcm5lckRvdFwiO1xuaW1wb3J0IHsgUmVxdWlyZWRPcHRpb25zIH0gZnJvbSBcIi4vUVJPcHRpb25zXCI7XG5pbXBvcnQgZ3JhZGllbnRUeXBlcyBmcm9tIFwiLi4vY29uc3RhbnRzL2dyYWRpZW50VHlwZXNcIjtcbmltcG9ydCBzaGFwZVR5cGVzIGZyb20gXCIuLi9jb25zdGFudHMvc2hhcGVUeXBlc1wiO1xuaW1wb3J0IHsgUVJDb2RlLCBGaWx0ZXJGdW5jdGlvbiwgR3JhZGllbnQgfSBmcm9tIFwiLi4vdHlwZXNcIjtcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gXCJ1dWlkXCI7XG5cbmNvbnN0IHNxdWFyZU1hc2sgPSBbXG4gIFsxLCAxLCAxLCAxLCAxLCAxLCAxXSxcbiAgWzEsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAxLCAxLCAxLCAxLCAxLCAxXVxuXTtcblxuY29uc3QgZG90TWFzayA9IFtcbiAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICBbMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gIFswLCAwLCAxLCAxLCAxLCAwLCAwXSxcbiAgWzAsIDAsIDEsIDEsIDEsIDAsIDBdLFxuICBbMCwgMCwgMSwgMSwgMSwgMCwgMF0sXG4gIFswLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRUlNWRyB7XG4gIF9lbGVtZW50OiBTVkdFbGVtZW50O1xuICBfZGVmczogU1ZHRWxlbWVudDtcbiAgX2JhY2tncm91bmRDbGlwUGF0aD86IFNWR0VsZW1lbnQ7XG4gIF9kb3RzQ2xpcFBhdGg/OiBTVkdFbGVtZW50O1xuICBfY29ybmVyc1NxdWFyZUNsaXBQYXRoPzogU1ZHRWxlbWVudDtcbiAgX2Nvcm5lcnNEb3RDbGlwUGF0aD86IFNWR0VsZW1lbnQ7XG4gIF9vcHRpb25zOiBSZXF1aXJlZE9wdGlvbnM7XG4gIF9xcj86IFFSQ29kZTtcbiAgX2ltYWdlPzogSFRNTEltYWdlRWxlbWVudDtcblxuICAvL1RPRE8gZG9uJ3QgcGFzcyBhbGwgb3B0aW9ucyB0byB0aGlzIGNsYXNzXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFJlcXVpcmVkT3B0aW9ucykge1xuICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInN2Z1wiKTtcbiAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIHV1aWR2NCgpKTtcbiAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFN0cmluZyhvcHRpb25zLndpZHRoKSk7XG4gICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgU3RyaW5nKG9wdGlvbnMuaGVpZ2h0KSk7XG4gICAgaWYgKG9wdGlvbnMuc2hhcGVSZW5kZXJpbmcpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwic2hhcGUtcmVuZGVyaW5nXCIsIG9wdGlvbnMuc2hhcGVSZW5kZXJpbmcpO1xuICAgIH1cbiAgICB0aGlzLl9kZWZzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJkZWZzXCIpO1xuICAgIHRoaXMuX2RlZnMuc2V0QXR0cmlidXRlKFwiaWRcIiwgdXVpZHY0KCkpO1xuICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fZGVmcyk7XG5cbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLndpZHRoO1xuICB9XG5cbiAgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLmhlaWdodDtcbiAgfVxuXG4gIGdldEVsZW1lbnQoKTogU1ZHRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gIH1cblxuICBhc3luYyBkcmF3UVIocXI6IFFSQ29kZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvdW50ID0gcXIuZ2V0TW9kdWxlQ291bnQoKTtcbiAgICBjb25zdCBtaW5TaXplID0gTWF0aC5taW4odGhpcy5fb3B0aW9ucy53aWR0aCwgdGhpcy5fb3B0aW9ucy5oZWlnaHQpIC0gdGhpcy5fb3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IHJlYWxRUlNpemUgPSB0aGlzLl9vcHRpb25zLnNoYXBlID09PSBzaGFwZVR5cGVzLmNpcmNsZSA/IG1pblNpemUgLyBNYXRoLnNxcnQoMikgOiBtaW5TaXplO1xuICAgIGNvbnN0IGRvdFNpemUgPSBNYXRoLmZsb29yKHJlYWxRUlNpemUgLyBjb3VudCk7XG4gICAgY29uc3QgeyBpbWFnZU9wdGlvbnMsIHFyT3B0aW9ucyB9ID0gdGhpcy5fb3B0aW9ucztcbiAgICBjb25zdCBpc0NpcmNsZVNoYXBlID0gaW1hZ2VPcHRpb25zLnNoYXBlID09PSBcImNpcmNsZVwiO1xuICAgIC8vIFN0YXlzIDAgaWYgYGlzQ2lyY2xlU2hhcGVgIGlzIGZhbHNlXG4gICAgLy8gVmFsdWUgaXMgYSByYWRpdXMvZG90U2l6ZVxuICAgIGxldCBjaXJjbGVSYWRpdXNTcXVhcmVkID0gMDtcbiAgICBsZXQgZHJhd0ltYWdlU2l6ZSA9IHtcbiAgICAgIGhpZGVYRG90czogMCxcbiAgICAgIGhpZGVZRG90czogMCxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfTtcbiAgICBjb25zdCBpbWFnZUNlbnRlclggPSBjb3VudCAvIDI7XG4gICAgY29uc3QgaW1hZ2VDZW50ZXJZID0gY291bnQgLyAyO1xuICAgIC8vIEEgcmVjdGFuZ2xlIHdoZXJlIHdlIGNvbnNpZGVyIGhpZGluZyBRUiBjb2RlIGRvdHMuXG4gICAgLy8gVXNlZCBvbmx5IGlmIHRoZXJlJ3MgYW4gaW1hZ2UgYW5kIGl0IHN1Y2Nlc2Z1bGx5IGxvYWRlZC5cbiAgICAvLyBFYWNoIGNvb3JkaW5hdGUgaXMgbm90IGEgcGl4ZWwgdmFsdWUgYnV0IGFuIHgseSBvZiBhIFFSIGNvZGUgZG90LlxuICAgIC8vIGUuZy4gYSA1MDB4NTAwIFFSIGNvZGUgbWF5IGhhdmUgMzZ4MzYgbnVtYmVyIG9mIGRvdHMsXG4gICAgLy8gYHhTdGFydGAgYW5kIGB5U3RhcnRgIGNvdWxkIGJlIHNldCB0byAxOCBhbmQgYHhFbmRgLCBgeUVuZGAgdG8gMjEgKGluIGNhc2Ugb2Ygc21hbGwgaW1hZ2UpLlxuICAgIGxldCBxckNvZGVGcmVlUmVjdGFuZ2xlID0ge1xuICAgICAgeFN0YXJ0OiAwLFxuICAgICAgeVN0YXJ0OiAwLFxuICAgICAgeEVuZDogMCxcbiAgICAgIHlFbmQ6IDBcbiAgICB9O1xuXG4gICAgdGhpcy5fcXIgPSBxcjtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLmltYWdlKSB7XG4gICAgICAvL1dlIG5lZWQgaXQgdG8gZ2V0IGltYWdlIHNpemVcbiAgICAgIGF3YWl0IHRoaXMubG9hZEltYWdlKCk7XG4gICAgICBpZiAoIXRoaXMuX2ltYWdlKSByZXR1cm47XG4gICAgICBjb25zdCBjb3ZlckxldmVsID0gaW1hZ2VPcHRpb25zLmltYWdlU2l6ZSAqIGVycm9yQ29ycmVjdGlvblBlcmNlbnRzW3FyT3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbF07XG4gICAgICBsZXQgbWF4SGlkZGVuRG90cyA9IDA7XG4gICAgICBsZXQgaW1hZ2VXaWR0aCA9IHRoaXMuX2ltYWdlLndpZHRoO1xuICAgICAgbGV0IGltYWdlSGVpZ2h0ID0gdGhpcy5faW1hZ2UuaGVpZ2h0O1xuXG4gICAgICBjb25zdCBtYXhTaXplID0gTWF0aC5tYXgodGhpcy5faW1hZ2Uud2lkdGgsIHRoaXMuX2ltYWdlLmhlaWdodCk7XG4gICAgICBpZiAoaXNDaXJjbGVTaGFwZSkge1xuICAgICAgICBpbWFnZVdpZHRoID0gbWF4U2l6ZTtcbiAgICAgICAgaW1hZ2VIZWlnaHQgPSBtYXhTaXplO1xuICAgICAgfVxuXG4gICAgICBtYXhIaWRkZW5Eb3RzID1cbiAgICAgICAgaW1hZ2VIZWlnaHQgPT09IGltYWdlV2lkdGhcbiAgICAgICAgICA/IE1hdGguZmxvb3IoY292ZXJMZXZlbCAqIGNvdW50ICogY291bnQpXG4gICAgICAgICAgOiAobWF4U2l6ZSAtIE1hdGgubWluKHRoaXMuX2ltYWdlLndpZHRoLCB0aGlzLl9pbWFnZS5oZWlnaHQpKSAvIDI7XG5cbiAgICAgIGRyYXdJbWFnZVNpemUgPSBjYWxjdWxhdGVJbWFnZVNpemUoe1xuICAgICAgICBvcmlnaW5hbFdpZHRoOiBpbWFnZVdpZHRoLFxuICAgICAgICBvcmlnaW5hbEhlaWdodDogaW1hZ2VIZWlnaHQsXG4gICAgICAgIG1heEhpZGRlbkRvdHMsXG4gICAgICAgIG1heEhpZGRlbkF4aXNEb3RzOiBjb3VudCAtIDE0LFxuICAgICAgICBkb3RTaXplXG4gICAgICB9KTtcblxuICAgICAgaWYgKGlzQ2lyY2xlU2hhcGUpIHtcbiAgICAgICAgY2lyY2xlUmFkaXVzU3F1YXJlZCA9IE1hdGgucG93KGRyYXdJbWFnZVNpemUuaGVpZ2h0IC8gZG90U2l6ZSAvIDIsIDIpO1xuICAgICAgfVxuXG4gICAgICBxckNvZGVGcmVlUmVjdGFuZ2xlID0ge1xuICAgICAgICB4U3RhcnQ6IChjb3VudCAtIGRyYXdJbWFnZVNpemUuaGlkZVhEb3RzKSAvIDIsXG4gICAgICAgIHlTdGFydDogKGNvdW50IC0gZHJhd0ltYWdlU2l6ZS5oaWRlWURvdHMpIC8gMixcbiAgICAgICAgeEVuZDogKGNvdW50ICsgZHJhd0ltYWdlU2l6ZS5oaWRlWERvdHMpIC8gMixcbiAgICAgICAgeUVuZDogKGNvdW50ICsgZHJhd0ltYWdlU2l6ZS5oaWRlWURvdHMpIC8gMlxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0aGlzLmRyYXdCYWNrZ3JvdW5kKCk7XG4gICAgdGhpcy5kcmF3RG90cygoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgIGlmICh0aGlzLl9pbWFnZSAmJiB0aGlzLl9vcHRpb25zLmltYWdlT3B0aW9ucy5oaWRlQmFja2dyb3VuZERvdHMpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHggPj0gcXJDb2RlRnJlZVJlY3RhbmdsZS54U3RhcnQgJiZcbiAgICAgICAgICB4IDwgcXJDb2RlRnJlZVJlY3RhbmdsZS54RW5kICYmXG4gICAgICAgICAgeSA+PSBxckNvZGVGcmVlUmVjdGFuZ2xlLnlTdGFydCAmJlxuICAgICAgICAgIHkgPCBxckNvZGVGcmVlUmVjdGFuZ2xlLnlFbmRcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKGlzQ2lyY2xlU2hhcGUpIHtcbiAgICAgICAgICAgIHJldHVybiAhKE1hdGgucG93KHggLSBpbWFnZUNlbnRlclgsIDIpICsgTWF0aC5wb3coeSAtIGltYWdlQ2VudGVyWSwgMikgPD0gY2lyY2xlUmFkaXVzU3F1YXJlZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3F1YXJlTWFza1t4XT8uW3ldIHx8IHNxdWFyZU1hc2tbeCAtIGNvdW50ICsgN10/Llt5XSB8fCBzcXVhcmVNYXNrW3hdPy5beSAtIGNvdW50ICsgN10pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZG90TWFza1t4XT8uW3ldIHx8IGRvdE1hc2tbeCAtIGNvdW50ICsgN10/Llt5XSB8fCBkb3RNYXNrW3hdPy5beSAtIGNvdW50ICsgN10pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLmRyYXdDb3JuZXJzKCk7XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5pbWFnZSAmJiB0aGlzLl9pbWFnZSkge1xuICAgICAgYXdhaXQgdGhpcy5kcmF3SW1hZ2UoeyBvcmlnaW5hbEltYWdlOiB0aGlzLl9pbWFnZSwgd2lkdGg6IGRyYXdJbWFnZVNpemUud2lkdGgsIGhlaWdodDogZHJhd0ltYWdlU2l6ZS5oZWlnaHQgfSk7XG4gICAgfVxuICB9XG5cbiAgZHJhd0JhY2tncm91bmQoKTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnQ7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgY29uc3QgZ3JhZGllbnRPcHRpb25zID0gb3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucz8uZ3JhZGllbnQ7XG4gICAgICBjb25zdCBjb2xvciA9IG9wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnM/LmNvbG9yO1xuXG4gICAgICBpZiAoZ3JhZGllbnRPcHRpb25zIHx8IGNvbG9yKSB7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUNvbG9yKHtcbiAgICAgICAgICBvcHRpb25zOiBncmFkaWVudE9wdGlvbnMsXG4gICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogMCxcbiAgICAgICAgICB4OiAwLFxuICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgaGVpZ2h0OiBvcHRpb25zLmhlaWdodCxcbiAgICAgICAgICB3aWR0aDogb3B0aW9ucy53aWR0aCxcbiAgICAgICAgICBpZDogXCJiYWNrZ3JvdW5kLWNvbG9yXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmJhY2tncm91bmRPcHRpb25zPy5yb3VuZCkge1xuICAgICAgICBjb25zdCBzaXplID0gTWF0aC5taW4ob3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQpO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJyZWN0XCIpO1xuICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ2xpcFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNsaXBQYXRoXCIpO1xuICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ2xpcFBhdGguc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjbGlwLXBhdGgtYmFja2dyb3VuZC1jb2xvclwiKTtcbiAgICAgICAgdGhpcy5fZGVmcy5hcHBlbmRDaGlsZCh0aGlzLl9iYWNrZ3JvdW5kQ2xpcFBhdGgpO1xuXG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwieFwiLCBTdHJpbmcoKG9wdGlvbnMud2lkdGggLSBzaXplKSAvIDIpKTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ5XCIsIFN0cmluZygob3B0aW9ucy5oZWlnaHQgLSBzaXplKSAvIDIpKTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBTdHJpbmcoc2l6ZSkpO1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBTdHJpbmcoc2l6ZSkpO1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcInJ4XCIsIFN0cmluZygoc2l6ZSAvIDIpICogb3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucy5yb3VuZCkpO1xuXG4gICAgICAgIHRoaXMuX2JhY2tncm91bmRDbGlwUGF0aC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkcmF3RG90cyhmaWx0ZXI/OiBGaWx0ZXJGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcXIpIHtcbiAgICAgIHRocm93IFwiUVIgY29kZSBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5fcXIuZ2V0TW9kdWxlQ291bnQoKTtcblxuICAgIGlmIChjb3VudCA+IG9wdGlvbnMud2lkdGggfHwgY291bnQgPiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgdGhyb3cgXCJUaGUgY2FudmFzIGlzIHRvbyBzbWFsbC5cIjtcbiAgICB9XG5cbiAgICBjb25zdCBtaW5TaXplID0gTWF0aC5taW4ob3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQpIC0gb3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IHJlYWxRUlNpemUgPSBvcHRpb25zLnNoYXBlID09PSBzaGFwZVR5cGVzLmNpcmNsZSA/IG1pblNpemUgLyBNYXRoLnNxcnQoMikgOiBtaW5TaXplO1xuICAgIGNvbnN0IGRvdFNpemUgPSBNYXRoLmZsb29yKHJlYWxRUlNpemUgLyBjb3VudCk7XG4gICAgY29uc3QgeEJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMud2lkdGggLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgeUJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMuaGVpZ2h0IC0gY291bnQgKiBkb3RTaXplKSAvIDIpO1xuICAgIGNvbnN0IGRvdCA9IG5ldyBRUkRvdCh7IHN2ZzogdGhpcy5fZWxlbWVudCwgdHlwZTogb3B0aW9ucy5kb3RzT3B0aW9ucy50eXBlIH0pO1xuXG4gICAgdGhpcy5fZG90c0NsaXBQYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJjbGlwUGF0aFwiKTtcbiAgICBjb25zdCBpZCA9IHV1aWR2NCgpO1xuICAgIHRoaXMuX2RvdHNDbGlwUGF0aC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgdGhpcy5fZGVmcy5hcHBlbmRDaGlsZCh0aGlzLl9kb3RzQ2xpcFBhdGgpO1xuXG4gICAgdGhpcy5fY3JlYXRlQ29sb3Ioe1xuICAgICAgb3B0aW9uczogb3B0aW9ucy5kb3RzT3B0aW9ucz8uZ3JhZGllbnQsXG4gICAgICBjb2xvcjogb3B0aW9ucy5kb3RzT3B0aW9ucy5jb2xvcixcbiAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogMCxcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgaGVpZ2h0OiBvcHRpb25zLmhlaWdodCxcbiAgICAgIHdpZHRoOiBvcHRpb25zLndpZHRoLFxuICAgICAgaWQ6IGlkXG4gICAgfSk7XG5cbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGNvdW50OyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgY291bnQ7IHkrKykge1xuICAgICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoeCwgeSkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3FyPy5pc0RhcmsoeCwgeSkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvdC5kcmF3KFxuICAgICAgICAgIHhCZWdpbm5pbmcgKyB4ICogZG90U2l6ZSxcbiAgICAgICAgICB5QmVnaW5uaW5nICsgeSAqIGRvdFNpemUsXG4gICAgICAgICAgZG90U2l6ZSxcbiAgICAgICAgICAoeE9mZnNldDogbnVtYmVyLCB5T2Zmc2V0OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGlmICh4ICsgeE9mZnNldCA8IDAgfHwgeSArIHlPZmZzZXQgPCAwIHx8IHggKyB4T2Zmc2V0ID49IGNvdW50IHx8IHkgKyB5T2Zmc2V0ID49IGNvdW50KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoeCArIHhPZmZzZXQsIHkgKyB5T2Zmc2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuICEhdGhpcy5fcXIgJiYgdGhpcy5fcXIuaXNEYXJrKHggKyB4T2Zmc2V0LCB5ICsgeU9mZnNldCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChkb3QuX2VsZW1lbnQgJiYgdGhpcy5fZG90c0NsaXBQYXRoKSB7XG4gICAgICAgICAgdGhpcy5fZG90c0NsaXBQYXRoLmFwcGVuZENoaWxkKGRvdC5fZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5zaGFwZSA9PT0gc2hhcGVUeXBlcy5jaXJjbGUpIHtcbiAgICAgIGNvbnN0IGFkZGl0aW9uYWxEb3RzID0gTWF0aC5mbG9vcigobWluU2l6ZSAvIGRvdFNpemUgLSBjb3VudCkgLyAyKTtcbiAgICAgIGNvbnN0IGZha2VDb3VudCA9IGNvdW50ICsgYWRkaXRpb25hbERvdHMgKiAyO1xuICAgICAgY29uc3QgeEZha2VCZWdpbm5pbmcgPSB4QmVnaW5uaW5nIC0gYWRkaXRpb25hbERvdHMgKiBkb3RTaXplO1xuICAgICAgY29uc3QgeUZha2VCZWdpbm5pbmcgPSB5QmVnaW5uaW5nIC0gYWRkaXRpb25hbERvdHMgKiBkb3RTaXplO1xuICAgICAgY29uc3QgZmFrZU1hdHJpeDogbnVtYmVyW11bXSA9IFtdO1xuICAgICAgY29uc3QgY2VudGVyID0gTWF0aC5mbG9vcihmYWtlQ291bnQgLyAyKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmYWtlQ291bnQ7IGkrKykge1xuICAgICAgICBmYWtlTWF0cml4W2ldID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZmFrZUNvdW50OyBqKyspIHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpID49IGFkZGl0aW9uYWxEb3RzIC0gMSAmJlxuICAgICAgICAgICAgaSA8PSBmYWtlQ291bnQgLSBhZGRpdGlvbmFsRG90cyAmJlxuICAgICAgICAgICAgaiA+PSBhZGRpdGlvbmFsRG90cyAtIDEgJiZcbiAgICAgICAgICAgIGogPD0gZmFrZUNvdW50IC0gYWRkaXRpb25hbERvdHNcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGZha2VNYXRyaXhbaV1bal0gPSAwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKE1hdGguc3FydCgoaSAtIGNlbnRlcikgKiAoaSAtIGNlbnRlcikgKyAoaiAtIGNlbnRlcikgKiAoaiAtIGNlbnRlcikpID4gY2VudGVyKSB7XG4gICAgICAgICAgICBmYWtlTWF0cml4W2ldW2pdID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vR2V0IHJhbmRvbSBkb3RzIGZyb20gUVIgY29kZSB0byBzaG93IGl0IG91dHNpZGUgb2YgUVIgY29kZVxuICAgICAgICAgIGZha2VNYXRyaXhbaV1bal0gPSB0aGlzLl9xci5pc0RhcmsoXG4gICAgICAgICAgICBqIC0gMiAqIGFkZGl0aW9uYWxEb3RzIDwgMCA/IGogOiBqID49IGNvdW50ID8gaiAtIDIgKiBhZGRpdGlvbmFsRG90cyA6IGogLSBhZGRpdGlvbmFsRG90cyxcbiAgICAgICAgICAgIGkgLSAyICogYWRkaXRpb25hbERvdHMgPCAwID8gaSA6IGkgPj0gY291bnQgPyBpIC0gMiAqIGFkZGl0aW9uYWxEb3RzIDogaSAtIGFkZGl0aW9uYWxEb3RzXG4gICAgICAgICAgKVxuICAgICAgICAgICAgPyAxXG4gICAgICAgICAgICA6IDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmYWtlQ291bnQ7IGkrKykge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGZha2VDb3VudDsgaisrKSB7XG4gICAgICAgICAgaWYgKCFmYWtlTWF0cml4W2ldW2pdKSBjb250aW51ZTtcblxuICAgICAgICAgIGRvdC5kcmF3KFxuICAgICAgICAgICAgeEZha2VCZWdpbm5pbmcgKyBpICogZG90U2l6ZSxcbiAgICAgICAgICAgIHlGYWtlQmVnaW5uaW5nICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICBkb3RTaXplLFxuICAgICAgICAgICAgKHhPZmZzZXQ6IG51bWJlciwgeU9mZnNldDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiAhIWZha2VNYXRyaXhbaSArIHhPZmZzZXRdPy5baiArIHlPZmZzZXRdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKGRvdC5fZWxlbWVudCAmJiB0aGlzLl9kb3RzQ2xpcFBhdGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2RvdHNDbGlwUGF0aC5hcHBlbmRDaGlsZChkb3QuX2VsZW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRyYXdDb3JuZXJzKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcXIpIHtcbiAgICAgIHRocm93IFwiUVIgY29kZSBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50O1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICB0aHJvdyBcIkVsZW1lbnQgY29kZSBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5fcXIuZ2V0TW9kdWxlQ291bnQoKTtcbiAgICBjb25zdCBtaW5TaXplID0gTWF0aC5taW4ob3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQpIC0gb3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IHJlYWxRUlNpemUgPSBvcHRpb25zLnNoYXBlID09PSBzaGFwZVR5cGVzLmNpcmNsZSA/IG1pblNpemUgLyBNYXRoLnNxcnQoMikgOiBtaW5TaXplO1xuICAgIGNvbnN0IGRvdFNpemUgPSBNYXRoLmZsb29yKHJlYWxRUlNpemUgLyBjb3VudCk7XG4gICAgY29uc3QgY29ybmVyc1NxdWFyZVNpemUgPSBkb3RTaXplICogNztcbiAgICBjb25zdCBjb3JuZXJzRG90U2l6ZSA9IGRvdFNpemUgKiAzO1xuICAgIGNvbnN0IHhCZWdpbm5pbmcgPSBNYXRoLmZsb29yKChvcHRpb25zLndpZHRoIC0gY291bnQgKiBkb3RTaXplKSAvIDIpO1xuICAgIGNvbnN0IHlCZWdpbm5pbmcgPSBNYXRoLmZsb29yKChvcHRpb25zLmhlaWdodCAtIGNvdW50ICogZG90U2l6ZSkgLyAyKTtcblxuICAgIFtcbiAgICAgIFswLCAwLCAwXSxcbiAgICAgIFsxLCAwLCBNYXRoLlBJIC8gMl0sXG4gICAgICBbMCwgMSwgLU1hdGguUEkgLyAyXVxuICAgIF0uZm9yRWFjaCgoW2NvbHVtbiwgcm93LCByb3RhdGlvbl0pID0+IHtcbiAgICAgIGNvbnN0IHggPSB4QmVnaW5uaW5nICsgY29sdW1uICogZG90U2l6ZSAqIChjb3VudCAtIDcpO1xuICAgICAgY29uc3QgeSA9IHlCZWdpbm5pbmcgKyByb3cgKiBkb3RTaXplICogKGNvdW50IC0gNyk7XG4gICAgICBsZXQgY29ybmVyc1NxdWFyZUNsaXBQYXRoID0gdGhpcy5fZG90c0NsaXBQYXRoO1xuICAgICAgbGV0IGNvcm5lcnNEb3RDbGlwUGF0aCA9IHRoaXMuX2RvdHNDbGlwUGF0aDtcblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LmdyYWRpZW50IHx8IG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LmNvbG9yKSB7XG4gICAgICAgIGNvcm5lcnNTcXVhcmVDbGlwUGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiY2xpcFBhdGhcIik7XG4gICAgICAgIGNvbnN0IGlkID0gdXVpZHY0KCk7XG4gICAgICAgIGNvcm5lcnNTcXVhcmVDbGlwUGF0aC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgICAgIHRoaXMuX2RlZnMuYXBwZW5kQ2hpbGQoY29ybmVyc1NxdWFyZUNsaXBQYXRoKTtcbiAgICAgICAgdGhpcy5fY29ybmVyc1NxdWFyZUNsaXBQYXRoID0gdGhpcy5fY29ybmVyc0RvdENsaXBQYXRoID0gY29ybmVyc0RvdENsaXBQYXRoID0gY29ybmVyc1NxdWFyZUNsaXBQYXRoO1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZUNvbG9yKHtcbiAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zPy5ncmFkaWVudCxcbiAgICAgICAgICBjb2xvcjogb3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8uY29sb3IsXG4gICAgICAgICAgYWRkaXRpb25hbFJvdGF0aW9uOiByb3RhdGlvbixcbiAgICAgICAgICB4LFxuICAgICAgICAgIHksXG4gICAgICAgICAgaGVpZ2h0OiBjb3JuZXJzU3F1YXJlU2l6ZSxcbiAgICAgICAgICB3aWR0aDogY29ybmVyc1NxdWFyZVNpemUsXG4gICAgICAgICAgaWQ6IGlkXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8udHlwZSkge1xuICAgICAgICBjb25zdCBjb3JuZXJzU3F1YXJlID0gbmV3IFFSQ29ybmVyU3F1YXJlKHsgc3ZnOiB0aGlzLl9lbGVtZW50LCB0eXBlOiBvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zLnR5cGUgfSk7XG5cbiAgICAgICAgY29ybmVyc1NxdWFyZS5kcmF3KHgsIHksIGNvcm5lcnNTcXVhcmVTaXplLCByb3RhdGlvbik7XG5cbiAgICAgICAgaWYgKGNvcm5lcnNTcXVhcmUuX2VsZW1lbnQgJiYgY29ybmVyc1NxdWFyZUNsaXBQYXRoKSB7XG4gICAgICAgICAgY29ybmVyc1NxdWFyZUNsaXBQYXRoLmFwcGVuZENoaWxkKGNvcm5lcnNTcXVhcmUuX2VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBzdmc6IHRoaXMuX2VsZW1lbnQsIHR5cGU6IG9wdGlvbnMuZG90c09wdGlvbnMudHlwZSB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNxdWFyZU1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNxdWFyZU1hc2tbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghc3F1YXJlTWFza1tpXT8uW2pdKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICAgICAgeCArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgICB5ICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4gISFzcXVhcmVNYXNrW2kgKyB4T2Zmc2V0XT8uW2ogKyB5T2Zmc2V0XVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGRvdC5fZWxlbWVudCAmJiBjb3JuZXJzU3F1YXJlQ2xpcFBhdGgpIHtcbiAgICAgICAgICAgICAgY29ybmVyc1NxdWFyZUNsaXBQYXRoLmFwcGVuZENoaWxkKGRvdC5fZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zPy5ncmFkaWVudCB8fCBvcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zPy5jb2xvcikge1xuICAgICAgICBjb3JuZXJzRG90Q2xpcFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNsaXBQYXRoXCIpO1xuICAgICAgICBjb25zdCBpZCA9IHV1aWR2NCgpO1xuICAgICAgICBjb3JuZXJzRG90Q2xpcFBhdGguc2V0QXR0cmlidXRlKFwiaWRcIiwgaWQpO1xuICAgICAgICB0aGlzLl9kZWZzLmFwcGVuZENoaWxkKGNvcm5lcnNEb3RDbGlwUGF0aCk7XG4gICAgICAgIHRoaXMuX2Nvcm5lcnNEb3RDbGlwUGF0aCA9IGNvcm5lcnNEb3RDbGlwUGF0aDtcblxuICAgICAgICB0aGlzLl9jcmVhdGVDb2xvcih7XG4gICAgICAgICAgb3B0aW9uczogb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uZ3JhZGllbnQsXG4gICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnM/LmNvbG9yLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgeDogeCArIGRvdFNpemUgKiAyLFxuICAgICAgICAgIHk6IHkgKyBkb3RTaXplICogMixcbiAgICAgICAgICBoZWlnaHQ6IGNvcm5lcnNEb3RTaXplLFxuICAgICAgICAgIHdpZHRoOiBjb3JuZXJzRG90U2l6ZSxcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zPy50eXBlKSB7XG4gICAgICAgIGNvbnN0IGNvcm5lcnNEb3QgPSBuZXcgUVJDb3JuZXJEb3QoeyBzdmc6IHRoaXMuX2VsZW1lbnQsIHR5cGU6IG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMudHlwZSB9KTtcblxuICAgICAgICBjb3JuZXJzRG90LmRyYXcoeCArIGRvdFNpemUgKiAyLCB5ICsgZG90U2l6ZSAqIDIsIGNvcm5lcnNEb3RTaXplLCByb3RhdGlvbik7XG5cbiAgICAgICAgaWYgKGNvcm5lcnNEb3QuX2VsZW1lbnQgJiYgY29ybmVyc0RvdENsaXBQYXRoKSB7XG4gICAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoLmFwcGVuZENoaWxkKGNvcm5lcnNEb3QuX2VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBzdmc6IHRoaXMuX2VsZW1lbnQsIHR5cGU6IG9wdGlvbnMuZG90c09wdGlvbnMudHlwZSB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRvdE1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRvdE1hc2tbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghZG90TWFza1tpXT8uW2pdKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICAgICAgeCArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgICB5ICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4gISFkb3RNYXNrW2kgKyB4T2Zmc2V0XT8uW2ogKyB5T2Zmc2V0XVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGRvdC5fZWxlbWVudCAmJiBjb3JuZXJzRG90Q2xpcFBhdGgpIHtcbiAgICAgICAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoLmFwcGVuZENoaWxkKGRvdC5fZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBsb2FkSW1hZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgaWYgKCFvcHRpb25zLmltYWdlKSB7XG4gICAgICAgIHJldHVybiByZWplY3QoXCJJbWFnZSBpcyBub3QgZGVmaW5lZFwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmltYWdlT3B0aW9ucy5jcm9zc09yaWdpbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpbWFnZS5jcm9zc09yaWdpbiA9IG9wdGlvbnMuaW1hZ2VPcHRpb25zLmNyb3NzT3JpZ2luO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbWFnZSA9IGltYWdlO1xuICAgICAgaW1hZ2Uub25sb2FkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuICAgICAgaW1hZ2Uuc3JjID0gb3B0aW9ucy5pbWFnZTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRyYXdJbWFnZSh7XG4gICAgb3JpZ2luYWxJbWFnZSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfToge1xuICAgIG9yaWdpbmFsSW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQ7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IGltYWdlT3B0aW9ucyA9IHRoaXMuX29wdGlvbnMuaW1hZ2VPcHRpb25zO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkaW1lbnNpb25zIGZvciB0aGUgU1ZHIGVsZW1lbnQsIGFjY291bnRpbmcgZm9yIG1hcmdpbiBhbmQgYm9yZGVyIHdpZHRoXG4gICAgY29uc3QgYm9yZGVyV2lkdGggPSBpbWFnZU9wdGlvbnMuYm9yZGVyV2lkdGggfHwgMDsgLy8gVXNlIDAgaWYgYm9yZGVyV2lkdGggaXMgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgdG90YWxNYXJnaW4gPSAyICogaW1hZ2VPcHRpb25zLm1hcmdpbjtcbiAgICBsZXQgaW1hZ2VXaWR0aCA9IHdpZHRoO1xuICAgIGxldCBpbWFnZUhlaWdodCA9IGhlaWdodDtcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgZGltZW5zaW9ucyBvZiB0aGUgc3F1YXJlIChiYXNlZCBvbiB0aGUgZ3JlYXRlciBvZiBpbWFnZVdpZHRoIG9yIGltYWdlSGVpZ2h0KVxuICAgIGNvbnN0IHNxdWFyZVNpemUgPSBNYXRoLm1heChpbWFnZVdpZHRoLCBpbWFnZUhlaWdodCk7XG4gICAgbGV0IHhJbWFnZU9mZnNldCA9IDA7XG4gICAgbGV0IHlJbWFnZU9mZnNldCA9IDA7XG5cbiAgICBjb25zdCBpc0NpcmNsZVNoYXBlID0gaW1hZ2VPcHRpb25zLnNoYXBlID09PSBcImNpcmNsZVwiO1xuXG4gICAgaWYgKGlzQ2lyY2xlU2hhcGUpIHtcbiAgICAgIGNvbnN0IGFzcGVjdFJhdGlvID0gb3JpZ2luYWxJbWFnZS53aWR0aCAvIG9yaWdpbmFsSW1hZ2UuaGVpZ2h0O1xuICAgICAgaWYgKGFzcGVjdFJhdGlvID4gMSkge1xuICAgICAgICBpbWFnZUhlaWdodCA9IHNxdWFyZVNpemU7XG4gICAgICAgIGNvbnN0IF9pbWFnZVdpZHRoID0gaW1hZ2VIZWlnaHQgKiBhc3BlY3RSYXRpbztcbiAgICAgICAgeEltYWdlT2Zmc2V0ID0gLShfaW1hZ2VXaWR0aCAtIGltYWdlV2lkdGgpIC8gMjtcbiAgICAgICAgaW1hZ2VXaWR0aCA9IF9pbWFnZVdpZHRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW1hZ2VXaWR0aCA9IHNxdWFyZVNpemU7XG4gICAgICAgIGNvbnN0IF9pbWFnZUhlaWdodCA9IGltYWdlV2lkdGggLyBhc3BlY3RSYXRpbztcbiAgICAgICAgeUltYWdlT2Zmc2V0ID0gLShfaW1hZ2VIZWlnaHQgLSBpbWFnZUhlaWdodCkgLyAyO1xuICAgICAgICBpbWFnZUhlaWdodCA9IF9pbWFnZUhlaWdodDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBTVkcgZWxlbWVudFxuICAgIGNvbnN0IHN2Z1Jvb3RYUG9zaXRpb24gPSBNYXRoLmZsb29yKE1hdGguYWJzKG9wdGlvbnMud2lkdGggLSBpbWFnZVdpZHRoKSAvIDIpO1xuICAgIGNvbnN0IHN2Z1Jvb3RZUG9zaXRpb24gPSBNYXRoLmZsb29yKE1hdGguYWJzKG9wdGlvbnMuaGVpZ2h0IC0gaW1hZ2VIZWlnaHQpIC8gMik7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGNlbnRlciBhbmQgcmFkaXVzIG9mIHRoZSBpbWFnZS9jaXJjbGUgYmFzZWQgb24gdGhlIHNpemVcbiAgICBjb25zdCBjaXJjbGVYID0gaW1hZ2VXaWR0aCAvIDI7XG4gICAgY29uc3QgY2lyY2xlWSA9IGltYWdlSGVpZ2h0IC8gMjtcbiAgICBjb25zdCBjaXJjbGVSYWRpdXMgPSBzcXVhcmVTaXplIC8gMiAtIGJvcmRlcldpZHRoIC8gMjtcblxuICAgIC8vIENyZWF0ZSBhbiBTVkcgZWxlbWVudCBmb3IgdGhlIHNxdWFyZVxuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCIpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIGAke2ltYWdlV2lkdGh9cHhgKTsgLy8gU2V0IHRoZSBTVkcgd2lkdGggdG8gdGhlIHNxdWFyZSBzaXplXG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBgJHtpbWFnZUhlaWdodH1weGApOyAvLyBTZXQgdGhlIFNWRyBoZWlnaHQgdG8gdGhlIHNxdWFyZSBzaXplXG4gICAgc3ZnLnNldEF0dHJpYnV0ZShcInhcIiwgU3RyaW5nKHN2Z1Jvb3RYUG9zaXRpb24pKTsgLy8gU2V0IFggcG9zaXRpb25cbiAgICBzdmcuc2V0QXR0cmlidXRlKFwieVwiLCBTdHJpbmcoc3ZnUm9vdFlQb3NpdGlvbikpOyAvLyBTZXQgWSBwb3NpdGlvblxuXG4gICAgLy8gQ3JlYXRlIGFuIGltYWdlIGVsZW1lbnRcbiAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiaW1hZ2VcIik7XG4gICAgY29uc3QgaW1hZ2VVcmwgPSBhd2FpdCB0b0RhdGFVcmwob3B0aW9ucy5pbWFnZSB8fCBcIlwiKTtcbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIGltYWdlVXJsIHx8IFwiXCIpO1xuICAgIGltYWdlLnNldEF0dHJpYnV0ZShcImlkXCIsIHV1aWR2NCgpKTtcbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBgJHtpbWFnZVdpZHRofXB4YCk7IC8vIFNldCB0aGUgaW1hZ2Ugd2lkdGggdG8gdGhlIHNxdWFyZSBzaXplXG4gICAgaW1hZ2Uuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIGAke2ltYWdlSGVpZ2h0fXB4YCk7IC8vIFNldCB0aGUgaW1hZ2UgaGVpZ2h0IHRvIHRoZSBzcXVhcmUgc2l6ZVxuICAgIGltYWdlLnNldEF0dHJpYnV0ZShcInhcIiwgU3RyaW5nKHhJbWFnZU9mZnNldCkpO1xuICAgIGltYWdlLnNldEF0dHJpYnV0ZShcInlcIiwgU3RyaW5nKHlJbWFnZU9mZnNldCkpO1xuXG4gICAgaWYgKGlzQ2lyY2xlU2hhcGUpIHtcbiAgICAgIC8vIERlZmluZSBhIGNpcmN1bGFyIGNsaXAgcGF0aFxuICAgICAgY29uc3QgY2xpcFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNsaXBQYXRoXCIpO1xuICAgICAgY29uc3QgY2lyY2xlQ2xpcElkID0gdXVpZHY0KCk7XG4gICAgICBjbGlwUGF0aC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBjaXJjbGVDbGlwSWQpO1xuXG4gICAgICBjb25zdCBjaXJjbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNpcmNsZVwiKTtcbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKFwiY3hcIiwgU3RyaW5nKGNpcmNsZVgpKTtcbiAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoXCJjeVwiLCBTdHJpbmcoY2lyY2xlWSkpO1xuICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZShcInJcIiwgU3RyaW5nKGNpcmNsZVJhZGl1cyAtIHRvdGFsTWFyZ2luIC8gMikpOyAvLyBBZGp1c3QgZm9yIG1hcmdpblxuXG4gICAgICBjbGlwUGF0aC5hcHBlbmRDaGlsZChjaXJjbGUpO1xuICAgICAgaW1hZ2Uuc2V0QXR0cmlidXRlKFwiY2xpcC1wYXRoXCIsIGB1cmwoIyR7Y2lyY2xlQ2xpcElkfSlgKTtcblxuICAgICAgLy8gQXBwZW5kIHRoZSBlbGVtZW50cyB0byB0aGUgU1ZHIGluIHRoZSBjb3JyZWN0IG9yZGVyXG4gICAgICBzdmcuYXBwZW5kQ2hpbGQoY2xpcFBhdGgpO1xuICAgIH1cblxuICAgIHN2Zy5hcHBlbmRDaGlsZChpbWFnZSk7XG5cbiAgICBpZiAoYm9yZGVyV2lkdGggPiAwKSB7XG4gICAgICBsZXQgYm9yZGVyRWxlbWVudDogU1ZHRWxlbWVudDtcbiAgICAgIGlmIChpc0NpcmNsZVNoYXBlKSB7XG4gICAgICAgIGJvcmRlckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNpcmNsZVwiKTtcbiAgICAgICAgYm9yZGVyRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjeFwiLCBTdHJpbmcoY2lyY2xlWCkpO1xuICAgICAgICBib3JkZXJFbGVtZW50LnNldEF0dHJpYnV0ZShcImN5XCIsIFN0cmluZyhjaXJjbGVZKSk7XG4gICAgICAgIGJvcmRlckVsZW1lbnQuc2V0QXR0cmlidXRlKFwiclwiLCBTdHJpbmcoY2lyY2xlUmFkaXVzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib3JkZXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJyZWN0XCIpO1xuICAgICAgfVxuICAgICAgYm9yZGVyRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgICBib3JkZXJFbGVtZW50LnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIGAke2ltYWdlV2lkdGh9cHhgKTsgLy8gU2V0IHRoZSBTVkcgd2lkdGggdG8gdGhlIHNxdWFyZSBzaXplXG4gICAgICBib3JkZXJFbGVtZW50LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBgJHtpbWFnZUhlaWdodH1weGApOyAvLyBTZXQgdGhlIFNWRyBoZWlnaHQgdG8gdGhlIHNxdWFyZSBzaXplXG4gICAgICBib3JkZXJFbGVtZW50LnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLCBpbWFnZU9wdGlvbnMuYm9yZGVyQ29sb3IgfHwgXCJibGFja1wiKTsgLy8gQm9yZGVyIGNvbG9yXG4gICAgICBib3JkZXJFbGVtZW50LnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLCBTdHJpbmcoYm9yZGVyV2lkdGgpKTsgLy8gQm9yZGVyIHdpZHRoXG4gICAgICBib3JkZXJFbGVtZW50LnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJub25lXCIpOyAvLyBUcmFuc3BhcmVudCBmaWxsXG4gICAgICBzdmcuYXBwZW5kQ2hpbGQoYm9yZGVyRWxlbWVudCk7IC8vIEFkZCB0aGUgY2lyY3VsYXIgYm9yZGVyIGFmdGVyIHRoZSBpbWFnZVxuICAgIH1cblxuICAgIC8vIEFwcGVuZCB0aGUgU1ZHIHRvIHRoZSBjb250YWluZXJcbiAgICB0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKHN2Zyk7XG4gIH1cblxuICBfY3JlYXRlQ29sb3Ioe1xuICAgIG9wdGlvbnMsXG4gICAgY29sb3IsXG4gICAgYWRkaXRpb25hbFJvdGF0aW9uLFxuICAgIHgsXG4gICAgeSxcbiAgICBoZWlnaHQsXG4gICAgd2lkdGgsXG4gICAgaWRcbiAgfToge1xuICAgIG9wdGlvbnM/OiBHcmFkaWVudDtcbiAgICBjb2xvcj86IHN0cmluZztcbiAgICBhZGRpdGlvbmFsUm90YXRpb246IG51bWJlcjtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaWQ6IHN0cmluZztcbiAgfSk6IHZvaWQge1xuICAgIGNvbnN0IHNpemUgPSB3aWR0aCA+IGhlaWdodCA/IHdpZHRoIDogaGVpZ2h0O1xuICAgIGNvbnN0IHJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInJlY3RcIik7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJ4XCIsIFN0cmluZyh4KSk7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJ5XCIsIFN0cmluZyh5KSk7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgU3RyaW5nKGhlaWdodCkpO1xuICAgIHJlY3Quc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgU3RyaW5nKHdpZHRoKSk7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJjbGlwLXBhdGhcIiwgYHVybCgnIyR7aWR9JylgKTtcblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBsZXQgZ3JhZGllbnQ6IFNWR0VsZW1lbnQ7XG4gICAgICBjb25zdCBncmFkaWVudElkID0gdXVpZHY0KCk7XG4gICAgICBpZiAob3B0aW9ucy50eXBlID09PSBncmFkaWVudFR5cGVzLnJhZGlhbCkge1xuICAgICAgICBncmFkaWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicmFkaWFsR3JhZGllbnRcIik7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIGdyYWRpZW50SWQpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJncmFkaWVudFVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIik7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImZ4XCIsIFN0cmluZyh4ICsgd2lkdGggLyAyKSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImZ5XCIsIFN0cmluZyh5ICsgaGVpZ2h0IC8gMikpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJjeFwiLCBTdHJpbmcoeCArIHdpZHRoIC8gMikpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJjeVwiLCBTdHJpbmcoeSArIGhlaWdodCAvIDIpKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiclwiLCBTdHJpbmcoc2l6ZSAvIDIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gKChvcHRpb25zLnJvdGF0aW9uIHx8IDApICsgYWRkaXRpb25hbFJvdGF0aW9uKSAlICgyICogTWF0aC5QSSk7XG4gICAgICAgIGNvbnN0IHBvc2l0aXZlUm90YXRpb24gPSAocm90YXRpb24gKyAyICogTWF0aC5QSSkgJSAoMiAqIE1hdGguUEkpO1xuICAgICAgICBsZXQgeDAgPSB4ICsgd2lkdGggLyAyO1xuICAgICAgICBsZXQgeTAgPSB5ICsgaGVpZ2h0IC8gMjtcbiAgICAgICAgbGV0IHgxID0geCArIHdpZHRoIC8gMjtcbiAgICAgICAgbGV0IHkxID0geSArIGhlaWdodCAvIDI7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIChwb3NpdGl2ZVJvdGF0aW9uID49IDAgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAwLjI1ICogTWF0aC5QSSkgfHxcbiAgICAgICAgICAocG9zaXRpdmVSb3RhdGlvbiA+IDEuNzUgKiBNYXRoLlBJICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMiAqIE1hdGguUEkpXG4gICAgICAgICkge1xuICAgICAgICAgIHgwID0geDAgLSB3aWR0aCAvIDI7XG4gICAgICAgICAgeTAgPSB5MCAtIChoZWlnaHQgLyAyKSAqIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgICB4MSA9IHgxICsgd2lkdGggLyAyO1xuICAgICAgICAgIHkxID0geTEgKyAoaGVpZ2h0IC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpdmVSb3RhdGlvbiA+IDAuMjUgKiBNYXRoLlBJICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMC43NSAqIE1hdGguUEkpIHtcbiAgICAgICAgICB5MCA9IHkwIC0gaGVpZ2h0IC8gMjtcbiAgICAgICAgICB4MCA9IHgwIC0gd2lkdGggLyAyIC8gTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICAgIHkxID0geTEgKyBoZWlnaHQgLyAyO1xuICAgICAgICAgIHgxID0geDEgKyB3aWR0aCAvIDIgLyBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpdmVSb3RhdGlvbiA+IDAuNzUgKiBNYXRoLlBJICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMS4yNSAqIE1hdGguUEkpIHtcbiAgICAgICAgICB4MCA9IHgwICsgd2lkdGggLyAyO1xuICAgICAgICAgIHkwID0geTAgKyAoaGVpZ2h0IC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgICAgeDEgPSB4MSAtIHdpZHRoIC8gMjtcbiAgICAgICAgICB5MSA9IHkxIC0gKGhlaWdodCAvIDIpICogTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aXZlUm90YXRpb24gPiAxLjI1ICogTWF0aC5QSSAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDEuNzUgKiBNYXRoLlBJKSB7XG4gICAgICAgICAgeTAgPSB5MCArIGhlaWdodCAvIDI7XG4gICAgICAgICAgeDAgPSB4MCArIHdpZHRoIC8gMiAvIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgICB5MSA9IHkxIC0gaGVpZ2h0IC8gMjtcbiAgICAgICAgICB4MSA9IHgxIC0gd2lkdGggLyAyIC8gTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JhZGllbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImxpbmVhckdyYWRpZW50XCIpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJncmFkaWVudFVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIik7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcIngxXCIsIFN0cmluZyhNYXRoLnJvdW5kKHgwKSkpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJ5MVwiLCBTdHJpbmcoTWF0aC5yb3VuZCh5MCkpKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwieDJcIiwgU3RyaW5nKE1hdGgucm91bmQoeDEpKSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcInkyXCIsIFN0cmluZyhNYXRoLnJvdW5kKHkxKSkpO1xuICAgICAgfVxuICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgZ3JhZGllbnRJZCk7XG4gICAgICBvcHRpb25zLmNvbG9yU3RvcHMuZm9yRWFjaCgoeyBvZmZzZXQsIGNvbG9yIH06IHsgb2Zmc2V0OiBudW1iZXI7IGNvbG9yOiBzdHJpbmcgfSkgPT4ge1xuICAgICAgICBjb25zdCBzdG9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJzdG9wXCIpO1xuICAgICAgICBzdG9wLnNldEF0dHJpYnV0ZShcIm9mZnNldFwiLCBgJHsxMDAgKiBvZmZzZXR9JWApO1xuICAgICAgICBzdG9wLnNldEF0dHJpYnV0ZShcInN0b3AtY29sb3JcIiwgY29sb3IpO1xuICAgICAgICBncmFkaWVudC5hcHBlbmRDaGlsZChzdG9wKTtcbiAgICAgIH0pO1xuXG4gICAgICByZWN0LnNldEF0dHJpYnV0ZShcImZpbGxcIiwgYHVybCgnIyR7Z3JhZGllbnRJZH0nKWApO1xuICAgICAgdGhpcy5fZGVmcy5hcHBlbmRDaGlsZChncmFkaWVudCk7XG4gICAgfSBlbHNlIGlmIChjb2xvcikge1xuICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIGNvbG9yKTtcbiAgICB9XG5cbiAgICB0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKHJlY3QpO1xuICB9XG59XG4iLCJpbXBvcnQgY29ybmVyRG90VHlwZXMgZnJvbSBcIi4uLy4uL2NvbnN0YW50cy9jb3JuZXJEb3RUeXBlc1wiO1xuaW1wb3J0IHsgQ29ybmVyRG90VHlwZSwgUm90YXRlRmlndXJlQXJncywgQmFzaWNGaWd1cmVEcmF3QXJncywgRHJhd0FyZ3MgfSBmcm9tIFwiLi4vLi4vdHlwZXNcIjtcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gXCJ1dWlkXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSQ29ybmVyRG90IHtcbiAgX2VsZW1lbnQ/OiBTVkdFbGVtZW50O1xuICBfc3ZnOiBTVkdFbGVtZW50O1xuICBfdHlwZTogQ29ybmVyRG90VHlwZTtcblxuICBjb25zdHJ1Y3Rvcih7IHN2ZywgdHlwZSB9OiB7IHN2ZzogU1ZHRWxlbWVudDsgdHlwZTogQ29ybmVyRG90VHlwZSB9KSB7XG4gICAgdGhpcy5fc3ZnID0gc3ZnO1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICB9XG5cbiAgZHJhdyh4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdHlwZSA9IHRoaXMuX3R5cGU7XG4gICAgbGV0IGRyYXdGdW5jdGlvbjtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBjb3JuZXJEb3RUeXBlcy5zcXVhcmU6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdTcXVhcmU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBjb3JuZXJEb3RUeXBlcy5kb3Q6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RG90O1xuICAgIH1cblxuICAgIGRyYXdGdW5jdGlvbi5jYWxsKHRoaXMsIHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfcm90YXRlRmlndXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gPSAwLCBkcmF3IH06IFJvdGF0ZUZpZ3VyZUFyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCBjeCA9IHggKyBzaXplIC8gMjtcbiAgICBjb25zdCBjeSA9IHkgKyBzaXplIC8gMjtcblxuICAgIGRyYXcoKTtcbiAgICB0aGlzLl9lbGVtZW50Py5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgYHJvdGF0ZSgkeygxODAgKiByb3RhdGlvbikgLyBNYXRoLlBJfSwke2N4fSwke2N5fSlgKTtcbiAgfVxuXG4gIF9iYXNpY0RvdChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNpcmNsZVwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY3hcIiwgU3RyaW5nKHggKyBzaXplIC8gMikpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImN5XCIsIFN0cmluZyh5ICsgc2l6ZSAvIDIpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJyXCIsIFN0cmluZyhzaXplIC8gMikpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2Jhc2ljU3F1YXJlKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicmVjdFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwieFwiLCBTdHJpbmcoeCkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcInlcIiwgU3RyaW5nKHkpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBTdHJpbmcoc2l6ZSkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBTdHJpbmcoc2l6ZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2RyYXdEb3QoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfZHJhd1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvcm5lclNxdWFyZVR5cGVzIGZyb20gXCIuLi8uLi9jb25zdGFudHMvY29ybmVyU3F1YXJlVHlwZXNcIjtcbmltcG9ydCB7IENvcm5lclNxdWFyZVR5cGUsIERyYXdBcmdzLCBCYXNpY0ZpZ3VyZURyYXdBcmdzLCBSb3RhdGVGaWd1cmVBcmdzIH0gZnJvbSBcIi4uLy4uL3R5cGVzXCI7XG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tIFwidXVpZFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRUkNvcm5lclNxdWFyZSB7XG4gIF9lbGVtZW50PzogU1ZHRWxlbWVudDtcbiAgX3N2ZzogU1ZHRWxlbWVudDtcbiAgX3R5cGU6IENvcm5lclNxdWFyZVR5cGU7XG5cbiAgY29uc3RydWN0b3IoeyBzdmcsIHR5cGUgfTogeyBzdmc6IFNWR0VsZW1lbnQ7IHR5cGU6IENvcm5lclNxdWFyZVR5cGUgfSkge1xuICAgIHRoaXMuX3N2ZyA9IHN2ZztcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgfVxuXG4gIGRyYXcoeDogbnVtYmVyLCB5OiBudW1iZXIsIHNpemU6IG51bWJlciwgcm90YXRpb246IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLl90eXBlO1xuICAgIGxldCBkcmF3RnVuY3Rpb247XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuc3F1YXJlOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3U3F1YXJlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuZXh0cmFSb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RXh0cmFSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyU3F1YXJlVHlwZXMuZG90OlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0RvdDtcbiAgICB9XG5cbiAgICBkcmF3RnVuY3Rpb24uY2FsbCh0aGlzLCB7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICB9XG5cbiAgX3JvdGF0ZUZpZ3VyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uID0gMCwgZHJhdyB9OiBSb3RhdGVGaWd1cmVBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgY3ggPSB4ICsgc2l6ZSAvIDI7XG4gICAgY29uc3QgY3kgPSB5ICsgc2l6ZSAvIDI7XG5cbiAgICBkcmF3KCk7XG4gICAgdGhpcy5fZWxlbWVudD8uc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIGByb3RhdGUoJHsoMTgwICogcm90YXRpb24pIC8gTWF0aC5QSX0sJHtjeH0sJHtjeX0pYCk7XG4gIH1cblxuICBfYmFzaWNEb3QoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcbiAgICBjb25zdCBkb3RTaXplID0gc2l6ZSAvIDc7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xpcC1ydWxlXCIsIFwiZXZlbm9kZFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJkXCIsXG4gICAgICAgICAgYE0gJHt4ICsgc2l6ZSAvIDJ9ICR7eX1gICsgLy8gTSBjeCwgeSAvLyAgTW92ZSB0byB0b3Agb2YgcmluZ1xuICAgICAgICAgICAgYGEgJHtzaXplIC8gMn0gJHtzaXplIC8gMn0gMCAxIDAgMC4xIDBgICsgLy8gYSBvdXRlclJhZGl1cywgb3V0ZXJSYWRpdXMsIDAsIDEsIDAsIDEsIDAgLy8gRHJhdyBvdXRlciBhcmMsIGJ1dCBkb24ndCBjbG9zZSBpdFxuICAgICAgICAgICAgYHpgICsgLy8gWiAvLyBDbG9zZSB0aGUgb3V0ZXIgc2hhcGVcbiAgICAgICAgICAgIGBtIDAgJHtkb3RTaXplfWAgKyAvLyBtIC0xIG91dGVyUmFkaXVzLWlubmVyUmFkaXVzIC8vIE1vdmUgdG8gdG9wIHBvaW50IG9mIGlubmVyIHJhZGl1c1xuICAgICAgICAgICAgYGEgJHtzaXplIC8gMiAtIGRvdFNpemV9ICR7c2l6ZSAvIDIgLSBkb3RTaXplfSAwIDEgMSAtMC4xIDBgICsgLy8gYSBpbm5lclJhZGl1cywgaW5uZXJSYWRpdXMsIDAsIDEsIDEsIC0xLCAwIC8vIERyYXcgaW5uZXIgYXJjLCBidXQgZG9uJ3QgY2xvc2UgaXRcbiAgICAgICAgICAgIGBaYCAvLyBaIC8vIENsb3NlIHRoZSBpbm5lciByaW5nLiBBY3R1YWxseSB3aWxsIHN0aWxsIHdvcmsgd2l0aG91dCwgYnV0IGlubmVyIHJpbmcgd2lsbCBoYXZlIG9uZSB1bml0IG1pc3NpbmcgaW4gc3Ryb2tlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNTcXVhcmUoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcbiAgICBjb25zdCBkb3RTaXplID0gc2l6ZSAvIDc7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xpcC1ydWxlXCIsIFwiZXZlbm9kZFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJkXCIsXG4gICAgICAgICAgYE0gJHt4fSAke3l9YCArXG4gICAgICAgICAgICBgdiAke3NpemV9YCArXG4gICAgICAgICAgICBgaCAke3NpemV9YCArXG4gICAgICAgICAgICBgdiAkey1zaXplfWAgK1xuICAgICAgICAgICAgYHpgICtcbiAgICAgICAgICAgIGBNICR7eCArIGRvdFNpemV9ICR7eSArIGRvdFNpemV9YCArXG4gICAgICAgICAgICBgaCAke3NpemUgLSAyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGB2ICR7c2l6ZSAtIDIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGggJHstc2l6ZSArIDIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYHpgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNFeHRyYVJvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcbiAgICBjb25zdCBkb3RTaXplID0gc2l6ZSAvIDc7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xpcC1ydWxlXCIsIFwiZXZlbm9kZFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJkXCIsXG4gICAgICAgICAgYE0gJHt4fSAke3kgKyAyLjUgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYHYgJHsyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7Mi41ICogZG90U2l6ZX0gJHsyLjUgKiBkb3RTaXplfSwgMCwgMCwgMCwgJHtkb3RTaXplICogMi41fSAke2RvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgaCAkezIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsyLjUgKiBkb3RTaXplfSAkezIuNSAqIGRvdFNpemV9LCAwLCAwLCAwLCAke2RvdFNpemUgKiAyLjV9ICR7LWRvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgdiAkey0yICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7Mi41ICogZG90U2l6ZX0gJHsyLjUgKiBkb3RTaXplfSwgMCwgMCwgMCwgJHstZG90U2l6ZSAqIDIuNX0gJHstZG90U2l6ZSAqIDIuNX1gICtcbiAgICAgICAgICAgIGBoICR7LTIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsyLjUgKiBkb3RTaXplfSAkezIuNSAqIGRvdFNpemV9LCAwLCAwLCAwLCAkey1kb3RTaXplICogMi41fSAke2RvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgTSAke3ggKyAyLjUgKiBkb3RTaXplfSAke3kgKyBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGggJHsyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7MS41ICogZG90U2l6ZX0gJHsxLjUgKiBkb3RTaXplfSwgMCwgMCwgMSwgJHtkb3RTaXplICogMS41fSAke2RvdFNpemUgKiAxLjV9YCArXG4gICAgICAgICAgICBgdiAkezIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsxLjUgKiBkb3RTaXplfSAkezEuNSAqIGRvdFNpemV9LCAwLCAwLCAxLCAkey1kb3RTaXplICogMS41fSAke2RvdFNpemUgKiAxLjV9YCArXG4gICAgICAgICAgICBgaCAkey0yICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7MS41ICogZG90U2l6ZX0gJHsxLjUgKiBkb3RTaXplfSwgMCwgMCwgMSwgJHstZG90U2l6ZSAqIDEuNX0gJHstZG90U2l6ZSAqIDEuNX1gICtcbiAgICAgICAgICAgIGB2ICR7LTIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYGEgJHsxLjUgKiBkb3RTaXplfSAkezEuNSAqIGRvdFNpemV9LCAwLCAwLCAxLCAke2RvdFNpemUgKiAxLjV9ICR7LWRvdFNpemUgKiAxLjV9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2RyYXdEb3QoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfZHJhd1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9kcmF3RXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY0V4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgZG90VHlwZXMgZnJvbSBcIi4uLy4uL2NvbnN0YW50cy9kb3RUeXBlc1wiO1xuaW1wb3J0IHsgRG90VHlwZSwgR2V0TmVpZ2hib3IsIERyYXdBcmdzLCBCYXNpY0ZpZ3VyZURyYXdBcmdzLCBSb3RhdGVGaWd1cmVBcmdzIH0gZnJvbSBcIi4uLy4uL3R5cGVzXCI7XG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tIFwidXVpZFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRUkRvdCB7XG4gIF9lbGVtZW50PzogU1ZHRWxlbWVudDtcbiAgX3N2ZzogU1ZHRWxlbWVudDtcbiAgX3R5cGU6IERvdFR5cGU7XG5cbiAgY29uc3RydWN0b3IoeyBzdmcsIHR5cGUgfTogeyBzdmc6IFNWR0VsZW1lbnQ7IHR5cGU6IERvdFR5cGUgfSkge1xuICAgIHRoaXMuX3N2ZyA9IHN2ZztcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgfVxuXG4gIGRyYXcoeDogbnVtYmVyLCB5OiBudW1iZXIsIHNpemU6IG51bWJlciwgZ2V0TmVpZ2hib3I6IEdldE5laWdoYm9yKTogdm9pZCB7XG4gICAgY29uc3QgdHlwZSA9IHRoaXMuX3R5cGU7XG4gICAgbGV0IGRyYXdGdW5jdGlvbjtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBkb3RUeXBlcy5kb3RzOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RG90O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuY2xhc3N5OlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3Q2xhc3N5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuY2xhc3N5Um91bmRlZDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0NsYXNzeVJvdW5kZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5yb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3Um91bmRlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRvdFR5cGVzLmV4dHJhUm91bmRlZDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0V4dHJhUm91bmRlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRvdFR5cGVzLnNxdWFyZTpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdTcXVhcmU7XG4gICAgfVxuXG4gICAgZHJhd0Z1bmN0aW9uLmNhbGwodGhpcywgeyB4LCB5LCBzaXplLCBnZXROZWlnaGJvciB9KTtcbiAgfVxuXG4gIF9yb3RhdGVGaWd1cmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiA9IDAsIGRyYXcgfTogUm90YXRlRmlndXJlQXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGN4ID0geCArIHNpemUgLyAyO1xuICAgIGNvbnN0IGN5ID0geSArIHNpemUgLyAyO1xuXG4gICAgZHJhdygpO1xuICAgIHRoaXMuX2VsZW1lbnQ/LnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCBgcm90YXRlKCR7KDE4MCAqIHJvdGF0aW9uKSAvIE1hdGguUEl9LCR7Y3h9LCR7Y3l9KWApO1xuICB9XG5cbiAgX2Jhc2ljRG90KGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiY2lyY2xlXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIHV1aWR2NCgpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjeFwiLCBTdHJpbmcoeCArIHNpemUgLyAyKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY3lcIiwgU3RyaW5nKHkgKyBzaXplIC8gMikpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcInJcIiwgU3RyaW5nKHNpemUgLyAyKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNTcXVhcmUoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJyZWN0XCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIHV1aWR2NCgpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ4XCIsIFN0cmluZyh4KSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwieVwiLCBTdHJpbmcoeSkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFN0cmluZyhzaXplKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFN0cmluZyhzaXplKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL2lmIHJvdGF0aW9uID09PSAwIC0gcmlnaHQgc2lkZSBpcyByb3VuZGVkXG4gIF9iYXNpY1NpZGVSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwiZFwiLFxuICAgICAgICAgIGBNICR7eH0gJHt5fWAgKyAvL2dvIHRvIHRvcCBsZWZ0IHBvc2l0aW9uXG4gICAgICAgICAgICBgdiAke3NpemV9YCArIC8vZHJhdyBsaW5lIHRvIGxlZnQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYGggJHtzaXplIC8gMn1gICsgLy9kcmF3IGxpbmUgdG8gbGVmdCBib3R0b20gY29ybmVyICsgaGFsZiBvZiBzaXplIHJpZ2h0XG4gICAgICAgICAgICBgYSAke3NpemUgLyAyfSAke3NpemUgLyAyfSwgMCwgMCwgMCwgMCAkey1zaXplfWAgLy8gZHJhdyByb3VuZGVkIGNvcm5lclxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy9pZiByb3RhdGlvbiA9PT0gMCAtIHRvcCByaWdodCBjb3JuZXIgaXMgcm91bmRlZFxuICBfYmFzaWNDb3JuZXJSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB1dWlkdjQoKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwiZFwiLFxuICAgICAgICAgIGBNICR7eH0gJHt5fWAgKyAvL2dvIHRvIHRvcCBsZWZ0IHBvc2l0aW9uXG4gICAgICAgICAgICBgdiAke3NpemV9YCArIC8vZHJhdyBsaW5lIHRvIGxlZnQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYGggJHtzaXplfWAgKyAvL2RyYXcgbGluZSB0byByaWdodCBib3R0b20gY29ybmVyXG4gICAgICAgICAgICBgdiAkey1zaXplIC8gMn1gICsgLy9kcmF3IGxpbmUgdG8gcmlnaHQgYm90dG9tIGNvcm5lciArIGhhbGYgb2Ygc2l6ZSB0b3BcbiAgICAgICAgICAgIGBhICR7c2l6ZSAvIDJ9ICR7c2l6ZSAvIDJ9LCAwLCAwLCAwLCAkey1zaXplIC8gMn0gJHstc2l6ZSAvIDJ9YCAvLyBkcmF3IHJvdW5kZWQgY29ybmVyXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL2lmIHJvdGF0aW9uID09PSAwIC0gdG9wIHJpZ2h0IGNvcm5lciBpcyByb3VuZGVkXG4gIF9iYXNpY0Nvcm5lckV4dHJhUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgdXVpZHY0KCkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3h9ICR7eX1gICsgLy9nbyB0byB0b3AgbGVmdCBwb3NpdGlvblxuICAgICAgICAgICAgYHYgJHtzaXplfWAgKyAvL2RyYXcgbGluZSB0byBsZWZ0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGBoICR7c2l6ZX1gICsgLy9kcmF3IGxpbmUgdG8gcmlnaHQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYGEgJHtzaXplfSAke3NpemV9LCAwLCAwLCAwLCAkey1zaXplfSAkey1zaXplfWAgLy8gZHJhdyByb3VuZGVkIHRvcCByaWdodCBjb3JuZXJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vaWYgcm90YXRpb24gPT09IDAgLSBsZWZ0IGJvdHRvbSBhbmQgcmlnaHQgdG9wIGNvcm5lcnMgYXJlIHJvdW5kZWRcbiAgX2Jhc2ljQ29ybmVyc1JvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIHV1aWR2NCgpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJkXCIsXG4gICAgICAgICAgYE0gJHt4fSAke3l9YCArIC8vZ28gdG8gbGVmdCB0b3AgcG9zaXRpb25cbiAgICAgICAgICAgIGB2ICR7c2l6ZSAvIDJ9YCArIC8vZHJhdyBsaW5lIHRvIGxlZnQgdG9wIGNvcm5lciArIGhhbGYgb2Ygc2l6ZSBib3R0b21cbiAgICAgICAgICAgIGBhICR7c2l6ZSAvIDJ9ICR7c2l6ZSAvIDJ9LCAwLCAwLCAwLCAke3NpemUgLyAyfSAke3NpemUgLyAyfWAgKyAvLyBkcmF3IHJvdW5kZWQgbGVmdCBib3R0b20gY29ybmVyXG4gICAgICAgICAgICBgaCAke3NpemUgLyAyfWAgKyAvL2RyYXcgbGluZSB0byByaWdodCBib3R0b20gY29ybmVyXG4gICAgICAgICAgICBgdiAkey1zaXplIC8gMn1gICsgLy9kcmF3IGxpbmUgdG8gcmlnaHQgYm90dG9tIGNvcm5lciArIGhhbGYgb2Ygc2l6ZSB0b3BcbiAgICAgICAgICAgIGBhICR7c2l6ZSAvIDJ9ICR7c2l6ZSAvIDJ9LCAwLCAwLCAwLCAkey1zaXplIC8gMn0gJHstc2l6ZSAvIDJ9YCAvLyBkcmF3IHJvdW5kZWQgcmlnaHQgdG9wIGNvcm5lclxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2RyYXdEb3QoeyB4LCB5LCBzaXplIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNEb3QoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogMCB9KTtcbiAgfVxuXG4gIF9kcmF3U3F1YXJlKHsgeCwgeSwgc2l6ZSB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gIH1cblxuICBfZHJhd1JvdW5kZWQoeyB4LCB5LCBzaXplLCBnZXROZWlnaGJvciB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA+IDIgfHwgKGxlZnROZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB8fCAodG9wTmVpZ2hib3IgJiYgYm90dG9tTmVpZ2hib3IpKSB7XG4gICAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMikge1xuICAgICAgbGV0IHJvdGF0aW9uID0gMDtcblxuICAgICAgaWYgKGxlZnROZWlnaGJvciAmJiB0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmICh0b3BOZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAocmlnaHROZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAxKSB7XG4gICAgICBsZXQgcm90YXRpb24gPSAwO1xuXG4gICAgICBpZiAodG9wTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJIC8gMjtcbiAgICAgIH0gZWxzZSBpZiAocmlnaHROZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEk7XG4gICAgICB9IGVsc2UgaWYgKGJvdHRvbU5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gLU1hdGguUEkgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9iYXNpY1NpZGVSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgX2RyYXdFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCBnZXROZWlnaGJvciB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA+IDIgfHwgKGxlZnROZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB8fCAodG9wTmVpZ2hib3IgJiYgYm90dG9tTmVpZ2hib3IpKSB7XG4gICAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMikge1xuICAgICAgbGV0IHJvdGF0aW9uID0gMDtcblxuICAgICAgaWYgKGxlZnROZWlnaGJvciAmJiB0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmICh0b3BOZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAocmlnaHROZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDEpIHtcbiAgICAgIGxldCByb3RhdGlvbiA9IDA7XG5cbiAgICAgIGlmICh0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Jhc2ljU2lkZVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfZHJhd0NsYXNzeSh7IHgsIHksIHNpemUsIGdldE5laWdoYm9yIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoLTEsIDApIDogMDtcbiAgICBjb25zdCByaWdodE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMSwgMCkgOiAwO1xuICAgIGNvbnN0IHRvcE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgLTEpIDogMDtcbiAgICBjb25zdCBib3R0b21OZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIDEpIDogMDtcblxuICAgIGNvbnN0IG5laWdoYm9yc0NvdW50ID0gbGVmdE5laWdoYm9yICsgcmlnaHROZWlnaGJvciArIHRvcE5laWdoYm9yICsgYm90dG9tTmVpZ2hib3I7XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyc1JvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogTWF0aC5QSSAvIDIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFsZWZ0TmVpZ2hib3IgJiYgIXRvcE5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lclJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogLU1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghcmlnaHROZWlnaGJvciAmJiAhYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG5cbiAgX2RyYXdDbGFzc3lSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgZ2V0TmVpZ2hib3IgfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCBsZWZ0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigtMSwgMCkgOiAwO1xuICAgIGNvbnN0IHJpZ2h0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigxLCAwKSA6IDA7XG4gICAgY29uc3QgdG9wTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAtMSkgOiAwO1xuICAgIGNvbnN0IGJvdHRvbU5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgMSkgOiAwO1xuXG4gICAgY29uc3QgbmVpZ2hib3JzQ291bnQgPSBsZWZ0TmVpZ2hib3IgKyByaWdodE5laWdoYm9yICsgdG9wTmVpZ2hib3IgKyBib3R0b21OZWlnaGJvcjtcblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJzUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWxlZnROZWlnaGJvciAmJiAhdG9wTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyRXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IC1NYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJpZ2h0TmVpZ2hib3IgJiYgIWJvdHRvbU5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lckV4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG59XG4iLCJpbnRlcmZhY2UgSW1hZ2VTaXplT3B0aW9ucyB7XG4gIG9yaWdpbmFsSGVpZ2h0OiBudW1iZXI7XG4gIG9yaWdpbmFsV2lkdGg6IG51bWJlcjtcbiAgbWF4SGlkZGVuRG90czogbnVtYmVyO1xuICBtYXhIaWRkZW5BeGlzRG90cz86IG51bWJlcjtcbiAgZG90U2l6ZTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgSW1hZ2VTaXplUmVzdWx0IHtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhpZGVZRG90czogbnVtYmVyO1xuICBoaWRlWERvdHM6IG51bWJlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2FsY3VsYXRlSW1hZ2VTaXplKHtcbiAgb3JpZ2luYWxIZWlnaHQsXG4gIG9yaWdpbmFsV2lkdGgsXG4gIG1heEhpZGRlbkRvdHMsXG4gIG1heEhpZGRlbkF4aXNEb3RzLFxuICBkb3RTaXplXG59OiBJbWFnZVNpemVPcHRpb25zKTogSW1hZ2VTaXplUmVzdWx0IHtcbiAgY29uc3QgaGlkZURvdHMgPSB7IHg6IDAsIHk6IDAgfTtcbiAgY29uc3QgaW1hZ2VTaXplID0geyB4OiAwLCB5OiAwIH07XG5cbiAgaWYgKG9yaWdpbmFsSGVpZ2h0IDw9IDAgfHwgb3JpZ2luYWxXaWR0aCA8PSAwIHx8IG1heEhpZGRlbkRvdHMgPD0gMCB8fCBkb3RTaXplIDw9IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVpZ2h0OiAwLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoaWRlWURvdHM6IDAsXG4gICAgICBoaWRlWERvdHM6IDBcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgayA9IG9yaWdpbmFsSGVpZ2h0IC8gb3JpZ2luYWxXaWR0aDtcblxuICAvL0dldHRpbmcgdGhlIG1heGltdW0gcG9zc2libGUgYXhpcyBoaWRkZW4gZG90c1xuICBoaWRlRG90cy54ID0gTWF0aC5mbG9vcihNYXRoLnNxcnQobWF4SGlkZGVuRG90cyAvIGspKTtcbiAgLy9UaGUgY291bnQgb2YgaGlkZGVuIGRvdCdzIGNhbid0IGJlIGxlc3MgdGhhbiAxXG4gIGlmIChoaWRlRG90cy54IDw9IDApIGhpZGVEb3RzLnggPSAxO1xuICAvL0NoZWNrIHRoZSBsaW1pdCBvZiB0aGUgbWF4aW11bSBhbGxvd2VkIGF4aXMgaGlkZGVuIGRvdHNcbiAgaWYgKG1heEhpZGRlbkF4aXNEb3RzICYmIG1heEhpZGRlbkF4aXNEb3RzIDwgaGlkZURvdHMueCkgaGlkZURvdHMueCA9IG1heEhpZGRlbkF4aXNEb3RzO1xuICAvL1RoZSBjb3VudCBvZiBkb3RzIHNob3VsZCBiZSBvZGRcbiAgaWYgKGhpZGVEb3RzLnggJSAyID09PSAwKSBoaWRlRG90cy54LS07XG4gIGltYWdlU2l6ZS54ID0gaGlkZURvdHMueCAqIGRvdFNpemU7XG4gIC8vQ2FsY3VsYXRlIG9wcG9zaXRlIGF4aXMgaGlkZGVuIGRvdHMgYmFzZWQgb24gYXhpcyB2YWx1ZS5cbiAgLy9UaGUgdmFsdWUgd2lsbCBiZSBvZGQuXG4gIC8vV2UgdXNlIGNlaWwgdG8gcHJldmVudCBkb3RzIGNvdmVyaW5nIGJ5IHRoZSBpbWFnZS5cbiAgaGlkZURvdHMueSA9IDEgKyAyICogTWF0aC5jZWlsKChoaWRlRG90cy54ICogayAtIDEpIC8gMik7XG4gIGltYWdlU2l6ZS55ID0gTWF0aC5yb3VuZChpbWFnZVNpemUueCAqIGspO1xuICAvL0lmIHRoZSByZXN1bHQgZG90cyBjb3VudCBpcyBiaWdnZXIgdGhhbiBtYXggLSB0aGVuIGRlY3JlYXNlIHNpemUgYW5kIGNhbGN1bGF0ZSBhZ2FpblxuICBpZiAoaGlkZURvdHMueSAqIGhpZGVEb3RzLnggPiBtYXhIaWRkZW5Eb3RzIHx8IChtYXhIaWRkZW5BeGlzRG90cyAmJiBtYXhIaWRkZW5BeGlzRG90cyA8IGhpZGVEb3RzLnkpKSB7XG4gICAgaWYgKG1heEhpZGRlbkF4aXNEb3RzICYmIG1heEhpZGRlbkF4aXNEb3RzIDwgaGlkZURvdHMueSkge1xuICAgICAgaGlkZURvdHMueSA9IG1heEhpZGRlbkF4aXNEb3RzO1xuICAgICAgaWYgKGhpZGVEb3RzLnkgJSAyID09PSAwKSBoaWRlRG90cy54LS07XG4gICAgfSBlbHNlIHtcbiAgICAgIGhpZGVEb3RzLnkgLT0gMjtcbiAgICB9XG4gICAgaW1hZ2VTaXplLnkgPSBoaWRlRG90cy55ICogZG90U2l6ZTtcbiAgICBoaWRlRG90cy54ID0gMSArIDIgKiBNYXRoLmNlaWwoKGhpZGVEb3RzLnkgLyBrIC0gMSkgLyAyKTtcbiAgICBpbWFnZVNpemUueCA9IE1hdGgucm91bmQoaW1hZ2VTaXplLnkgLyBrKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaGVpZ2h0OiBpbWFnZVNpemUueSxcbiAgICB3aWR0aDogaW1hZ2VTaXplLngsXG4gICAgaGlkZVlEb3RzOiBoaWRlRG90cy55LFxuICAgIGhpZGVYRG90czogaGlkZURvdHMueFxuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZG93bmxvYWRVUkkodXJpOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gIGxpbmsuZG93bmxvYWQgPSBuYW1lO1xuICBsaW5rLmhyZWYgPSB1cmk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gIGxpbmsuY2xpY2soKTtcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbn1cbiIsImltcG9ydCBtb2RlcyBmcm9tIFwiLi4vY29uc3RhbnRzL21vZGVzXCI7XG5pbXBvcnQgeyBNb2RlIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldE1vZGUoZGF0YTogc3RyaW5nKTogTW9kZSB7XG4gIHN3aXRjaCAodHJ1ZSkge1xuICAgIGNhc2UgL15bMC05XSokLy50ZXN0KGRhdGEpOlxuICAgICAgcmV0dXJuIG1vZGVzLm51bWVyaWM7XG4gICAgY2FzZSAvXlswLTlBLVogJCUqK1xcLS4vOl0qJC8udGVzdChkYXRhKTpcbiAgICAgIHJldHVybiBtb2Rlcy5hbHBoYW51bWVyaWM7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBtb2Rlcy5ieXRlO1xuICB9XG59XG4iLCJpbXBvcnQgeyBVbmtub3duT2JqZWN0IH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmNvbnN0IGlzT2JqZWN0ID0gKG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBib29sZWFuID0+ICEhb2JqICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgIUFycmF5LmlzQXJyYXkob2JqKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWVyZ2VEZWVwKHRhcmdldDogVW5rbm93bk9iamVjdCwgLi4uc291cmNlczogVW5rbm93bk9iamVjdFtdKTogVW5rbm93bk9iamVjdCB7XG4gIGlmICghc291cmNlcy5sZW5ndGgpIHJldHVybiB0YXJnZXQ7XG4gIGNvbnN0IHNvdXJjZSA9IHNvdXJjZXMuc2hpZnQoKTtcbiAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkIHx8ICFpc09iamVjdCh0YXJnZXQpIHx8ICFpc09iamVjdChzb3VyY2UpKSByZXR1cm4gdGFyZ2V0O1xuICB0YXJnZXQgPSB7IC4uLnRhcmdldCB9O1xuICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goKGtleTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgY29uc3QgdGFyZ2V0VmFsdWUgPSB0YXJnZXRba2V5XTtcbiAgICBjb25zdCBzb3VyY2VWYWx1ZSA9IHNvdXJjZVtrZXldO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0VmFsdWUpICYmIEFycmF5LmlzQXJyYXkoc291cmNlVmFsdWUpKSB7XG4gICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVZhbHVlO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodGFyZ2V0VmFsdWUpICYmIGlzT2JqZWN0KHNvdXJjZVZhbHVlKSkge1xuICAgICAgdGFyZ2V0W2tleV0gPSBtZXJnZURlZXAoT2JqZWN0LmFzc2lnbih7fSwgdGFyZ2V0VmFsdWUpLCBzb3VyY2VWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlVmFsdWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gbWVyZ2VEZWVwKHRhcmdldCwgLi4uc291cmNlcyk7XG59XG4iLCJpbXBvcnQgeyBSZXF1aXJlZE9wdGlvbnMgfSBmcm9tIFwiLi4vY29yZS9RUk9wdGlvbnNcIjtcbmltcG9ydCB7IEdyYWRpZW50IH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmZ1bmN0aW9uIHNhbml0aXplR3JhZGllbnQoZ3JhZGllbnQ6IEdyYWRpZW50KTogR3JhZGllbnQge1xuICBjb25zdCBuZXdHcmFkaWVudCA9IHsgLi4uZ3JhZGllbnQgfTtcblxuICBpZiAoIW5ld0dyYWRpZW50LmNvbG9yU3RvcHMgfHwgIW5ld0dyYWRpZW50LmNvbG9yU3RvcHMubGVuZ3RoKSB7XG4gICAgdGhyb3cgXCJGaWVsZCAnY29sb3JTdG9wcycgaXMgcmVxdWlyZWQgaW4gZ3JhZGllbnRcIjtcbiAgfVxuXG4gIGlmIChuZXdHcmFkaWVudC5yb3RhdGlvbikge1xuICAgIG5ld0dyYWRpZW50LnJvdGF0aW9uID0gTnVtYmVyKG5ld0dyYWRpZW50LnJvdGF0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICBuZXdHcmFkaWVudC5yb3RhdGlvbiA9IDA7XG4gIH1cblxuICBuZXdHcmFkaWVudC5jb2xvclN0b3BzID0gbmV3R3JhZGllbnQuY29sb3JTdG9wcy5tYXAoKGNvbG9yU3RvcDogeyBvZmZzZXQ6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9KSA9PiAoe1xuICAgIC4uLmNvbG9yU3RvcCxcbiAgICBvZmZzZXQ6IE51bWJlcihjb2xvclN0b3Aub2Zmc2V0KVxuICB9KSk7XG5cbiAgcmV0dXJuIG5ld0dyYWRpZW50O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzYW5pdGl6ZU9wdGlvbnMob3B0aW9uczogUmVxdWlyZWRPcHRpb25zKTogUmVxdWlyZWRPcHRpb25zIHtcbiAgY29uc3QgbmV3T3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9O1xuXG4gIG5ld09wdGlvbnMud2lkdGggPSBOdW1iZXIobmV3T3B0aW9ucy53aWR0aCk7XG4gIG5ld09wdGlvbnMuaGVpZ2h0ID0gTnVtYmVyKG5ld09wdGlvbnMuaGVpZ2h0KTtcbiAgbmV3T3B0aW9ucy5tYXJnaW4gPSBOdW1iZXIobmV3T3B0aW9ucy5tYXJnaW4pO1xuICBuZXdPcHRpb25zLmltYWdlT3B0aW9ucyA9IHtcbiAgICAuLi5uZXdPcHRpb25zLmltYWdlT3B0aW9ucyxcbiAgICBoaWRlQmFja2dyb3VuZERvdHM6IEJvb2xlYW4obmV3T3B0aW9ucy5pbWFnZU9wdGlvbnMuaGlkZUJhY2tncm91bmREb3RzKSxcbiAgICBpbWFnZVNpemU6IE51bWJlcihuZXdPcHRpb25zLmltYWdlT3B0aW9ucy5pbWFnZVNpemUpLFxuICAgIG1hcmdpbjogTnVtYmVyKG5ld09wdGlvbnMuaW1hZ2VPcHRpb25zLm1hcmdpbilcbiAgfTtcblxuICBpZiAobmV3T3B0aW9ucy5tYXJnaW4gPiBNYXRoLm1pbihuZXdPcHRpb25zLndpZHRoLCBuZXdPcHRpb25zLmhlaWdodCkpIHtcbiAgICBuZXdPcHRpb25zLm1hcmdpbiA9IE1hdGgubWluKG5ld09wdGlvbnMud2lkdGgsIG5ld09wdGlvbnMuaGVpZ2h0KTtcbiAgfVxuXG4gIG5ld09wdGlvbnMuZG90c09wdGlvbnMgPSB7XG4gICAgLi4ubmV3T3B0aW9ucy5kb3RzT3B0aW9uc1xuICB9O1xuICBpZiAobmV3T3B0aW9ucy5kb3RzT3B0aW9ucy5ncmFkaWVudCkge1xuICAgIG5ld09wdGlvbnMuZG90c09wdGlvbnMuZ3JhZGllbnQgPSBzYW5pdGl6ZUdyYWRpZW50KG5ld09wdGlvbnMuZG90c09wdGlvbnMuZ3JhZGllbnQpO1xuICB9XG5cbiAgaWYgKG5ld09wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnMpIHtcbiAgICBuZXdPcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zID0ge1xuICAgICAgLi4ubmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9uc1xuICAgIH07XG4gICAgaWYgKG5ld09wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnMuZ3JhZGllbnQpIHtcbiAgICAgIG5ld09wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnMuZ3JhZGllbnQgPSBzYW5pdGl6ZUdyYWRpZW50KG5ld09wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnMuZ3JhZGllbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChuZXdPcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zKSB7XG4gICAgbmV3T3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucyA9IHtcbiAgICAgIC4uLm5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnNcbiAgICB9O1xuICAgIGlmIChuZXdPcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zLmdyYWRpZW50KSB7XG4gICAgICBuZXdPcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zLmdyYWRpZW50ID0gc2FuaXRpemVHcmFkaWVudChuZXdPcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zLmdyYWRpZW50KTtcbiAgICB9XG4gIH1cblxuICBpZiAobmV3T3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucykge1xuICAgIG5ld09wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnMgPSB7XG4gICAgICAuLi5uZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zXG4gICAgfTtcbiAgICBpZiAobmV3T3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucy5ncmFkaWVudCkge1xuICAgICAgbmV3T3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucy5ncmFkaWVudCA9IHNhbml0aXplR3JhZGllbnQobmV3T3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucy5ncmFkaWVudCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ld09wdGlvbnM7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiB0b0RhdGFVUkwodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcpO1xuICAgICAgfTtcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKHhoci5yZXNwb25zZSk7XG4gICAgfTtcbiAgICB4aHIub3BlbihcIkdFVFwiLCB1cmwpO1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSBcImJsb2JcIjtcbiAgICB4aHIuc2VuZCgpO1xuICB9KTtcbn1cbiIsImV4cG9ydCBpbnRlcmZhY2UgVW5rbm93bk9iamVjdCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IHR5cGUgRG90VHlwZSA9IFwiZG90c1wiIHwgXCJyb3VuZGVkXCIgfCBcImNsYXNzeVwiIHwgXCJjbGFzc3ktcm91bmRlZFwiIHwgXCJzcXVhcmVcIiB8IFwiZXh0cmEtcm91bmRlZFwiO1xuZXhwb3J0IHR5cGUgQ29ybmVyRG90VHlwZSA9IFwiZG90XCIgfCBcInNxdWFyZVwiO1xuZXhwb3J0IHR5cGUgQ29ybmVyU3F1YXJlVHlwZSA9IFwiZG90XCIgfCBcInNxdWFyZVwiIHwgXCJleHRyYS1yb3VuZGVkXCI7XG5leHBvcnQgdHlwZSBGaWxlRXh0ZW5zaW9uID0gXCJzdmdcIiB8IFwicG5nXCIgfCBcImpwZWdcIiB8IFwid2VicFwiO1xuZXhwb3J0IHR5cGUgR3JhZGllbnRUeXBlID0gXCJyYWRpYWxcIiB8IFwibGluZWFyXCI7XG5leHBvcnQgdHlwZSBEcmF3VHlwZSA9IFwiY2FudmFzXCIgfCBcInN2Z1wiO1xuZXhwb3J0IHR5cGUgU2hhcGVUeXBlID0gXCJzcXVhcmVcIiB8IFwiY2lyY2xlXCI7XG5cbmV4cG9ydCB0eXBlIEdyYWRpZW50ID0ge1xuICB0eXBlOiBHcmFkaWVudFR5cGU7XG4gIHJvdGF0aW9uPzogbnVtYmVyO1xuICBjb2xvclN0b3BzOiB7XG4gICAgb2Zmc2V0OiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgfVtdO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBEb3RUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IERvdFR5cGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR3JhZGllbnRUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IEdyYWRpZW50VHlwZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb3JuZXJEb3RUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IENvcm5lckRvdFR5cGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29ybmVyU3F1YXJlVHlwZXMge1xuICBba2V5OiBzdHJpbmddOiBDb3JuZXJTcXVhcmVUeXBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IERyYXdUeXBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNoYXBlVHlwZXMge1xuICBba2V5OiBzdHJpbmddOiBTaGFwZVR5cGU7XG59XG5cbmV4cG9ydCB0eXBlIFR5cGVOdW1iZXIgPVxuICB8IDBcbiAgfCAxXG4gIHwgMlxuICB8IDNcbiAgfCA0XG4gIHwgNVxuICB8IDZcbiAgfCA3XG4gIHwgOFxuICB8IDlcbiAgfCAxMFxuICB8IDExXG4gIHwgMTJcbiAgfCAxM1xuICB8IDE0XG4gIHwgMTVcbiAgfCAxNlxuICB8IDE3XG4gIHwgMThcbiAgfCAxOVxuICB8IDIwXG4gIHwgMjFcbiAgfCAyMlxuICB8IDIzXG4gIHwgMjRcbiAgfCAyNVxuICB8IDI2XG4gIHwgMjdcbiAgfCAyOFxuICB8IDI5XG4gIHwgMzBcbiAgfCAzMVxuICB8IDMyXG4gIHwgMzNcbiAgfCAzNFxuICB8IDM1XG4gIHwgMzZcbiAgfCAzN1xuICB8IDM4XG4gIHwgMzlcbiAgfCA0MDtcblxuZXhwb3J0IHR5cGUgRXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSBcIkxcIiB8IFwiTVwiIHwgXCJRXCIgfCBcIkhcIjtcbmV4cG9ydCB0eXBlIE1vZGUgPSBcIk51bWVyaWNcIiB8IFwiQWxwaGFudW1lcmljXCIgfCBcIkJ5dGVcIiB8IFwiS2FuamlcIjtcbmV4cG9ydCBpbnRlcmZhY2UgUVJDb2RlIHtcbiAgYWRkRGF0YShkYXRhOiBzdHJpbmcsIG1vZGU/OiBNb2RlKTogdm9pZDtcbiAgbWFrZSgpOiB2b2lkO1xuICBnZXRNb2R1bGVDb3VudCgpOiBudW1iZXI7XG4gIGlzRGFyayhyb3c6IG51bWJlciwgY29sOiBudW1iZXIpOiBib29sZWFuO1xuICBjcmVhdGVJbWdUYWcoY2VsbFNpemU/OiBudW1iZXIsIG1hcmdpbj86IG51bWJlcik6IHN0cmluZztcbiAgY3JlYXRlU3ZnVGFnKGNlbGxTaXplPzogbnVtYmVyLCBtYXJnaW4/OiBudW1iZXIpOiBzdHJpbmc7XG4gIGNyZWF0ZVN2Z1RhZyhvcHRzPzogeyBjZWxsU2l6ZT86IG51bWJlcjsgbWFyZ2luPzogbnVtYmVyOyBzY2FsYWJsZT86IGJvb2xlYW4gfSk6IHN0cmluZztcbiAgY3JlYXRlRGF0YVVSTChjZWxsU2l6ZT86IG51bWJlciwgbWFyZ2luPzogbnVtYmVyKTogc3RyaW5nO1xuICBjcmVhdGVUYWJsZVRhZyhjZWxsU2l6ZT86IG51bWJlciwgbWFyZ2luPzogbnVtYmVyKTogc3RyaW5nO1xuICBjcmVhdGVBU0NJSShjZWxsU2l6ZT86IG51bWJlciwgbWFyZ2luPzogbnVtYmVyKTogc3RyaW5nO1xuICByZW5kZXJUbzJkQ29udGV4dChjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNlbGxTaXplPzogbnVtYmVyKTogdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUgT3B0aW9ucyA9IHtcbiAgdHlwZT86IERyYXdUeXBlO1xuICBzaGFwZT86IFNoYXBlVHlwZTtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGhlaWdodD86IG51bWJlcjtcbiAgaW1hZ2U/OiBzdHJpbmc7XG4gIG1hcmdpbj86IG51bWJlcjtcbiAgZGF0YT86IHN0cmluZztcbiAgLyoqXG4gICAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9TVkcvQXR0cmlidXRlL3NoYXBlLXJlbmRlcmluZyN1c2FnZV9ub3Rlc1xuICAgKi9cbiAgc2hhcGVSZW5kZXJpbmc/OiBzdHJpbmc7XG4gIHFyT3B0aW9ucz86IHtcbiAgICB0eXBlTnVtYmVyPzogVHlwZU51bWJlcjtcbiAgICBtb2RlPzogTW9kZTtcbiAgICBlcnJvckNvcnJlY3Rpb25MZXZlbD86IEVycm9yQ29ycmVjdGlvbkxldmVsO1xuICB9O1xuICBpbWFnZU9wdGlvbnM/OiB7XG4gICAgaGlkZUJhY2tncm91bmREb3RzPzogYm9vbGVhbjtcbiAgICBpbWFnZVNpemU/OiBudW1iZXI7XG4gICAgY3Jvc3NPcmlnaW4/OiBzdHJpbmc7XG4gICAgbWFyZ2luPzogbnVtYmVyO1xuICAgIHNoYXBlPzogc3RyaW5nO1xuICAgIGJvcmRlcldpZHRoPzogbnVtYmVyO1xuICAgIGJvcmRlckNvbG9yPzogc3RyaW5nO1xuICB9O1xuICBkb3RzT3B0aW9ucz86IHtcbiAgICB0eXBlPzogRG90VHlwZTtcbiAgICBjb2xvcj86IHN0cmluZztcbiAgICBncmFkaWVudD86IEdyYWRpZW50O1xuICB9O1xuICBjb3JuZXJzU3F1YXJlT3B0aW9ucz86IHtcbiAgICB0eXBlPzogQ29ybmVyU3F1YXJlVHlwZTtcbiAgICBjb2xvcj86IHN0cmluZztcbiAgICBncmFkaWVudD86IEdyYWRpZW50O1xuICB9O1xuICBjb3JuZXJzRG90T3B0aW9ucz86IHtcbiAgICB0eXBlPzogQ29ybmVyRG90VHlwZTtcbiAgICBjb2xvcj86IHN0cmluZztcbiAgICBncmFkaWVudD86IEdyYWRpZW50O1xuICB9O1xuICBiYWNrZ3JvdW5kT3B0aW9ucz86IHtcbiAgICByb3VuZD86IG51bWJlcjtcbiAgICBjb2xvcj86IHN0cmluZztcbiAgICBncmFkaWVudD86IEdyYWRpZW50O1xuICB9O1xufTtcblxuZXhwb3J0IHR5cGUgRmlsdGVyRnVuY3Rpb24gPSAoaTogbnVtYmVyLCBqOiBudW1iZXIpID0+IGJvb2xlYW47XG5cbmV4cG9ydCB0eXBlIERvd25sb2FkT3B0aW9ucyA9IHtcbiAgbmFtZT86IHN0cmluZztcbiAgZXh0ZW5zaW9uPzogRmlsZUV4dGVuc2lvbjtcbn07XG5cbmV4cG9ydCB0eXBlIERyYXdBcmdzID0ge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgc2l6ZTogbnVtYmVyO1xuICByb3RhdGlvbj86IG51bWJlcjtcbiAgZ2V0TmVpZ2hib3I/OiBHZXROZWlnaGJvcjtcbn07XG5cbmV4cG9ydCB0eXBlIEJhc2ljRmlndXJlRHJhd0FyZ3MgPSB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICBzaXplOiBudW1iZXI7XG4gIHJvdGF0aW9uPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUm90YXRlRmlndXJlQXJncyA9IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHNpemU6IG51bWJlcjtcbiAgcm90YXRpb24/OiBudW1iZXI7XG4gIGRyYXc6ICgpID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgdHlwZSBHZXROZWlnaGJvciA9ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gYm9vbGVhbjtcblxuZXhwb3J0IHR5cGUgRXh0ZW5zaW9uRnVuY3Rpb24gPSAoc3ZnOiBTVkdFbGVtZW50LCBvcHRpb25zOiBPcHRpb25zKSA9PiB2b2lkO1xuIiwiY29uc3QgcmFuZG9tVVVJRCA9IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIGNyeXB0by5yYW5kb21VVUlEICYmIGNyeXB0by5yYW5kb21VVUlELmJpbmQoY3J5cHRvKTtcbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmFuZG9tVVVJRFxufTsiLCJleHBvcnQgZGVmYXVsdCAvXig/OlswLTlhLWZdezh9LVswLTlhLWZdezR9LVsxLTVdWzAtOWEtZl17M30tWzg5YWJdWzAtOWEtZl17M30tWzAtOWEtZl17MTJ9fDAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCkkL2k7IiwiLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gSW4gdGhlIGJyb3dzZXIgd2UgdGhlcmVmb3JlXG4vLyByZXF1aXJlIHRoZSBjcnlwdG8gQVBJIGFuZCBkbyBub3Qgc3VwcG9ydCBidWlsdC1pbiBmYWxsYmFjayB0byBsb3dlciBxdWFsaXR5IHJhbmRvbSBudW1iZXJcbi8vIGdlbmVyYXRvcnMgKGxpa2UgTWF0aC5yYW5kb20oKSkuXG5sZXQgZ2V0UmFuZG9tVmFsdWVzO1xuY29uc3Qgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBybmcoKSB7XG4gIC8vIGxhenkgbG9hZCBzbyB0aGF0IGVudmlyb25tZW50cyB0aGF0IG5lZWQgdG8gcG9seWZpbGwgaGF2ZSBhIGNoYW5jZSB0byBkbyBzb1xuICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIGdldFJhbmRvbVZhbHVlcyBuZWVkcyB0byBiZSBpbnZva2VkIGluIGEgY29udGV4dCB3aGVyZSBcInRoaXNcIiBpcyBhIENyeXB0byBpbXBsZW1lbnRhdGlvbi5cbiAgICBnZXRSYW5kb21WYWx1ZXMgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChjcnlwdG8pO1xuXG4gICAgaWYgKCFnZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY3J5cHRvLmdldFJhbmRvbVZhbHVlcygpIG5vdCBzdXBwb3J0ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQjZ2V0cmFuZG9tdmFsdWVzLW5vdC1zdXBwb3J0ZWQnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZ2V0UmFuZG9tVmFsdWVzKHJuZHM4KTtcbn0iLCJpbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZS5qcyc7XG4vKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWFhYWFhYWFhYXG4gKi9cblxuY29uc3QgYnl0ZVRvSGV4ID0gW107XG5cbmZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgYnl0ZVRvSGV4LnB1c2goKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnNsaWNlKDEpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2FmZVN0cmluZ2lmeShhcnIsIG9mZnNldCA9IDApIHtcbiAgLy8gTm90ZTogQmUgY2FyZWZ1bCBlZGl0aW5nIHRoaXMgY29kZSEgIEl0J3MgYmVlbiB0dW5lZCBmb3IgcGVyZm9ybWFuY2VcbiAgLy8gYW5kIHdvcmtzIGluIHdheXMgeW91IG1heSBub3QgZXhwZWN0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkL3B1bGwvNDM0XG4gIHJldHVybiBieXRlVG9IZXhbYXJyW29mZnNldCArIDBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMV1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDNdXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA1XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDZdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgN11dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA4XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDldXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTJdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTNdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTVdXTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFyciwgb2Zmc2V0ID0gMCkge1xuICBjb25zdCB1dWlkID0gdW5zYWZlU3RyaW5naWZ5KGFyciwgb2Zmc2V0KTsgLy8gQ29uc2lzdGVuY3kgY2hlY2sgZm9yIHZhbGlkIFVVSUQuICBJZiB0aGlzIHRocm93cywgaXQncyBsaWtlbHkgZHVlIHRvIG9uZVxuICAvLyBvZiB0aGUgZm9sbG93aW5nOlxuICAvLyAtIE9uZSBvciBtb3JlIGlucHV0IGFycmF5IHZhbHVlcyBkb24ndCBtYXAgdG8gYSBoZXggb2N0ZXQgKGxlYWRpbmcgdG9cbiAgLy8gXCJ1bmRlZmluZWRcIiBpbiB0aGUgdXVpZClcbiAgLy8gLSBJbnZhbGlkIGlucHV0IHZhbHVlcyBmb3IgdGhlIFJGQyBgdmVyc2lvbmAgb3IgYHZhcmlhbnRgIGZpZWxkc1xuXG4gIGlmICghdmFsaWRhdGUodXVpZCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ1N0cmluZ2lmaWVkIFVVSUQgaXMgaW52YWxpZCcpO1xuICB9XG5cbiAgcmV0dXJuIHV1aWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0cmluZ2lmeTsiLCJpbXBvcnQgbmF0aXZlIGZyb20gJy4vbmF0aXZlLmpzJztcbmltcG9ydCBybmcgZnJvbSAnLi9ybmcuanMnO1xuaW1wb3J0IHsgdW5zYWZlU3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuXG5mdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICBpZiAobmF0aXZlLnJhbmRvbVVVSUQgJiYgIWJ1ZiAmJiAhb3B0aW9ucykge1xuICAgIHJldHVybiBuYXRpdmUucmFuZG9tVVVJRCgpO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGNvbnN0IHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpOyAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG5cbiAgcm5kc1s2XSA9IHJuZHNbNl0gJiAweDBmIHwgMHg0MDtcbiAgcm5kc1s4XSA9IHJuZHNbOF0gJiAweDNmIHwgMHg4MDsgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG5cbiAgaWYgKGJ1Zikge1xuICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICBidWZbb2Zmc2V0ICsgaV0gPSBybmRzW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICByZXR1cm4gdW5zYWZlU3RyaW5naWZ5KHJuZHMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2NDsiLCJpbXBvcnQgUkVHRVggZnJvbSAnLi9yZWdleC5qcyc7XG5cbmZ1bmN0aW9uIHZhbGlkYXRlKHV1aWQpIHtcbiAgcmV0dXJuIHR5cGVvZiB1dWlkID09PSAnc3RyaW5nJyAmJiBSRUdFWC50ZXN0KHV1aWQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2YWxpZGF0ZTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IFFSQ29kZVN0eWxpbmcgZnJvbSBcIi4vY29yZS9RUkNvZGVTdHlsaW5nXCI7XG5pbXBvcnQgZG90VHlwZXMgZnJvbSBcIi4vY29uc3RhbnRzL2RvdFR5cGVzXCI7XG5pbXBvcnQgY29ybmVyRG90VHlwZXMgZnJvbSBcIi4vY29uc3RhbnRzL2Nvcm5lckRvdFR5cGVzXCI7XG5pbXBvcnQgY29ybmVyU3F1YXJlVHlwZXMgZnJvbSBcIi4vY29uc3RhbnRzL2Nvcm5lclNxdWFyZVR5cGVzXCI7XG5pbXBvcnQgZXJyb3JDb3JyZWN0aW9uTGV2ZWxzIGZyb20gXCIuL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25MZXZlbHNcIjtcbmltcG9ydCBlcnJvckNvcnJlY3Rpb25QZXJjZW50cyBmcm9tIFwiLi9jb25zdGFudHMvZXJyb3JDb3JyZWN0aW9uUGVyY2VudHNcIjtcbmltcG9ydCBtb2RlcyBmcm9tIFwiLi9jb25zdGFudHMvbW9kZXNcIjtcbmltcG9ydCBxclR5cGVzIGZyb20gXCIuL2NvbnN0YW50cy9xclR5cGVzXCI7XG5pbXBvcnQgZHJhd1R5cGVzIGZyb20gXCIuL2NvbnN0YW50cy9kcmF3VHlwZXNcIjtcbmltcG9ydCBzaGFwZVR5cGVzIGZyb20gXCIuL2NvbnN0YW50cy9zaGFwZVR5cGVzXCI7XG5pbXBvcnQgZ3JhZGllbnRUeXBlcyBmcm9tIFwiLi9jb25zdGFudHMvZ3JhZGllbnRUeXBlc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQge1xuICBkb3RUeXBlcyxcbiAgY29ybmVyRG90VHlwZXMsXG4gIGNvcm5lclNxdWFyZVR5cGVzLFxuICBlcnJvckNvcnJlY3Rpb25MZXZlbHMsXG4gIGVycm9yQ29ycmVjdGlvblBlcmNlbnRzLFxuICBtb2RlcyxcbiAgcXJUeXBlcyxcbiAgZHJhd1R5cGVzLFxuICBzaGFwZVR5cGVzLFxuICBncmFkaWVudFR5cGVzXG59O1xuXG5leHBvcnQgZGVmYXVsdCBRUkNvZGVTdHlsaW5nO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9