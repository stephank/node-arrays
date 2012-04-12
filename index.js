var util = require('util');
var binding = require('./build/Release/binding');


// Coerce length to a number (possibly NaN), floor
// in case it's fractional (e.g. 123.456) then do a
// double negate to coerce a NaN to 0. Easy, right?
function coerceInt(val) {
  return ~~Math.floor(+val);
}

function positiveInt(val, name, def) {
  if (val === undefined) {
    if (def !== undefined) {
      return def;
    }
  }
  else if (typeof val === 'number') {
    val = coerceInt(val);
    if (val >= 0) {
      return val;
    }
  }
  throw new RangeError(name + " must be a positive integer");
}

// Convert an offset parameter into an absolute offset.
function absOffset(val, end, def) {
  if (val === undefined) {
    return def === undefined ? end : def;
  }

  val = coerceInt(val);
  if (val < 0) {
    val = end + val;
  }

  if (val > end) {
    val = end;
  }
  else if (val < 0) {
    val = 0;
  }

  return val;
}

// Check if `val` is aligned to `align`.
function checkAlignment(val, align) {
  return (val & (align - 1)) === 0;
}


function ArrayBuffer(subject, begin, end) {
  if (!(this instanceof ArrayBuffer)) {
    throw new TypeError("Constructor cannot be called as a function.");
  }

  var length;

  // Internal slice constructor
  if (subject instanceof ArrayBuffer) {
    length = this.byteLength = end - begin;
    this.nodeBuffer = new Buffer(length);
    subject.nodeBuffer.copy(this.nodeBuffer, 0, begin, end);
  }

  // Buffer constructor
  else if (Buffer.isBuffer(subject)) {
    this.nodeBuffer = subject;
    this.byteLength = subject.length;
  }

  // Length constructor, per the spec
  else {
    length = this.byteLength = positiveInt(subject, "Length", 0);
    this.nodeBuffer = new Buffer(length);
    this.nodeBuffer.fill(0);
  }
}

ArrayBuffer.prototype.slice = function(begin, end) {
  begin = absOffset(begin, this.byteLength, 0);
  end = absOffset(end, this.byteLength);

  if (begin >= end) {
    return new ArrayBuffer();
  }
  else {
    return new ArrayBuffer(this, begin, end);
  }
};


// Dummy, useful for instanceof checks
function ArrayBufferView() {
  throw new TypeError("ArrayBufferView cannot be constructed.");
}

// Common constructor part when creating an ArrayBufferView subclass from an
// ArrayBuffer or Buffer. This function looks at the parameters and determines
// if the constructor call was indeed of that kind, and sets attributes if so.
function makeViewFromBuffer(view, args, typeSize) {
  var buffer = args[0];
  if (Buffer.isBuffer(buffer)) {
    buffer = new ArrayBuffer(buffer);
  }
  else if (!(buffer instanceof ArrayBuffer)) {
    return false;
  }

  var byteOffset = positiveInt(args[1], "Offset", 0);

  var byteLength;
  if (args[2] === undefined) {
    byteLength = buffer.byteLength - byteOffset;
  }
  else {
    byteLength = positiveInt(args[2], "Length") * typeSize;
  }

  if (byteOffset + byteLength > buffer.byteLength) {
    throw new RangeError("Byte offset / length out of range.");
  }

  view.buffer = buffer;
  view.byteOffset = byteOffset;
  view.byteLength = byteLength;

  var end = byteOffset + byteLength;
  view.nodeBuffer = buffer.nodeBuffer.slice(byteOffset, end);

  // SlowBuffer and Buffer pool allocations are already aligned.
  // This is here to protect from badly aligned slicing.
  if (!checkAlignment(view.nodeBuffer.offset, typeSize) ||
      !checkAlignment(view.nodeBuffer.length, typeSize)) {
    throw new RangeError("Byte offset / length is not aligned.");
  }

  return true;
}


// Uses `typeName` and `typeSize` attributes, defined by `makeTypedArray`
function TypedArray(subject) {
  if (!(this instanceof TypedArray)) {
    throw new TypeError("Constructor cannot be called as a function.");
  }
  else if (!this.typeName) {
    throw new TypeError("TypedArray cannot be constructed.");
  }

  var source = null;

  // Is it a view over ArrayBuffer or Buffer?
  if (!makeViewFromBuffer(this, arguments, this.typeSize)) {
    // Nope, transparently create a new ArrayBuffer
    this.byteOffset = 0;

    // Find the length, and also allow no arguments at all
    if (subject === undefined || typeof subject === 'number') {
      this.byteLength = positiveInt(subject, "Length", 0) * this.typeSize;
    }
    else if (subject && typeof subject === 'object') {
      // Assume object is a TypedArray or Array.
      this.byteLength = subject.length * this.typeSize;
      source = subject; // Copy contents later
    }
    else {
      throw new TypeError("Expected a TypedArray, array or number");
    }

    this.buffer = new ArrayBuffer(this.byteLength);
    this.nodeBuffer = this.buffer.nodeBuffer;
  }

  this.length = this.byteLength / this.typeSize;
  binding.makeFastBuffer(this, this.nodeBuffer.parent,
      this.nodeBuffer.offset, this.typeName, this.length);

  if (source) {
    this.set(source);
  }
}
util.inherits(TypedArray, ArrayBufferView);

TypedArray.prototype.set = function(source, offset) {
  var length = source.length;
  offset = positiveInt(offset, "Offset", 0);

  if (offset + length > this.length) {
    throw new RangeError("Offset / length out of range.");
  }

  // Same type, so we can copy data right over. Node's Buffer#copy ensures
  // that overlapping regions are copied correctly.
  if (source instanceof this.constructor) {
    source.nodeBuffer.copy(this.nodeBuffer, offset * this.typeSize);
    return;
  }

  // We can't do a straight copy, because types differ.
  if (source instanceof TypedArray) {
    // Manually check if the regions overlap.
    var srcBuf = source.nodeBuffer;
    var dstBuf = this.nodeBuffer;
    if (srcBuf.parent === dstBuf.parent) {
      var srcStart = srcBuf.offset;
      var srcEnd   = srcStart + srcBuf.length;
      var dstStart = dstBuf.offset + offset * this.typeSize;
      var dstEnd   = dstStart + length * this.typeSize;
      if (!(srcStart >= dstEnd || srcEnd <= dstStart)) {
        // They do, continue with a temporary copy of the values.
        var tmp = new Array(source.length);
        for (var i = 0; i < length; i++) {
          tmp[i] = source[i];
        }
        source = tmp;
      }
    }
  }

  // Assume source is an Array.
  for (var i = 0; i < length; i++) {
    this[offset + i] = source[i];
  }
};

TypedArray.prototype.subarray = function(begin, end) {
  begin = absOffset(begin, this.length, 0);
  end = absOffset(end, this.length);

  if (begin >= end) {
    return new this.constructor();
  }
  else {
    var byteOffset = this.byteOffset + begin * this.typeSize;
    var length = end - begin;
    return new this.constructor(this.buffer, byteOffset, length);
  }
};


function makeTypedArray(ctor, name, size) {
  util.inherits(ctor, TypedArray);

  var proto = ctor.prototype;

  proto.typeName = name;
  proto.typeSize = size;

  proto.BYTES_PER_ELEMENT = ctor.BYTES_PER_ELEMENT = size;
}

function Int8Array() { TypedArray.apply(this, arguments); }
makeTypedArray(Int8Array, 'int8', 1);

function Uint8Array() { TypedArray.apply(this, arguments); }
makeTypedArray(Uint8Array, 'uint8', 1);

function Uint8ClampedArray() { TypedArray.apply(this, arguments); }
makeTypedArray(Uint8ClampedArray, 'pixel', 1);

function Int16Array() { TypedArray.apply(this, arguments); }
makeTypedArray(Int16Array, 'int16', 2);

function Uint16Array() { TypedArray.apply(this, arguments); }
makeTypedArray(Uint16Array, 'uint16', 2);

function Int32Array() { TypedArray.apply(this, arguments); }
makeTypedArray(Int32Array, 'int32', 4);

function Uint32Array() { TypedArray.apply(this, arguments); }
makeTypedArray(Uint32Array, 'uint32', 4);

function Float32Array() { TypedArray.apply(this, arguments); }
makeTypedArray(Float32Array, 'float', 4);

function Float64Array() { TypedArray.apply(this, arguments); }
makeTypedArray(Float64Array, 'double', 8);


function DataView(buffer, offset, length) {
  if (!(this instanceof DataView)) {
    throw new TypeError("Constructor cannot be called as a function.");
  }

  if (!makeViewFromBuffer(this, arguments, 1)) {
    throw new TypeError("Object must be an ArrayBuffer or Buffer");
  }
}
util.inherits(DataView, ArrayBufferView);

function wrapGetter(size, fn) {
  return function(byteOffset, littleEndian) {
    byteOffset = positiveInt(byteOffset, "Offset");
    if (byteOffset + size > this.byteLength) {
      throw new RangeError("Offset out of range.");
    }

    return fn.call(this, byteOffset, littleEndian);
  };
}

DataView.prototype.getInt8 = wrapGetter(1, function(byteOffset) {
  return this.nodeBuffer.readInt8(byteOffset);
});

DataView.prototype.getUint8 = wrapGetter(1, function(byteOffset) {
  return this.nodeBuffer.readUInt8(byteOffset);
});

DataView.prototype.getInt16 = wrapGetter(2, function(byteOffset, littleEndian) {
  if (littleEndian)
    return this.nodeBuffer.readInt16LE(byteOffset);
  else
    return this.nodeBuffer.readInt16BE(byteOffset);
});

DataView.prototype.getUint16 = wrapGetter(2, function(byteOffset, littleEndian) {
  if (littleEndian)
    return this.nodeBuffer.readUInt16LE(byteOffset);
  else
    return this.nodeBuffer.readUInt16BE(byteOffset);
});

DataView.prototype.getInt32 = wrapGetter(4, function(byteOffset, littleEndian) {
  if (littleEndian)
    return this.nodeBuffer.readInt32LE(byteOffset);
  else
    return this.nodeBuffer.readInt32BE(byteOffset);
});

DataView.prototype.getUint32 = wrapGetter(4, function(byteOffset, littleEndian) {
  if (littleEndian)
    return this.nodeBuffer.readUInt32LE(byteOffset);
  else
    return this.nodeBuffer.readUInt32BE(byteOffset);
});

DataView.prototype.getFloat32 = wrapGetter(4, function(byteOffset, littleEndian) {
  if (littleEndian)
    return this.nodeBuffer.readFloatLE(byteOffset);
  else
    return this.nodeBuffer.readFloatBE(byteOffset);
});

DataView.prototype.getFloat64 = wrapGetter(8, function(byteOffset, littleEndian) {
  if (littleEndian)
    return this.nodeBuffer.readDoubleLE(byteOffset);
  else
    return this.nodeBuffer.readDoubleBE(byteOffset);
});

function wrapSetter(size, fn) {
  return function(byteOffset, value, littleEndian) {
    byteOffset = positiveInt(byteOffset, "Offset");
    if (byteOffset + size > this.byteLength) {
      throw new RangeError("Offset out of range.");
    }

    fn.call(this, byteOffset, value, littleEndian);
  };
}

DataView.prototype.setInt8 = wrapSetter(1, function(byteOffset, value) {
  this.nodeBuffer.writeInt8(value, byteOffset);
});

DataView.prototype.setUint8 = wrapSetter(1, function(byteOffset, value) {
  this.nodeBuffer.writeUInt8(value, byteOffset);
});

DataView.prototype.setInt16 = wrapSetter(2, function(byteOffset, value, littleEndian) {
  if (littleEndian)
    this.nodeBuffer.writeInt16LE(value, byteOffset);
  else
    this.nodeBuffer.writeInt16BE(value, byteOffset);
});

DataView.prototype.setUint16 = wrapSetter(2, function(byteOffset, value, littleEndian) {
  if (littleEndian)
    this.nodeBuffer.writeUInt16LE(value, byteOffset);
  else
    this.nodeBuffer.writeUInt16BE(value, byteOffset);
});

DataView.prototype.setInt32 = wrapSetter(4, function(byteOffset, value, littleEndian) {
  if (littleEndian)
    this.nodeBuffer.writeInt32LE(value, byteOffset);
  else
    this.nodeBuffer.writeInt32BE(value, byteOffset);
});

DataView.prototype.setUint32 = wrapSetter(4, function(byteOffset, value, littleEndian) {
  if (littleEndian)
    this.nodeBuffer.writeUInt32LE(value, byteOffset);
  else
    this.nodeBuffer.writeUInt32BE(value, byteOffset);
});

DataView.prototype.setFloat32 = wrapSetter(4, function(byteOffset, value, littleEndian) {
  if (littleEndian)
    this.nodeBuffer.writeFloatLE(value, byteOffset, true);
  else
    this.nodeBuffer.writeFloatBE(value, byteOffset, true);
});

DataView.prototype.setFloat64 = wrapSetter(8, function(byteOffset, value, littleEndian) {
  if (littleEndian)
    this.nodeBuffer.writeDoubleLE(value, byteOffset, true);
  else
    this.nodeBuffer.writeDoubleBE(value, byteOffset, true);
});


module.exports = {
  ArrayBuffer: ArrayBuffer,
  ArrayBufferView: ArrayBufferView,
  TypedArray: TypedArray,
  Int8Array: Int8Array,
  Uint8Array: Uint8Array,
  Uint8ClampedArray: Uint8ClampedArray,
  Int16Array: Int16Array,
  Uint16Array: Uint16Array,
  Int32Array: Int32Array,
  Uint32Array: Uint32Array,
  Float32Array: Float32Array,
  Float64Array: Float64Array,
  DataView: DataView
};
