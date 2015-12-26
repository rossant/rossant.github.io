Title: Back from our first Vispy code camp at ESRF
Tags: python, dataviz

We had our first official [Vispy Code Camp](https://github.com/vispy/vispy/wiki/Vispy-code-camp-@ESRF) this week. I and the other core developers of Vispy were kindly invited by the [European Synchrotron Radiation Facility](http://www.esrf.eu). We presented our young library to software engineers from the ESRF and other European synchrotron facilities. It was also the occasion for us to make a gentle introduction to modern OpenGL, as many attendees didn't have experience in real-time GPU rendering. We discovered various scientific use cases in need of high-bandwidth, low-latency real-time visualization of big data.

<!-- PELICAN_END_SUMMARY -->

This was also the very first time we all gathered to work entirely on the project. We made productive use of our time together, discussing code architecture and design during most of the days and evenings. In particular, we had a close look to [Luke Campagnola](http://luke.campagnola.me/)'s amazing work realized during the weeks before the meeting. Luke managed to digest all our prior discussions about the core layers of Vispy (visuals, transforms, scene graph, shader composition). He designed a very solid and promising system that does not sacrifice speed for flexibility. We also discussed many other aspects of the library and the project. Here is a summary.

## Abstraction levels for interactive visualization

The core idea of Vispy is to offer different abstraction layers for high-performance interactive visualization. There is a huge gap between what a scientist wants to display (in terms of data and plots), and the OpenGL API. This is no different to the gap between a high-level language (such as Python or Haskell) and assembly code. Computer science is fundamentally based on this idea. In terms of high-performance interactive visualization, we think that the gap has yet to be filled.

Interactive visualization deals with visualization on the one hand, and interactivity on the other hand. What are convenient abstraction levels for these two ideas? This is probably an open question in general. With Vispy, we'll be offering one among many possible solutions. Importantly, we will also design modular building blocks for epxerimenting different types of abstractions.

As far as visualization is concerned, we plan to design:

* **vispy.gloo**: an object-oriented interface to the core features of modern OpenGL
* **vispy.visuals**: an object-oriented reactive interface for various 2D and 3D visuals
* **vispy.shaders**: an architecture for modular GLSL shaders
* **vispy.transform**: a flexible system for handling various linear and non-linear coordinate systems (Cartesian, polar, log, geographical map projections...), with support for GPU acceleration when needed
* **vispy.scenegraph**: a flexible and efficient scene graph that is designed with big data in mind
* high-level plotting interfaces

There is obviously a tremendous amount of work down the line, but we start to have a good idea about how we'll organise these modules. Hopefully, we'll be able to reach a critical mass of code and contributors required for the realization of this project.

[Renaud Blanch](http://iihm.imag.fr/blanch/) from UJF suggested that we start thinking about something similar for *interactivity*. Typically, user interactivity is implemented at the lowest level possible: mouse movements, key strokes, etc. Higher-level abstraction systems may allow end-users to design interactive visualizations in a more intuitive way. There happens to be a whole range of research about this topic (human-machine interfaces).


## Object-oriented OpenGL

Vispy.gloo is the main module implemented at this time. It is supporting our whole visualization stack. We discussed some relatively minor changes suggested by [Nicolas Rougier](http://www.loria.fr/~rougier/) in order to make the interface even simpler and cleaner. This object-oriented interface is already extremely convenient for us and other OpenGL developers. In effect, it allows us to focus on the *what* instead of the *how*. We define vertex buffers, textures, variables, we write the shaders in GLSL, and we render the OpenGL programs. All that with a Pythonic interface.

## Visuals

The visuals, transforms, modular shaders, and scene graph, are very much work in progress right now. We discussed these layers extensively during the code camp.

The visuals layer is one abstraction level above *vispy.gloo*. A **visual** is an object appearing on the scene. At this level, we start to get closer to the user's mind. Vispy will eventually come with a library of common visuals: polylines, geometric 2D shapes, 3D meshes, Bézier curves, surfaces, etc. Those visuals will be extendable. Importantly, users will be able to write their own visuals for complex use cases. They will have to learn the basis of modern OpenGL, and notably GLSL. We plan to provide very solid documentation on this subject. That being said, the core ideas are relatively simple.

Visuals will come with a reactive object-oriented interface: properties of a visual may be updated by changing instance attributes in Python. The according OpenGL commands would be automatically called under the hood.

Using a small subset of the SVG specification for common shapes may also be an interesting idea.

## Linear and non-linear transformations

With transformations, we allow visual objects to be organized in different coordinate systems. We tried to base this module on the mathematical notion of bijective function. After all, transformations are merely more than the mathematical composition of direct and inverse functions. Linear transformations can be expressed as matrix multiplications, but we don't enforce this in order to support non-linear transformations out of the box.

## Modular shaders

Offering the possibility to write and organize modular shaders is one of the main challenges of the project. GLSL is a pretty low-level language, describing how *vertices* and *fragments* (i.e. pixels) are processed on the massively parallel GPU architecture. Shaders can become quite complex in real-world use cases. Yet, there are many recurring patterns in shaders. By allowing users to design shaders from compact building blocks, we drastically simplify the task of creating complex extendable visuals (DRY principle). We also need these features internally for the transforms.

Luke came up with a pretty amazing modular system that seems to encompass all our use cases. The amount of programming wizardry involved is quite stunning. Nicolas pointed out that we were basically creating a new language on top of GLSL along with a dynamic compiler to GLSL. Although many details remain to be worked out, I think we have here a brilliant system that will prove vastly useful for the whole project.

## Scene graph

With the visuals, the transforms, and the modular shader, we have everything we need to build a flexible and efficient GPU-aware scene graph. The idea of the scene graph is very classic: there is a hierarchy of visual objects that are linked by specific transforms. Imagine, for example, a scientific interactive figure with multiple subplots (grid layout). There are multiple coordinate systems involved. For maximum performance, transforms may happen on the CPU or the GPU depending on the use cases. For instance, *static* transforms may be computed and cached once on the CPU, whereas it may be more efficient to perform *dynamic* transforms on the GPU.

## High-level interfaces

The layers described above constitute the internals of Vispy, and most users won't be aware of them. Eventually, we'll need to implement high-level interfaces for scientific plotting. Even if we could implement a brand new interface, it will be safer to implement existing high-level APIs.

We talked a bit about the different possibilities, starting with the MATLAB/matplotlib.pyplot interface. Although this interface is admitedly clunky, many scientists are used to it. We could either reimplement the most important functions, or find a way to leverage the existing implementation in matplotlib. One interesting direction is [Jake Vanderplas' current work](https://github.com/mpld3) on an exporter for matplotlib figures. The idea is to export a plot in a language-independent representation, so that it can be easily displayed with another backend (such as Vispy).

Of course, there are alternative interfaces and plotting libraries that we could take inspiration from: seaborn, vincent/vega, bokeh, plot.ly, etc. Even if we start thinking about these issues now, we're currently focusing on the core layers, keeping in mind plotting use-cases.

## Vispy in the browser

A longing feature is the ability to run Vispy in the browser. The main use case is the IPython notebook. I've thought a lot about the different ways to achieve this. We discussed many of these ways during the code camp, and I think we made some progress.

First, it should be relatively easy to implement an online backend. A Python server would stream OpenGL commands straight to the browser through WebSockets. This would enable interactive visualizations embedded in live IPython notebooks.

In parallel, an *offline backend* would be even more interesting, but highly challenging. The idea is to compile a visualization written in Python to a standalone HTML/Javascript interactive document.

After exploring multiple ideas, I'm now thinking that the cleanest way of bringing Vispy to the browser would be to:

* Allow serialization of visuals, entities, transforms, scene graphs, interactivity.
* Implement an interpreter in Javascript for displaying serialized visualizations.

This represents a significant amount of work, notably the first part. But we can do it progressively. The interpreter would be much less complex than Vispy itself, mainly because Python would still be responsible for the most complex part, that is, initialization of the scene with user-provided code.

## Desktop and ES OpenGL

An issue we discussed a lot relates to the different flavors of OpenGL. We currently limit the set of features to OpenGL ES 2.0. This light implementation of OpenGL works on desktop and mobile devices, as well as in the browser. Having a single implementation makes it easier to share code between different devices and platforms. However, OpenGL ES 2.0 lacks a few interesting features that *do* exist on many desktop systems. We have yet to find a convenient system for enabling explicitly non-ES features.

## OpenGL wrapper, ANGLE

Almar Klein has been busy in the train implementing his own OpenGL ES wrapper in Python with ctypes, thereby bypassing PyOpenGL. He also succeeded in using [ANGLE](http://code.google.com/p/angleproject/) on Windows with this wrapper, bringing modern OpenGL to most Windows users. ANGLE automatically translates OpenGL API calls to DirectX. This is quite an useful feature for those Windows users who only have the default OpenGL 1.1 implementation in Windows. This will considerably simplify the distribution of OpenGL-based applications to Windows users.

## Image registration for continuous integration

Eric Larson has set up a continuous integration system for Vispy with Travis CI. He also did some great work improving our testing suite. However, we have yet to check the bitmap output of rendering tests. A difficulty lies in the fact that different OpenGL implementations do not result in pixel-perfect results. We started some preliminary work to have a look at the discrepancies between images generated by various implementations.

## Installation and library dependencies

Even if Vispy is still a pure Python library for now (yet depending on NumPy and PyOpenGL), this might change in the future. In specific instances, we may need to implement complex algorithms in C or Cython. This will complicate the installation, except if we find a way to achieve graceful degradation in the absence of a C compiler or external dependencies. In particular, it seems that SciPy is quite a heavy dependency, and we should avoid relying on it if possible.

## OpenCL/OpenGL interoperability

Jérôme Kieffer and Armando Solé from ESRF were interested in combining OpenGL and OpenCL with Vispy. The idea is to allocate a single buffer on the GPU for both visualization and computing. For example, one can create an OpenGL texture, and perform general-purpose computations on this buffer from an OpenCL kernel. This is quite efficient since there is no copy whatsoever between the CPU and GPU.

After fighting against driver and OS-specific bugs of various kinds with OpenCL, we finally managed to enable OpenGL-OpenCL interoperability with Vispy. We have yet to do detailed performance benchmarks with various backends and OpenGL wrappers. We're also working on encapsulating boilerplate code in a clean Pythonic API.

## Out-of-memory visualization with HDF5

I presented a few demos implementing out-of-memory visualization of HDF5 files with Galry. We have yet to port those to Vispy, but there shouldn't be any particular difficulty in the process. Armando shared with us his long expertise in optimizing HDF5 data access. There happens to be many tricks and techniques to get the most performance out of HDF5 in Python.

## A molecular viewer with true impostors

The code camp was also the occasion for some of the participants to implement demos in modern OpenGL, using our object-oriented interface vispy.gloo.

Gaël Goret implemented an interactive 3D viewer of molecules with vispy.gloo. This viewer is extremely efficient: Nicolas suggested to use [true impostors](http://http.developer.nvidia.com/GPUGems3/gpugems3_ch21.html). This smart technique consists in using a tiny number of vertices (or even one) per molecule, instead of rendering spheres with complex meshes. Realistic 3D rendering is achieved with a ray-casting algorithm implemented in the fragment shader. Be sure to [check out the demo here](https://github.com/vispy/codecamp-esrf-2014/tree/master/gg).

## Wrap-up

This was a highly productive meeting, and we're all quite excited with what's coming. We're starting to overcome most conceptual challenges. Code is being written, discussed, tested. More and more people with various areas of expertise are willing to contribute.

We're also producing more and more documentation materials (when will we see a Vispy book?). This is a fundamental aspect of the project. Indeed, our goal is not only to build a *library*, but also a *knowledge base*. Scientists are generally not exposed to *modern* OpenGL, although this is a decade-old subject (generally the expertise domain of game developers). The high complexity of OpenGL is probably an important reason why OpenGL is still not widespread in scientific visualization. Vispy hides most of this complexity, offering simple and clean interfaces that specifically target scientific visualization. We really want to bring OpenGL to scientists.

So, that's a wrap. We're deeply grateful to the ESRF staff for their support, and particularly Jérôme and Armando who decided to invite all of us. This was a fantastic opportunity for the project, and we hope we'll be able to organize more events like this in the future. In the meantime, the development continues!

PS: the ESRF Data Analysis Unit is recruiting an OpenGL/OpenCL/Python expert for high-performance interactive visualization of big scientific data. [Be sure to check out the announcement](http://esrf.profilsearch.com/recrute/fo_annonce_voir.php?id=300), and pass the word around if you know potentially interested people!
