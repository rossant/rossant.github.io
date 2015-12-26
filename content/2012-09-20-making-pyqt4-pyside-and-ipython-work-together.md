Title: Making PyQt4, PySide and IPython work together
Tags: python

[PyQt](http://en.wikipedia.org/wiki/PyQt) and
[PySide](http://en.wikipedia.org/wiki/PySide)
are two independent Python libraries allowing access to the
[Qt framework](http://en.wikipedia.org/wiki/Qt_(framework)).
PyQt is maintained by the British firm
[Riverbank Computing](http://www.riverbankcomputing.co.uk),
whereas PySide is developed by Qt developers from
[Nokia](http://en.wikipedia.org/wiki/Nokia). PySide was created
by Nokia in 2009 after they _"failed to reach an agreement with PyQt developers
to change its licensing terms to include LGPL as an alternative license"_
([quoting Wikipedia](http://en.wikipedia.org/wiki/PySide)).
Fortunately, the two APIs are very similar (which is
not that surprising given that they are just bindings to the same Qt library).

<!-- PELICAN_END_SUMMARY -->

Developers willing to create a Python project based on Qt do not necessarily
need to choose between the two libraries: it is possible to support both
as soon as some deprecated features of PyQt are not used. Some details can
be found on the
[Qt website](http://qt-project.org/wiki/Differences_Between_PySide_and_PyQt)
or on the
[PyQt website](http://www.riverbankcomputing.co.uk/static/Docs/PyQt4/html/incompatible_apis.html).

Here I give some tips about how to support both PySide and PyQt4 in a Python
project. In addition, I describe how IPython can be configured to work
properly with those libraries: it is indeed possible to
[interact with Qt widgets from the IPython console](http://ipython.org/ipython-doc/dev/interactive/qtconsole.html#qt-and-the-qtconsole).
This can be extremely helpful for debugging
or even in real-world applications. It is also very interesting when
[using matplotlib from IPython](http://ipython.org/ipython-doc/stable/interactive/reference.html#gui-event-loop-support)
(the GUI backend then being Qt).


Importing Qt in Python
----------------------

The
[python_qt_binding](https://github.com/ros-visualization/python_qt_binding/tree/master/src/python_qt_binding)
package allows to use either PyQt4 or PySide, depending on which is installed.
<a href='http://cyrille.rossant.net/wp-content/uploads/2012/09/python_qt_binding.zip'>You
can also download a slightly modified version here (ZIP file)</a>.
Priority is given to PyQt4, but it can be changed in the code.
I prefer to use PyQt for now, since it seems more stable (especially when
used in conjunction with IPython), but that will probably change at some point.

To use it, replace all your `PyQt4` or `PySide` imports with this package, like:

    :::python
    # from PyQt4 import QtGui, QtCore  # old imports
    from python_qt_binding import QtGui, QtCore  # new imports

The `python_qt_binding` package must be importable: the folder should be
in the current directory, or put the path to this folder in the Python path
(e.g. by creating an ASCII `.pth` file with the path to `python_qt_binding`
inside).


PyQt4 API v1 and v2
-------------------

Two APIs are available in PyQt4, v1 and v2. The first version is on the
deprecation road. Python 3 only supports v2, so does PySide. On Python 2.x,
the v1 is the default API. You can change the API with the following code
which comes from the `python_qt_binding` package):

    :::python
    import sip
    try:
        sip.setapi('QDate', 2)
        sip.setapi('QDateTime', 2)
        sip.setapi('QString', 2)
        sip.setapi('QtextStream', 2)
        sip.setapi('Qtime', 2)
        sip.setapi('QUrl', 2)
        sip.setapi('QVariant', 2)
    except ValueError, e:
        raise RuntimeError('Could not set API version (%s): did you import PyQt4 directly?' % e)

This code must be called before any PyQt4 import. It can be a problem with
IPython, which automatically imports PyQt4 when Qt GUI event loop integration
is active. A possible solution is to paste the above code
in `~/.ipython/profile_default/ipython_config.py`.

Also, you may want to set the
[`Qt_API` environment variable](http://ipython.org/ipython-doc/dev/interactive/reference.html#pyqt-and-pyside)
to either `pyqt` or `pyside` depending on which library you want to use.
[See here for detailled instructions on Windows](http://www.technoon.com/how-to-add-environment-variables-in-windows-8.html).



Configuring IPython
-------------------

To enable the Qt GUI event loop integration in IPython, you need to uncomment
the following lines in `~/.ipython/profile_default/ipython_config.py` (this file is
automatically created when you create an IPython profile):

    :::python
    c.TerminalIPythonApp.gui = 'qt'
    c.TerminalIPythonApp.pylab = 'qt'

This allows you to open a Qt window in an interactive way, and to access the Qt
widget instance from IPython while the window is open. It solves also some
slow-down issues in the IPython console when windows have been opened.
It also works with matplotlib.


Create a Qt window with IPython
-------------------------------

When Qt GUI event loop integration is active, a Qt application is
automatically created upon IPython launch, so that:

    :::python
    window = MyQtWindow()
    window.show

just works. But this won't work by default in Python (e.g. with
`python script.py`) since a Qt application won't have been opened in the first
place. By contrast, using the following code:

    :::python
    app = QtGui.QApplication(sys.argv)
    window = MyQtWindow()
    window.show
    app.exec_()

will work with a standard Python console, but will disable interactive GUI
integration in IPython! So in order to
have the expected behavior in both cases (interactive IPython, or standard
Python interpreter), I use the following code:

    :::python
    def create_window(window_class):
        """Create a Qt window in Python, or interactively in IPython with Qt GUI
        event loop integration.
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

This function can be used like this:

    :::python
    class MyQtWindow(QtGui.QMainWindow):
        # [...] your Qt window code
        pass

    window = create_window(MyQtWindow)

