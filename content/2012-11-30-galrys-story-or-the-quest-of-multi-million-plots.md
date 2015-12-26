Title: Galry's Story, or the quest of multi-million plots
Tags: dataviz

About a month ago, 
[I announced here the availability](http://cyrille.rossant.net/introducing-galry/)
of a
[new experimental high performance visualization package in Python](http://rossant.github.com/galry/)
that I'm developing as part of my current research project.
It has significantly evolved since then, but it is still experimental.
Moreover, the interface is still not ready for a 0.1 release. I also need to do
much more tests on various systems and graphics cards. In this post I'll 
talk about how the idea of writing a new visualization package came up in the
first place. I'll also describe the new features that are coming to the
library.

<!-- PELICAN_END_SUMMARY -->

After my announcement,
I was pleased to see that there were a lot of people interested in
this project. There were more than 500 unique visits since then, which is
not that impressive but still much more than what I'd have thought!
That's probably because I wasn't the only one
to note that it was simply *not possible* to plot huge datasets in
Python.
[Matplotlib](http://matplotlib.org), 
probably the most popular plotting library in Python,
crashes before displaying a multi-million dataset (at least that's what I could
experience on my machine), or when it works, the navigation is severly limited
by an extremely low framerate. 

All other plotting libraries I could find had the same issue.
The Matlab plotting library appears to be a bit more efficient than
matplotlib when it comes to multi-millions datasets, and it may be one of the
reasons why many people still prefer to use Matlab rather than Python.

I think many people are doing just fine with matplotlib because they simply 
don't work with very large datasets. But that may be going to change, with
"*[big data](http://en.wikipedia.org/wiki/Big_data)*"
becoming a more and more popular *buzz word*.
In bioinformatics, the mass of data becoming available is simply crazy.
There's the whole field of bioimaging of course, but even apparently harmless
time-dependent signals can become quite large.
Imagine, for example, a
neurophysiological recording with an extracellular 
[multi-electrode array](http://en.wikipedia.org/wiki/Multielectrode_array) with
250 channels,
each channel sampling a signal at 16 bits and 20 kHz (this is close to a real
example). That's 10 MB of data *per second* (5 million points),
more than 30 GB per hour (18 billion points) !
A modern hard drive can store that, but processing such a big file is simply
not straightforward: it even doesn't fit in system memory (at least on
most today's computers), and even less in graphics memory. Yet, is it too much
to ask to just plot these data?

The typical way of processing this is to take chunks of data, either in space
or in time. But when it comes to visualization, it's hardly possible to 
plot even *a single second* across all channels, since that's already 5
million points!

One could argue that a modern screen does not contain much more than 2 million
pixels, and about 2000 only horizontally. But the whole point of interactive
navigation (zooming and panning) is to be able to plot the whole signal at
first, and zoom-in in real time on regions of interest.

I could not find any Python library that would allow me to do that. Outside
Python, I am not aware of such a software either. That's precisely why I 
decided to try a new approach, which is to use the graphics card for
the whole rendering process in the most efficient possible way. I realized that
the only way I could achieve the highest performance possible on a given
piece of hardware was to
go as low-level as I could with Python. Using a great and light Python wrapper
around
[OpenGL](http://en.wikipedia.org/wiki/OpenGL) 
(not unexpectingly called 
[PyOpenGL](http://pyopengl.sourceforge.net)) seemed like a natural choice.
Initial proof-of-concept experiments with PyOpenGL suggested that it appeared
to be like a viable method.

That's how Galry was born earlier this year.


Here come shaders
-----------------

The library has evolved a lot since then. I had to go through multiple 
improvements and refactoring sessions as I was using Galry for my research
project. In addition, I also had to learn OpenGL in parallel. That was not
an excellent idea, since I realized several times that I was doing it wrong.
In particular, I was using at first a totally obsolete way of rendering points,
which
was to use the 
[fixed function pipeline](http://en.wikipedia.org/wiki/Shader). 
When I discovered that
[the modern
way of using OpenGL was to use customizable shaders](http://cyrille.rossant.net/shaders-opengl/)
, I had to go through
a consequent rewriting of the whole rendering engine. I could have spared
me this rewriting if I was aware of that point beforehand.

But it was in the end a very good decision, since programmable shaders are just
infinitely more powerful than the fixed function pipeline, and make 
a whole new bunch of things possible with the package. Not only was I able
to considerably improve the rendering part in my research project, but I 
realized that the same code could be used to do much more than just
plotting. Here are a few examples of what I was able to do with the new
"shader-aware"
interface: GPU-based image filtering, GPU-based particle system, GPU-based
fractal viewer, 3D rendering, dynamic graph rendering (CPU-based for now), etc.
These are all actual working examples in the Galry repository. I suppose this
package could also be used to write small video games!

The following video shows a demo of the graph example. This example
incorporates many of the rendering techniques currently implemented in Galry:
point sprites (a single texture attached to many points), lines,
buffer references (the nodes and edges are rendered using the exact same
memory buffer on the GPU, which contains the node positions),
indexed rendering (the edges are
rendered using indices targetting the corresponding nodes, always stored in
the same buffer),
real-time buffer updating (the positions are updated on the CPU and
transferred on the GPU at every frame). GPU-based rendering may also be 
possible but it's not straightforward, since the shaders need to access
the other shaders' information, and also modify dynamically the 
position. I might investigate this some time. Another solution is to use
[OpenCL](http://en.wikipedia.org/wiki/OpenCL), 
but it requires to have an OpenCL installation (it can work even if
[an OpenCL-capable GPU is not available, in which case the OpenCL kernels
are executed on the CPU](cyrille.rossant.net/pyopencl-on-windows-without-a-gpu/)).

<embed src="http://www.youtube.com/v/MLW3i-_yQ-k" />


About OpenGL
------------

Another thing I discovered a bit late was that OpenGL is a fragmented library:
there are multiple versions, a lot of different extensions, some being
specific to a hardware vendor, and a lot of deprecated features. 
There's also a specific version of OpenGL for mobile platforms (such as the
IPhone and the IPad), called
[OpenGL ES](http://en.wikipedia.org/wiki/OpenGL_ES), which is based on OpenGL but which
is still different. In particular, a lot of deprecated features in OpenGL are
simply unavailable in OpenGL ES. Also, the 
[shading language (GLSL)](http://en.wikipedia.org/wiki/GLSL) is not the
same between OpenGL and OpenGL ES. There's a loose correspondence between the
two but the
version numbers do not match at all. And, by the way, the GLSL language version
does not match the corresponding OpenGL version... except for later versions!
Really confusing.

The OpenGL ES story is important for Galry, because apparently OpenGL ES
is sometimes used in
[VirtualBox](http://en.wikipedia.org/wiki/VirtualBox) 
for hardware-acceleration, and it might also be
useful
in the future for a potential mobile version of Galry. In addition, OpenGL ES
also forms the basis of 
[WebGL](http://en.wikipedia.org/wiki/WebGL), enabling access to OpenGL in the browser. 
I'll talk about that below, but the point is that in order to have
compatibility between multiple versions of OpenGL, I had to redesign again an
important part of the rendering process (by using a small template system for
dynamic shader code generation depending on the GLSL version).

Also, whereas the shading language is quite nice and easy to use, I find the
host OpenGL API unintuitive and sometimes obscure. The Galry programming
interface is right there to hide those details to the developer.

In brief, I find certain aspects of OpenGL a bit messy, but the advantages and
the power of the library are definitely worth it.


About writing multi-platform software
-------------------------------------

Python is great for multi-platform software. Choosing Python for a new project
means that one has the best chance of having a single code base for all
operating systems out there. In theory, that's the same story for OpenGL, 
since it's a widely used open standard. In practice, it's much more difficult
due to the fragmentation of the OpenGL versions and drivers across different
systems and graphics card manufacturers. Writing a multi-platform system means
that all supported systems need to be tested, and that's not particularly easy
to do in practice: there are a large number of combinations of systems
(Windows, different Linux distributions, Mac OSX, either 32 bits
and 64 bits), of graphics card drivers, versions of Python/PyOpenGL/Qt, etc.


High-level interface
--------------------

In the current experimental version of Galry, the low-level API is the
only interface I've been working on, since it's really what I need for my
project. However, I do plan to write a basic matplotlib-like high-level
interface in the near future.
At some point, I even considered integrating Galry's code into
a matplotlib GL backend, which is apparently something that several people 
[have
been trying to do for quite some time](http://code.google.com/p/glumpy/). 
However, as far as I understand, this
is very much non-trivial due to the internal architecture of matplotlib. The 
backend handles the rendering process and is asked to redraw everything at
each frame during interactive navigation. However, high performance is
achieved in Galry by loading data at initialization time only, and updating
the transformation at every frame so that the GPU can apply it on the data.
The backend does not appear to have access to that transformation, so I can't
see how an efficient GL renderer could be written in the current architecture.
But I'm pretty sure that somebody will manage to make that happen eventually.

In the meantime, I will probably write a high-level interface from scratch,
without using matplotlib at all. The goal is to replace
`import matplotlib.pyplot as plt` by something like `import galry.plot as plt`
at the top of a script to use Galry instead of matplotlib. At first, I'll
probably only implement the most common functions such as
`plot`, `imshow`, etc. That would already be very useful.


Galry in the browser
--------------------

[Fernando Perez](http://fperez.org/), the author of 
[IPython](http://ipython.org), suggested to integrate Galry in the
[IPython notebook](http://ipython.org/ipython-doc/dev/interactive/htmlnotebook.html).
The notebook is a relatively new feature that allows to
write (I)Python code in *cells* within an HTML page, and output the result
below. That's quite similar to what Mathematica or Maple offer. The whole
interactive session
can then be saved as a
[JSON](http://en.wikipedia.org/wiki/JSON) file. It brings reproducibility and
coherent structure in interactive computing. Headers, text, and even
static images with matplotlib can be integrated in a notebook. Blog posts, 
courses, even technical books are being written with this.

I personally heard about the notebook some time ago, but I'd never tried it
because
I was a bit reluctant to use Python in a *browser* instead of a console. After
Fernando's suggestion, I tried to use the notebook and I quickly understood why
so many people
are very enthusiastic about it. It's because it changes the very way we do
exploratory research with numerical experiments. In a classical workflow, one
would use a Python script to write some computational process, and use
the interactive console to execute it, explore the model in the parameter
space, etc. It works, but it can be terrible for reproducibility: there's
no way one can recover the exact set of parameters and code that corresponds
to figure `test34_old_newnewbis.png`. Many people are dealing with this 
problem, me included. I'm quite ashamed by the file structure of most of
my past research projects' code, and I'll try to use the notebook in the future
to try being more organized than before.

The idea of integrating Galry in the notebook comes from the 
[work that has
been done during a Python conference earlier this month](http://blog.fperez.org/2012/11/back-from-pycon-canada-2012.html), with the integration
of a 3D molecular visualization toolkit in the notebook using WebGL. WebGL
is a standard specification derived from OpenGL that aims at bringing OpenGL
rendering to
the browser, through the HTML5 `<canvas>` element. It is still an ongoing
project that may still take months or years to complete. Currently, it is only
supported by the latest versions of modern browsers such as Chrome or Firefox
(no IE of course). But it's an exciting technology that has a huge
potential.

So I thought it would be quite a good idea and I gave it a try: I managed to
implement a proof-of-concept in only one day, by looking at the code that 
had been done during the conference.

<embed src="http://www.youtube.com/v/taN4TobRS-E" />

Then, I was able to see what would need to
be done in the code's architecture to make that integration smooth and
flexible. The solution I chose was to separate completely the scene definition
(what to plot exactly, with all parameters, data, colors, shading code, etc.)
with the actual GL rendering code. The scene can be serialized in JSON and
transmitted to a Javascript/WebGL renderer. I had to rewrite a portion of the
Python renderer in Javascript, which turned out to be less painful than what 
I thought.

Finally, the WebGL renderer can in fact be used as a completely standalone
Javascript library, without any reference to Python. This may allow
interesting scenarios, such as the conversion of a plotting script in 
Python using a matplotlib-like high-level interface, 
into standalone HTML/Javascript code that enables interactive visualization of
that plot in the browser.


About performance
-----------------

The major objective of Galry is, by far, performance. I found that PyOpenGL can
be very fast at the important condition of using it correctly. In particular,
data transfer from system memory to graphics memory should be made only when
necessary. Also,
the number of calls to OpenGL commands should be minimal in the rendering
phase.

The first point means that data should be uploaded on the GPU at initialization
time, and should stay on the GPU as long as possible. When zooming in, the GPU
should handle the whole transformation on the same memory buffer. This ensures
that the GPU is used optimally. In Matplotlib, as far as I know, everything
is rendered again at each frame, which explains why the performance is not
very good. And the CPU does the rendering in this case, not the GPU.

The second point is also crucial. When plotting a large number of individual
points, or a single curve, it is possible to call a single OpenGL rendering
command, so that the Python overhead is negligible compared to the actual
GPU rendering phase. But when it comes to a plot containing a large number of 
individual curves, using a Python loop is highly inefficient, especially when
every call renders a small curve. The best solution I could find is to use
[*glMultiDrawArrays*](http://www.opengl.org/sdk/docs/man/xhtml/glMultiDrawArrays.xml) 
or
[*glMultiDrawElements*](http://www.opengl.org/sdk/docs/man/xhtml/glMultiDrawElements.xml), 
which render several primitives
with a single memory buffer and a single command. Even if this function is
implemented internally as a loop by the driver, it will still be much faster
than a Python loop, since there isn't the cost of interpretation.

With this technique, I am able to plot 100 curves with 1 million points each
at ~15 FPS with a recent graphics card. That's 1.5 *billion* points per second!
Such performance is directly related to the incredible power of modern GPUs,
which is literally mind blowing.

Yet, I think there's still some room for improvement by using dynamic 
undersampling techniques. But that is for the future...

