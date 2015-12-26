Title: Profiling and optimizing Python code
Tags: python

> Premature optimization is the root of all evil.

> [_Donald Knuth_](http://en.wikipedia.org/wiki/Donald_Knuth)

There are two opposite directions a programmer can take when writing a piece
of software: coming up with an elegant software design or with an heavily 
optimized code. A good design leads to better readability and maintenance, 
often at the expense of pure performance. Conversely, highly optimized code
tends to be more difficult to read, and can lead to bugs that are hard to
fix.

<!-- PELICAN_END_SUMMARY -->

It appears that of those two possible directions, [design and code 
readability are more important _at first_ than premature
optimization](http://en.wikipedia.org/wiki/Program_optimization#When_to_optimize). 
It might seem counterintuitive: why bother trying to write good code if the
code architecture needs to be changed later anyway due to bad performance?

First, one needs to begin somewhere. After all, it is the normal life for
any software to be progressively improved over time. And it is much easier to
improve a well written code than a messy one filled up with hideous optimizing
tricks. Second, the performance may not be that bad. The only way to know is to
try with a first, well-written version. It may even not be necessary to 
optimize anything, if the performance is just _good enough_.
Finally, and most importantly, knowing in advance which part of the code will 
require optimization is very often unpredictable.
That's something I surprisingly discovered only recently despite many years
of programming.

Whenever your code is too slow, you can, at least at first, make some guesses.
Maybe that function, maybe this code snippet, is the
[bottleneck](http://en.wikipedia.org/wiki/Bottleneck_(engineering)#Engineering). 
This
algorithm may have a too large complexity, the hard drive may be too slow when
writing this file, allocating this amount of memory, binding this socket may 
take too much time, spawning this process may be the bottleneck, etc. In my
experience, whatever you best guess is, _you can be pretty confident that 
you'll be wrong_. The vast majority of time, the actual bottleneck will be
completely unexpected, sometimes incredibly stupid, sometimes very subtle.

The only way to know for sure is to 
[_profile_](http://en.wikipedia.org/wiki/Profiling_(computer_programming)). 
With the right tools, profiling
code can be highly valuable. Whenever your code is becoming too slow, profile
and find the bottleneck, the small part of the code that is taking too long.
Very often, [it is a small portion of the code that is responsible for 
most of the slow-down (Pareto 
principle)](http://en.wikipedia.org/wiki/Program_optimization#Bottlenecks).

I've never taken the time to play with the profiling tools in Python until
recently, and I want to share here what I've been using lately.

Profiling Python code
---------------------

The [Python standard library](http://docs.python.org/library/) contains the 
[`cProfile`](http://docs.python.org/library/profile.html) module for determining
the time that takes every Python function when running the code. The
`pstats` module allows to read the profiling results. Third party profiling
libraries include in particular 
[`line_profiler`](http://packages.python.org/line_profiler/) 
for profiling code line after 
line, and 
[`memory_profiler`](http://pypi.python.org/pypi/memory_profiler) 
for profiling memory usage. All these tools are
very powerful and extremely useful when optimizing some code, but they might not
be very easy to use at first.

So, how to profile Python code? First, prepare a Python script which executes
the code you want to profile. Ideally, this code should be deterministic
(e.g., use a fixed seed if you use a pseudorandom number generator, etc.).

Then, use `cProfile` to execute and profile this script. The `cProfile` module
generates a binary file with all the information related to the profiling
session.
In order to convert this file into an human-readable format, one has to use the
`pstats` module. I found the following solution convenient: I create a .bat file
with the following lines (this is for Windows):

    :::bash
    python -m cProfile -o prof script.py
    python dumpprof.py > stats.txt

The first line profiles 'script.py' and saves the result in a 'prof' file.
The second line converts the 'prof' binary file into a text file.
    
The `dumpprof.py` file contains the following code:

    :::python
    import pstats
    pstats.Stats('prof').strip_dirs().sort_stats("cumulative").print_stats()

You can take a look to the Python documentation to find all the options
in the
[`pstats` module](http://docs.python.org/library/profile.html#pstats.Stats). 
When I launch the .bat file, the script is executed,
and I get a text file with the profiling result, that is, with the time 
each function took.

Here is a toy example with the following script:

    :::python
    import numpy as np
    import numpy.random as rdn

    # uncomment for line_profiler
    # @profile
    def test():
        a = rdn.randn(100000)
        b = np.repeat(a, 100)
        c = b ** 2

    test()

An excerpt of the output of `cProfile` on my laptop is:
    
    :::text
    10895 function calls (10706 primitive calls) in 0.472 CPU seconds
    
    Ordered by: cumulative time
    
    ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.000    0.000    0.474    0.474 {execfile}
        1    0.025    0.025    0.474    0.474 script.py:1(<module>)
        1    0.009    0.009    0.240    0.240 __init__.py:106(<module>)
        1    0.074    0.074    0.209    0.209 script.py:5(test)
        [...]
        1    0.000    0.000    0.126    0.126 fromnumeric.py:300(repeat)
        1    0.126    0.126    0.126    0.126 {method 'repeat' of 'numpy.ndarray' objects}
        [...]
        1    0.009    0.009    0.009    0.009 {method 'randn' of 'mtrand.RandomState' objects}

The `test` function took 209 ms, among which 126 were spent in the `repeat`
function (allocating and copying large amounts of data takes time). But
we don't have directly the time that the square operation took.

For this,
we can use `line_profiler` to profile the code line by line. 
After installation (using 
[Christoph Gohlke website](http://www.lfd.uci.edu/~gohlke/pythonlibs/)
on Windows), you can use the `kernprof.py` module. I had to copy it from the
Python scripts directory (e.g. `C:\Python27\Scritps`) to my script directory. 
Then, add the `@profile` decorator to every function you want to profile line
by line. Finally, use the following command:

    :::bash
    python -m kernprof -l -v script.py > statsline.txt

This executes the script and generates a text file with the line profiler
output. Here is the output on the toy example:

    :::text
    Wrote profile results to script.py.lprof
    Timer unit: 5.13284e-07 s

    File: script.py
    Function: test at line 4
    Total time: 0.205144 s

    Line #      Hits         Time  Per Hit   % Time  Line Contents
    ==============================================================
         4                                           @profile
         5                                           def test():
         6         1        18069  18069.0      4.5      a = rdn.randn(100000)
         7         1       241293 241293.0     60.4      b = np.repeat(a, 100)
         8         1       140307 140307.0     35.1      c = b ** 2

The percentage of time and the actual time (in unit of
the Timer unit, about 0.5 microseconds here) spent on each line is given.
This line by line profiling can be extremely valuable when optimizing a
complex function.

Conclusion
----------

That's it for this quick introduction. In conclusion:

  * Do not try to optimize you code prematurely: always favor code readability 
    versus unnecessary optimization.
  * Do not try to optimize unless you really need to: very often, _good enough_ 
    performance is better than over-optimization.  
  * Always profile your code before optimizing it: you need to know exactly the
    portion of your code that needs to be optimized in priority.
  * When encountering a bottleneck, do not guess where it's hiding: you'll 
    probably be wrong.
  * In Python, you can profile your code thanks to the following tools:
    `cProfile`, `line_profiler` and `memory_profiler`.
  
Notes
-----

Related links:

  * [Profiling in Python](http://www.doughellmann.com/PyMOTW/profile/)
  * [A question on Stackoverflow](http://stackoverflow.com/questions/582336/how-can-you-profile-a-python-script)
  * [A blog post about pstats](http://stefaanlippens.net/python_profiling_with_pstats_interactive_mode)
  
  