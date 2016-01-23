# -*- coding: utf-8 -*-
"""Generate a PDF version of the CV."""

import os
import tempfile

from pelican import signals

CMD = ('pandoc {fn} -o content/pdfs/cv.pdf '
       '-V geometry:margin=1in '
       '--template=template.tex')


def generate_pdf(p):
    with tempfile.TemporaryDirectory() as tmpdir:
        print("Generating cv.pdf")
        with open('content/pages/about.md', 'r') as f:
            contents = f.read()
        fn = os.path.join(tmpdir, 'about.md')
        contents = contents[contents.index('\n---') + 4:]
        contents = ('---\n'
                    'title: Curriculum vitae\n'
                    'author: Cyrille Rossant\n'
                    '---\n\n' +
                    contents)
        with open(fn, 'w') as f:
            f.write(contents)
        os.system(CMD.format(fn=fn))


# def register():
#     signals.finalized.connect(generate_pdf)
