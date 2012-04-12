## TypedArrays in JS

This is an implementation of the [TypedArrays] draft spec for Node.js. It
requires at least Node.js 0.7.7.

It's written in JavaScript, with one exception: `makeFastBuffer`. This is an
extended version of Node.js' `SlowBuffer.makeFastBuffer`, to allow different
types of V8 ExternalArray property access.

### Notes

The implementation passes the WebGL [conformance tests], but there are subtle
differences with the current Node.js implementation when it comes to smaller
details outside the spec:

  - `Object#toString` always returns `[object Object]`. There doesn't appear to
    be an API to set the class name for Function instances in V8.

  - DataView in Node.js allowed construction using TypedArrays. This is outside
    the spec (and Chrome doesn't allow it either).

  - ArrayBufferViews in Node.js could be constructed from a Node.js Buffer. This
    is still possible, but transparently creates an ArrayBuffer backed by the
    Buffer.

    In Node.js, `ArrayBufferView#buffer` would erronously be a Buffer in this
    situation, which breaks the spec. The underlying Node.js Buffer is made
    available as `ArrayBuffer#nodeBuffer` and `ArrayBufferView#nodeBuffer`, of
    which the latter may be a slice matching the view.

  - There is no `TypedArray#get` and `TypedArray#set` for indexing. These are
    also not in the spec, but can be added, of course. Chrome doesn't have them.

  - There is no `TypedArray#slice`, which is a Node.js extension that follows
    `Buffer#slice` behavior. The spec defines `TypedArray#subarray`.
 
    The name `slice` in this way also goes a bit against the definition
    `ArrayBuffer#slice`, which actually creates a copy.

### License

Parts are © Joyent, © Khronos Group, and original work done here
© Stéphan Kochen. All MIT licensed.

 [TypedArrays]: http://www.khronos.org/registry/typedarray/specs/latest/
 [conformance tests]: https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/tests/conformance/typedarrays/
