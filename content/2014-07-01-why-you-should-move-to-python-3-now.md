Title: Why you should move to Python 3 – now
Tags: python

I started to learn Python in 2008. The same year, Python 3 was released. Yet, almost six years later, I'm still using Python 2. Like the [vast majority of scientific Python programmers, apparently](http://ipython.org/usersurvey2013.html).

But now is the time for me to move to Python 3. You should too. Here's why.

<!-- PELICAN_END_SUMMARY -->

## Why would you want to move to Python 3?

Six years is a long time in computer science. Yet, the vast majority of scientific Python users are still on Python 2. That is despite the fact that the main scientific Python libraries are all compatible with Python 3 now (NumPy, SciPy, matplotlib, Pandas, IPython, SymPy, and many others). Others have already written about this issue (notably [Jake Vanderplas](http://jakevdp.github.io/blog/2013/01/03/will-scientists-ever-move-to-python-3/)). My interpretation is that **scientists think that the benefit-cost ratio for moving from Python 2 to Python 3 is too low**.

Python 2 is working fine for them because **their core expertise is in array programming with NumPy**. Array processing with NumPy hasn't changed at all between Python 2 or Python 3. By constrast, other Python developers (like in sysadmin or Web dev) use pure Python algorithms or string processing, and those things have been *vastly* improved in Python 3.

Most scientists think they have very little to gain by moving to Python 3, while it represents a significant investment (not only updating old code, but also reinstalling an entire Python distribution which has always been a pain).

I was one of them.

Until recently, when I bought the [Python Cookbook](http://shop.oreilly.com/product/0636920027072.do), Third Edition, by David Beazley and Brian K. Jones. This book is a must-read for anyone doing anything serious with Python. It contains lots of advanced recipes for *Python 3 only*. In the Preface, the authors warn the reader:

> All of the recipes have been written and tested with Python 3.3 without regard to past Python versions or the "old way" of doing things. In fact, **many of the recipes will only work with Python 3.3 and above**.

Ouch. The 260 recipes look pretty cool, but if you're in Python 2, you're out. While many might be irritated by this decision, I find it brilliant. This book is exactly the thing you need if you're waiting to be convinced to move to Python 3. (Maybe that's a lesson for the developers of the main scientific Python packages: provide Python 3-only features...)

While going through the book, I discovered many elegant solutions to very common problems. I had no idea those solutions were possible, because I had no idea Python 3 had been so much improved.

For sure, if you're only doing numerical computing, Python 2 may well be sufficient for you most of the time. But the one time you need to do advanced string processing, or you need to code some complex algorithm in pure Python, you will appreciate those fancy Python 3 features.

I won't go into the details, but you can find several excellent references online about the things you miss by staying on Python 2, notably [this presentation by Aaron Meurer](http://asmeurer.github.io/python3-presentation/slides.html).


## Updating courses and tutorials to Python 3

Now, I would argue that there are more important reasons to move to Python 3. It's a decision you should not only make for your individual interest, but also for the general interest. It is obvious that this split between Python 2 and Python 3 isn't good for the community. That's particularly bad for people *outside* the community who are considering moving from MATLAB/Excel/whatever to Python. I don't think this split is making a first good impression.

That's why I think it is important that more courses, tutorials and documentation use Python 3 now. While [my first book](http://ipython.rossant.net) uses Python 2, the second edition will use Python 3. Also, my [new book](http://ipython-books.github.io) uses Python 3. That being said, the code will *just work* with Python 2; nothing has fundamentally changed when it comes to array processing and scientific computing.

If you've created any sort of tutorial or documentation in Python 2, please consider updating it. My bet is that you'll just have to change a few `print X` to `print(X)` here and there, and a couple of `map(...)` to `list(map(...))`. Much of the work can be done automatically. Once again, I won't go into the details, and you'll find [many references here](https://github.com/ipython-books/cookbook-code/blob/master/references/chapter02_best_practices.md#python-2python-3).

A last note about installation: yes, installing a Python distribution with all its packages has always been a nightmare. Fortunately, most of these problems are being solved by Anaconda/conda/miniconda/binstar. [These tools now support Python 3 natively](http://continuum.io/blog/anaconda-2-released), so moving to a Python 3 distribution is becoming straightforward in many situations.


## Why moving to Python 3 might not be easy for you

Okay, so, that was for the optimistic part. Python 3 is great, stable, most scientific Python libraries work just as before, and your core expertise relying on NumPy/SciPy doesn't have to change at all.

But things aren't always that easy. There are some cases where moving to Python 3 is not possible, or where it isn't only your decision.


### You're using package X and it's stuck to Python 2

So you're using NumPy and SciPy and many other great packages that work just fine with Python 3. And there's this package X, for Python 2 only, that you absolutely need. It answers a specific need of yours, and there's no other package in the entire world that solves it as well.

What can you do?

* Begging the authors to move to Python 3 (kidnapping and torture forbidden).
* Doing it yourself. After all, it's open source!
* Writing your own package.
* Finding an alternative package (compatible with Python 3, of course) and making it better (it's open source).

If none of these solutions is possible, you're kind of stuck.

Maybe we should maintain a sort of [Python 3 "Wall of Shame"](https://python3wos.appspot.com/) for scientific Python libraries. A few examples would include `line_profiler` (but there's an ongoing [pull request](https://bitbucket.org/robertkern/line_profiler/pull-request/2/python-25-33-compatibility-using-a-single/)) or [Mayavi/VTK](https://github.com/enthought/mayavi/issues/84) (hopefully [Vispy](http://vispy.org) will provide the foundations for an alternative solution in the near future).


### You have to use legacy code in Python 2

This time, you're the one to blame. :) You have some old code you wrote a while ago, and it doesn't work on Python 3. Or maybe you use someone else's code. Take an afternoon and try to update the code.

Chances are that it's not going to be as bad as it sounds. And you have tools to automate much of the work.

But in some situations (with [C extension modules](http://python3porting.com/cextensions.html) for instance), the cost may just be too high.


### You have to use old systems that don't support Python 3 well

You don't always have the luxury to choose the machines and operating systems you work on. I know many people who are imposed old systems that don't support Python 3 well. There's nothing much you can do, unfortunately. Except one thing: learn how to write Python 2 code that's going to work just fine with Python 3 (`print(X)` instead of `print X` and so on). You'll find many references online.


### Many of your end-users are stuck with Python 2

You're writing software that's going to be installed on many machines you don't control. You know that many of your users are not on Python 3 (yet). The best thing you can do is probably to write your software for both Python 2 and Python 3. There are techniques and tools that make that possible. Importantly, follow strong software engineering practices: version control, unit testing, code coverage, continuous integration. These practices increase your confidence that your code is working fine on Python 2 and Python 3 at all times.

If you follow these rules, maybe *you* can move to Python 3 while you're developing your software.


## Conclusion

If you're a scientist using Python 2, please at least think about moving to Python 3. Check [these references](https://github.com/ipython-books/cookbook-code/blob/master/references/chapter02_best_practices.md#python-2python-3), [have a look at this book](http://shop.oreilly.com/product/0636920027072.do), [install Anaconda 2](http://continuum.io/blog/anaconda-2-released) and give Python 3 a try.

If you're teaching, maintaining tutorials, courses or books about Python, please consider updating your materials to Python 3.

It would be a bit sad that, in 2014, new Python users invest time on Python 2 only.

