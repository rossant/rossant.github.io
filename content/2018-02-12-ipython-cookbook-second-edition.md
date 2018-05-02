title: Writing the IPython Cookbook, Second Edition
tags: python

<a href="https://ipython-books.github.io/"><img src="/images/cookbook.png" alt="IPython Cookbook, Second Edition" align="left" style="width: 140px; margin-right: 10px;" /></a> I'm pleased to announce the release of the [IPython Cookbook, Second Edition](https://ipython-books.github.io/), more than three years after the first edition. All 100+ recipes have been updated to the latest versions of Python, IPython, Jupyter, and all of the scientific packages.

There are a few new recipes introducing recent libraries such as [Dask](https://dask.pydata.org/en/latest/), [Altair](https://altair-viz.github.io/), and [JupyterLab](https://github.com/jupyterlab/jupyterlab). As usual, [all of the code is available on GitHub as Jupyter notebooks](https://github.com/ipython-books/cookbook-2nd-code).

However, the main novelty is that [**almost the entire book is now freely available on GitHub**](https://github.com/ipython-books/cookbook-2nd). The released text is available under the CC-BY-NC-ND license, while the code is under the MIT license. A few recipes are exclusive to the printed book and ebook, to be purchased on [Packt](https://www.packtpub.com/big-data-and-business-intelligence/ipython-interactive-computing-and-visualization-cookbook-second-e) and [Amazon](https://www.amazon.com/IPython-Interactive-Computing-Visualization-Cookbook-ebook/dp/B079KBGPQC).

The writing process was [much less painful than with the first edition](/writing-ipython-cookbook/). In this post, I'll give an overview of the technical process I've used to write the book, using Markdown, Jupyter Notebook, pandoc, and pelican.

<!-- PELICAN_END_SUMMARY -->

## From the first edition's PDF to Markdown

I had written the first edition in Jupyter notebooks, and I had developed a home-made tool to convert the notebooks into Word, the only format accepted by Packt. Then, the editing process took place in Word and, after the layout process, in PDF. The text edits weren't backported into the original notebook sources. So I was left with two branches of the text : the original unedited notebooks, and the final, edited, proofread text in PDF.

For the new edition, I wanted to start from the final version of the first edition. At the same time, I had negotiated with Packt Publishing that I would not use anything else than Markdown and Jupyter, except for the very last minor edits made by the publisher in PDF. To save time and to avoid the issues of the first edition, I obtained that only a light proofreading pass would be done by the editors.

A restriction I had was that I wanted the Markdown files to be nicely rendered on GitHub. To see LaTeX equations in Markdown files on GitHub, one has to use an extension like [this Chrome extension](https://chrome.google.com/webstore/detail/github-with-mathjax/ioemnmodlmafdkllaclgeombjnmnbima/), because [GitHub doesn't support this natively](https://github.com/github/markup/issues/897).

How to obtain Markdown files from the PDF ? I used [pdftotext](https://en.wikipedia.org/wiki/Pdftotext), a little tool that extracts plain text from a PDF file. I cleaned the output semi-manually with some Python. I also converted into Markdown the original Jupyter notebooks. Then, I manually merged the two versions, integrating the latest version of the text obtained from the PDF into the Markdown sources. This painstaking process took place over several weeks for the 100+ recipes.

Eventually, I ended up with 100+ Markdown files with the latest version of the code and text of the first edition.


## Editing Markdown files in the Notebook with podoc

To convert the original Jupyter notebooks into Markdown, I used [podoc](https://github.com/podoc/podoc), an experimental tool I'm still developing that aims at replacing my previous [ipymd](https://github.com/rossant/ipymd) project. Instead of relying on a custom Markdown parser adapted from the [mistune](https://github.com/lepture/mistune) Markdown parser in Python, podoc uses [pandoc](http://pandoc.org/) via the [pypandoc](https://github.com/bebraw/pypandoc) wrapper.

Podoc converts files in any supported format into an in-memory abstract syntax tree (AST) that closely follows the internal pandoc AST. The tree can be manipulated in Python, and exported into any other format supported by pandoc. Podoc implements a Jupyter reader and writer, which makes Jupyter notebooks convertable to any pandoc-supported format.

Another nice side-effect is that Markdown files can be directly edited in the Jupyter Notebook, exactly like ipymd. However, unlike ipymd, podoc supports image files. Output images like matplotlib figures are automatically exported in PNG in a subdirectory alongside the Markdown file.

How are code cells supported? After all, Markdown doesn't know how to represent them. I chose a simple set of conventions.

For input code, I use regular code blocks starting with `` ```python ``. This allows input code to be nicely rendered on GitHub, with syntax highlighting in Python. A limitation is that all Python code blocks are to be interpreted as Jupyter code cells, which was an acceptable limitation for the cookbook.

For output, I use a special syntax, for example `` ```{output:stdout}`` for standard output of code cells. For images, I use the following convention: any standalone image in its own paragraph just after a code input block is an output image.

With these conventions, it is easy to write Python code that transforms any AST into a Jupyter-aware AST, with input and output code blocks wrapped into dedicated `CodeCell` AST elements. This modified AST can be trivially exported into a Jupyter notebook object, using [nbformat](https://nbformat.readthedocs.io/en/latest/).

This machinery allowed me to write the book either in a text editor that supports Markdown, or in the Jupyter Notebook. This was extremely convenient: I tend to prefer a text editor for prose, and the Notebook for interactive programming.

Although podoc served me well for this project, I have to add a word of caution which is that the library is still wildly experimental, it has not reached an alpha state yet, and the API is all but stable. Use it at your own risks.


## Updating the book

With the entire book in Markdown and editable in Jupyter, I could start to work on the update itself. Some recipes didn't require much changes, while others had to be significantly rewritten because the underlying library had changed so much, had disappeared, or a new library could make the code significantly simpler.


## Converting to Word

Once I was happy with a chapter, I had to export it into Word. At Packt, editors cannot use anything else than this format. Fortunately, that was easy with podoc and pandoc. I just had to convert Markdown into an AST, and export the AST into a Word `.docx` document using pandoc.

A few things required extra care.

Mathematical equations are supported by pandoc and, thus, podoc. However, Packt editors had a problem with importing Word equations into InDesign, and they asked me to provide PNG and EPS files for every single inline or block LaTeX equation.

In many math-oriented recipes, I had used inline LaTeX equations everywhere in the text. There could be up to 100 little standalone inline or block equations in some recipes. For example, I had to provide three pairs of EPS/PNG files for the LaTeX symbols in the sentence: "the function $f$ reaches its maximum on $[-1, 1]$ at the point $x_0$".

Again, podoc made this process relatively easy.

First, I wrote a little [quick-and-dirty Python script to convert LaTeX code into EPS and PNG](https://gist.github.com/rossant/b9a37747d37140105299b4564fafade1).

Then, I wrote a Python "visitor" function that, for every inline or block LaTeX equation in the AST, wrote the corresponding files.

The editors apologized to make me waste my time exporting thousands of tiny little symbols, but I reassured them saying that it was all done automatically, and that I would never ever have done this by hand! It was actually me who was apologetic because every single of my little stupid EPS files had to be integrated *by hand* into InDesign by the editors. In fact, when I checked the first converted chapter, I realized there was some vertical alignment problems in most inline equations.

<img src="/images/latex-vertical.png" style="width: 50%; display: block; margin: 0 auto;" />

Fortunately, they fixed it all afterwards.

Had I known this, I wouldn't have used so many inline LaTeX equations in the text.

That was the main issue with the process. Apart from that, I advantageously used the AST to customize the exported Word documents: using the input and output code prompts I wanted, running an [autopep8](https://github.com/hhatto/autopep8) pass on the code, making sure there was no more than X characters per line to avoid ugly unintended code wrapping in the PDF, and so on and so forth.

I also used the AST to export just the code as Jupyter notebooks, and to write a small table of contents at the very beginning of every chapter, as required by Packt.


## Editing process

In practice, for every chapter, I sent Packt one exported Word document per recipe, with all images and EPS/PNG equations. They took care of making the PDF layout with InDesign. There were a few edit-review cycles using PDF annotations. I have to admit they did a good job, and that the overall process was still time-consuming, but much less painful than with the first edition.


## Website

Beyond the GitHub repository with the Markdown sources, I also wanted to make a little website for the freely-available recipes of the book. I used the [Pelican](http://docs.getpelican.com/en/stable/) static site generator written in Python. This is what I use for [my own website](https://cyrille.rossant.net/). I also reused the same CSS theme. The website is served on [GitHub pages](https://pages.github.com/).

Even if Pelican supports Markdown contents out of the box, I wrote a Python script to make minor modifications to the sources (adding a header with the book cover image, a link to the book, the license), and to add redirections with [pelican_alias](https://github.com/Nitron/pelican-alias). I had to use a patched version of [Python-markdown](https://github.com/rossant/Python-Markdown/tree/codehilite-css) to [add the code block language name into the CSS classes](https://blog.liang2.tw/posts/2016/02/markdown-codehilite-lang/). This was necessary to have a nice styling of the Jupyter code cells.


## Conclusion

Writing this second edition took place over about a year because I had little time to devote to this project. However, although it was time-consuming, the overall process was not that painstaking. Also, it gave me a motivation to set up an efficient and flexible writing process with tools that I love, such as Markdown, Jupyter, pandoc, and of course Python.
