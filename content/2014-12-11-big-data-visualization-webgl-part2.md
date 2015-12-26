Title: Big Data visualization with WebGL, part 2: VisPy
Tags: dataviz, gpu

In this post series, I'm describing the [big data visualization platform I'm currently developing with WebGL](http://collaborate.mozillascience.org/projects/hpdataVis). I'll detail in this second post the [VisPy library](http://vispy.org) which is the basis of the project.

<!-- PELICAN_END_SUMMARY -->

* [Part 1: Overview]({filename}2014-10-15-big-data-visualization-webgl-part1.md)
* Part 2: VisPy

## Birth of the project

I started to be interested in high-performance data visualization technologies three years ago. I was left unsatisfied by existing visualization libraries in Python like matplotlib. Although rich and powerful, matplotlib is slow when it comes to interactive visualization, particularly with datasets containing more than a few thousands of points. Yet, I was often dealing with digital time-dependent signals containing millions of points or more. It struck me to find out that no existing library would let me pan and zoom in a plot containing a long signal. More generally, there was no way to visualize interactively a large dataset.

Being familiar with graphics processing units (GPUs) for general-purpose computing, I started to investigate the possibility to leverage the hardware acceleration offered by these devices for interactive data visualization. I ended up releasing an experimental visualization toolkit named Galry for this purpose. With Galry, I was able to interactively explore plots containing tens to hundreds of millions of points. I've already detailed this work in previous posts ([here]({filename}2012-10-24-introducing-galry.md), [here]({filename}2012-11-05-shaders-opengl.md), [here]({filename}2012-11-30-galrys-story-or-the-quest-of-multi-million-plots.md), and [here]({filename}2013-04-04-hardware-accelerated-interactive-data-visualization-in-python.md)).

In late 2012, other developers of similar libraries and I decided to join forces to create a brand new visualization library that would scale to very big datasets. The VisPy library was born.

## What is VisPy?

[VisPy](http://vispy.org) is a scientific visualization library in Python that focuses on scalability and performance. It is based on OpenGL, an open industry-standard visualization library that can leverage the hardware acceleration of graphics processing units.

![VisPy examples]({filename}images/vispy-examples.png)

VisPy focuses on *modern* OpenGL. Whereas legacy OpenGL uses a fixed function pipeline with a limited predefined list of rendering features, modern OpenGL lets users customize all aspects of the rendering pipeline. This is done through through small programs named **shaders**. These programs are written in a low-level C-like language called GLSL. Shaders run on the GPU and benefit from the massively parallel architecture of GPUs.

A major challenge of the project is to offer visualization facilities that are simultaneously user-friendly, flexible, and efficient. The high flexibility of OpenGL should be reflected by the user API. Yet, these constraints tend to be mutually exclusive. An easy-to-use library tends to offer less possibilities than a complex one. This is particularly problematic in a visualization library, where users needs can be highly diverse.

To overcome these issues, VisPy provides several interfaces and abstraction levels that vary in terms of accessibility and flexibility. These interfaces are presented here in decreasing order of user-friendliness, and increasing order of flexibility.

* The **plot** interface will offer a high-level plotting API similar to the interfaces provided by other visualization toolkits like matplotlib, bokeh, ggplot, and others. This interface will be available in the long term; in the meantime, VisPy will offer a fast backend to these popular high-level interfaces.

* The **scene** interface lets users position graphical objects (also known as *visuals*) in 2D or 3D within a scene graph. Various cameras implementing specific interaction patterns are provided.

* **Visuals** are types of graphical objects like points, lines, polygons, meshes, graphs, images, volumes, among others. Advanced users can customize existing visuals or create brand new visuals.

* **Gloo** offers a Pythonic, object-oriented interface to OpenGL. The OpenGL API is known for its verbosity and complexity. Yet, the main concepts are relatively simple. Gloo lets users easily create GLSL shaders, bind GLSL variables to Python variables and NumPy arrays, and render OpenGL programs.

Although quite young and relatively experimental at this point, VisPy is slowly starting to mature and to get a user base. At this point, gloo is quite stable, whereas the visuals and scene interfaces are still experimental and rough around the edges. We expect to make good progress on these interfaces in early 2015.

## WebGL backend

Although VisPy is primarily meant to execute on a desktop running Python, we are also working on a WebGL backend. There are two use-cases for this backend:

* Showing interactive VisPy visualizations in the IPython/Jupyter notebook.
* Exporting interactive visualizations to a standalone HTML document.

Going forward, we would love to let users export interactive applications written with Python and VisPy into standalone web/mobile applications.

In the next post, I'll describe one of the key components of VisPy's distributed architecture.
