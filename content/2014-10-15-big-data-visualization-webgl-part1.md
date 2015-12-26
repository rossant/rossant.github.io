Title: Big Data visualization with WebGL, part 1: Overview
Tags: dataviz, gpu

In this post series, I'll talk about the [big data visualization platform I'm currently developing with WebGL](http://collaborate.mozillascience.org/projects/hpdataVis). I'll give in this first post the main motivations for this project. The next posts will contain the technical details.

<!-- PELICAN_END_SUMMARY -->

* Part 1: Overview
* [Part 2: Vispy]({filename}2014-12-11-big-data-visualization-webgl-part2.md)

## Overview

This project brings together several modern trends in data science and computing:

* Big Data
* Cloud computing
* Python
* The IPython/Jupyter notebook
* The modern Web platform
* Mobile devices
* Graphics Processing Units

### Big Data

**Big Data**, like every buzzword, is often misused. It will die eventually. Yet, it is not completely meaningless. We are really drowning in the volume of data. In the [experimental neuroscience lab](http://www.ucl.ac.uk/cortexlab) I'm working in, we're constantly buying new multi-terabytes hard drives and NAS boxes. We're always running out of disk space. Yet, this is only for *storage*. Processing, analyzing, and visualizing these terabytes of data is harder and harder. Our algorithms, software, and hardware are not scaling as fast as our acquisition systems.

This is not going to stop, on the contrary; it's going to get worse with international research projects such as the [Human Brain Project](https://www.humanbrainproject.eu/) or the [BRAIN Initiative](http://www.whitehouse.gov/share/brain-initiative). Although raising huge technical challenges, this deluge of data is nevertheless expected to lead to important [data-driven discoveries](http://www.moore.org/programs/science/data-driven-discovery).

This is not only true in experimental neuroscience, but also in virtually any academic and industrial discipline.


### Cloud computing

In more and more disciplines, datasets are becoming too big for our computers. Cloud computing architectures let networks of computers process huge datasets in parallel. These platforms have been used by large Internet companies for many years. Academia is now trying to [embrace this trend](http://thefreemanlab.com/pdf/freeman-2014-nature-methods.pdf).

Another thing to consider is **big data inertia**. A huge, multi-terabytes dataset is going to be stored in a computer, a network drive, or in the cloud. You're not going to move it around in order to analyze and visualize it. Data transfers at this scale come at a huge cost, so you'll have to **bring your code to the data rather than the other way around**.

In terms of visualization, this implies that scalable solutions have to be distributed. Enabling **remote data access** for analysis and visualization is now a requirement.


### Python

Python is one of the leading **open platforms for data analysis and visualization**. More and more scientists are using it. Yet, it lags behind other solutions when it comes to *big data* analysis and visualization. Another drawback of Python is the difficulty of installing a working scientific Python distribution on a computer (although [conda](http://conda.pydata.org/) is not far from solving this problem altogether).

Because of this, *sharing* and *diffusing* data analysis reports in Python containing interactive visualizations is far from being straightforward, particularly when large datasets are involved. Innovative solutions are required in this area.


### The IPython notebook

One of the most popular features of the scientific Python platform is the [IPython notebook](http://ipython.org/notebook.html) (now also called [Jupyter](https://speakerdeck.com/fperez/project-jupyter) notebook). This tool lets scientists write code, text, and create figures in a single document, all within their Web browser. This document can be tracked by a version control system, shared, and converted to HTML, PDF, and other formats.

[Collaborative work on notebooks is becoming possible](https://colaboratory.jupyter.org). Notebooks now support non-Python languages (R, Julia, Haskell, and many others). Finally, interactive graphical applications can be built in the notebook thanks to [IPython widgets](http://nbviewer.ipython.org/github/ipython/ipython/blob/master/examples/Interactive%20Widgets/Index.ipynb).


### The modern Web platform

Whereas Python is one of the leading data analysis platforms, **JavaScript is simply one of the most popular programming languages in the world**. I'm not sure how we got here, because JavaScript is not really known to be the most elegant language ever. However, the JavaScript community and ecosystem are huge nowadays. Also, the Web industry leaders have spent a considerable effort on building blazingly fast JavaScript interpreters for their browsers. JavaScript is probably here to stay, and we'll have to live with it.

More optimistically, HTML5, CSS3, JavaScript, and the various WebSomething (WebGL, WebAudio, WebSocket, and so on) technologies offer an open, standardized, cross-platform, and highly capable platform for application development. For example, [WebGL](http://www.chromeexperiments.com/webgl/) offers a standard API to display hardware-accelerated 2D and 3D graphics in real-time in the browser. Quite a few video games are written in WebGL now.

**With Web applications, deployment is basically trivial** (from a user perspective, at least). Open an URL with your browser and you instantaneously get your application running (possibly in the cloud). No installation, no plugin. That's probably one of the main reasons why this platform is so popular today.


### Mobile devices

People spend more and more time on their mobile devices, and less and less time on their personal computers. That's not true everywhere, and many professionals still need a desktop computer. But I think this trend is not going to stop. Many scientists would love to access their data and analyses remotely through their mobile devices. Multi-touch interfaces on mobile devices would also make scientists more productive when they're visualizing and analyzing data.


### Graphics Processing Units

The video game industry has been fostered the computational power of graphics processing units (GPUs) in the last two decades. Today, the GPU is often the most powerful processing unit in a computer. GPUs are now everywhere: desktop computers, laptops, tablets, smartphones, and even watches! We wouldn't have fast and fluid graphical interfaces without GPUs.

GPUs are now routinely used in scientific disciplines for general-purpose computing applications. Some kinds of numerical problems can be solved highly efficiently on GPUs thanks to their massively parallel architecture. But GPUs were primarily designed for real-time rendering and 3D video games. We can also very well use them for big data visualization. I've been working on [this idea](http://journal.frontiersin.org/Journal/10.3389/fninf.2013.00036/full) for two years, and this is the core idea of the project I'll be talking about here.


## Bringing these technologies together

What would be an ideal, modern workflow for big data analysis and visualization? Here's my take:

1. **Perform an experiment**. Acquire a huge dataset, store it in a remote server or in the cloud.
2. **Start your analysis** by opening your Web browser and going to a secure URL.
3. **Write code** in a notebook interface to access and visualize your data. You can launch analyses in parallel, and get status reports asynchronously.
4. **Use a GUI**. There are specific situations where text-based interfaces are not enough, and you really need a user-friendly graphical interface for data processing. For example, you may need to run a semi-automatic analysis involving human supervision. This interface may involve complex interactive visualizations.
5. **Collaborate**. You're in the middle of an analysis session, and you want to share your findings *in real-time* with a colleague in another city or country. You just give her the URL, and she immediately gets access to your notebook.
6. **Save your work** using a distributed version control such as Git.
7. **Access your work remotely**. On your way back home, you can still access your notebook and your data from your smartphone.
8. **Share your findings** with colleagues or in a blog post. You can convert your notebook to an interactive self-contained HTML document containing your data, analyses, code, results, and interactive figures.
9. **Publish** a paper by converting your notebook to a publication-ready paper (we're not there yet!).

Most of what is described here is **already possible today using the IPython notebook**. The architecture enabling interactive widgets was implemented in IPython 2.0. Collaborative work and multi-language support should be brought by IPython 3.0. Interactive visualization tools in JavaScript exist; [d3.js](http://d3js.org) is the most popular one, and it can be effectively integrated in the notebook (although this requires quite some work at the moment, unless you use [mpld3](http://mpld3.github.io/)).

What is currently missing is a **fast and scalable big data visualization tool in the browser**. [Vispy](http://vispy.org) is a hardware-accelerated big data visualization library in Python. I'm currently working on this library together with several other developers. Plotting interfaces are still being worked out at the moment, but data visualization widgets can already be written using lower-level interfaces. These visualizations are fast and scalable because the GPU is optimally leveraged thanks to **OpenGL** (Open Graphics Library).

The last missing feature is the ability to **run a Vispy visualization in the IPython notebook and in the browser**. WebGL is an implementation of OpenGL in the Web browser. It is supported by all modern browsers on desktop computers and mobile devices. It is today the best technology at our disposal for distributed big data visualization.

In the next posts, I'll describe how we're going to bring Vispy to the IPython notebook and the browser through WebGL. The main challenge will be to make Python and JavaScript communicate effectively, and to let users get the most of the architecture without asking them to write JavaScript code themselves.
