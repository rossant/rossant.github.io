Title: Projects

## Platform for large-scale electrophysiological data analysis

Next-generation electrophysiological recording devices require scalable data analysis platforms. I'm leading the development of a new [Python-based platform](http://klusta-team.github.io/) that will let scientists analyze their terabytes of data remotely and effectively in the Web browser (thanks to the [IPython notebook](http://ipython.org/notebook.html)).

I'm focusing on raw data visualization and extraction of spike trains from raw extracellular recordings (spike sorting).


## High-performance big data visualization

I've developed a [technology for high-performance interactive visualization of big data]({filename}/pdfs/RossantHardware2013.pdf) based on optimal use of the graphics processing unit (GPU). It is based on modern OpenGL (GLSL shaders) and it uses techniques originally created for 3D video games.

I'm now a core developer of [Vispy](http://vispy.org/), a collaborative project in Python that aims at bringing to scientists high-level, user-friendly visualization facilities based on this technology.

I'm also interested in bringing Vispy to the browser. This will let scientists visualize huge volumes of data remotely thanks to [WebGL](http://en.wikipedia.org/wiki/WebGL), a browser-based implementation of OpenGL.


## Python for data science

I've written [two books on Python for data science and interactive computing]({filename}/pages/books.md).

The first book is a beginner-level introduction to Python for data analysis and numerical computing.

The second book is an advanced-level guide to data science with Python, covering technical aspects of interactive and high-performance computing as well as applied mathematics topics such as statistics, machine learning, signal processing, computer vision, numerical optimization, network data analysis, and mathematical modeling for data science. The book contains more than 100 hands-on recipes applied on real-world examples.


## Open data

I analyze public datasets with Python and I make data visualizations.

* [Map of all road accidents in France in 2012](/opendata-interior-hackathon/), realized with [Rue89](http://rue89.nouvelobs.com/2014/06/25/carte-presque-tous-les-accidents-route-2012-253113) journalists during an [Open Data Hackathon organized by the French Minister of the Interior](http://fr.okfn.org/2014/08/09/retour-sur-le-premier-hackathon-sur-les-donnees-du-ministere-de-linterieur/). I gathered several data sources with IPython and pandas to create the final dataset of all accidents.
* [Vélib' in Paris](/velib-open-data/)
* First names of students taking their high-school diplomas (in French, based on an [original study by Baptiste Coulmont](http://coulmont.com/blog/2012/07/08/prenoms-mentions-bac-2012/)): [post 1](/prenoms-et-reussite-au-bac/) and [post 2](/frequence-des-prenoms-des-candidats-au-bac-2012/)
