Title: Scientific Python in the Browser: it's coming!
Tags: python

There is currently a manifest trend in the scientific Python ecosystem: Python is slowly but surely coming to the browser. It's a real challenge, but we're getting there. In this post, I want to give an overview of where we are, and where we're headed.

<!-- PELICAN_END_SUMMARY -->

## Why it's a good thing

**Python is becoming [one of the most popular open source platforms for scientific computing and data analysis](http://cyrille.rossant.net/why-using-python-for-scientific-computing/)**. The language is easy-to-use, expressive, open to the rest of the universe, and the scientific ecosystem is quite solid.

On the other hand, the Web is today the [platform of choice](https://blog.mozilla.org/blog/2012/02/27/mozilla-in-mobile-the-web-is-the-platform/) for client-side applications. What we called *Web 2.0* some time ago is now just the *Web*. Social networks have pervaded our lives and sharing things on the Web with our acquaintances is now entirely natural. The Web is also becoming a solid mobile platform, maybe not quite as powerful as native platforms yet, but it should eventually get there (at least that's my hope).

Marrying Python and the Web seems natural. **The power and expressivity of Python for numerical computing, and the popularity of the Web for diffusion and dissemination, interactive data visualization, rich client applications...** Why hasn't it happened yet? The main reason is technical. Python is Python, Javascript is Javascript. Those two just don't get along.

It doesn't have to be that way. Technical difficulties can be overcome. We're not there yet, but we're getting there. Here's why.


## The signs it's coming

It's like different pieces of a puzzle popping here and there, suggesting a barely perceptible convergence. From time to time, Python timidly tempts to approach the Web platform.

### The IPython notebook

The most dazzling attempt so far has decidedly been the [**IPython notebook**](http://ipython.org/notebook.html). This impressively architectured piece of software has been particularly well received by the community. The reason is that it was just the exactly right answer to a desperate need. The fact that it's a browser-based technology is almost a detail, and yet that is precisely my point. Many people now *live* in the browser, so bringing Python there just seems absolutely right.

To me, **the IPython notebook is the first revolution in the convergence between Python and the Web platform**.

The second revolution is [**IPython 2.0 and its interactive widgets**](http://ipython.org/ipython-doc/dev/whatsnew/development.html#notebook-widgets). Those may sound like a gadget, but they *really* are not. They represent a fundamental change of paradigm that brings Python and the browser yet closer. We now have the right architecture to make Python and Javascript communicate in real time. We now have extendable graphical widgets that interact dynamically with Python. We now have the technology to create small Web-based client-side applications that are backed by Python. All that in the notebook.

The third revolution has yet to come. It will complete the union between Python and Javascript by bringing an important part of scientific Python *within* the browser. That's probably a controversial idea, but I think it's both desirable and achievable within the next few years.


### Web-based visualization libraries in Python

Another trend concerns interactive data visualization technologies that come to the browser.

Libraries like [Bokeh](http://bokeh.pydata.org), or online services like [plot.ly](https://plot.ly), allow people to design figures in Python in order to obtain Web-based visualizations. The rationale behind these ideas is that scientists are no longer satisfied with static publication-ready plots: they want *interactive* plots. There really can be scientific information in interactivity (think about linked brushing for instance).

A widely popular interactive visualization library in the Web community is [d3.js](http://d3js.org/). It's no surprise that several Python libraries try to target it as a backend. There's [Vincent](http://vincent.readthedocs.org/en/latest/) that lets you design a visualization in Python, export it to [Vega](http://trifacta.github.io/vega/) (a visualization grammar), and finally generate a d3.js visualization from there.

And there's [mpld3](http://mpld3.github.io/), a wonderful attempt to bring matplotlib and d3.js together. [The idea is conceptually very simple](https://github.com/jakevdp/mpld3/issues/69): [export a matplotlib figure to JSON](https://github.com/mpld3/mplexporter), and generate a d3.js visualization from there. [The end-result is stunning](http://mpld3.github.io/examples/custom_plugin.html): your matplotlib figures become *intrinsically* interactive. You no longer need a live Python server to pan and zoom in your figure: it's just there, in your browser.

Finally, I want to mention [Vispy](http://vispy.org/), a project I'm currently involved in. The idea is to leverage the power of the graphics card (through OpenGL) for fast high-performance interactive visualization of potentially huge datasets. Although it is a Python project, we think hard about ways to bring Vispy to the browser. The most promising (and challenging) approach is quite similar to mpld3: export a visualization in JSON, and render it in the browser with WebGL.

In the end, it seems like data visualization is today a hot topic that concentrates a large part of the various efforts to bring scientific Python to the browser.


### Mobile devices

I've given the arguments from the Python side. Here are those from the browser side.

HTML5, Javascript and CSS3 now form a popular multi-device development technology for client-side applications. Frameworks and game engines are constantly being developped. The popularity of the platform comes from the simplicity of deployement and the fact that it's based on standard technologies of the Web. Mobile devices have now good support of those technologies. The *write once, run anywhere* slogan is now (slowly) becoming true.

There's no reason why scientific applications should not benefit from this platform. The eventuality of joining Python and the Web could enable the creation of rich scientific applications, with ergonomic and portable HTML-based user interfaces backed by the powerful scientific Python ecosystem. Those applications would run in the browser, so deployement would become trivial compared to installing a Python distribution. Besides, they could run directly on tablets and smartphones. I think there would be a huge demand for this.


### Web technologies

Web technologies are being more and more mature and powerful. Even if the Javascript language is sometimes unappreciated, it is becoming quite efficient on latest browsers, notably thanks to dynamic compilation techniques (V8, SpiderMonkey, Chakra...).

Native C code can now be ported to Javascript thanks to [emscripten](http://emscripten.org/) and [asm.js](http://asmjs.org/). Emscripten, based on [LLVM](http://llvm.org/), can convert C code to a subset of Javascript: asm.js, which is a kind of intermediate-level "assembly language" in Javascript. One can now execute Javascript code with performance close to native code. High performance is really coming to the browser.

Very recently, [Intel, Mozilla and Google announced that SIMD instructions where coming to Chrome and Firefox](https://01.org/blogs/tlcounts/2014/bringing-simd-javascript), and to emscripten as well.

[WebCL](http://www.khronos.org/webcl/) is still a draft, but it should eventually bring OpenCL to the browser. General purpose massively parallel computing on multicore CPUs and GPUs in the (desktop or mobile) browser is becoming a reality.

Finally, [WebGL](http://www.khronos.org/webgl/) will interest big data visualization libraries: this technology gives direct access to OpenGL ES from the browser. WebGL support on mobile devices is still scarce, but it should hopefully improve in the future.

As an aside, see this [promising project](http://superconductor.github.io/superconductor/) in Javascript that combines WebGL and WebCL for big data visualization in the browser.

So we see that the pieces of the puzzle are being put together to enable high-performance computing and visualization in the browser. We are close to get everything we need to bring scientific Python to the browser. The last challenge is the language barrier itself.


## How it's coming

So, how could scientific Python come to the browser? Here are a few ideas. Some of them may not be reasonable. I have probably omitted interesting alternative ideas. And I've no idea about which approach could effectively succeed. I hope people more clever than me will eventually find out.


### Python in the Cloud

The "easiest" solution is probably a *cloud* approach. Run Python in the cloud, and make it accessible from browser-based applications. I think this is one of the most reasonable approaches in the short and medium term. Many services already offer this technology: [Wakari](https://wakari.io/), [PiCloud](http://www.picloud.com/), [PythonAnywhere](https://www.pythonanywhere.com/), [StarCluster](http://star.mit.edu/cluster/), and others. The main drawbacks are the following:

1. A live Internet connection is required.
2. You might get high latency depending on your connection, which can be detrimental to real-time interactivity.
3. Those services may sometimes be expensive (you need a cloud infrastructure!).
4. You don't really "own" your code and your data.

The cloud approach is probably the best for heavy workflows, highly intensive computations, and huge amounts of data. For reasonably light computations, or small to medium amounts of data, purely offline self-contained solutions may be interesting alternatives.


### A Python interpreter in the browser

An idea is to write a Python interpreter in Javascript. This can be done manually ([Brython](http://www.brython.info/), [skulpt](http://www.skulpt.org/)) or automatically ([repl.it](http://repl.it/languages)). Performance is generally not optimal, because you end up with Python code being interpreted by a Javascript library that is itself interpreted by the browser.

There are also Javascript libraries that parse Python code and translate it to Javascript ([PythonJS](https://github.com/PythonJS/PythonJS), [pyjs](http://pyjs.org/)).

Although impressive, these projects generally do not guarantee 100% of the language syntax nor 100% modules in the Python standard library. And they don't have support for scientific Python modules like NumPy, SciPy, etc. The main challenge with those libraries is that they include C and even FORTRAN code.

Note that we could also consider translators from Python to languages like [CoffeeScript](http://coffeescript.org/), that transcompile in return to Javascript.


### A Python JIT compiler in the browser

There's an ongoing project called [PyPy.js](http://www.rfk.id.au/blog/entry/pypy-js-first-steps/) that aims at bringing PyPy's JIT Python compiler to Javascript with LLVM and emscripten. There's probably just [*one* guy](http://www.rfk.id.au/) on the entire Earth who has the required degree of programming wizardry to achieve this project. I hope he'll be successful eventually. The end-result would be impressive: write Python code, and JIT-compile it *in the browser* to asm.js with PyPy and emscripten. [Performance appears to be promising](http://www.rfk.id.au/blog/entry/pypy-js-poc-jit/).


### NumPy in the browser

All the solutions mentionned above do not tackle a major challenge: how to bring NumPy and the rest of the scientific Python stack to the browser?

A large part of those libraries is written in C or FORTRAN, and make API calls to CPython. Bringing these entire projects as they are now to the browser seems extremely hard to me. Emscripten and asm.js might help, but to what extent I'm not sure.

An alternative would be to rewrite from scratch part of the core functionality of NumPy. The major missing piece is the multidimensional array data structure: the `ndarray`, and vectorized computations. [Mikola Lysenko](https://github.com/mikolalysenko) has a few projects in this spirit: [`ndarray`](https://github.com/mikolalysenko/ndarray), [`cwise`](https://github.com/mikolalysenko/cwise), and others. This work may be a starting point for bringing core NumPy-like functionality to the browser.

These projects could be combined with asm.js, SIMD.js or WebCL to achieve high performance.

There's also a line of work related to JIT compilation of NumPy computations: [Numba](http://numba.pydata.org/) and [Blaze](http://blaze.pydata.org/), conducted by [Continuum Analytics](http://continuum.io/). Those projects are based on LLVM: they can parse Python code and emit LLVM bytecode that can be compiled to assembly languages for nearly optimal performance. There might be some work to do there to compile Python code to optimized Javascript/asm.js.


## Conclusion

I think there's a whole body of evidence showing that scientific Python will eventually come to the browser. How, I don't know, but I can definitely see several promising approaches.

We'll probably make baby steps at first. For instance, executing simple NumPy-based pure functions from Python to Javascript.

The IPython notebook will provide the perfect platform for these experiments. In particular, the interactive API in IPython 2.0+ could be extended to support Javascript callback functions instead of Python functions. Right now, the [`@interact`](http://nbviewer.ipython.org/github/ipython/ipython/blob/master/examples/widgets/Interact.ipynb) function decorator allows you to generate a set of widgets to control the input arguments of a function. This is a wonderful idea in my opinion, because it's fundamentally *functional*. Converting such decorated Python function to Javascript would directly enable purely offline interactive widgets with the existing infrastructure.

There's some really exciting and challenging work down the road, and I can't wait to see what the community will bring to life.

