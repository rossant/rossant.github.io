Title: The Power of Shaders in Real-Time Graphics Programming
Tags: gpu, dataviz

I've been programming in
[OpenGL](http://en.wikipedia.org/wiki/OpenGL)
for a few months. Like a lot of programmers,
I learnt the language by myself, thanks to various tutorials, books or e-books
on the subject. One couldn't say there's a lack of resources on this
20-years old language since it's so widely used throughout the world. Yet,
I was surprised to discover a few weeks ago that the **vast majority of what
I learnt has been obsolete for almost a decade**. The reason is that too many
textbooks and tutorials on the Internet about OpenGL refer to a deprecated
way of programming and which relates to the **fixed-function pipeline**.
The modern way of programming in OpenGL is to use the **programmable pipeline
through shaders**. The
[free e-book](http://www.arcsynthesis.org/gltut/) by
Jason McKesson is a very good
resource for learning modern OpenGL programming using the programmable
pipeline.

<!-- PELICAN_END_SUMMARY -->

The graphics pipeline
---------------------

I'll try to explain what this is all about in simple terms, assuming no
prior knowledge in graphics programming. Since graphics cards exist, the way
rendering is done in a computer can be seen as a
[pipeline](http://en.wikipedia.org/wiki/Graphics_pipeline).
At the top, there's
data that enters in the graphics card memory. At the bottom, there's the pixels
on the screen. The role of the graphics card is, and has always been, to
transform the data into pixels. The reason why this is complicated is that
most of the time, the graphics card needs to render 3D data on a 2D screen.
Indeed, graphics cards have been created primarily to allow real-time
rendering in 3D video games. So, first, the 3D data describing the game
world and characters enter into the graphics card memory.
Then, the graphics card transforms the data into a 2D scene that corresponds
to the projection of the world onto a virtual camera. In a first-person game,
like an FPS for instance, this camera corresponds to the eye of the main
character.

[Projecting a 3D world to a 2D camera](http://en.wikipedia.org/wiki/3D_projection)
is not mathematically complicated,
and only involves basic linear algebra. However, it can be expensive in terms
of computing power, since the number of mathematical operations to perform
at every frame increases with the scene complexity. More details in the game
implies a higher number of points, therefore a higher number of operations.
Those operations constitute a highly parallel problem, since in general, the
same mathematical operation is performed on all points (for instance,
when the camera moves, the same linear transformation is applied on all
points). The power of graphics cards comes precisely from their highly parallel
architecture which lets them compute this kind of linear transformation
in a very efficient way.

So, coming back to the rendering pipeline, the transformation of the data
involves **linear transformations** to get the 2D positions of the points on the
camera, then
[**rasterization**](http://en.wikipedia.org/wiki/Rasterization)
to transform primitives (made up by vertices) into
colored pixels. In addition, an important aspect of 3D rendering has to do with
**lighting**,
which plays an essential role in the realistic aspect of the scene. Real-time
realistic lighting is a complicated subject. There's also the issue of
textures, reflections, etc.
So over the years, graphics cards
programming has become increasingly complicated in order to account for more
and more complex and realistic rendering algorithms.

The advent of programmable shaders
----------------------------------

Then, an alternative approach has been to bring flexibility in this pipeline
process, by giving the programmer the possibility to customize this
rendering pipeline. Instead of having fixed, hard-coded rendering algorithms,
the programmer had the possibility to write small programs in a low-level
language called a
[**shading language**](http://en.wikipedia.org/wiki/Shader).
A shader program is executed
independently and in parallel over all vertices or pixels, and transforms
them in order to implement custom rendering algorithms. This new technique
has allowed for real-time special effects that would not have been possible
before.

Several types of shaders exist, the most common ones are the vertex shader and
the fragment shader. The **vertex shader is executed once per vertex** and can
transform its position. Applications include any special effect that requires
independent transformation of vertices that would not be possible globally
(e.g. cloth simulation, hair movements, morphing, particle system rendering,
special lighting effects, etc.).

The **fragment shader is executed once per pixel** and can transform its
final color. Applications include everything related to textures, lighting,
reflections, etc.

**Shaders are extremely powerful, for they give the programmer
full control of the graphics card to make them do what they do best:
real-time rendering**. The deep reason why they are so powerful is that shaders
execute on the GPU in a fully parallel way, so they exploit the
[parallel architecture of graphics card](http://en.wikipedia.org/wiki/Graphics_processing_unit)
in the most efficient possible way. The hundreds
or thousands of cores all execute simultaneously the same little programs
that transform the megabytes or gigabytes of data stored in GPU memory into
millions of pixels on the screen. And the precise algorithms are up to the
programmer rather than the graphics card manufacturer.

In the early times of programmable pipeline rendering, shaders were written
in an assembly language, making them highly difficult to write, design, read,
and debug. Then, more readable languages have been designed, such as
[GLSL](http://en.wikipedia.org/wiki/GLSL) (OpenGL),
[HLSL](http://en.wikipedia.org/wiki/HLSL) (DirectX),
or
[Cg](http://en.wikipedia.org/wiki/Cg_(programming_language)) (Nvidia).
These languages look very much like C, even if they target
very different architectures than those of typical central processing units.
The simple and widespread syntax has made shader programming a potential
reality for most graphics programmers.

Today, shaders are widely used in virtually all 3D video games. Yet, very few
OpenGL resources address them. Instead, tutorials and lessons explain how
to use the fixed-function pipeline to perform transform and lighting on the
GPU, without precising that this way of doing has been obsolete for nearly 10
years! Now, even old graphics cards fully support programmable shaders,
so I can't see good reasons not to use them. They are just so powerful,
easy to program and they allow for a thorough understanding of how modern
graphics cards work, and how to use their extreme computational power to their
full extent.


Concrete example of shaders in OpenGL
-------------------------------------

I will now give an example of using shaders in PyOpenGL, by
extending
[my previous tutorial on PyOpenGL](cyrille.rossant.net/2d-graphics-rendering-tutorial-with-pyopengl/).
In OpenGL, shaders are
written in
[GLSL](http://en.wikipedia.org/wiki/GLSL).
Several versions of GLSL exist, and the version supported
by the GPU depends on the version of OpenGL implemented in the graphics
card drivers. I will assume that OpenGL 3.30 is supported.

First, when using shaders, it may be a good idea to get rid of all code related
to the fixed-function pipeline. It is now completely deprecated, yet almost
all tutorials do not mention that. For example, here is a non-exhaustive list
of deprecated OpenGL functions:

    :::text
    glColorPointer, glVertexPointer, glEnableClientState, glLoadIdentity,
    glLoadMatrix, glMultMatrix, glOrtho*, glPopMatrix, glRotate*, glScale*,
    glTranslate*, glMaterial*, glLight*...

The details can be found in
[the official specifications](http://www.opengl.org/registry/).
It means that all functions related to transformations, lighting, texturing,
etc. are deprecated and should rather be implemented in vertex and fragment
shaders. Concerning matrix transformations, it means that matrices
need to be passed to the vertex shader through
[uniform variables](http://www.opengl.org/wiki/Uniform_(GLSL)), and then
be explicitely multiplied to the position vector (which are attribute
variables). Similarly for lighting and texturing.


### Example description

In this simple example, a null sampled function ($x \in [-1, 1], y = 0$) is
loaded on the GPU as an attribute variable named `position`. An
[attribute variable](http://www.opengl.org/wiki/Type_Qualifier_(GLSL))
is an array of scalars or vectors (of dimension 2, 3 or 4) that
is loaded on the GPU as a
[vertex buffer object](http://www.opengl.org/wiki/Vertex_Buffer_Object#Vertex_Buffer_Object).
It has a name, a type
and a location. The location is an integer that should be unique within
a shader program. Here, `position` is an attribute of type vec2 and location 0.
It contains the coordinates of the vertices. There are $N$ vertices, so
$N$ vectors with vertex coordinates, and $N$ executions of the vertex shader.
Each thread takes one vec2 position as an input, and returns the final
position in the special variable `gl_Position`. If linear transformations
need to be applied, one needs to multiply matrices with `position` and assign
the result to `gl_Position`.


### Vertex shader

Here is the source code of the vertex shader in this example.

    :::python
    # Vertex shader.
    VS = """
    #version 330
    // Attribute variable that contains coordinates of the vertices.
    layout(location = 0) in vec2 position;

    // Main function, which needs to set `gl_Position`.
    void main()
    {
        // The final position is transformed from a null signal to a sinewave here.
        // We pass the position to gl_Position, by converting it into
        // a 4D vector. The last coordinate should be 0 when rendering 2D figures.
        gl_Position = vec4(position.x, .2 * sin(20 * position.x), 0., 1.);
    }
    """

The code should be self-explanatory. The x coordinate of the position is
used to calculate the y coordinate (through a sinus function). We don't use
the y coordinate at all, so we could also have used an array of floats for
the position. The special variable
[`gl_Position`](http://www.opengl.org/sdk/docs/manglsl/xhtml/gl_Position.xml)
has four components,
the third is the third dimension (not used here since we render a 2D scene),
the latest is the fourth, homogeneous coordinate, that is not relevant in
2D rendering and should be fixed to 1.


### Fragment shader

The fragment shader is executed once per primitive pixel. It takes possible
vertex shader outputs as inputs (none here) and returns the pixel color
as an output. The output color needs to be explicitely declared.
Usage of the special `gl_FragColor` keyword is now deprecated, such as
a lot of other `gl_*` variables in GLSL.

    :::python
    # Fragment shader
    FS = """
    #version 330
    // Output variable of the fragment shader, which is a 4D vector containing the
    // RGBA components of the pixel color.
    out vec4 out_color;

    // Main fragment shader function.
    void main()
    {
        // We simply set the pixel color to yellow.
        out_color = vec4(1., 1., 0., 1.);
    }
    """

Once again, the code should be clear enough. The `out_color` variable contains
the red, green, blue and alpha components of the pixel final color. The
components are between 0 and 1. The alpha component is the transparency:
0 for completely transparent, 1 for completely opaque.


### Compiling a shader

Once shader codes have been defined, shaders need to be compiled.
Here is a small Python function for compiling a vertex shader.

    :::python
    import OpenGL.GL as gl
    def compile_vertex_shader(source):
        """Compile a vertex shader from source."""
        vertex_shader = gl.glCreateShader(gl.GL_VERTEX_SHADER)
        gl.glShaderSource(vertex_shader, source)
        gl.glCompileShader(vertex_shader)
        # check compilation error
        result = gl.glGetShaderiv(vertex_shader, gl.GL_COMPILE_STATUS)
        if not(result):
            raise RuntimeError(gl.glGetShaderInfoLog(vertex_shader))
        return vertex_shader

Compilation involves the creation of a shader, the load of the source code,
and finally the compilation. Then, we check that no error happened during
the compilation, or we print the compilation error. This last step
is critical when debugging a PyOpenGL program using shaders, because otherwise
there is no way to know why the compilation failed.

The function for compiling a fragment shader is pretty much the same (see the
full script at the end for the details).


### Attaching shaders to a program

Once the vertex and fragment shaders have been compiled, they need to be
attached to a program, the latter being then linked.

    :::python
    def link_shader_program(vertex_shader, fragment_shader):
        """Create a shader program with from compiled shaders."""
        program = gl.glCreateProgram()
        gl.glAttachShader(program, vertex_shader)
        gl.glAttachShader(program, fragment_shader)
        gl.glLinkProgram(program)
        # check linking error
        result = gl.glGetProgramiv(program, gl.GL_LINK_STATUS)
        if not(result):
            raise RuntimeError(gl.glGetProgramInfoLog(program))
        return program

We first create a program, then we attach the compiled shaders, and finally
we link the program. We also check that the linking was successful.


### Using shaders

Finally, here is how to use shaders during the rendering process.

    :::python
    def paintGL(self):
        # vertices located in the buffer in position 0 contain 2 single
        # precision floating points as coordinates
        gl.glEnableVertexAttribArray(0)
        gl.glVertexAttribPointer(0, 2, gl.GL_FLOAT, gl.GL_FALSE, 0, None)
        # we use the compiled program
        gl.glUseProgram(program)
        # draw "count" points from the VBO
        gl.glDrawArrays(gl.GL_LINE_STRIP, 0, len(self.data))

We activate the buffers that need to pass data to the vertex shader,
then we use the program before calling the OpenGL rendering commands.


### Full script

Finally, here is the full Python script that displays a sinewave function
using shaders. PyQt4 or PySide and PyOpenGL are necessary. If you use PySide,
you should simply replace `PyQt4` by `PySide` in the imports. The
`create_window` function has already been explained
[in a previous post](cyrille.rossant.net/making-pyqt4-pyside-and-ipython-work-together/).

    :::python
    # PyQt4 imports
    from PyQt4 import QtGui, QtCore, QtOpenGL
    from PyQt4.QtOpenGL import QGLWidget
    # PyOpenGL imports
    import OpenGL.GL as gl
    import OpenGL.arrays.vbo as glvbo

    # Window creation function.
    def create_window(window_class):
        """Create a Qt window in Python, or interactively in IPython with Qt GUI
        event loop integration:
            # in ~/.ipython/ipython_config.py
            c.TerminalIPythonApp.gui = 'qt'
            c.TerminalIPythonApp.pylab = 'qt'
        See also:
            http://ipython.org/ipython-doc/dev/interactive/qtconsole.html#qt-and-the-qtconsole
        """
        app_created = False
        app = QtCore.QCoreApplication.instance()
        if app is None:
            app = QtGui.QApplication(sys.argv)
            app_created = True
        app.references = set()
        window = window_class()
        app.references.add(window)
        window.show()
        if app_created:
            app.exec_()
        return window

    def compile_vertex_shader(source):
        """Compile a vertex shader from source."""
        vertex_shader = gl.glCreateShader(gl.GL_VERTEX_SHADER)
        gl.glShaderSource(vertex_shader, source)
        gl.glCompileShader(vertex_shader)
        # check compilation error
        result = gl.glGetShaderiv(vertex_shader, gl.GL_COMPILE_STATUS)
        if not(result):
            raise RuntimeError(gl.glGetShaderInfoLog(vertex_shader))
        return vertex_shader

    def compile_fragment_shader(source):
        """Compile a fragment shader from source."""
        fragment_shader = gl.glCreateShader(gl.GL_FRAGMENT_SHADER)
        gl.glShaderSource(fragment_shader, source)
        gl.glCompileShader(fragment_shader)
        # check compilation error
        result = gl.glGetShaderiv(fragment_shader, gl.GL_COMPILE_STATUS)
        if not(result):
            raise RuntimeError(gl.glGetShaderInfoLog(fragment_shader))
        return fragment_shader

    def link_shader_program(vertex_shader, fragment_shader):
        """Create a shader program with from compiled shaders."""
        program = gl.glCreateProgram()
        gl.glAttachShader(program, vertex_shader)
        gl.glAttachShader(program, fragment_shader)
        gl.glLinkProgram(program)
        # check linking error
        result = gl.glGetProgramiv(program, gl.GL_LINK_STATUS)
        if not(result):
            raise RuntimeError(gl.glGetProgramInfoLog(program))
        return program

    # Vertex shader
    VS = """
    #version 330
    // Attribute variable that contains coordinates of the vertices.
    layout(location = 0) in vec2 position;

    // Main function, which needs to set `gl_Position`.
    void main()
    {
        // The final position is transformed from a null signal to a sinewave here.
        // We pass the position to gl_Position, by converting it into
        // a 4D vector. The last coordinate should be 0 when rendering 2D figures.
        gl_Position = vec4(position.x, .2 * sin(20 * position.x), 0., 1.);
    }
    """

    # Fragment shader
    FS = """
    #version 330
    // Output variable of the fragment shader, which is a 4D vector containing the
    // RGBA components of the pixel color.
    out vec4 out_color;

    // Main fragment shader function.
    void main()
    {
        // We simply set the pixel color to yellow.
        out_color = vec4(1., 1., 0., 1.);
    }
    """

    class GLPlotWidget(QGLWidget):
        # default window size
        width, height = 600, 600

        def initializeGL(self):
            """Initialize OpenGL, VBOs, upload data on the GPU, etc."""
            # background color
            gl.glClearColor(0, 0, 0, 0)
            # create a Vertex Buffer Object with the specified data
            self.vbo = glvbo.VBO(self.data)
            # compile the vertex shader
            vs = compile_vertex_shader(VS)
            # compile the fragment shader
            fs = compile_fragment_shader(FS)
            # compile the vertex shader
            self.shaders_program = link_shader_program(vs, fs)

        def paintGL(self):
            """Paint the scene."""
            # clear the buffer
            gl.glClear(gl.GL_COLOR_BUFFER_BIT)
            # bind the VBO
            self.vbo.bind()
            # tell OpenGL that the VBO contains an array of vertices
            # prepare the shader
            gl.glEnableVertexAttribArray(0)
            # these vertices contain 2 single precision coordinates
            gl.glVertexAttribPointer(0, 2, gl.GL_FLOAT, gl.GL_FALSE, 0, None)
            gl.glUseProgram(self.shaders_program)
            # draw "count" points from the VBO
            gl.glDrawArrays(gl.GL_LINE_STRIP, 0, len(self.data))

        def resizeGL(self, width, height):
            """Called upon window resizing: reinitialize the viewport."""
            # update the window size
            self.width, self.height = width, height
            # paint within the whole window
            gl.glViewport(0, 0, width, height)

    if __name__ == '__main__':
        # import numpy for generating random data points
        import sys
        import numpy as np

        # null signal
        data = np.zeros((10000, 2), dtype=np.float32)
        data[:,0] = np.linspace(-1., 1., len(data))

        # define a Qt window with an OpenGL widget inside it
        class TestWindow(QtGui.QMainWindow):
            def __init__(self):
                super(TestWindow, self).__init__()
                # initialize the GL widget
                self.widget = GLPlotWidget()
                self.widget.data = data
                # put the window at the screen position (100, 100)
                self.setGeometry(100, 100, self.widget.width, self.widget.height)
                self.setCentralWidget(self.widget)
                self.show()

        # show the window
        win = create_window(TestWindow)


There is of course much more to say about shaders that what this deceptively
simple example has shown: how to implement linear transformations,
lighting, textures, etc.
[This free ebook](http://www.arcsynthesis.org/gltut/) is an excellent
resource for modern OpenGL programming, since it directly addresses the
programmable pipeline instead of the deprecated fixed-function pipeline.
The latter remains supported only for the sake of backwards compatibility,
and should not be used at all.
