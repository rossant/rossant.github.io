## New instructions

* ./generate.sh # generate the HTML output
* ./serve.sh    # development server
* ./publish.sh  # publish on github


## Old notes

* This is in the `sources` branch of `rossant.github.io`.
* The `master` branch contains the generated output.
* The `pelican-plugins` (rossant fork) must be recursive-cloned here.
* We test locally with `make html` and `make devserver`
* We publish with `make publish github`
* We must use Docker because build is broken with latest versions of dependencies...
