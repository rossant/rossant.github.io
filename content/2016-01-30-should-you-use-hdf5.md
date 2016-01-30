Title: Should you use HDF5?

This is a follow-up on my post [*Moving away from HDF5*](/moving-away-hdf5/) (see also [Konrad Hinsen's post](http://blog.khinsen.net/posts/2016/01/07/on-hdf5-and-the-future-of-data-management/), and discussions on [Twitter](https://twitter.com/cyrillerossant/status/684767653697683456) and [Hacker News](https://news.ycombinator.com/item?id=10858189)). Here are some further thoughts, in no particular order.

<!-- PELICAN_END_SUMMARY -->

First, others have pointed out alternative implementations of the HDF5 specification (complete or not), notably in [Julia](http://cyrille.rossant.net/moving-away-hdf5/#comment-2445619778) and [Java](https://www.unidata.ucar.edu/software/thredds/current/netcdf-java/CDM/). I haven't tried them so I don't know how good they are. I don't know of any alternative implementation in Python. It would be interesting to see a Python implementation of a subset of HDF5 that doesn't depend on libhdf5.

Now about use cases. While HDF5 didn't appear to be the right tool for us, others reported that they were happy with it. For example, [Konrad Hinsen uses HDF5 with lots of tiny arrays](http://blog.khinsen.net/posts/2016/01/07/on-hdf5-and-the-future-of-data-management/), whereas we had no more than a few huge arrays. Also, we have large volumes of experimental data, whereas his data comes from numerical simulations. These are quite different use cases. HDF5 was probably overkill for us, whereas it may well be the best option in Konrad's case. The file system alternative I mention in my post may not be a good idea with zillions of small files.

Another thing is that we must make a distinction between creating, analyzing, and sharing a dataset. With our file format we tried to do all of these things with the same structure. As far as I understand it, this is what HDF5 encourages you to do. But these different use cases pose different constraints on how you store your data.

When creating a dataset, you want a fast write access. For analysis, you want a fast read access. For sharing, you want as few files as possible (ideally, one), with a clean internal structure. Of course this is overly simplistic.

It's hard to have a one-size-fits-all format. In our experience, HDF5 seemed to be a good option for sharing large datasets, but not that good for our peculiar read/write access patterns.

What we ended up doing at some point is using HDF5 only for sharing data. When importing the data into our software, we copied it into an internal format based on flat binary arrays. With this change, our software was much faster, at the expense of disk space and a longer initial loading time.

Effectively, we used a different format for sharing and for analyzing our data. If you need a file format, think hard about your requirements. Which is the most important to you: sharing, reading, writing?

Another question that came up was whether there were alternatives to HDF5. I'm not aware of a portable container format for storing numerical arrays that is not HDF5. If you are, please let me know. If you don't use HDF5, you can always use a folder hierarchy with one file per array. This is what we'll end up doing, although having many files isn't an ideal solution. If you want to make a single file out of a hierarchy of files and folders, you can always use tar or zip, of course.

Finally, it is worth mentioning [**ASDF**](http://asdf-standard.readthedocs.org/en/latest/), a new file format for astronomy from the Space Telescope Science Institute that aims to replace [FITS](http://fits.gsfc.nasa.gov/). It is somewhat similar in spirit to HDF5. [The paper](http://www.sciencedirect.com/science/article/pii/S2213133715000645) by P. Greenfield, M. Droettboom, and E. Bray describes the issues with HDF5 and the motivations behind this new format. Here is an excerpt that largely overlaps with the arguments exposed in my previous post:

> [HDF5] is an entirely binary format. [...] All inspection of HDF5 files must be done through HDF5 software. [...] The consequence of this for HDF5 is that the HDF5 toolset must be installed, and its software must be used if one wants to inspect the contents of the HDF5 file in any way.

> [...] Because of the complexity, there is effectively only one implementation. The drawback of having only one implementation is that it may deviate from the published specification (who would know since there is no independent verification?). [...]

> A related issue is that for some time the HDF format was not considered archival as it kept changing, and for a time it was considered more of a software API than a specific representation on disk. HDF5 has been relatively stable, though given the lack of multiple implementations and self documenting nature makes it less appropriate as an archival format. Will the future library be able to read much older files?

> HDF5 does not lend itself to supporting simpler, smaller text-based data files. As an example, many astronomers prefer to use simple ASCII tables for data that do not require very large files, primarily for the convenience in viewing and editing them without using special tools.

> The HDF5 Abstract Data Model is not flexible enough to represent the structures we need to represent, notably for generalized WCS (see Section  6.6). The set of data types in HDF5 does not include a variable-length mapping datatype (analogous to a Python dictionary or JavaScript object). While “Groups”, which are much like a filesystem directory, could be used for this purpose, “Groups” cannot be nested inside of variable-length arrays but only within each other. The “Compound” data type, analogous to a C struct also seems fruitful, but it cannot contain other “Compound” types or variable-length arrays. These arbitrary restrictions on nesting of data structures make some concepts much harder to represent than they otherwise need to be.

According to the paper, ASDF is expected to be used with the James Webb Space Telescope, the successor to the Hubble telescope.

Hopefully you should now be in a position to decide whether HDF5 is the right tool for you, or if you need to explore other options. The main question you should ask is: do you absolutely need a portable container format containing many numerical arrays? If the answer is yes, you might have no other choice than HDF5, and you should be aware of its drawbacks. Do prototypes and benchmarks to avoid bad surprises in production.

The more important question is: do you *really* need a file format in the first place? If you're targeting advanced users who are familiar with Python, it might be sufficient to provide a sensible API and let them deal with file format issues. Savvy users tend to prefer keeping control of their data.

On the other hand, if your users aren't programmers and expect an easy-to-use integrated solution, you may have no other choice than deciding the file format and structure of the data generated by your software. This was our case. I tried to push hard our users (who are biologists) to learn Python and regain control of their workflows and data formats, but I failed. This is sad, as I think that in 2016 *any* researcher needs to know a programming language, Unix, bash, a version control system, etc. Still, many researchers continue to be allergic to command-line interfaces and programming languages, and you might have to comply with their requests. Maybe the customer is always right.
