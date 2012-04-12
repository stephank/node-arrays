/*
** Copyright (c) 2012 The Khronos Group Inc.
**
** Permission is hereby granted, free of charge, to any person obtaining a
** copy of this software and /or associated documentation files (the
** "Materials"), to deal in the Materials without restriction, including
** without limitation the rights to use, copy, modify, merge, publish,
** distribute, sublicense, and/or sell copies of the Materials, and to
** permit persons to whom the Materials are furnished to do so, subject to
** the following conditions:
**
** The above copyright notice and this permission notice shall be included
** in all copies or substantial portions of the Materials.
**
** THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
*/

description("Verifies the functionality of the new array-like objects in the TypedArray spec");

var currentlyRunning = '';
var allPassed = true;
function running(str) {
  currentlyRunning = str;
}

function output(str) {
  debug(str);
}

function pass() {
  testPassed(currentlyRunning);
}

function fail(str) {
  allPassed = false;
  var exc;
  if (str)
    exc = currentlyRunning + ': ' + str;
  else
    exc = currentlyRunning;
  testFailed(exc);
}

function printSummary() {
  if (allPassed) {
    debug("Test passed.");
  } else {
    debug("TEST FAILED");
  }
}

var byteLength;
var subBuffer;
function testSlice() {
  function test(subBuf, starts, size) {
    byteLength = size;
    subBuffer = eval(subBuf);
    var subArray = new Int8Array(subBuffer);
    assertEq(subBuf, subBuffer.byteLength, byteLength);
    for (var i = 0; i < size; ++i)
      assertEq('Element ' + i, starts + i, subArray[i]);
  }

  try {
    running('testSlice');
    var buffer = new ArrayBuffer(32);
    var array = new Int8Array(buffer);
    for (var i = 0; i < 32; ++i)
      array[i] = i;

    test("buffer.slice(0)", 0, 32);
    test("buffer.slice(16)", 16, 16);
    test("buffer.slice(24)", 24, 8);
    test("buffer.slice(32)", 32, 0);
    test("buffer.slice(40)", 32, 0);
    test("buffer.slice(80)", 32, 0);

    test("buffer.slice(-8)", 24, 8);
    test("buffer.slice(-16)", 16, 16);
    test("buffer.slice(-24)", 8, 24);
    test("buffer.slice(-32)", 0, 32);
    test("buffer.slice(-40)", 0, 32);
    test("buffer.slice(-80)", 0, 32);

    test("buffer.slice(0, 32)", 0, 32);
    test("buffer.slice(0, 16)", 0, 16);
    test("buffer.slice(8, 24)", 8, 16);
    test("buffer.slice(16, 32)", 16, 16);
    test("buffer.slice(24, 16)", 24, 0);

    test("buffer.slice(16, -8)", 16, 8);
    test("buffer.slice(-20, 30)", 12, 18);

    test("buffer.slice(-8, -20)", 24, 0);
    test("buffer.slice(-20, -8)", 12, 12);
    test("buffer.slice(-40, 16)", 0, 16);
    test("buffer.slice(-40, 40)", 0, 32);
    pass();
  } catch (e) {
    fail(e);
  }
}

//
// Tests for unsigned array variants
//

function testSetAndGet10To1(type, name) {
  running('test ' + name + ' SetAndGet10To1');
  try {
    var array = new type(10);
    for (var i = 0; i < 10; i++) {
      array[i] = 10 - i;
    }
    for (var i = 0; i < 10; i++) {
      assertEq('Element ' + i, 10 - i, array[i]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function testConstructWithArrayOfUnsignedValues(type, name) {
  running('test ' + name + ' ConstructWithArrayOfUnsignedValues');
  try {
    var array = new type([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
    assertEq('Array length', 10, array.length);
    for (var i = 0; i < 10; i++) {
      assertEq('Element ' + i, 10 - i, array[i]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function testConstructWithTypedArrayOfUnsignedValues(type, name) {
  running('test ' + name + ' ConstructWithTypedArrayOfUnsignedValues');
  try {
    var tmp = new type([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
    var array = new type(tmp);
    assertEq('Array length', 10, array.length);
    for (var i = 0; i < 10; i++) {
      assertEq('Element ' + i, 10 - i, array[i]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

//
// Tests for signed array variants
//

function testSetAndGetPos10ToNeg10(type, name) {
  running('test ' + name + ' SetAndGetPos10ToNeg10');
  try {
    var array = new type(21);
    for (var i = 0; i < 21; i++) {
      array[i] = 10 - i;
    }
    for (var i = 0; i < 21; i++) {
      assertEq('Element ' + i, 10 - i, array[i]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function testConstructWithArrayOfSignedValues(type, name) {
  running('test ' + name + ' ConstructWithArrayOfSignedValues');
  try {
    var array = new type([10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10]);
    assertEq('Array length', 21, array.length);
    for (var i = 0; i < 21; i++) {
      assertEq('Element ' + i, 10 - i, array[i]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function testConstructWithTypedArrayOfSignedValues(type, name) {
  running('test ' + name + ' ConstructWithTypedArrayOfSignedValues');
  try {
    var tmp = new type([10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10]);
    var array = new type(tmp);
    assertEq('Array length', 21, array.length);
    for (var i = 0; i < 21; i++) {
      assertEq('Element ' + i, 10 - i, array[i]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

//
// Test cases for integral types.
// Some JavaScript engines need separate copies of this code in order
// to exercise all of their optimized code paths.
//

function testIntegralArrayTruncationBehavior(type, name, unsigned) {
  running('test integral array truncation behavior for ' + name);

  var sourceData;
  var expectedResults;

  if (unsigned) {
    sourceData = [0.6, 10.6];
    if (type === Uint8ClampedArray) {
      expectedResults = [1, 11];
    } else {
      expectedResults = [0, 10];
    }
  } else {
    sourceData = [0.6, 10.6, -0.6, -10.6];
    expectedResults = [0, 10, 0, -10];
  }

  var numIterations = 10;
  var array = new type(numIterations);

  // The code block in each of the case statements below is identical, but some
  // JavaScript engines need separate copies in order to exercise all of
  // their optimized code paths.

  try {
    switch (type) {
    case Int8Array:
      for (var ii = 0; ii < sourceData.length; ++ii) {
        for (var jj = 0; jj < numIterations; ++jj) {
          array[jj] = sourceData[ii];
          assertEq('Storing ' + sourceData[ii], expectedResults[ii], array[jj]);
        }
      }
      break;
    case Int16Array:
      for (var ii = 0; ii < sourceData.length; ++ii) {
        for (var jj = 0; jj < numIterations; ++jj) {
          array[jj] = sourceData[ii];
          assertEq('Storing ' + sourceData[ii], expectedResults[ii], array[jj]);
        }
      }
      break;
    case Int32Array:
      for (var ii = 0; ii < sourceData.length; ++ii) {
        for (var jj = 0; jj < numIterations; ++jj) {
          array[jj] = sourceData[ii];
          assertEq('Storing ' + sourceData[ii], expectedResults[ii], array[jj]);
        }
      }
      break;
    case Uint8Array:
      for (var ii = 0; ii < sourceData.length; ++ii) {
        for (var jj = 0; jj < numIterations; ++jj) {
          array[jj] = sourceData[ii];
          assertEq('Storing ' + sourceData[ii], expectedResults[ii], array[jj]);
        }
      }
      break;
    case Uint8ClampedArray:
      for (var ii = 0; ii < sourceData.length; ++ii) {
        for (var jj = 0; jj < numIterations; ++jj) {
          array[jj] = sourceData[ii];
          assertEq('Storing ' + sourceData[ii], expectedResults[ii], array[jj]);
        }
      }
      break;
    case Uint16Array:
      for (var ii = 0; ii < sourceData.length; ++ii) {
        for (var jj = 0; jj < numIterations; ++jj) {
          array[jj] = sourceData[ii];
          assertEq('Storing ' + sourceData[ii], expectedResults[ii], array[jj]);
        }
      }
      break;
    case Uint32Array:
      for (var ii = 0; ii < sourceData.length; ++ii) {
        for (var jj = 0; jj < numIterations; ++jj) {
          array[jj] = sourceData[ii];
          assertEq('Storing ' + sourceData[ii], expectedResults[ii], array[jj]);
        }
      }
      break;
    default:
      fail("Unhandled type");
      break;
    }

    pass();
  } catch (e) {
    fail(e);
  }
}


//
// Test cases for both signed and unsigned types
//

function testGetWithOutOfRangeIndices(type, name) {
    debug('Testing ' + name + ' GetWithOutOfRangeIndices');
    // See below for declaration of this global variable
    array = new type([2, 3]);
    shouldBeUndefined("array[2]");
    shouldBeUndefined("array[-1]");
    shouldBeUndefined("array[0x20000000]");
}

function testOffsetsAndSizes(type, name, elementSizeInBytes) {
  running('test ' + name + ' OffsetsAndSizes');
  try {
    var len = 10;
    assertEq('type.BYTES_PER_ELEMENT', elementSizeInBytes, type.BYTES_PER_ELEMENT);
    var array = new type(len);
    assert('array.buffer', array.buffer);
    assertEq('array.byteOffset', 0, array.byteOffset);
    assertEq('array.length', len, array.length);
    assertEq('array.byteLength', len * elementSizeInBytes, array.byteLength);
    array = new type(array.buffer, elementSizeInBytes, len - 1);
    assert('array.buffer', array.buffer);
    assertEq('array.byteOffset', elementSizeInBytes, array.byteOffset);
    assertEq('array.length', len - 1, array.length);
    assertEq('array.byteLength', (len - 1) * elementSizeInBytes, array.byteLength);
    pass();
  } catch (e) {
    fail(e);
  }
}

function testSetFromTypedArray(type, name) {
  running('test ' + name + ' SetFromTypedArray');
  try {
    var array = new type(10);
    var array2 = new type(5);
    for (var i = 0; i < 10; i++) {
      assertEq('Element ' + i, 0, array[i]);
    }
    for (var i = 0; i < array2.length; i++) {
      array2[i] = i;
    }
    array.set(array2);
    for (var i = 0; i < array2.length; i++) {
      assertEq('Element ' + i, i, array[i]);
    }
    array.set(array2, 5);
    for (var i = 0; i < array2.length; i++) {
      assertEq('Element ' + i, i, array[5 + i]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function negativeTestSetFromTypedArray(type, name) {
  running('negativeTest ' + name + ' SetFromTypedArray');
  try {
    var array = new type(5);
    var array2 = new type(6);
    for (var i = 0; i < 5; i++) {
      assertEq('Element ' + i, 0, array[i]);
    }
    for (var i = 0; i < array2.length; i++) {
      array2[i] = i;
    }
    try {
      array.set(array2);
      fail('Expected exception from array.set(array2)');
      return;
    } catch (e) {
    }
    try {
      array2.set(array, 2);
      fail('Expected exception from array2.set(array, 2)');
      return;
    } catch (e) {
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function testSetFromArray(type, name) {
  running('test ' + name + ' SetFromArray');
  try {
    var array = new type(10);
    var array2 = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    for (var i = 0; i < 10; i++) {
      assertEq('Element ' + i, 0, array[i]);
    }
    array.set(array2, 0);
    for (var i = 0; i < array2.length; i++) {
      assertEq('Element ' + i, 10 - i, array[i]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function negativeTestSetFromArray(type, name) {
  running('negativeTest ' + name + ' SetFromArray');
  try {
    var array = new type([2, 3]);
    try {
      array.set([4, 5], 1);
      fail();
      return;
    } catch (e) {
    }
    try {
      array.set([4, 5, 6]);
      fail();
      return;
    } catch (e) {
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function testSubarray(type, name) {
  running('test ' + name + ' Subarray');
  try {
    var array = new type([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    var subarray = array.subarray(0, 5);
    assertEq('subarray.length', 5, subarray.length);
    for (var i = 0; i < 5; i++) {
      assertEq('Element ' + i, i, subarray[i]);
    }
    subarray = array.subarray(4, 10);
    assertEq('subarray.length', 6, subarray.length);
    for (var i = 0; i < 6; i++) {
      assertEq('Element ' + i, 4 + i, subarray[i]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function negativeTestSubarray(type, name) {
  running('negativeTest ' + name + ' Subarray');
  try {
    var array = new type([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    subarray = array.subarray(5, 11);
    if (subarray.length != 5) {
      fail();
      return;
    }
    subarray = array.subarray(10, 10);
    if (subarray.length != 0) {
      fail();
      return;
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function testSetBoundaryConditions(type, name, testValues, expectedValues) {
  running('test ' + name + ' SetBoundaryConditions');
  try {
    var array = new type(1);
    assertEq('Array length', 1, array.length);
    for (var ii = 0; ii < testValues.length; ++ii) {
      for (var jj = 0; jj < 10; ++jj) {
        array[0] = testValues[ii];
        assertEq('Element 0', expectedValues[ii], array[0]);
      }
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function testConstructionBoundaryConditions(type, name, testValues, expectedValues) {
  running('test ' + name + ' ConstructionBoundaryConditions');
  try {
    var array = new type(testValues);
    assertEq('Array length', testValues.length, array.length);
    for (var ii = 0; ii < testValues.length; ++ii) {
      assertEq('Element ' + ii, expectedValues[ii], array[ii]);
    }
    pass();
  } catch (e) {
    fail(e);
  }
}

function testConstructionWithNullBuffer(type, name) {
    var array;
    try {
        array = new type(null);
        testFailed("Construction of " + name + " with null buffer should throw exception");
    } catch (e) {
        testPassed("Construction of " + name + " with null buffer threw exception");
    }
    try {
        array = new type(null, 0, 0);
        testFailed("Construction of " + name + " with (null buffer, 0) should throw exception");
    } catch (e) {
        testPassed("Construction of " + name + " with (null buffer, 0) threw exception");
    }
    try {
        array = new type(null, 0, 0);
        testFailed("Construction of " + name + " with (null buffer, 0, 0) should throw exception");
    } catch (e) {
        testPassed("Construction of " + name + " with (null buffer, 0, 0) threw exception");
    }
}

function shouldThrowIndexSizeErr(func, text) {
    var errorText = text + " should throw an exception";
    try {
        func();
        testFailed(errorText);
    } catch (e) {
        testPassed(text + " threw an exception");
    }
}

function testConstructionWithOutOfRangeValues(type, name) {
    shouldThrowIndexSizeErr(function() {
        var buffer = new ArrayBuffer(4);
        var array = new type(buffer, 4, 0x3FFFFFFF);
    }, "Construction of " + name + " with out-of-range number of elements");
    shouldThrowIndexSizeErr(function() {
        var buffer = new ArrayBuffer(4);
        var array = new type(buffer, 8);
    }, "Construction of " + name + " with out-of-range offset");
}

function testConstructionWithNegativeOutOfRangeValues(type, name) {
    try {
        var buffer = new ArrayBuffer(-1);
        testFailed("Construction of ArrayBuffer with negative size should throw exception");
    } catch (e) {
        testPassed("Construction of ArrayBuffer with negative size threw exception");
    }
    try {
        var array = new type(-1);
        testFailed("Construction of " + name + " with negative size should throw exception");
    } catch (e) {
        testPassed("Construction of " + name + " with negative size threw exception");
    }
    shouldThrowIndexSizeErr(function() {
        var buffer = new ArrayBuffer(4);
        var array = new type(buffer, 4, -2147483648);
    }, "Construction of " + name + " with negative out-of-range values");
}

function testConstructionWithUnalignedOffset(type, name, elementSizeInBytes) {
    if (elementSizeInBytes > 1) {
        shouldThrowIndexSizeErr(function() {
            var buffer = new ArrayBuffer(32);
            var array = new type(buffer, 1, elementSizeInBytes);
        }, "Construction of " + name + " with unaligned offset");
    }
}

function testConstructionWithUnalignedLength(type, name, elementSizeInBytes) {
    if (elementSizeInBytes > 1) {
        shouldThrowIndexSizeErr(function() {
            var buffer = new ArrayBuffer(elementSizeInBytes + 1);
            var array = new type(buffer, 0);
        }, "Construction of " + name + " with unaligned length");
    }
}

function testConstructionOfHugeArray(type, name, sz) {
    if (sz == 1)
        return;
    try {
        // Construction of huge arrays must fail because byteLength is
        // an unsigned long
        array = new type(3000000000);
        testFailed("Construction of huge " + name + " should throw exception");
    } catch (e) {
        testPassed("Construction of huge " + name + " threw exception");
    }
}

function testConstructionWithBothArrayBufferAndLength(type, name, elementSizeInBytes) {
    var bufByteLength = 1000 * elementSizeInBytes;
    var buf = new ArrayBuffer(bufByteLength);
    var array1 = new type(buf);
    var array2 = new type(bufByteLength / elementSizeInBytes);
    if (array1.length == array2.length) {
        testPassed("Array lengths matched with explicit and implicit creation of ArrayBuffer");
    } else {
        testFailed("Array lengths DID NOT MATCH with explicit and implicit creation of ArrayBuffer");
    }
}

function testConstructionWithSubPortionOfArrayBuffer(type, name, elementSizeInBytes) {
    if (elementSizeInBytes > 1) {
        // Test construction with a valid sub-portion of an array buffer
        // (whose size is not an integral multiple of the element size).
        var size = 4 * elementSizeInBytes + (elementSizeInBytes / 2);
        var buf = new ArrayBuffer(size);
        try {
            var array = new type(buf, 0, 2);
            testPassed("new " + name + "(new ArrayBuffer(" + size + "), 0, 2) succeeded");
        } catch (e) {
            testFailed("new " + name + "(new ArrayBuffer(" + size + "), 0, 2) failed: " + e);
        }
    }
}

// These need to be global for shouldBe to see them
var array;
var typeSize;

function testSubarrayWithOutOfRangeValues(type, name, sz) {
    debug("Testing subarray of " + name);
    try {
        var buffer = new ArrayBuffer(32);
        array = new type(buffer);
        typeSize = sz;
        shouldBe("array.length", "32 / typeSize");
        try {
            shouldBe("array.subarray(4, 0x3FFFFFFF).length", "(32 / typeSize) - 4");
            shouldBe("array.subarray(4, -2147483648).length", "0");
            // Test subarray() against overflows.
            array = array.subarray(2);
            if (sz > 1) {
                // Full byte offset is +1 larger than the maximum unsigned long int.
                // Make sure subarray() still handles it correctly.  Otherwise overflow would happen and
                // offset would be 0, and array.length array.length would incorrectly be 1.
                var start = 4294967296 / sz - 2;
                array = array.subarray(start, start + 1);
                shouldBe("array.length", "0");
            }
        } catch (e) {
            testFailed("Subarray of " + name + " threw exception");
        }
    } catch (e) {
        testFailed("Exception: " + e);
    }
}

function testSubarrayWithDefaultValues(type, name, sz) {
    debug("Testing subarray with default inputs of " + name);
    try {
        var buffer = new ArrayBuffer(32);
        array = new type(buffer);
        typeSize = sz;
        shouldBe("array.length", "32 / typeSize");
        try {
            shouldBe("array.subarray(0).length", "(32 / typeSize)");
            shouldBe("array.subarray(2).length", "(32 / typeSize) - 2");
            shouldBe("array.subarray(-2).length", "2");
            shouldBe("array.subarray(-2147483648).length", "(32 / typeSize)");
        } catch (e) {
            testFailed("Subarray of " + name + " threw exception");
        }
    } catch (e) {
        testFailed("Exception: " + e);
    }
}

function setWithInvalidOffset(type, name, length,
                              sourceType, sourceName, sourceLength,
                              offset, offsetDescription) {
    var webglArray = new type(length);
    var sourceArray = new sourceType(sourceLength);
    for (var i = 0; i < sourceLength; i++)
        sourceArray[i] = 42 + i;
    try {
        webglArray.set(sourceArray, offset);
        testFailed("Setting " + name + " from " + sourceName + " with " +
                   offsetDescription + " offset was not caught");
    } catch (e) {
        testPassed("Setting " + name + " from " + sourceName + " with " +
                   offsetDescription + " offset was caught");
    }
}

function setWithValidOffset(type, name, length,
                            sourceType, sourceName, sourceLength,
                            offset, offsetDescription) {
    running("Setting " + name + " from " + sourceName + " with " +
            offsetDescription + " offset");
    var webglArray = new type(length);
    var sourceArray = new sourceType(sourceLength);
    for (var i = 0; i < sourceLength; i++)
        sourceArray[i] = 42 + i;
    try {
        webglArray.set(sourceArray, offset);
        offset = Math.floor(offset);
        for (var i = 0; i < sourceLength; i++) {
            assertEq("Element " + i + offset, sourceArray[i], webglArray[i + offset]);
        }
        pass();
    } catch (e) {
        fail(e);
    }
}


function testSettingFromArrayWithOutOfRangeOffset(type, name) {
    setWithInvalidOffset(type, name, 32, Array, "array", 16,
                         0x7FFFFFF8, "out-of-range");
}

function testSettingFromTypedArrayWithOutOfRangeOffset(type, name) {
    setWithInvalidOffset(type, name, 32, type, name, 16,
                         0x7FFFFFF8, "out-of-range");
}

function testSettingFromArrayWithNegativeOffset(type, name) {
    setWithInvalidOffset(type, name, 32, Array, "array", 16,
                         -1, "negative");
}

function testSettingFromTypedArrayWithNegativeOffset(type, name) {
    setWithInvalidOffset(type, name, 32, type, name, 16,
                         -1, "negative");
}

function testSettingFromArrayWithMinusZeroOffset(type, name) {
    setWithValidOffset(type, name, 32, Array, "array", 16,
                       -0, "-0");
}

function testSettingFromTypedArrayWithMinusZeroOffset(type, name) {
    setWithValidOffset(type, name, 32, type, name, 16,
                       -0, "-0");
}

function testSettingFromArrayWithBoundaryOffset(type, name) {
    setWithValidOffset(type, name, 32, Array, "array", 16,
                       16, "boundary");
}

function testSettingFromTypedArrayWithBoundaryOffset(type, name) {
    setWithValidOffset(type, name, 32, type, name, 16,
                       16, "boundary");
}

function testSettingFromArrayWithNonIntegerOffset(type, name) {
    setWithValidOffset(type, name, 32, Array, "array", 16,
                       16.999, "non-integer");
}

function testSettingFromTypedArrayWithNonIntegerOffset(type, name) {
    setWithValidOffset(type, name, 32, type, name, 16,
                       16.999, "non-integer");
}

function testSettingFromFakeArrayWithOutOfRangeLength(type, name) {
    var webglArray = new type(32);
    var array = {};
    array.length = 0x80000000;
    try {
        webglArray.set(array, 8);
        testFailed("Setting " + name + " from fake array with invalid length was not caught");
    } catch (e) {
        testPassed("Setting " + name + " from fake array with invalid length was caught");
    }
}


function negativeTestGetAndSetMethods(type, name) {
    array = new type([2, 3]);
    shouldBeUndefined("array.get");
    var exceptionThrown = false;
    // We deliberately check for an exception here rather than using
    // shouldThrow here because the precise contents of the syntax
    // error are not specified.
    try {
        webGLArray.set(0, 1);
    } catch (e) {
        exceptionThrown = true;
    }
    var output = "array.set(0, 1) ";
    if (exceptionThrown) {
        testPassed(output + "threw exception.");
    } else {
        testFailed(output + "did not throw exception.");
    }
}

function testNaNConversion(type, name) {
  running('test storing NaN in ' + name);

  var array = new type([1, 1]);
  var results = [];

  // The code block in each of the case statements below is identical, but some
  // JavaScript engines need separate copies in order to exercise all of
  // their optimized code paths.
  try {
    switch (type) {
    case Float32Array:
      for (var i = 0; i < array.length; ++i) {
        array[i] = NaN;
        results[i] = array[i];
      }
      break;
    case Float64Array:
      for (var i = 0; i < array.length; ++i) {
        array[i] = NaN;
        results[i] = array[i];
      }
      break;
    case Int8Array:
      for (var i = 0; i < array.length; ++i) {
        array[i] = NaN;
        results[i] = array[i];
      }
      break;
    case Int16Array:
      for (var i = 0; i < array.length; ++i) {
        array[i] = NaN;
        results[i] = array[i];
      }
      break;
    case Int32Array:
      for (var i = 0; i < array.length; ++i) {
        array[i] = NaN;
        results[i] = array[i];
      }
      break;
    case Uint8Array:
      for (var i = 0; i < array.length; ++i) {
        array[i] = NaN;
        results[i] = array[i];
      }
      break;
    case Uint8ClampedArray:
      for (var i = 0; i < array.length; ++i) {
        array[i] = NaN;
        results[i] = array[i];
      }
      break;
    case Uint16Array:
      for (var i = 0; i < array.length; ++i) {
        array[i] = NaN;
        results[i] = array[i];
      }
      break;
    case Uint32Array:
      for (var i = 0; i < array.length; ++i) {
        array[i] = NaN;
        results[i] = array[i];
      }
      break;
    default:
      fail("Unhandled type");
      break;
    }

    // Some types preserve NaN values; all other types convert NaN to zero.
    if (type === Float32Array || type === Float64Array) {
      assert('initial NaN preserved', isNaN(new type([NaN])[0]));
      for (var i = 0; i < array.length; ++i)
        assert('NaN preserved via setter', isNaN(results[i]));
    } else {
      assertEq('initial NaN converted to zero', 0, new type([NaN])[0]);
      for (var i = 0; i < array.length; ++i)
        assertEq('NaN converted to zero by setter', 0, results[i]);
    }

    pass();
  } catch (e) {
      fail(e);
  }
}

//
// Test driver
//

function runTests() {
  allPassed = true;

  testSlice();

  // The "name" attribute is a concession to browsers which don't
  // implement the "name" property on function objects
  var testCases =
    [ {name: "Float32Array",
       unsigned: false,
       integral: false,
       elementSizeInBytes: 4,
       testValues:     [ -500.5, 500.5 ],
       expectedValues: [ -500.5, 500.5 ]
      },
      {name: "Float64Array",
       unsigned: false,
       integral: false,
       elementSizeInBytes: 8,
       testValues:     [ -500.5, 500.5 ],
       expectedValues: [ -500.5, 500.5 ]
      },
      {name: "Int8Array",
       unsigned: false,
       integral: true,
       elementSizeInBytes: 1,
       testValues:     [ -128, 127, -129,  128 ],
       expectedValues: [ -128, 127,  127, -128 ]
      },
      {name: "Int16Array",
       unsigned: false,
       integral: true,
       elementSizeInBytes: 2,
       testValues:     [ -32768, 32767, -32769,  32768 ],
       expectedValues: [ -32768, 32767,  32767, -32768 ]
      },
      {name: "Int32Array",
       unsigned: false,
       integral: true,
       elementSizeInBytes: 4,
       testValues:     [ -2147483648, 2147483647, -2147483649,  2147483648 ],
       expectedValues: [ -2147483648, 2147483647,  2147483647, -2147483648 ]
      },
      {name: "Uint8Array",
       unsigned: true,
       integral: true,
       elementSizeInBytes: 1,
       testValues:     [ 0, 255,  -1, 256 ],
       expectedValues: [ 0, 255, 255,   0 ]
      },
      {name: "Uint8ClampedArray",
       unsigned: true,
       integral: true,
       elementSizeInBytes: 1,
       testValues:     [ 0, 255,  -1, 256 ],
       expectedValues: [ 0, 255,   0, 255 ]
      },
      {name: "Uint16Array",
       unsigned: true,
       integral: true,
       elementSizeInBytes: 2,
       testValues:     [ 0, 65535,    -1, 65536 ],
       expectedValues: [ 0, 65535, 65535,     0 ]
      },
      {name: "Uint32Array",
       unsigned: true,
       integral: true,
       elementSizeInBytes: 4,
       testValues:     [ 0, 4294967295,         -1, 4294967296 ],
       expectedValues: [ 0, 4294967295, 4294967295,          0 ]
      }
    ];
  for (var i = 0; i < testCases.length; i++) {
    var testCase = testCases[i];
    running(testCase.name);
    if (!(testCase.name in arraysjs)) {
        fail("does not exist");
        continue;
    }
    var type = arraysjs[testCase.name];
    var name = testCase.name;
    if (testCase.unsigned) {
      testSetAndGet10To1(type, name);
      testConstructWithArrayOfUnsignedValues(type, name);
      testConstructWithTypedArrayOfUnsignedValues(type, name);
    } else {
      testSetAndGetPos10ToNeg10(type, name);
      testConstructWithArrayOfSignedValues(type, name);
      testConstructWithTypedArrayOfSignedValues(type, name);
    }
    if (testCase.integral) {
      testIntegralArrayTruncationBehavior(type, name, testCase.unsigned);
    }
    testGetWithOutOfRangeIndices(type, name);
    testOffsetsAndSizes(type, name, testCase.elementSizeInBytes);
    testSetFromTypedArray(type, name);
    negativeTestSetFromTypedArray(type, name);
    testSetFromArray(type, name);
    negativeTestSetFromArray(type, name);
    testSubarray(type, name);
    negativeTestSubarray(type, name);
    testSetBoundaryConditions(type,
                              name,
                              testCase.testValues,
                              testCase.expectedValues);
    testConstructionBoundaryConditions(type,
                                       name,
                                       testCase.testValues,
                                       testCase.expectedValues);
    testConstructionWithNullBuffer(type, name);
    testConstructionWithOutOfRangeValues(type, name);
    testConstructionWithNegativeOutOfRangeValues(type, name);
    testConstructionWithUnalignedOffset(type, name, testCase.elementSizeInBytes);
    testConstructionWithUnalignedLength(type, name, testCase.elementSizeInBytes);
    testConstructionOfHugeArray(type, name, testCase.elementSizeInBytes);
    testConstructionWithBothArrayBufferAndLength(type, name, testCase.elementSizeInBytes);
    testConstructionWithSubPortionOfArrayBuffer(type, name, testCase.elementSizeInBytes);
    testSubarrayWithOutOfRangeValues(type, name, testCase.elementSizeInBytes);
    testSubarrayWithDefaultValues(type, name, testCase.elementSizeInBytes);
    testSettingFromArrayWithOutOfRangeOffset(type, name);
    testSettingFromTypedArrayWithOutOfRangeOffset(type, name);
    testSettingFromArrayWithNegativeOffset(type, name);
    testSettingFromTypedArrayWithNegativeOffset(type, name);
    testSettingFromArrayWithMinusZeroOffset(type, name);
    testSettingFromTypedArrayWithMinusZeroOffset(type, name);
    testSettingFromArrayWithBoundaryOffset(type, name);
    testSettingFromTypedArrayWithBoundaryOffset(type, name);
    testSettingFromArrayWithNonIntegerOffset(type, name);
    testSettingFromTypedArrayWithNonIntegerOffset(type, name);
    testSettingFromFakeArrayWithOutOfRangeLength(type, name);
    negativeTestGetAndSetMethods(type, name);
    testNaNConversion(type, name);
  }

  printSummary();
}

runTests();
successfullyParsed = true;
