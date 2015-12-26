Title: Playing with Ruzzle in Python
Tags: python

Ruzzle is becoming a popular game on smartphones and tablets. Inspired by
Boggle, it consists in finding as many words as possible in a grid of 4x4
letters. Here I'll show how one can easily generate and resolve grids
automatically in Python.

<!-- PELICAN_END_SUMMARY -->

Generating grids
----------------

A grid is a $N \times M$ matrix of letters ($N=M=4$ here). The letters are randomly
sampled according to some probability distribution. We'll see how we can
generate grids with a reasonably good number of possible words.

### Sampling letters

The easiest way of sampling letters is to use a uniform distribution over
the alphabet. However, uncommon letters will appear as frequently as the most
common letters, which will yield awkward grids with very few existing words.
What we can do is take the frequency of letters across all existing words in
a given language, and sample letters according to this distribution.
The frequency list can be found on Wikipedia for example
([here for English](http://en.wikipedia.org/wiki/Letter_frequency)).

I created two text files, one with the list of all letters by decreasing
order of frequency, one with the list of frequencies for each letter.
These files can be easily opened with Numy's `loadtxt`. Then, to sample
letters according to this distribution, we can use the following code:

    :::python
    frequencies_cum = cumsum(frequencies)
    dig = digitize(rand(count), frequencies_cum)
    grid = letters[dig].reshape((rows, columns))

Here, `letters` is a 26-long vector with the letters,
`frequencies` is a 26-long vector with the letter frequencies,
`count` is the number of letters
to sample, and `rows` and `columns` are the number of rows and columns in
the grid. The idea is to partition the interval $[0,1]$ into 26 boxes,
each box size being equal to the corresponding letter's frequency. By
sampling uniform values in $[0,1]$ and getting the corresponding boxes
in which they appear, we
obtain random values between 0 and 25 that correspond to random letters
respecting the frequencies. Mathematically, this method is called
[*inverse transform sampling*](http://en.wikipedia.org/wiki/Inverse_transform_sampling).

The `cumsum` function yields the cumulative probability distribution,
and `digitize` represents the inverse function. The `dig` variable contains
random integer indices between 0 and 25, and finally `grid` is a Numpy array
with the random letters.

It would be possible to extend this generation method by taking second-order
statistics into account (i.e. the frequency of each *pair* of successive
letters across all words) and generating the grid by taking these second-order
correlations into account. However this would be much more complicated and
probably overkill for small grids!


### Using the IPython notebook

Now, we can define a simple Python class for generating a grid and displaying a
nice representation in the IPython notebook. The principle is to
create a `_repr_html_` method for the class so that a HTML table is displayed
in the notebook. Here is an example of such a class:

    :::python
    class Grid(object):
        def __init__(self, rows, columns):
            self.rows = rows
            self.columns = columns
            self.count = self.rows * self.columns
            # generating the grid
            frequencies_cum = cumsum(frequencies)
            dig = digitize(rand(self.count), frequencies_cum)
            self.grid = letters[dig].reshape((self.rows, self.columns))

        def _repr_html_(self):
            style_td = """
            width: 50px;
            height: 50px;
            font-size: 24pt;
            text-align: center;
            vertical-align: middle;
            text-transform: uppercase;
            font-weight: bold;
            background: #eee;
            """
            html = '<table>\n'
            for row in xrange(self.rows):
                html += '<tr>\n'
                for column in xrange(self.columns):
                    html += '<td style="{0:s}">{1:s}</td>\n'.format(
                        style_td, self.grid[row, column])
                html += '</tr>\n'
            html += '</table>'
            return html

The `__init__` constructor just contains the grid generation code we described
above. The interesting part is in the `_repr_html_` method. We define a HTML
table, some basic CSS styles and we return the code. Then, in the IPython
notebook, displaying a grid is a simple as this:




The
[rich display feature](http://ipython.org/ipython-doc/dev/api/generated/IPython.core.formatters.html)
can also be used to display SVG, PNG, JPEG, LaTeX
or JSON representations. In the future, there will be the possibility to
write custom Javascript extensions, and we can expect to have
rich representations using libraries such as D3, ThreeJS, WebGL, etc.
I can't even imagine the incredibly cool stuff we're going to see in
the notebook in the months and years to come.


Solving grids
-------------

Now that we generated grids, how about solving them? I won't describe how
to implement the game in Python, but rather how to code a robot that solves
a grid automatically.

### Using a dictionary

The first step is to find a dictionary with the list of all possible words
in a given language. For the French language,
[I found this dictionary with 336,531 words](http://www.pallier.org/ressources/dicofr/dicofr.html).
It's a few megabytes large. I had to get rid of the accents, and I used the
following code snippet
([found here](http://stackoverflow.com/questions/517923/what-is-the-best-way-to-remove-accents-in-a-python-unicode-string)):

    :::python
    import unicodedata
    with open('dictionary_accents.txt', 'r') as f:
        dictionary = f.read()
    if isinstance(dictionary, str):
        dictionary = unicode(dictionary, 'utf8', 'ignore')
    dictionary = unicodedata.normalize('NFKD', dictionary).encode('ascii','ignore')
    with open('dictionary.txt', 'w') as f:
        f.write(dictionary.lower())

Then, the dictionary can be simply loaded in Python using Numpy's `loadtxt`
function:

    :::python
    dictionary = loadtxt('dictionary.txt', dtype=str)

### Using an efficient data structure for the dictionary

We're going to write an algorithm that automatically resolves a grid by finding
all possible words according to the dictionary. It's a computationally
intensive task, even for small grids, since there's a combinatorial explosion.
Using naive algorithms and data structures won't work for 4x4 grids. Therefore
I'll detail the easiest techniques that allow to solve a 4x4 grid
instantaneously (a few tens of milliseconds on an old laptop).

The algorithm will work by starting from any letter, and recursively going
through all neighbors in the grid, checking at each iteration that the
current word exists in the dictionary. The number of paths is huge, and the
dictionary is several hundreds of thousands of words long. Searching each word
in the dictionary by looking for every existing word individually is largely
infeasible. A possibility is to use a more efficient data structure than
just a linear list of possible words.

The data structure I chose is a [trie](http://en.wikipedia.org/wiki/Trie).
It is a
tree-like data structure that is particularly adapted here. Indeed, it offers
a very efficient way of checking if one word appears in the dictionary,
or *if it's the prefix of at least one existing word*. The latter point is
crucial, because it allows to know in advance when an exploratory path is
condemned, i.e. when no other word can be found by appending letters to the
current word. In this case the solving algorithm will backtrack and try
other paths directly.

In this tree, the root corresponds to the empty string,
every internal node corresponds to a prefix, and every leaf
corresponds to an existing word in the dictionary.

![A trie](http://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Trie_example.svg/200px-Trie_example.svg.png)

I found a
[code snippet on StackOverflow](http://stackoverflow.com/questions/11015320/how-to-create-a-trie-in-python)
implementing a trie in Python. It is particularly simple, because a structure
with nested Python dictionaries is perfectly adapted for tries.

    :::python
    _end = '_end_'
    def make_trie(*words):
        root = dict()
        for word in words:
            current_dict = root
            for letter in word:
                current_dict = current_dict.setdefault(letter, {})
            current_dict = current_dict.setdefault(_end, _end)
        return root

This function takes a list of words as an argument, and converts it into
a trie. To get all words starting with `sta`, we just use
`trie['s']['t']['a']`. Now, here is the function to efficiently check
if a word is in the dictionary:

    :::python
    def in_trie(trie, word):
        current_dict = trie
        for letter in word:
            if letter in current_dict:
                current_dict = current_dict[letter]
            else:
                return False
        else:
            if _end in current_dict:
                return True
            else:
                return False

This function explores the tree following the letters in the word, and
returns `True` if it ends on a leaf.

Here is the function to check is a string is a prefix to at least one word
in the dictionary:

    :::python
    def prefix_in_trie(trie, word):
        current_dict = trie
        for letter in word:
            if letter in current_dict:
                current_dict = current_dict[letter]
            else:
                return False
        return True


### Solving algorithm

Now, here is the solving algorithm. We first start from any letter in the grid.
Then, we check if 1) the current word is in the dictionary and 2) whether
the path is not condemned, i.e. there are other words to find on this current
path. If everything's ok, we go through all neighbors of the current position
and we apply *recursively* the same function on the expanded paths.
The exploration corresponds to a
[depth-first search in a graph](http://en.wikipedia.org/wiki/Depth-first_search).

We use several data structures. First, `words` is the list of all words
found so far, initially empty. The current path is stored in a list `positions`
containing a list of tuples `(i,j)`. It allows us
to avoid crossings in the paths, i.e. we can't explore an already visited
position in a given path.

Here is the code:

    :::python
    def get_word(positions):
        """Get the word corresponding to a path (list of positions)."""
        return ''.join([g.grid[(i, j)] for (i, j) in positions])

    neighbors = [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)]

    def explore(positions, words):
        # process current word
        word = get_word(positions)
        # check if the word is in the dictionary
        if len(word) >= 2 and in_trie(trie, word) and word not in words:
            words.append(word)
        # stop if this path is condemned, i.e. no more word possible
        if not prefix_in_trie(trie, word):
            return
        # go through all neighbors of the last position
        pos = positions[-1]
        for neighbor in neighbors:
            npos = (pos[0] + neighbor[0], pos[1] + neighbor[1])
            # check if the neighbor is admissible
            if npos[0] >= 0 and npos[0] < g.rows and npos[1] >= 0 and npos[1] < g.columns:
                # avoid self-intersections
                if npos not in positions:
                    # we create a copy of the list positions instead of
                    # updating the same list!
                    npositions = positions + [npos]
                    # explore the new path
                    explore(npositions, words)

    def find_words(grid):
        """Return all possible words in a grid."""
        words = []
        for row in xrange(grid.rows):
            for column in xrange(grid.columns):
                explore([(row, column)], words)
        # sort words by decreasing order of length
        words = sorted(words, cmp=lambda k,v: len(k)-len(v))[::-1]
        return words

This algorithm appears to be sufficiently performant on 4x4 grids thanks
to our efficient trie data structure. A naive implementation with a Numpy
array for the dictionary takes several minutes instead of a few tens of
milliseconds with the trie.

As an example, here is the list of words found on the grid shown above
(in French):

    barbue, reacs, ruera, barbu, cabus, ubacs, scare, jura, jure, reac, crue, crus, urus, abus, ruer, bacs, busc, bure, brus, cuba, cura, cure, cabs, guru, grue, ubac, suca, surs, rea, eau, cru, ure, are, rue, rua, rus, bar, bac, bus, bue, bru, cab, car, gus, suc, sur, ra, re, eu, cl, au, ru, bu, ca, us, su.

Finally, the full code, including the dictionary,
[can be downloaded here]().


