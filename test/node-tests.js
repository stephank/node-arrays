// Copyright Joyent, Inc. and other Node contributors.

// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

/*
 * Test to verify we are using Typed Arrays
 * (http://www.khronos.org/registry/typedarray/specs/latest/) correctly Test to
 * verify Buffer can used in Typed Arrays
 */

(function(){

description("Node.js tests.");


// initialize a zero-filled buffer
var buffer = new Buffer(16);
buffer.fill(0);

// only one of these instantiations should succeed, as the other ones will be
// unaligned
var errors = 0;
var offset;
for (var i = 0; i < 8; i++) {
  try {
    new Float64Array(buffer, i);
    offset = i;
  } catch (e) {
    errors += 1;
  }
}

assertEq("Alignment", errors, 7);

pass();


var uint8 = new Uint8Array(buffer, offset);
var uint16 = new Uint16Array(buffer, offset);
var uint16slice = new Uint16Array(buffer, offset + 2, 2);
var uint32 = new Uint32Array(buffer, offset);

assertEq("Element size for Uint8", uint8.BYTES_PER_ELEMENT, 1);
assertEq("Element size for Uint16", uint16.BYTES_PER_ELEMENT, 2);
assertEq("Element size for Uint16 slice", uint16slice.BYTES_PER_ELEMENT, 2);
assertEq("Element size for Uint32", uint32.BYTES_PER_ELEMENT, 4);

pass();


// now change the underlying buffer
buffer[offset    ] = 0x08;
buffer[offset + 1] = 0x09;
buffer[offset + 2] = 0x0a;
buffer[offset + 3] = 0x0b;
buffer[offset + 4] = 0x0c;
buffer[offset + 5] = 0x0d;
buffer[offset + 6] = 0x0e;
buffer[offset + 7] = 0x0f;

/*
  This is what we expect the variables to look like at this point (on
  little-endian machines):

  uint8       | 0x08 | 0x09 | 0x0a | 0x0b | 0x0c | 0x0d | 0x0e | 0x0f |
  uint16      |    0x0908   |    0x0b0a   |    0x0d0c   |    0x0f0e   |
  uint16slice --------------|    0x0b0a   |    0x0d0c   |--------------
  uint32      |         0x0b0a0908        |         0x0f0e0d0c        |
*/

assertEq("Byte 0", uint8[0], 0x08);
assertEq("Byte 1", uint8[1], 0x09);
assertEq("Byte 2", uint8[2], 0x0a);
assertEq("Byte 3", uint8[3], 0x0b);
assertEq("Byte 4", uint8[4], 0x0c);
assertEq("Byte 5", uint8[5], 0x0d);
assertEq("Byte 6", uint8[6], 0x0e);
assertEq("Byte 7", uint8[7], 0x0f);

pass();


// determine whether or not typed array values are stored little-endian first
// internally
var IS_LITTLE_ENDIAN = (new Uint16Array([0x1234])).nodeBuffer[0] === 0x34;

if (IS_LITTLE_ENDIAN) {
  assertEq("Short 0", uint16[0], 0x0908);
  assertEq("Short 1", uint16[1], 0x0b0a);
  assertEq("Short 2", uint16[2], 0x0d0c);
  assertEq("Short 3", uint16[3], 0x0f0e);

  assertEq("Offset short 0+1", uint16slice[0], 0x0b0a);
  assertEq("Offset short 1+1", uint16slice[1], 0x0d0c);

  assertEq("Int 0", uint32[0], 0x0b0a0908);
  assertEq("Int 1", uint32[1], 0x0f0e0d0c);
} else {
  assertEq("Short 0", uint16[0], 0x0809);
  assertEq("Short 1", uint16[1], 0x0a0b);
  assertEq("Short 2", uint16[2], 0x0c0d);
  assertEq("Short 3", uint16[3], 0x0e0f);

  assertEq("Offset short 0+1", uint16slice[0], 0x0a0b);
  assertEq("Offset short 1+1", uint16slice[1], 0x0c0d);

  assertEq("Int 0", uint32[0], 0x08090a0b);
  assertEq("Int 1", uint32[1], 0x0c0d0e0f);
}

pass();


// test .subarray(begin, end)
var sub = uint8.subarray(2, 4);

assert("subarray returns same type", sub instanceof Uint8Array);
assertEq("Subarray 0", sub[0], 0x0a);
assertEq("Subarray 1", sub[1], 0x0b);

pass();


// modifications of a value in the subarray of `uint8` should propagate to
// the other views
sub[0] = 0x12;
sub[1] = 0x34;

assertEq("Shared store 0", uint8[2], 0x12);
assertEq("Shared store 1", uint8[3], 0x34);

pass();


// test .set(arr, offset)
uint8.set([0x0a, 0x0b], 2);

assertEq("Copy 0", uint8[2], 0x0a);
assertEq("Copy 1", uint8[3], 0x0b);

pass();


// test clamped array
var uint8c = new Uint8ClampedArray(buffer);
uint8c[0] = -1;
uint8c[1] = 257;

assertEq("Clamped edge 0", uint8c[0], 0);
assertEq("Clamped edge 1", uint8c[1], 255);

uint8c[0] = -10;
uint8c[1] = 260;

assertEq("Clamped large 0", uint8c[0], 0);
assertEq("Clamped large 1", uint8c[1], 255);

pass();


})();
