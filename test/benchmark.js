var ben = require('ben'),
    arraysjs = require('../');

var XArrayBuffer = arraysjs.ArrayBuffer,
    XArrayBufferView = arraysjs.ArrayBufferView,
    XTypedArray = arraysjs.TypedArray,
    XInt8Array = arraysjs.Int8Array,
    XUint8Array = arraysjs.Uint8Array,
    XUint8ClampedArray = arraysjs.Uint8ClampedArray,
    XInt16Array = arraysjs.Int16Array,
    XUint16Array = arraysjs.Uint16Array,
    XInt32Array = arraysjs.Int32Array,
    XUint32Array = arraysjs.Uint32Array,
    XFloat32Array = arraysjs.Float32Array,
    XFloat64Array = arraysjs.Float64Array,
    XDataView = arraysjs.DataView;


function bench(name, fnNative, fnJs) {
  process.stdout.write(name + ":  ");

  ben(1000, fnNative); // warm
  var msNative = ben(1000000, fnNative);
  process.stdout.write(msNative + " ms (native)");

  ben(1000, fnJs); // warm
  var msJs = ben(1000000, fnJs);
  process.stdout.write(" vs. " + msJs + " ms (pure-js)");

  var factor = msJs / msNative;
  process.stdout.write(", ×" + factor.toFixed(2) + "\n");
}


bench("Small ArrayBuffer", function() {
  var x = new ArrayBuffer(10);
}, function() {
  var x = new XArrayBuffer(10);
});

bench("Large ArrayBuffer", function() {
  var x = new ArrayBuffer(16384);
}, function() {
  var x = new XArrayBuffer(16384);
});

bench("Small Int8Array", function() {
  var x = new ArrayBuffer(10);
}, function() {
  var x = new XArrayBuffer(10);
});

bench("Large Int8Array", function() {
  var x = new ArrayBuffer(16384);
}, function() {
  var x = new XArrayBuffer(16384);
});
