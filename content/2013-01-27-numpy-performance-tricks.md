Title: NumPy performance tricks
Tags: python

I've been using NumPy for nearly five years, but I'm still learning
performance tricks. The reason is that I currently need to deal with
very large arrays (hundreds of millions of elements) and the performance
of my code started to be disappointing. Then, through extensive
line-by-line profiling, I discovered some subtleties that explain why
some seemingly harmless lines of code can actually lead to major
bottlenecks. Very often, a small trick allows to significantly improve
the performance. Here is what I've learnt. These tips are intended to
regular Numpy users rather than pure beginners.

<!-- PELICAN_END_SUMMARY -->

[**A new version of this post can be found here.**](http://ipython-books.github.io/featured-01.html)
