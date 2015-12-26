function Buffer(data) {
    // data must be a TypedArray.
    this._typed_array = data;

    // Get data byte size, allocate memory on Emscripten heap, and get pointer
    var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
    var dataPtr = Module._malloc(nDataBytes);

    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(new Uint8Array(data.buffer));

    this._data_heap = dataHeap;
    this.pointer = dataHeap.byteOffset;
}

Buffer.prototype.get = function () {
    return new this._typed_array.constructor(this._data_heap.buffer,
                                             this._data_heap.byteOffset,
                                             this._typed_array.length);
}

Buffer.prototype.free = function () {
    Module._free(this._data_heap.byteOffset);
}

function is_array(tp) {
    return (tp.indexOf(':') > -1);
}

function wrap(args) {

    // return pointer, env
    var arg_types = ['number', 'number'];

    // one number per argument
    for (var i = 0; i < args.length; i++) {
        arg_types.push('number');
    }
    var func_name = 'main';
    var func = Module.cwrap(func_name, 'number', arg_types);

    var wrapped = function(return_arr) {
        // Wrap TypedArrays into emscripten buffers.

        // Buffer with the return buffer, initialized with an array
        // passed as argument.
        var buffer_out = new Buffer(return_arr);
        var buffers_in = [];

        // Wrap function arguments.
        var func_args = [buffer_out.pointer, 0];
        // Skip the first argument which is the return array.
        for (var i = 1; i < arguments.length; i++) {
            var arg;
            // Define the argument to send to the wrapped function.
            if (is_array(args[i-1])) {
                // If that argument is an array, pass the pointer to
                // an emscripten buffer containing the data.
                buffers_in[i] = new Buffer(arguments[i]);
                arg = buffers_in[i].pointer;
            }
            else {
                // Otherwise, just pass the argument directly.
                arg = arguments[i];
            }
            func_args.push(arg);
        }

        func.apply(undefined, func_args);
        var result = buffer_out.get();
        return result;
    };

    return wrapped;
}

// module.exports.wrap = wrap;
