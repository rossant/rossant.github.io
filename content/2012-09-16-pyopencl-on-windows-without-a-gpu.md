Title: A PyOpenCL tutorial on Windows with or without a GPU
Tags: python, gpu

I've been using [CUDA](http://en.wikipedia.org/wiki/CUDA) and
[PyCUDA](http://documen.tician.de/pycuda/) as
[GPGPU](http://en.wikipedia.org/wiki/GPGPU) platforms for a few years now.
They enable access to the incredible computational power of graphics cards
through a simple C-like language. A recent
[Nvidia](http://en.wikipedia.org/wiki/Nvidia) graphics card is nevertheless
required in order to execute CUDA code. Some computers may not include a
Nvidia GPU, but rather an
[AMD/ATI](http://en.wikipedia.org/wiki/Advanced_Micro_Devices) card or even
an integrated graphics processor. Those computers thus cannot execute a CUDA
program.

<!-- PELICAN_END_SUMMARY -->

Whereas changing the GPU on a desktop computer is straightforward (one still
needs to buy a new graphics card...), it is generally not possible to do so
on a laptop. It prevents a number of developers to run, compile or debug CUDA
code. It is also certainly a problem when distributing a software relying on
CUDA, since not having a CUDA-enabled Nvidia GPU prevents one to even launch
the program.

For these reasons, I've recently been interested in
[OpenCL](http://en.wikipedia.org/wiki/OpenCL), a computing framework
equivalent to CUDA. The main difference is that OpenCL is an open standard
that has been adopted not only by Nvidia, but also by Intel and AMD. It means
that OpenCL programs may run on (recent) graphics card of either Nvidia or
AMD. In addition, a very interesting feature is that OpenCL programs may run
on a computer that does not even have a OpenCL-enabled GPU, but only a
recent-enough CPU. OpenCL code can be compiled for CPUs through the [Intel
SDK for OpenCL](http://software.intel.com/en-us/vcsource/tools/opencl-sdk)
(Intel-only CPUs) or the [AMD APP
SDK](http://developer.amd.com/tools/hc/AMDAPPSDK/). OpenCL code is still
accelerated through vectorization instructions on CPUs (e.g.
[SSE](http://en.wikipedia.org/wiki/Streaming_SIMD_Extensions) or
[AVX](http://en.wikipedia.org/wiki/Advanced_Vector_Extensions)) and multicore
CPUs.

This is really convenient since one can develop, debug and run an OpenCL
program on virtually any computer, even if it does not include an
OpenCL-enabled GPU. Moreover, distributing such a program is easier since the
end-user does not necessarily need to have a specific graphics card. Of
course, the performance of the program will be far less interesting than with
such a GPU, but the program will still run correctly.

Here I detail my first experience with OpenCL on Python (using
[PyOpenCL](http://mathema.tician.de/software/pyopencl)).
The installation part is actually the less trivial part (while still being
relatively easy) and may be of interest to some people.

Installation of an OpenCL SDK
-----------------------------

I'll explain how I could install OpenCL and PyOpenCL on an "old" laptop with
an [ATI Radeon Mobility HD
3650](http://www.amd.com/us/products/desktop/graphics/ati-radeon-hd-3000/hd-3600)
graphics card that does not support
OpenCL, an [Intel Core 2 Duo CPU](http://en.wikipedia.org/wiki/Intel_Core_2),
and a 32-bits [Windows 8](http://en.wikipedia.org/wiki/Windows_8) operating
system.

First, one needs to install an OpenCL SDK. AMD and Intel have their own SDKs
and I installed both. Later, we'll see that PyOpenCL allows us to choose, at
compilation-time, which SDK to use. The installation of the SDKs is
straightforward on Windows.

Installation of PyOpenCL
------------------------

PyOpenCL is to OpenCL what PyCUDA is to CUDA: a Python wrapper to those GPGPU
platforms. It is developed and maintained by [Andreas
Klöckner](http://mathema.tician.de/).

Installing PyOpenCL on Windows is easy when using the binary package provided
by [Christoph Gohlke](http://www.lfd.uci.edu/~gohlke/). [His
webpage](http://www.lfd.uci.edu/~gohlke/pythonlibs/) contains Windows binary
installers for the most recent versions of hundreds of Python packages. It is
of invaluable help for those Python users that use Windows. It is also
possible yet much more complicated to build [PyOpenCL from source on
Windows](http://wiki.tiker.net/PyOpenCL/Installation).

PyOpenCL has a few uncommon dependencies (beyond
[Numpy](http://numpy.scipy.org/)), like
[decorator](http://pypi.python.org/pypi/decorator) and
[PyTools](http://pypi.python.org/pypi/pytools) (actually the latter includes
_decorator_, so I'm not even sure one needs to install decorator separately).
These libraries can be easily installed with the `easy_install` command-line
tool provided by the [Distribute](http://packages.python.org/distribute/)
library.

Some environment variables may need to be specified, like `PYOPENCL_CTX` or
`PYOPENCL_COMPILER_OUTPUT` (see below). In order to do this, one needs to go
to the advanced system parameters and add new variables in the _User
variables_ section ([see
here](http://www.technoon.com/how-to-add-environment-variables-in-windows-8.html)
for details).

In order to quickly test the installation of PyOpenCL, try the following
commands in a Python console:

    import pyopencl
    import pyopencl.array

We now turn to the execution of a very simple OpenCL program.

PyOpenCL Hello World script
---------------------------

Save the following code in a .py file and execute it. The OpenCL code should be
compiled and executed correctly, and the squares of integers should be
displayed. Some warnings may be displayed even if everything worked corectly.
In addition, PyOpenCL may require the user to decide which SDK to use if several
are installed. In order not to be asked everytime, one can set the
`PYOPENCL_CTX` environment variable to the corresponding index (see above).

I could use both Intel and AMD SDKs. Ensure that you run Python in a command
line as an administrator (otherwise it may cause issues with
compilation, at least that's what I could note on my Windows 8 setup).

The actual code is self-explanatory, especially for someone who already knows
CUDA. This program generates a Numpy array with all integers between 0 and 9,
passes it to an OpenCL kernel that computes the square of an array of integers,
dynamically compiles and executes this kernel, and copies back the output from
the context memory to Python.

    :::python
    # import PyOpenCL and Numpy. An OpenCL-enabled GPU is not required,
    # OpenCL kernels can be compiled on most CPUs thanks to the Intel SDK for OpenCL
    # or the AMD APP SDK.
    import pyopencl as cl
    import numpy as np

    # create an OpenCL context
    ctx = cl.create_some_context()
    queue = cl.CommandQueue(ctx)

    # create the kernel input
    a = np.array(np.arange(10), dtype=np.int32)

    # kernel output placeholder
    b = np.empty(a.shape, dtype=np.int32)

    # create context buffers for a and b arrays
    # for a (input), we need to specify that this buffer should be populated from a
    a_dev = cl.Buffer(ctx, cl.mem_flags.READ_ONLY | cl.mem_flags.COPY_HOST_PTR,
                        hostbuf=a)
    # for b (output), we just allocate an empty buffer
    b_dev = cl.Buffer(ctx, cl.mem_flags.WRITE_ONLY, b.nbytes)

    # OpenCL kernel code
    code = """
    __kernel void test1(__global int* a, __global int* b) {
        int i = get_global_id(0);
        b[i] = a[i]*a[i];
    }
    """

    # compile the kernel
    prg = cl.Program(ctx, code).build()

    # launch the kernel
    event = prg.test1(queue, a.shape, a_dev, b_dev)
    event.wait()

    # copy the output from the context to the Python process
    cl.enqueue_copy(queue, b, b_dev)

    # if everything went fine, b should contain squares of integers
    print(b)

Here is the output I get on my installation.

	:::text
    C:\Python27\lib\site-packages\pyopencl\__init__.py:32: CompilerWarning: Built kernel retrieved from cache. Original from-source build had warnings:
    Build on <pyopencl.Device 'Intel(R) Core(TM)2 Duo CPU     T6400  @ 2.00GHz' on 'Intel(R) OpenCL' at 0x2251b58> succeeded, but said:

    Build started
    Kernel <test1> was successfully vectorized
    Done.
      warn(text, CompilerWarning)
    C:\Python27\lib\site-packages\pyopencl\__init__.py:32: CompilerWarning: From-binary build succeeded, but resulted in non-empty logs:
    Build on <pyopencl.Device 'Intel(R) Core(TM)2 Duo CPU     T6400  @ 2.00GHz' on 'Intel(R) OpenCL' at 0x2251b58> succeeded, but said:

    Build started
    Kernel <test1> was successfully vectorized
    Done.
      warn(text, CompilerWarning)
    [ 0  1  4  9 16 25 36 49 64 81]

Final notes
-----------

There is of course far more to tell about OpenCL that what I've shown here.
The point was to show how one could use GPGPU on a standard computer that
does not have a GPGPU-enabled graphics card, by using OpenCL and Python.
Even if I don't have much experience in OpenCL yet, I think it has a promising
future as an open and portable concurrent to CUDA.

Here are some interesting related links:

*   [The official OpenCL website](http://www.khronos.org/opencl/)
*   [PyOpenCL tutorial](http://enja.org/2011/02/22/adventures-in-pyopencl-part-1-getting-started-with-python/)
*   [Another one (in French)](http://www.planquart.com/tutoriel-n%C2%B01-pyopencl-premier-calcul-sur-gpu)






