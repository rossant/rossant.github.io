Title: NumPy in the browser: proof of concept with Numba, LLVM, and emscripten
Tags: python

It's been a while since I wanted to try to bring some of NumPy to the browser. I've already discussed the motivations for this [in a previous post last year]({filename}2014-03-31-scientific-python-in-the-browser-its-coming.md). As far as I'm concerned, the main use case would be to enable interactive data visualization in offline notebooks (including nbviewer), which often require client-based array operations for interactivity. In this post, I'll describe a proof-of-concept of compiling NumPy-aware Python functions to JavaScript using Numba, LLVM, and emscripten.

<!-- PELICAN_END_SUMMARY -->

## How to bring NumPy to the browser?

There are at least two quite different approaches.

The first approach consists of reimplementing a tiny subset of NumPy in JavaScript. Many computations can be implemented with a minimum feature set of NumPy:

* the ndarray structure
* array creation functions
* indexing
* universal functions (ufuncs)
* a few shape manipulation routines

Good performance can be expected in JavaScript by using [TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays): these structures represent data in contiguous segments of memory. The JIT compilers of modern browsers should be smart enough to compile regular loops on these arrays quite efficiently.

Although only a small subset of NumPy would be sufficient for most purposes, this approach does represent quite some work. There is no fundamental challenge behind it: it just necessitates quite a bit of slightly boring work. Yet, I think there can be some interest in having a lightweight "numpy.js" JavaScript library.

The other approach is radically different and much more sophisticated. Starting from a Python function operating on NumPy arrays, compile it to LLVM, and then compile the LLVM code to JavaScript. The road from Python/NumPy to LLVM already exists: it's called [**Numba**](http://numba.pydata.org/). As for LLVM -> JavaScript, there's [**emscripten**](http://kripken.github.io/emscripten-site/). In theory, it should be possible to connect the LLVM output of Numba to the LLVM input of emscripten. That sounds easy, right?

Not so fast. A while ago, [I had asked the Numba developers about the feasibility of this approach](https://groups.google.com/a/continuum.io/d/msg/numba-users/ELAzQPFl6Ec/dbq6eQK134sJ). A major problem is that Python functions that are JIT-compiled with Numba use CPython under the hood. So some of CPython would have to be compiled to JavaScript as well. That sounds overly complicated, especially when it comes to small, self-contained Python functions operating exclusively on NumPy arrays. So I let it go.

Recently, I heard about a new release of Numba, and I had another look. I discovered the [**nopython mode**](http://numba.pydata.org/numba-doc/0.17.0/glossary.html#term-nopython-mode), which appeared to have been around for some time. This mode sounds like something interesting for our purposes: if Python functions are compiled to LLVM without relying on CPython at all, maybe they can be successfully compiled to JavaScript?

Since I had long wanted to play with LLVM, I decided to have a go.

## What is LLVM?

But first, what is LLVM exactly? It is a modular compiler architecture. The core of LLVM is a machine-independent assembly-like language called the **LLVM Intermediate Representation** (IR). Think of it as a strongly-typed instruction set for a virtual machine (even if *the scope of the project is not limited to the creation of virtual machines*, [tells us Wikipedia](http://en.wikipedia.org/wiki/LLVM)).

The IR abstracts away details of the compilation target. As such, it is common target for various language frontends (C, C++, Haskell, Python, and many others) and microarchitecture backends (x86, ARM, Nvidia PTX which is used in CUDA-enabled GPUs, etc.). LLVM also comes with a powerful and modular architecture for optimization passes.

LLVM seems to be quite popular these days, with a strong industrial support, notably by Apple. For example, Apple's **Clang** is a LLVM-based C/C++/Objective C compiler that aims at replacing GCC's compilers for these languages. The compilers of modern languages like Julia and Rust are also built with LLVM.

## What is Numba?

Now, the idea of Numba is the following. Take a Python function performing numerical operations on NumPy arrays. Normally, this function is interpreted by CPython. It performs Python and NumPy C API calls to execute these operations efficiently.

With Numba, things happen quite differently. At runtime, the function bytecode is analyzed, types are inferred, and LLVM IR is generated before being compiled to machine code. In *nopython mode*, the LLVM IR doesn't make Python C API calls. There are many situations where a Python function cannot be compiled in nopython mode because it uses non-trivial Python features or data structures. In this case, the *object mode* is activated and the LLVM IR makes many Python C API calls.

That's it for the theory. Now let's get our hands dirty.

## Getting the LLVM IR of a Python function with Numba

Let's first import Numba (I installed the latest stable release with conda):

```python
import os
import numpy as np
import llvmlite.binding as ll
import llvmlite.ir as llvmir
import numba
from numba import jit
from numba import int32
```

It seems that there is an easy way to get the LLVM IR of a JIT'ed function in the development version of Numba, but this version didn't work for me, so here is a custom function doing the same thing (we'll make extensive use of unstable API in this post so most things are likely to break with different versions of Numba and other libraries...):

```python
def llvm(func, sig=None):
    """Return the LLVM IR of a @jit'ed function."""
    if sig is None:
        sig = func.signatures[0]
    return str(func._compileinfos[sig].library._final_module)
```

Let's define a trivial function operating on scalars:

```python
def f(x, y):
    return x + y
```

```python
f(1, 2)
3
```

Now, let's compile it in nopython mode:

```python
@jit(int32(int32, int32), nopython=True)
def f(x, y):
    return x + y
```

For simplicity, we have specified the input and output types explicitely. Numba can compile several overloaded versions of the same function at runtime, depending on the types of the arguments.

Let's have a look at the generated LLVM IR:

```python
print(llvm(f))
```

```llvm
[...]

; Function Attrs: nounwind
define i32 @__main__.f.int32.int32(i32* nocapture %ret, i8* nocapture readnone %env, i32 %arg.x, i32 %arg.y) #0 {
entry:
  %.15 = add i32 %arg.y, %arg.x
  store i32 %.15, i32* %ret, align 4
  ret i32 0
}

[...]

define i8* @wrapper.__main__.f.int32.int32(i8* nocapture readnone %py_closure, i8* %py_args, i8* %py_kws) {
entry:
  %.4 = alloca i8*, align 8
  %.5 = alloca i8*, align 8
  %.6 = call i32 (i8*, i8*, i8*, i8**, ...)* @PyArg_ParseTupleAndKeywords(i8* %py_args, i8* %py_kws, i8* getelementptr inbounds ([3 x i8]* @.const.OO, i64 0, i64 0), i8** getelementptr inbounds ([3 x i8*]* @.kwlist, i64 0, i64 0), i8** %.4, i8** %.5)
  %.7 = icmp eq i32 %.6, 0
  br i1 %.7, label %entry.if, label %entry.endif, !prof !0

entry.if:                                         ; preds = %entry.endif1.1.endif, %entry.endif1.1, %entry.endif, %entry
  %merge = phi i8* [ null, %entry.endif1.1 ], [ null, %entry.endif ], [ null, %entry ], [ %.57, %entry.endif1.1.endif ]
  ret i8* %merge

entry.endif:                                      ; preds = %entry
  %.11 = load i8** %.4, align 8
  %.12 = call i8* @PyNumber_Long(i8* %.11)
  %.13 = call i64 @PyLong_AsLongLong(i8* %.12)
  call void @Py_DecRef(i8* %.12)
  %.16 = call i8* @PyErr_Occurred()
  %.17 = icmp eq i8* %.16, null
  br i1 %.17, label %entry.endif1.1, label %entry.if, !prof !1

entry.endif1.1:                                   ; preds = %entry.endif
  %.21 = load i8** %.5, align 8
  %.22 = call i8* @PyNumber_Long(i8* %.21)
  %.23 = call i64 @PyLong_AsLongLong(i8* %.22)
  call void @Py_DecRef(i8* %.22)
  %.26 = call i8* @PyErr_Occurred()
  %.27 = icmp eq i8* %.26, null
  br i1 %.27, label %entry.endif1.1.endif, label %entry.if, !prof !1

entry.endif1.1.endif:                             ; preds = %entry.endif1.1
  %.15.i = add i64 %.23, %.13
  %sext = shl i64 %.15.i, 32
  %.51 = ashr exact i64 %sext, 32
  %.57 = call i8* @PyInt_FromLong(i64 %.51)
  br label %entry.if
}
```

That's a lot of code for such a simple function! And yet I have only kept the most relevant bits.

Two LLVM functions are defined here (`define` instruction):

* `@__main__.f.int32.int32`
* `@wrapper.__main__.f.int32.int32`

In LLVM, the names of global variables and functions start with a `@`. Names can contain many non-alphanumerical characters, including dots `.` and quotes `"`. Comments start with a semi-colon `;`. [The LLVM Language Reference Manual](http://llvm.org/docs/LangRef.html) is a great source of documentation.

LLVM IR is a strongly-typed language. As we can see in the function definitions, the first function takes four parameters (`i32*`, `i8*`, `i32`, `i32`) and returns a `i32` value. `i8` and `i32` are 8-bit (=byte) and 32-bit integer types, respectively.

Let's try to reverse-engineer this function. The return value of this LLVM value is a success/failure output value. The actual value returned by our Python function is set in the pointer passed as a first argument. I'm not quite clear about the purpose of the second `i8*` argument; it might be related to the CPython environment and it doesn't seem important for what we're doing here. The last two `i32` arguments are our actual arguments `x` and `y`.

The body of that function seems to do what we expect:

```llvm
%.15 = add i32 %arg.y, %arg.x
store i32 %.15, i32* %ret, align 4
```

The `add` instructions adds our two input numbers and saves them into a local variable `%.15`. Then, the `store` instruction puts that value into the `%ret` pointer passed as input: that's the return value of the function.

The `@wrapper.__main__.f.int32.int32` function is more complicated and we won't detail it at all here. This function wraps the core LLVM function `@__main__.f.int32.int32` and exposes it to the Python interpreter. For example, our input numbers are actually Python objects. Some works needs to be done with the Python C API to extract the actual numbers from these objects and pass them to the core LLVM function.

Since our ultimate goal is to compile `f()` in JavaScript where there's no such thing as a CPython interpreter, we only need the `@__main__.f.int32.int32` function here.

Now, let's try to compile this to JavaScript with emscripten!

## Compiling the LLVM IR to JavaScript with emscripten

Emscripten is an impressive piece of software. It can compile C/C++ code, even large projects like game engines ([Unreal Engine](https://blog.mozilla.org/blog/2014/03/12/mozilla-and-epic-preview-unreal-engine-4-running-in-firefox/) for example), to JavaScript. Emscripten uses Clang to compile C/C++ to LLVM, and a custom LLVM backend named *Fastcomp* to compile LLVM IR to JavaScript/**asm.js** (*an extraordinarily optimizable, low-level subset of JavaScript* [according to the project page](http://asmjs.org/)).

Let's get started. I first tried to use the SDK installer, but I had some issues and I had to compile emscripten from source (note: I'm using Ubuntu 14.04 64-bit). [Here are the installation instructions](http://kripken.github.io/emscripten-site/docs/building_from_source/building_emscripten_from_source_on_linux.html#building-emscripten-on-linux). Also, I ended up using the `merge-3.5/merge-pnacl-3.5` branches of emscripten and fastcomp, but using `master` may work as well. The point was to ensure the same version of LLVM is used in Numba and emscripten, to avoid compatibility issues.

For some reasons, fastcomp appears to share code with [PNaCl](http://en.wikipedia.org/wiki/Google_Native_Client), a project by Google that brings native applications to the Chrome browser through a sandboxing technology based on LLVM. It's a bit unclear to me how the two projects are related exactly.

Here is a little function returning the LLVM library of a Python JIT'ed function. We'll use it later.

```python
def get_lib(func, sig_index=0):
    sig = func.signatures[sig_index]
    compiled = func._compileinfos[sig]
    lib = compiled.library
    return lib
```

Now, we save the LLVM IR code to a `.ll` file (the extension for files containing LLVM IR code), and we call `emcc` (the emscripten compiler):

```python
lib = get_lib(f)
with open('scalar.ll', 'w') as fh:
    fh.write(str(lib._final_module))
os.system('./emscripten/emcc scalar.ll -o scalar.js -O3 -s NO_EXIT_RUNTIME=1')
0
```

```python
os.path.getsize('scalar.js')
138022
```

```python
!cut -c-80 scalar.js | head -n5
var Module;if(!Module)Module=(typeof Module!=="undefined"?Module:null)||{};var m
var asm=(function(global,env,buffer) {
"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer)
// EMSCRIPTEN_START_FUNCS
function ma(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+15&-16;return b|0}function na(){ret
```

We now have a JavaScript file that supposedly implements our function. How do we call it from JavaScript? After all, what we have here is a sort of function compiled for a virtual machine in JavaScript. With Numba, we had a LLVM wrapper for Python that let us call the function from Python. Here, we have nothing, and we need to write our own wrapper.

A few more details:

* Programs compiled with emscripten are generally regular C programs with a main loop. However, what we want is an interactive access to our LLVM function from JavaScript. The `NO_EXIT_RUNTIME=1` option prevents the runtime exit at the end of the function execution.
* According to the documentation of emscripten, there is a way to access the LLVM functions from JavaScript. However, I must have done something wrong because I only managed to access the `main` entry point function (which actually doesn't exist).
* So I ended up creating a `main()` function in LLVM wrapping ` @__main__.f.int32.int32()`.

There are surely better ways to do it, but here is a little Python function adding this wrapper:

```python
def add_wrapper(lib):
    """Add a main entry point calling the function."""
...
    main = """
    define i32 @main(i64* %arg0, i8* %arg1, i32 %arg2, i32 %arg3)
    {
        %out = call i32 @__main__.add.int32.int32(i64* %arg0, i8* %arg1, i32 %arg2, i32 %arg3)
        ret i32 %out
    }
    declare i32 @__main__.add.int32.int32(i64*, i8*, i32, i32)
    """
...
    ll_module = ll.parse_assembly(main)
    ll_module.verify()
    try:
        lib.add_llvm_module(ll_module)
    except RuntimeError:
        print("Warning: the module as already been added.")
    return lib
```

It's a bit ugly because the wrapper is hard-coded with the function's signature.

Once we have this `main()` function, we can finally access it from JavaScript. But we're not done yet, because we need a way to retrieve the result. Recall that the result is stored via a pointer passed as a first argument to our LLVM function.

After a bit of googling, I implemented a quick-and-dirty JavaScript wrapper:

```javascript
function Buffer(data) {
    // see http://kapadia.github.io/emscripten/2013/09/13/emscripten-pointers-and-pointers.html
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

// wrap the main() LLVM function
function wrap(args) {

    // return pointer, env
    var arg_types = ['number', 'number'];

    // one number per argument
    for (var i = 0; i < args.length; i++) {
        arg_types.push('number');
    }

    var func_name = 'main';

    // here's how emscripten lets us access LLVM functions
    var func = Module.cwrap(func_name, 'number', arg_types);

    var wrapped = function(return_arr) {

        // Wrap TypedArrays into emscripten buffers.
        // Buffer with the return buffer, initialized with an array
        // passed as argument.
        var buffer_out = new Buffer(return_arr);

        // Wrap function arguments.
        var func_args = [buffer_out.pointer, 0];

        // Skip the first argument which is the return array.
        for (var i = 1; i < arguments.length; i++) {
            var arg;

            // Define the argument to send to the wrapped function.
            if (is_array(args[i-1])) {
                // If that argument is an array, pass the pointer to
                // an emscripten buffer containing the data.
                arg = new Buffer(arguments[i]).pointer;
            }
            else {
                // Otherwise, just pass the argument directly.
                arg = arguments[i];
            }
            func_args.push(arg);
        }

        // we call the LLVM function
        func.apply(undefined, func_args);

        // we get the result by reading the output buffer
        var result = buffer_out.get();

        return result;
    };
    return wrapped;
}
```

This wrapper connects JavaScript TypedArray buffers to the virtual machine buffers and pointers. We finally get a chance to call our compiled LLVM functions from JavaScript. Here is an interactive example:

```javascript
// We get the input numbers.
var arg1 = parseInt($('#my_arg1').val());
var arg2 = parseInt($('#my_arg2').val());

// We wrap the LLVM main() function, specifying the signature.
var add = wrap(['int', 'int']);

// We create a buffer that will contain the result.
var result = new Int32Array([0]);
result = add(result, arg1, arg2);

// We display the result.
$('#my_output').val(result[0]);
```

Recall that we started from this function:

```python
@jit(int32(int32, int32), nopython=True)
def f(x, y):
    return x + y
```

We now can use this function from JavaScript. Type some numbers below:

<iframe src="/widgets/emscripten-scalar.html" style="height: 60px;" scrolling="no"></iframe>

We have successfully compiled our first Python function to Javascript!

## Now with NumPy arrays

This sounds promising. Now, let's try to go further and use NumPy arrays in our original function:

```python
@jit(int32(int32[:]), nopython=True)
def np_sum(x):
    return x.sum()
```

Let's have a look at the LLVM IR:

```python
print(llvm(np_sum))
```

```llvm
[...]
define i32 @"__main__.np_sum.array(int32,_1d,_A,_nonconst)"(i32* nocapture %ret, i8* nocapture readnone %env, { i8*, i64, i64, i32*, [1 x i64], [1 x i64] }* nocapture readonly %arg.x) #0 {
entry:
  %.4 = load { i8*, i64, i64, i32*, [1 x i64], [1 x i64] }* %arg.x, align 8
  %.4.fca.3.extract = extractvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %.4, 3
  %.4.fca.4.0.extract = extractvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %.4, 4, 0
  %.4.fca.5.0.extract = extractvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %.4, 5, 0
  %.35.i = icmp eq i64 %.4.fca.4.0.extract, 0
  br i1 %.35.i, label %"numba.targets.arrayobj.array_sum_impl.array(int32,_1d,_A,_nonconst).exit", label %B16.endif.lr.ph.i, !prof !0
[...]
```

The code is several hundreds of lines long. Again, we have a core LLVM function and a Python wrapper. Let's examine the signature of the core function:

```llvm
i32 @"__main__.np_sum.array(int32,_1d,_A,_nonconst)"(i32* %ret, i8* %env, { i8*, i64, i64, i32*, [1 x i64], [1 x i64] }* %arg.x)
```

The signature follows the same pattern as before. The first argument is the integer output. The third argument is the most interesting: it represents our input array. It is a pointer to a structure containing six fields. After looking into Numba's code, we find out the signification of these six fields:

* `i8* parent`: apparently mostly relevant to CPython
* `i64 nitems`: number of items in the array
* `i64 itemsize`: number of bytes per item
* `i32* data`: a pointer to the data buffer
* `[1 x i64] shape`: the shape of the array
* `[1 x i64] strides`: the strides of the array

This time too, we need a wrapper. We'll do something even uglier than before: we'll hardcode the array metadata (dtype, shape, etc.) in the wrapper, considering a `(10,) int32` array.

```python
def add_wrapper(lib):
    main = """
    define i32 @main(i32* nocapture %ret, i8* nocapture readnone %env, i32* nocapture readonly %arr)
    {
        %tmp = alloca i8
        store i8 0, i8* %tmp
        %agg1 = insertvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } undef, i8* %tmp, 0             ; parent
        %agg2 = insertvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %agg1, i64 10, 1                ; nitems
        %agg3 = insertvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %agg2, i64 4, 2                ; itemsize
        %agg4 = insertvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %agg3, i32* %arr, 3            ; data
        %agg5 = insertvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %agg4, [1 x i64] [i64 10], 4    ; shape
        %agg6 = insertvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %agg5, [1 x i64] [i64 4], 5    ; strides
        %ptr = alloca { i8*, i64, i64, i32*, [1 x i64], [1 x i64] }
        store { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %agg6, { i8*, i64, i64, i32*, [1 x i64], [1 x i64] }* %ptr
        %out = call i32 @"__main__.np_sum.array(int32,_1d,_A,_nonconst)"(i32* %ret, i8* %env, { i8*, i64, i64, i32*, [1 x i64], [1 x i64] }* %ptr)
        ret i32 %out
    }
    declare i32 @"__main__.np_sum.array(int32,_1d,_A,_nonconst)"(i32* nocapture, i8* nocapture readnone, { i8*, i64, i64, i32*, [1 x i64], [1 x i64] }* nocapture readonly)
    """
    ll_module = ll.parse_assembly(main)
    ll_module.verify()
    try:
        lib.add_llvm_module(ll_module)
    except RuntimeError:
        print("Warning: the module as already been added.")
    return lib
```

What does this wrapper do? It takes the data buffer of an array as an input, it creates an appropriate structure for the corresponding NumPy array, and it calls our compiled Python function. Note that the `alloca` instruction creates a pointer, while `insertvalue` lets us create the LLVM ndarray structure.

This wrapper will make our lives easier in JavaScript. We'll just pass the data buffer, and this LLVM wrapper will take care of creating the appropriate array structure. The drawback is that the shape of the array is fixed at compile time here. For sure, there are much cleaner ways to do it.

Let's compile this with emscripten:

```python
lib = get_lib(np_sum)
add_wrapper(lib)
with open('array.ll', 'w') as fh:
    fh.write((str(lib._final_module)))
os.system('./emscripten/emcc array.ll -o array.js -O3 -s NO_EXIT_RUNTIME=1')
256
```

```llvm
Value:   %.4.fca.4.0.extract = extractvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %.4.insert15, 4, 0
Value:   %.4.insert15 = insertvalue { i8*, i64, i64, i32*, [1 x i64], [1 x i64] } %.4.insert12, [1 x i64] %.4.field14, 5
LLVM ERROR: ExpandStructRegs does not handle nested structs
```

This doesn't sound very good. A bit of googling tells us that [PNaCl and emscripten do not support nested structures very well](https://code.google.com/p/nativeclient/issues/detail?id=3815). The bug is still open at this time. Apparently, these projects target LLVM IR generated by Clang, which doesn't seem to use nested structs (?). I opened [an issue](https://github.com/numba/numba/issues/993) on the Numba GitHub repository, and someone suggested to disable the Numba optimizations. It worked, but then I had another similar bug. It looked like a dead-end.

Fortunately, after some more googling I found out that [other people had encountered the same bug](http://code.google.com/p/nativeclient/issues/detail?id=3932) with LLVM IR code generated by Julia and Rust. On this bug report, someone mentioned [a fix for Rust](https://github.com/epdtry/rust-emscripten-passes). So I tried it. I had to patch a C++ file in PNaCl and run a custom LLVM pass on the LLVM IR generated by Numba. It was a long shot, but it actually worked.

```python
os.system(
    "emscripten-fastcomp/build/Release/bin/opt "
    "-load=rust-emscripten-passes/BreakStructArguments.so "
    "-O3 -break-struct-arguments -globaldce array.ll -S -o array_fixed.ll"
    )
0
```

```python
os.system('./emscripten/emcc array_fixed.ll -o array.js -O3 -s NO_EXIT_RUNTIME=1')
0
```

Here is the result. Let's first recall the original function:

```python
@jit(int32(int32[:]), nopython=True)
def np_sum(x):
    return x.sum()
```

Type some numbers below to compute the sum (no more than 10 numbers):

<iframe src="/widgets/emscripten-array.html" style="height: 80px;" scrolling="no"></iframe>

This is better than what I expected! I also managed to pass 2D arrays with a little more work with the wrappers. The following example computes the index of the row with the maximum value for `x`:

```python
@numba.jit(numba.int32(numba.int32[:,::1]))
def f(x):
    i = x[:, 1].argmax()
    return x[i, 0]
```

Click on a number to change it:

<iframe src="/widgets/emscripten-table.html" style="height: 350px;" scrolling="no"></iframe>

## Performance

I've done some quick and somewhat non-scientific benchmarks. The test function is just `np.sum()` on an array containing one million random 32-bit integers uniformly sampled between -100 and 100. On my laptop, NumPy computes the sum in 0.85 ms. What about Numba/Emscripten and vanilla JavaScript? Click on the button to run the benchmark yourself:

<iframe src="/widgets/emscripten-benchmark.html" style="height: 200px;" scrolling="no"></iframe>

The Emscripten-compiled version appears to be 1-2 orders of magnitude slower than vanilla JavaScript and NumPy.

## Conclusion

There are several things that I didn't manage or didn't try to do:

* Returning an array
* Passing several arrays as arguments
* Using ufuncs
* Using array operations

Although interesting in itself, this proof-of-concept has important limitations:

* It is inherently limited by what Numba's nopython mode provides. Currently, just the most basic constructs of [Python](http://numba.pydata.org/numba-doc/0.17.0/reference/pysupported.html) and [NumPy](http://numba.pydata.org/numba-doc/0.17.0/reference/numpysupported.html) are available in this mode. There is no array creation, reshaping, no array operations without preallocating the output arrays, etc. Python features are also quite limited; for example, no containers (lists, dicts, sets, etc.) are available as these constructs require the Python C API. It's unclear to me how much the Numba devs want to implement in the nopython mode.

* There is currently limited interest in using this approach compared to writing vanilla JavaScript by hand when needed. Fore sure, JavaScript doesn't support ndarrays (even if there are some JS [ndarray libraries](https://github.com/scijs/ndarray) out there), but we've seen that Numba support for NumPy array computations is still a bit limited. Things would be quite different if we could compile a significant and non-trivial Python/NumPy codebase in nopython mode.

* I hard-coded the LLVM wrappers manually, which is quite horrible. However, I believe it would not be too complicated to build such wrappers dynamically using llvmlite.

* Performance could be better.

* This seems obvious, but: this approach only lets you compile Python functions ahead-of-time. Once you're in JavaScript, you can't write or compile your own functions on-the-fly. By contrast, the first approach I described in the introduction would let you do that.

* The whole approach is quite hackish (you need to apply obscure patches to unstable branches of various projects written in 3 or 4 different languages) and it feels like you're trying to fit a square peg in a round hole. I don't believe it could be ever used in production in any form.

Still, it was a lot of fun!
