Title: Introducing Galry, a high-performance interactive 2D visualization Python package
Tags: python, dataviz, gpu

I'm releasing today the code of a first experimental version of 
[**Galry, a high-performance interactive 2D visualization Python package**](http://rossant.github.com/galry/)
that I'm creating as part of my current research project.

<!-- PELICAN_END_SUMMARY -->

The rationale of this package is to provide a highly flexible and optimized
way of visualizing large 2D datasets in Python by using the full power of the
graphics card.
Most visualization packages in Python are either meant to generate high-quality
publication-ready figures (like 
[matplotlib](http://matplotlib.org/)), 
or to offer 3D fast interactive 
visualization (like 
[mayavi](http://code.enthought.com/projects/mayavi/)).
Existing 2D plotting packages do not generally offer an efficient way to 
interactively visualize large datasets (1, 10, even 100 million points). 
That's what Galry is aiming for, by 
using directly 
[OpenGL](http://en.wikipedia.org/wiki/OpenGL) through a thin Python wrapper 
called 
[PyOpenGL](http://pyopengl.sourceforge.net/).
Galry should work on most platforms (Windows/MacOS/Linux).

To give an idea of the performance of Galry on a recent hardware,
on a 2012 desktop computer with an high-end AMD graphics card, I can
navigate smoothly into a plot with **50 million points** (~35 FPS in the 
current version), and almost smoothly with **100 million points** (~15 FPS).

Galry integrates smoothly with 
[IPython](http://ipython.org/)
and 
[Qt](http://en.wikipedia.org/wiki/Qt_(framework)), 
through either 
[PyQt](http://www.riverbankcomputing.co.uk/software/pyqt/intro) or 
[PySide](http://qt-project.org/wiki/PySide). 

Demo
----

<embed src="http://www.youtube.com/v/jYNJJ4O3pXo" />

Getting started
---------------

[The code is available on GitHub](https://github.com/rossant/galry).

**Important note: Galry is still an experimental project with an unstable
programming interface that is likely to change at any time. Do not use it in
production yet.**

Installation of Galry may not be straightforward depending on your specific
configuration. In particular, you need a recent enough version of OpenGL
(tested version: 3.3). Please don't hesitate to contact me if you have any
trouble installing or using the library.


