"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var json_1 = require("mng-easy-util/json");
var src_1 = require("../src");
src_1.ColorPicker.init({
    rootElement: document.getElementById('app'),
    onSelectedColor: function (selectedColor) {
        console.log("selectedColor:\n" + json_1.stringifyNoCircle(selectedColor));
        var root = document.getElementById('app');
        var r = Math.ceil(selectedColor.r * 255);
        var g = Math.ceil(selectedColor.g * 255);
        var b = Math.ceil(selectedColor.b * 255);
        root.style['background'] = "rgba(" + r + "," + g + "," + b + "," + selectedColor.a + ")";
    },
    initColor: '0x7cb305',
    width: 100,
    backgroundColor: '#8c8c8c'
});
