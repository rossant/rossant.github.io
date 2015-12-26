Title: What's wrong with scientific Python?
Tags: python

tl;dr: Although not perfect, Python is today one of the best platforms for scientific computing. It's getting even better everyday thanks to the amazing work of a vibrant and growing community. [I reviewed Python's strengths in a previous post](http://cyrille.rossant.net/why-using-python-for-scientific-computing/). Here, I cover the more sensitive issue of its weaknesses.

<!-- PELICAN_END_SUMMARY -->

Don't get me wrong. I love Python. I use it everyday. I think that, as of today, it is nothing less than one of the best platforms for high-performance scientific computing and data science. Not only among other competing open-source languages like R or Scilab; to me, it even outclasses commercial products like Matlab.

That being said, nobody's perfect. While Python is mostly an excellent platform, it has some weaknesses. Sadly, those may prevent many people from jumping from Matlab & co to Python. I'd like to review them here. Note that these are my own opinions and many might disagree.

**Update** (24/01/2014): this updated version contains a few clarifications and additions compared to the original version from 15/01/2014. See also in the comments a [very good summary and perspective by Konrad Hinsen](http://cyrille.rossant.net/whats-wrong-with-scientific-python/#comment-1603524572).


## A good general-purpose language, but not that good for scientific computing

Python has been around for more than twenty years. It was originally, and has always been, a general-purpose language. It is actually one of its greatest strengths compared to domain-specific languages designed primarily for scientific computing. For example, Matlab is really good with matrices, but not with other data structures. Many statisticians like R's syntax, because it appears to do well what it is meant to do (statistics), but that's basically it.

Today, if Python supports the data structures we often use in scientific computing, that's thanks to NumPy. Whereas operations like indexing and slicing are quite natural (they translate to standard Python syntax), basic matrix manipulations like concatenations or reshaping feel a bit clunky. I think that's more a limitation of the language than a limitation of NumPy. I imagine that many Matlab users trying to move to Python feel a bit disoriented because of this.


## NumPy has a few weaknesses

A few things in NumPy are slightly odd and often confuse beginners. Off the top of my head:

* To concatenate arrays with, say, `hstack`, you end up using double parentheses: `hstack((a, b))`. How are you explaining this to beginners?

* Fancy indexing is slow: `x[indices]`, where `indices` is an arbitrary array of integers, can be up to *four times* slower than Matlab. Now, if you use [`take()`](http://docs.scipy.org/doc/numpy/reference/generated/numpy.take.html), you can achieve Matlab's speed. If you don't know [this trick](http://cyrille.rossant.net/numpy-performance-tricks/) (and why would you, if you're a Matlab user considering switching to Python?), you might just think that Python is *four times* slower than Matlab (this very situation actually happened to a colleague). Ouch...

* Let's create a matrix full of zeros: `x = zeros((10, 10))`. Now a random matrix: `x = rand(10, 10)`. First case: you *need* double parentheses or you get an error. Second case, you *need* single parentheses or you get an error. *Why?!* **Update**: someone pointed out in the comments that there's a really good reason for that: the `rand(10, 10)` function is a Matlab-friendly shortcut for `numpy.random.random_sample((10, 10))`. This little-known function *is* consistent with the rest of the NumPy API! This brings an additional point I'll tackle below (about Python trying to be Matlab).

I'm sure we can find several other oddities. Now, I concede that these are all pretty minor things. NumPy remains an exceptionally useful library that has a huge importance in scientific computing.

It should be noted that [Continuum Analytics](http://continuum.io/) is already working on the next generation of NumPy: [Blaze](http://blaze.pydata.org/), that looks fantastic. This is a brand new library, not just a new version of NumPy. I don't think that the NumPy project itself is going to evolve a lot in the future, and I expect a lot more from Blaze.


## Python is trying to be Matlab

(addition to the original version)

More precisely, the Python scientific stack (notably NumPy, SciPy, matplotlib...) tries to mimic some of the functionality and API of Matlab. This is actually not a bad idea: regular Matlab users have a chance to move to Python more easily. However, mimicking part of Matlab also means mimicking part of its weaknesses, including unpleasant or inconsistent API. The example of the Matlab shortcut `rand(10, 10)` being much more used than the original NumPy function `numpy.random.random_sample((10, 10))` is interesting.

Think also about the habit that many Python users (and potentially ex-Matlab users like me!) have taken, which consists in putting `from pylab import *` at the top of a script, or running IPython in `%pylab` mode. I've done that for years (not anymore). [The IPython core developers are desperately trying to prevent people from doing that now](http://carreau.github.io/posts/10-No-PyLab-Thanks.ipynb.html). The core of Matlab has no notion of namespaces: all function names are defined in a global, huge namespace. This is obviously not how Python is working, so the `pylab` mode imports everything in the interactive namespace. I understand that it makes life easier to people coming from Matlab, but that's really not a good habit to take.

This is a double-edged sword: Python needs to depart from Matlab's weaknesses, but it should also attract Matlab users with a very similar API. I'm not really sure what the best answer to this is.


## CPython is slow

[CPython](http://en.wikipedia.org/wiki/CPython) is the mainstream implementation of the Python language. Being written in C, it can easily talk to rock-solid libraries that have been developed over the course of decades. CPython itself is a solid piece of software.

The problem is, it is not always very fast. Tight loops in particular tend to be slow. Even a [trivial loop](http://stackoverflow.com/a/8097669) that does nothing wastes *many* CPU cycles in dynamic type checking, function calls, etc. This is why NumPy exists: matrix computations can be vectorized in C to make much better use of CPU cycles.

[Cython](http://cython.org/) is a popular solution, but I admit it sometimes feels a bit clunky. Mixing Python and C in some sort of bastard language seems more like a temporary hack to get things done than a long-term solution.

[Just-in-time (JIT) compilation](http://en.wikipedia.org/wiki/Just-in-time_compilation) is one possibility to overcome this issue. [PyPy](http://pypy.org/) uses this technique for general Python code, achieving [impressive speed-ups](http://speed.pypy.org/). However, it seems like supporting NumPy and SciPy in PyPy is particularly difficult. There are [some work](http://pypy.org/numpydonate.html) in this direction but I'm not sure they will succeed in the foreseeable future.

A related project is [Numba](http://numba.pydata.org/), by Continuum Analytics. This project is closely tied to Blaze. Its goal is to implement a JIT compiler specifically adapted to the kind of vectorized computations we have in scientific computing. It is also NumPy-aware. Numba is a very promising project that may overcome the most severe limitations of CPython in the context of scientific computing.


## CPython does not like parallel computing

Another big issue in Python is its weak support of multicore processors. Once again, this limitation comes from CPython. The [Global Interpreter Lock (GIL)](https://wiki.python.org/moin/GlobalInterpreterLock) is a mechanism in CPython that simplifies drastically memory management. It works by preventing threads, in a multithreaded Python interpreter, to run simultaneously. In other words, with CPython, you are stuck with one core per Python process.

There are some ways to run code in parallel with Python, but they are not particularly convenient. One can [bypass the GIL](http://docs.cython.org/src/userguide/external_C_code.html) with Cython or with C code, for example. Alternatively, one can simply use multiple processes. But [multiprocessing](http://docs.python.org/2/library/multiprocessing.html) is tedious and heavyweight in general, particularly on Python.

NumPy can run some specific types of computations (like matrix products) on multiple cores, thanks to libraries like [BLAS](http://en.wikipedia.org/wiki/Basic_Linear_Algebra_Subprograms). Blaze, the successor of NumPy, should support parallel computing (on CPU or GPU) out of the box.

**Update**. Some people have rightly pointed out that many, many solutions exist to do high-quality and efficient parallel computing in Python (see also [Aron Ahmadia](http://aron.ahmadia.net/)'s comment below). These solutions notably include: [mpi4py](http://mpi4py.scipy.org/), [petsc4py](https://code.google.com/p/petsc4py/), [IPython.parallel](http://ipython.org/ipython-doc/dev/parallel/) (which contains truly awesome stuff), [joblib](http://pythonhosted.org/joblib/), among many others. Just look at [this list](https://wiki.python.org/moin/ParallelProcessing). Some of these solutions are extremely powerful but may not be so easy to use, others are much simpler and already quite useful for [embarrassingly parallel](http://en.wikipedia.org/wiki/Embarrassingly_parallel) tasks (notably joblib).

IPython's parallel computing features have a particularity here: not only are they deeply easy to used, they are *also* extremely powerful, notably when used with MPI. The learning curve that some might encounter comes more from MPI than IPython, in my opinion.

The very fact that so many people ([including myself](https://github.com/rossant/playdoh)!) tried to improve the parallel computing capabilities of the Python platform *is precisely the point I wanted to make*. At its core, (C)Python is not well adapted to parallel computing. If it were, we wouldn't see so many people attempting to fix it...

More generally, this also shows that Python's native weaknesses *can* be fixed. And they *are*. They are even fixed so well that the very claim "Python does not like parallel computing" may hurt people's feelings (sorry). Some of the solutions mentioned above are so well-established that they actually seem to *belong* to Python. But I think that's forgetting the native limitations CPython.


## Lack of scalable visualization tools

Python currently lacks a good interactive visualization tool that scales to huge datasets (tens of millions of points). Admitedly, there aren't that many libraries in other languages either. But [we're working on it](http://vispy.org/) (shameless self-promotion).


## Python 2 versus Python 3

This is a tough one. The vast majority of Pythonista scientists use an *obsolete* version: the 2.x branch. The maintained version (the 3.x branch) has been there for years. The problem is: it is not [backward-compatible](http://docs.python.org/3.0/whatsnew/3.0.html). Even the absolute simplest thing in Python 2 (`print "Hello world!"`) is *broken* in Python 3.

The Python core developers have presented Python 3 as a [*new* language](https://wiki.python.org/moin/Python2orPython3) that fixes many weaknesses of Python 2. This very claim might have frightened many people. What's more, some respected [Python developers](http://lucumr.pocoo.org/2014/1/5/unicode-in-2-and-3/) are not that satisfied with the changes brought by Python 3. The situation looks really bad.

Fortunately, things tend to become slightly better with time. We now have a [few](http://docs.python.org/2/library/2to3.html) ways to release packages working seamlessly in *both* branches, or even to have a [single code base](http://pythonhosted.org/six/) for both branches. Those slightly hackish techniques are now becoming standard. Releasing Python 2-only or Python 3-only new libraries is considered as bad practice. I think it will take a *while* before people just use Python 3 and forget Python 2 altogether.

As far as scientific packages is concerned, I would say that, as of today, we're good. The vast majority of scientific libraries are compatible with Python 2 *and* Python 3. A Pythonista scientist can choose to work either with Python 2 or Python 3.

Of course, as time passes, using Python 3 instead of Python 2 for day-to-day work is more and more recommended. I have yet to do it, though. I guess we're all a bit refractory to change. More importantly, most people (including me) don't see much to be gained by making the switch. The benefit–cost ratio is probably still too weak. Non-scientist users (like Web developers) have probably more reasons to switch, be it only for Unicode support.


## Package fragmentation

That's the problem of distributed, open-source, self-organizing large projects like scientific Python. New packages are being developed in parallel. They get more mature, they get users. Then they make small, minor API changes here and there. Then package A v3 works with package B v7 but not v6. Or not v8. You start to get complicated dependencies between the packages you use in your software. Because the Python packaging system is so broken (see next paragraph), your users complain again and again.

I think this is hardly preventable with a young ecosystem like scientific Python. Hopefully things will become better with time.


## The packaging system in Python

This is another tough one, probably even tougher than Python 3. In layman's terms (might be a bit simplistic): packaging refers to the problem of letting other people use your Python library or program. You develop your software on a configuration A, and you want to share it with people on configurations B, C, and D. A configuration refers to a combination of an operating system (Windows? Unix? Linux? OS X? 32-bit or 64-bit?), a version of Python (2.x? 3.x? 32-bit or 64-bit?), the versions of your 47 Python dependencies, among others.

Solutions exist. They are all *terrible*. I won't go into the details. [Others](http://lucumr.pocoo.org/2012/6/22/hate-hate-hate-everywhere/) [have](http://python-packaging-user-guide.readthedocs.org/en/latest/) [done](http://python-notes.boredomandlaziness.org/en/latest/pep_ideas/core_packaging_api.html) [it](http://www.aosabook.org/en/packaging.html) better than I could.

It's even worse when it comes to Python programs with GUIs that you need to distribute to non-technical users (been there). You can't expect them to have a Python distribution, so you need to somehow [ship Python with your program](http://cyrille.rossant.net/create-a-standalone-windows-installer-for-your-python-application/). In my experience, it can be a nightmare. I have yet to find a good cross-platform solution that *just works*.

Once again, things are slowly getting better. The official solutions are improving. Also, Continuum Analytics appears to be doing some [really](https://binstar.org/) [good](http://technicaldiscovery.blogspot.fr/2013/12/why-i-promote-conda.html) job in this respect, with their own conda/binstar system.


## A glance at the future

I hope this post did not sound too much like a rant. It is not. I'm pretty happy with Python. I'm [developing and maintaining software in Python](http://klusta-team.github.io/). I even wrote [a book on scientific Python](http://ipython.rossant.net/)! For sure, I don't plan to leave this platform anytime soon. And, in any case, what I would leave it for? I don't think there is a better alternative as of today.

Things could be better. They always can. And, they *are* getting better. I'm quite confident that scientific Python is going to be stronger and stronger in the years to come.

Will Python be the best open platform for scientific computing in 5 years? I'm quite sure it will. In 10 years? 15 years? Not so sure.

What will be the state of scientific computing in 10 years? Nobody can predict the future, but it's fun to try (even if we're totally wrong).

In 10 years, Python will probably still be around. However, maybe will it have been beaten by something else. I don't know what this something else is going to be. Maybe [Julia](http://julialang.org), maybe something else. Maybe [Perl](http://blogs.perl.org/users/joel_berger/2014/01/on-the-relative-readability-of-perl-and-python.html) (just kidding).

This hypothetic language will be high-level, readable, easy to learn like Python, probably dynamic, maybe (partly) functional. But it won't have the limitations of CPython. It will be fast. [*Just* fast](http://www.evanmiller.org/why-im-betting-on-julia.html). Loops will be fast. It may implement a ([LLVM](http://en.wikipedia.org/wiki/LLVM)-based?) JIT compiler. It will fully embrace parallel and heterogeneous architectures. It will be as good as Python, without its weaknesses. Or maybe I'm wrong and Python 5 (incompatible with Python 4) is going to be the winner.

Before I conclude, let me mention [IPython](http://ipython.org/). In 10 years, maybe will Python be stronger than ever. Or maybe will it have been replaced by another language. In any case, however, I think that IPython will be there for good. Maybe not IPython itself. But its legacy. The [open, reproducible science paradigm](http://ipython.org/_static/sloangrant/sloan-grant.html). The idea of a [notebook for scientific computing](http://blog.fperez.org/2012/01/ipython-notebook-historical.html). Maybe even the [very architecture of the notebook](http://andrew.gibiansky.com/blog/ipython/ipython-kernels/) (including its [JSON-based file format](http://ipython.org/ipython-doc/stable/interactive/notebook.html)), which is actually *already* language-agnostic. Contrary to what its name suggests, IPython is not *that* tied to Python. Yes, it is entirely written in Python. But still, I think it is more than just a nice interactive thing on top of Python (I mostly think about the notebook, obviously).

So, what now? Should *you* switch to Python? If you're happy with your existing platform, if you're happy to pay thousands of dollars when alternative open-source solutions exist, or if you're scared by the current weaknesses of Python, please don't change a thing.

But if you *do* want to change, if you are well aware of Python's limitations, if you are ready to face up to them (because solutions *do* exist), if you are willing to discover an amazing and vibrant platform, then take the plunge.
