// This test is NOT from the WebGL conformance test suite.

description("Test a copy between different TypedArrays.");

// This test fails on pretty much everything but Firefox. I believe the Firefox
// behavior is the correct one in this case, though.

function testTypedArrayCopy() {
    var a = new Uint16Array(8);

    var b = new Uint8Array(a.buffer, 0, 2);
    b[0] = 0x05;
    b[1] = 0x05;

    assertEq('Uint16 value', a[0], 0x0505);

    a.set(b);

    assertEq('First Uint16 element', a[0], 0x0005);
    assertEq('Second Uint16 element', a[1], 0x0005);

    pass();
}

testTypedArrayCopy();
