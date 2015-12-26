Title: Why use Python for scientific computing?
Tags: python

Why use Python for scientific computing? This is a legitimate question. For us, regular Python users, using Python is so natural that we sometimes forget that this choice is not obvious for everyone. Matlab is very widely used in some communities (e.g. experimental biologists) and choosing a different platform requires extensive proselytism. We need to find the right words to convince people that Python is really the future for scientific computing.

<!-- PELICAN_END_SUMMARY -->

[Citing](http://blog.fperez.org/2013/07/in-memoriam-john-d-hunter-iii-1968-2012.html) [Fernando Perez](http://fperez.org/), creator of [IPython](http://ipython.org): *"I am absolutely convinced that in a few decades, historians of science will describe the period we are in right now as one of deep and significant transformations to the very structure of science. And in that process, the rise of free openly available tools plays a central role."* I couldn't agree more. But being convinced is merely enough, and we need to be aware of objective facts supporting the idea that Python is just the best platform for scientific computing.

Several people have written about why they chose Python over Matlab:

-   [Almar Klein: Python vs
    Matlab](https://sites.google.com/site/pythonforscientists/python-vs-matlab)
-   [Steve Tjoa: I used Matlab. Now I use
    Python.](http://stevetjoa.com/305/)
-   [Philippe Feldman: Eight Advantages of Python Over
    Matlab](http://phillipmfeldman.org/Python/Advantages_of_Python_Over_Matlab.html)
-   [Vincent Noël: Bye Matlab, hello Python, thanks
    Sage](http://vnoel.wordpress.com/2008/05/03/bye-matlab-hello-python-thanks-sage/)
-   [Hoyt Koepke: 10 Reasons Python Rocks for Research (And a Few
    Reasons it
    Doesn’t)](http://www.stat.washington.edu/~hoytak/blog/whypython.html)

I also found this [short text](http://nipy.org/nipy/stable/faq/why.html) in the documentation of [nipy](http://nipy.org/), a neuroimaging Python library. I reproduce it here as is.

> The choice of programming language has many scientific and practical consequences. Matlab is an example of a high-level language. Languages are considered high level if they are able to express a large amount of functionality per line of code; other examples of high level languages are Python, Perl, Octave, R and IDL. In contrast, C is a low-level language. Low level languages can achieve higher execution speed, but at the cost of code that is considerably more difficult to read. C++ and Java occupy the middle ground sharing the advantages and the disadvantages of both levels.

> Low level languages are a particularly ill-suited for exploratory scientific computing, because they present a high barrier to access by scientists that are not specialist programmers. Low-level code is difficult to read and write, which slows development ([Prechelt2000ECS], [boehm1981], [Walston1977MPM]) and makes it more difficult to understand the implementation of analysis algorithms. Ultimately this makes it less likely that scientists will use these languages for development, as their time for learning a new language or code base is at a premium. Low level languages do not usually offer an interactive command line, making data exploration much more rigid. Finally, applications written in low level languages tend to have more bugs, as bugs per line of code is approximately constant across many languages [brooks78].

> In contrast, interpreted, high-level languages tend to have easy-to-read syntax and the native ability to interact with data structures and objects with a wide range of built-in functionality. High level code is designed to be closer to the level of the ideas we are trying to implement, so the developer spends more time thinking about what the code does rather than how to write it. This is particularly important as it is researchers and scientists who will serve as the main developers of scientific analysis software. The fast development time of high-level programs makes it much easier to test new ideas with prototypes. Their interactive nature allows researchers flexible ways to explore their data.

> SPM is written in Matlab, which is a high-level language specialized for matrix algebra. Matlab code can be quick to develop and is relatively easy to read. However, Matlab is not suitable as a basis for a large-scale common development environment. The language is proprietary and the source code is not available, so researchers do not have access to core algorithms making bugs in the core very difficult to find and fix. Many scientific developers prefer to write code that can be freely used on any computer and avoid proprietary languages. Matlab has structural deficiencies for large projects: it lacks scalability and is poor at managing complex data structures needed for neuroimaging research. While it has the ability to integrate with other languages (e.g., C/C++ and FORTRAN) this feature is quite impoverished. Furthermore, its memory handling is weak and it lacks pointers - a major problem for dealing with the very large data structures that are often needed in neuroimaging. Matlab is also a poor choice for many applications such as system tasks, database programming, web interaction, and parallel computing. Finally, Matlab has weak GUI tools, which are crucial to researchers for productive interactions with their data.

Globally, the main arguments are:

-   Python is free and open source, whereas Matlab is a closed-source
    commercial product.
-   The Python *language* is just far better that Matlab's awkward
    language.
-   Python integrates better with other languages (e.g. C/C++).
-   Python includes natively an impressive number of general-purpose or
    more specialized libraries, and yet more external libraries are
    being developed by Python enthusiasts.

And, of course, nearly anything that is possible in Matlab is possible in Python, whereas the converse is not true.

Now, a downside of Python compared to Matlab is that is just more complicated to install. For example, on Windows, a Matlab user can just install the software, click on the icon, and a full graphical IDE opens. In Python, there are some integrated scientific distributions with graphical IDEs but they are less convenient than Matlab. Using IPython involves either a command-line interface or a web interface (the notebook). And installing external libraries can be a pain (it almost always involves the command-line interface, which terrifies many Windows users). I think that's the main real problem that prevents Python from widespread adoption in the Matlab community.

Yet, I'm pretty sure that Python will eventually become the platform of reference for scientific computing.
