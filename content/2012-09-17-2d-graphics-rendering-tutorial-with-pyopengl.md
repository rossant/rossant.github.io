Title: 2D graphics rendering tutorial with PyOpenGL
Tags: python, gpu, dataviz

**UPDATE**: you may be interested in the [Vispy](http://vispy.org/) library, which provides easier and more Pythonic access to OpenGL.

[OpenGL](http://en.wikipedia.org/wiki/OpenGL) is a widely used open and cross-platform library for real-time 3D graphics, developed more than twenty years ago. It provides a low-level API that allows the developer to access the graphics hardware in an uniform way. It is the platform of choice when developing complex 2D or 3D applications that require hardware acceleration and that need to work on different platforms. It can be used in a number of languages including C/C++, C#, Java, Objective-C (used in iPhone and iPad games), Python, etc. In this article, I'll show how OpenGL can be used with Python (thanks to the [PyOpenGL library](http://pyopengl.sourceforge.net/documentation/index.html)) to efficiently render 2D graphics.

<!-- PELICAN_END_SUMMARY -->

Installation
------------

One needs Python with the
[Numpy](http://numpy.scipy.org/),
[PyOpenGL](http://pyopengl.sourceforge.net/documentation/index.html), and
[PyQt4](http://www.riverbankcomputing.co.uk/software/pyqt/intro) libraries. On
Windows, binary installers can be found
[on this webpage](http://www.lfd.uci.edu/~gohlke/pythonlibs/).

In addition, the most
recent drivers of the system graphics cards are needed, so that the latest
implementation of OpenGL is available. In particular, we'll make use of
[vertex buffer objects (VBOs)](http://en.wikipedia.org/wiki/Vertex_Buffer_Object),
that are available in the core implementation
starting from OpenGL version 1.5 (which appeared in 2003). Graphics cards that
were shipped after this date should have drivers that support VBOs. However,
it is possible that the drivers installed on the system do not support a
recent version of OpenGL.

For instance, on Windows, I had some issues with the default drivers of a 2009
graphics cards: OpenGL 1.1 was the only supported version. The reason is that
Windows (starting from Vista) can use a sort of generic driver based on the
[Windows Display Driver Model (WDDM)](http://en.wikipedia.org/wiki/Windows_Display_Driver_Model)
when the constructor drivers are not found
or not available. Now, the WDDM drivers tend to privilege
[DirectX](http://en.wikipedia.org/wiki/DirectX) (Microsoft's
own graphics library, concurrent to OpenGL) rather than OpenGL, such that only
very old versions of OpenGL are supported on those drivers. In order to make
things work, one needs to find the constructor drivers and force their
installation. It can be a bit painful.

In brief, if you have an error message mentioning OpenGL and buffer objects when
running the script below, ensure that the graphics card drivers are the right
ones. An extremely useful tool to check the OpenGL capabilities of the
graphics card is
[OpenGL Extensions Viewer](http://www.realtech-vr.com/glview/). It works on
Windows, Linux, and iOS.

QGLWidget
---------

We'll define a
[Qt](http://en.wikipedia.org/wiki/Qt_(framework))
widget that displays points at random positions in the window.
This widget will derive from
[`QGLWidget`](http://doc.qt.nokia.com/4.7-snapshot/qglwidget.html),
a Qt widget that offers access to
the OpenGL API for rendering. Three methods at least need to be overriden
in the derived class: `initializeGL()`, `updateGL()`, and `resizeGL(w, h)`.

*   `initializeGL()`: make here calls to OpenGL initialization commands. It is
    also the place for creating vertex buffer objects and populating them with
    some data.

*   `paintGL()`: make here calls to OpenGL rendering commands. It is called
    whenever the window needs to be redrawn.

*   `resizeGL(w, h)`: make here calls related to camera and viewport. It is
    called whenever the size of the widget is changed (the new widget size are
    passed as parameters to this method).

Vertex Buffer Objects
---------------------

The most efficient way of rendering data is to minimize the data
transfers from system memory to GPU memory, and to minimize the number of calls
to OpenGL rendering commands. A convenient way for doing this is to use
[Vertex Buffer Objects](http://en.wikipedia.org/wiki/Vertex_Buffer_Object).
They allow to allocate memory on the GPU, load data on the GPU
once (or several times if the data changes), and render it
efficiently since the data stays on the GPU between consecutives calls to
`paintGL()`. PyOpenGL integrates a module to easily create and use VBOs:

    :::python
    import OpenGL.arrays.vbo as glvbo
    # in initializeGL:
    # create a VBO, data is a Nx2 Numpy array
    self.vbo = glvbo.VBO(self.data)

    # in paintGL:
    # bind a VBO, i.e. tell OpenGL we're going to use it for subsequent
    # rendering commands
    self.vbo.bind()

Painting with VBOs
------------------

OpenGL can render primitives like points, lines, and convex polygons.
The
[`glEnableClientState`](http://www.opengl.org/sdk/docs/man/xhtml/glEnableClientState.xml)
and
[`glVertexPointer`](http://www.opengl.org/sdk/docs/man/xhtml/glVertexPointer.xml)
functions configure the VBO
for rendering, and the
[`glDrawArrays`](http://www.opengl.org/sdk/docs/man/xhtml/glDrawArrays.xml)
function draws primitives from the
buffer stored in GPU memory. Other drawing commands that can be used with
a VBO include
[`glMultiDrawArrays`](http://www.opengl.org/sdk/docs/man/xhtml/glMultiDrawArrays.xml)
for plotting several independent primitives
from a single VBO (which is more efficient, but less flexible, than using
several VBOs). Indexed drawing is also possible and allows to use vertices
in arbitrary order, and to reuse vertices several times during rendering.
The relevant functions are
[`glDrawElements`](http://www.opengl.org/sdk/docs/man/xhtml/glDrawElements.xml) and
[`glMultiDrawElements`](http://www.opengl.org/sdk/docs/man/xhtml/glMultiDrawElements.xml).

Color can be specified either before calling the rendering commands, with
the function
[`glColor`](http://www.opengl.org/sdk/docs/man/xhtml/glColor.xml),
or by creating a special VBO for colors, containing
the colors of every point. The relevant functions are
[`glColorPointer`](http://www.opengl.org/sdk/docs/man/xhtml/glColorPointer.xml)
and `glEnableClientState(GL_COLOR_ARRAY)`. A variant consists in packing the
colors with the vertices, i.e. having 5 numbers per point in a single VBO
(x, y coordinates and R, V, B color components).
[See some details here](http://pyopengl.sourceforge.net/context/tutorials/shader_2.xhtml).

**Note**: apparently, in OpenGL, using
[single precision floating point numbers](http://en.wikipedia.org/wiki/Single-precision_floating-point_format)
is better than using
[double precision float point numbers](http://en.wikipedia.org/wiki/Double-precision_floating-point_format).
The graphics card may not indeed support the latter format. I used doubles in
an early version of this post and I had some nasty memory access violation
crashes in particular cases. They disappeared when I switched to floats. If
this is helpful to anyone...

    :::python
    # in paintGL:
    # set the color yellow
    gl.glColor(1,1,0)
    # enable the VBO
    gl.glEnableClientState(gl.GL_VERTEX_ARRAY)
    # tell OpenGL that each vertex is made of 2 single precision floating
    # numbers (x and y coordinates).
    gl.glVertexPointer(2, gl.GL_FLOAT, 0, self.vbo)
    # draw all points from the VBO
    gl.glDrawArrays(gl.GL_POINTS, 0, len(self.data))

Setting orthographic projection for 2D rendering
------------------------------------------------

The `resizeGL` method sets the geometric projection used for
[rasterization](http://en.wikipedia.org/wiki/Rasterisation).
Since we're only interested in 2D rendering in this article, we're using
[orthographic projection](http://en.wikipedia.org/wiki/Orthographic_projection)
with the
[`glOrtho`](http://www.opengl.org/sdk/docs/man/xhtml/glOrtho.xml) function.
The
[`glViewport`](http://www.opengl.org/sdk/docs/man/xhtml/glViewport.xml)
function
allows to specify the part of the screen used for the subsequent rendering
commands. Here we just tell OpenGL to draw within the entire window.

    :::python
    # paint within the whole window
    gl.glViewport(0, 0, self.width, self.height)
    # set orthographic projection (2D only)
    gl.glMatrixMode(gl.GL_PROJECTION)
    gl.glLoadIdentity()
    # the window corner OpenGL coordinates are (-+1, -+1)
    gl.glOrtho(-1, 1, 1, -1, -1, 1)

Setting the PyQt widget
-----------------------

Here we use PyQt as a GUI window system. To show a window on the screen and
use our OpenGL widget, we first need to define a Qt main window, put the
OpenGL widget inside, and finally create a Qt application to host the main
window.

    :::python
    # define a Qt window with an OpenGL widget inside it
    class TestWindow(QtGui.QMainWindow):
        def __init__(self):
            super(TestWindow, self).__init__()
            # initialize the GL widget
            self.widget = GLPlotWidget()
            # [...] (set data for the OpenGL widget)
            # put the window at the screen position (100, 100)
            self.setGeometry(100, 100, self.widget.width, self.widget.height)
            self.setCentralWidget(self.widget)
            self.show()

    # create the Qt App and window
    app = QtGui.QApplication(sys.argv)
    window = TestWindow()
    window.show()
    app.exec_()

Full script
-----------

Here is the full script.

    :::python
    # PyQt4 imports
    from PyQt4 import QtGui, QtCore, QtOpenGL
    from PyQt4.QtOpenGL import QGLWidget
    # PyOpenGL imports
    import OpenGL.GL as gl
    import OpenGL.arrays.vbo as glvbo

    class GLPlotWidget(QGLWidget):
        # default window size
        width, height = 600, 600

        def set_data(self, data):
            """Load 2D data as a Nx2 Numpy array.
            """
            self.data = data
            self.count = data.shape[0]

        def initializeGL(self):
            """Initialize OpenGL, VBOs, upload data on the GPU, etc.
            """
            # background color
            gl.glClearColor(0,0,0,0)
            # create a Vertex Buffer Object with the specified data
            self.vbo = glvbo.VBO(self.data)

        def paintGL(self):
            """Paint the scene.
            """
            # clear the buffer
            gl.glClear(gl.GL_COLOR_BUFFER_BIT)
            # set yellow color for subsequent drawing rendering calls
            gl.glColor(1,1,0)
            # bind the VBO
            self.vbo.bind()
            # tell OpenGL that the VBO contains an array of vertices
            gl.glEnableClientState(gl.GL_VERTEX_ARRAY)
            # these vertices contain 2 single precision coordinates
            gl.glVertexPointer(2, gl.GL_FLOAT, 0, self.vbo)
            # draw "count" points from the VBO
            gl.glDrawArrays(gl.GL_POINTS, 0, self.count)

        def resizeGL(self, width, height):
            """Called upon window resizing: reinitialize the viewport.
            """
            # update the window size
            self.width, self.height = width, height
            # paint within the whole window
            gl.glViewport(0, 0, width, height)
            # set orthographic projection (2D only)
            gl.glMatrixMode(gl.GL_PROJECTION)
            gl.glLoadIdentity()
            # the window corner OpenGL coordinates are (-+1, -+1)
            gl.glOrtho(-1, 1, 1, -1, -1, 1)

    if __name__ == '__main__':
        # import numpy for generating random data points
        import sys
        import numpy as np
        import numpy.random as rdn

        # define a Qt window with an OpenGL widget inside it
        class TestWindow(QtGui.QMainWindow):
            def __init__(self):
                super(TestWindow, self).__init__()
                # generate random data points
                self.data = np.array(.2*rdn.randn(100000,2),dtype=np.float32)
                # initialize the GL widget
                self.widget = GLPlotWidget()
                self.widget.set_data(self.data)
                # put the window at the screen position (100, 100)
                self.setGeometry(100, 100, self.widget.width, self.widget.height)
                self.setCentralWidget(self.widget)
                self.show()

        # create the Qt App and window
        app = QtGui.QApplication(sys.argv)
        window = TestWindow()
        window.show()
        app.exec_()

![PyOpenGL tutorial]({filename}images/gl.png)

Final notes
-----------

Here are some related interesting links:

*   [Official PyOpenGL documentation](http://pyopengl.sourceforge.net/documentation/index.html)
*   [Official OpenGL documentation](http://www.opengl.org/sdk/docs/man/)
*   [A PyOpenGL tutorial](http://pyopengl.sourceforge.net/context/tutorials/index.xhtml)
*   [A PyQt4 tutorial](http://zetcode.com/tutorials/pyqt4/)
*   [PyOpenGL tips and tricks](http://www.siafoo.net/article/58)
*   [A PyOpenGL and PyGame tutorial](http://disruption.ca/gutil/introduction.html)
*   [Introduction to VBOs (C++)](http://www.songho.ca/opengl/gl_vbo.html)
*   [Vertex Specification Best Practices](http://www.opengl.org/wiki/Vertex_Specification_Best_Practices)

