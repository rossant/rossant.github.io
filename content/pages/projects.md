Title: Projects

Here are my current projects:

* [Open-source Python libraries](#open-source-python-libraries): tools for numerical computing and technical writing
* [Technical writings](#technical-writings): books and blog posts
* [Open data](#open-data): analysis and visualization of public datasets

## Open-source Python libraries

### phy: spike sorting for large dense arrays

I'm leading the development of [**phy**](https://github.com/kwikteam/phy/), a Python library for large-scale electrophysiological data analysis. This library is being used by dozens of experimental labs around the world.

**Features**:

* Spike detection algorithms
* Bindings to clustering algorithms
* Manual clustering
* Fast and scalable visualization with VisPy
* Modular GUIs with Qt


### VisPy: high-performance interactive data visualization

I'm part of the core development team of [VisPy](http://vispy.org), a data visualization library based on OpenGL.

**Features**:

* Display millions of points efficiently
* 3D visualization


### podoc: conversion of markup documents in pure Python

I'm currently working on a [library](https://github.com/podoc/podoc) for converting documents between different markup formats. This library is fully compatible with [pandoc](http://pandoc.org/) but the most common conversion paths don't require it. This library will eventually supersede the older [ipymd library](https://github.com/rossant/ipymd).

**Features**:

* Edit Markdown or OpenDocument files in the Jupyter Notebook.
* Convert between Markdown, Jupyter Notebook, and other formats *without* pandoc.
* Convert between many other formats with pandoc.
* Easily parse, filter, and transform documents.


## Technical writings

### Books

I've written [several books on Python for data science and numerical computing](/books).


### Posts on O'Reilly Learning

I've written [an interactive tutorial on the t-SNE algorithm](https://www.oreilly.com/learning/an-illustrated-introduction-to-the-t-sne-algorithm) on the **O'Reilly Learning** platform.

More interactive tutorials to be coming soon!


### Awesome Math

I maintain the curated [Awesome Math](https://github.com/rossant/awesome-math) page, which contains many references to high-quality, freely-available mathematics courses.


### Blog posts

I've written [a few tutorials on my blog](/archives).


## Open data

I analyze public datasets with Python and I make data visualizations.

* [Map of all road accidents in France in 2012](/opendata-interior-hackathon), realized with [Rue89](http://rue89.nouvelobs.com/2014/06/25/carte-presque-tous-les-accidents-route-2012-253113) journalists during an [Open Data Hackathon organized by the French Minister of the Interior](http://fr.okfn.org/2014/08/09/retour-sur-le-premier-hackathon-sur-les-donnees-du-ministere-de-linterieur/). I gathered several data sources with IPython and pandas to create the final dataset of all accidents.
* [Vélib' in Paris](/velib-open-data)
* First names of students taking their high-school diplomas (in French, based on an [original study by Baptiste Coulmont](http://coulmont.com/blog/2012/07/08/prenoms-mentions-bac-2012/)): [post 1](/prenoms-et-reussite-au-bac) and [post 2](/frequence-des-prenoms-des-candidats-au-bac-2012)
