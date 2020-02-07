# tcl
Taming the complexity of the law: modelling and visualization of dynamically interacting legal systems.

Github Pages link: https://kingsdigitallab.github.io/tcl/

## Requirements
* [Ruby](https://www.ruby-lang.org/en/downloads/) version 2.2.5 or above, including all development headers
* [RubyGems](https://rubygems.org/pages/download)
* [GCC](https://gcc.gnu.org/install/) and [Make](https://www.gnu.org/software/make/)
* [Bundler](https://bundler.io/)
* [Jekyll](https://jekyllrb.com/)

## Set up the local environment
**Note:** _Make sure your system satisfies the requirements above_

* Run in the terminal `gem install bundler jekyll`
* Clone the repository `git clone git@github.com:kingsdigitallab/tcl.git`
* `cd` into the repository
* Set the path for bundle to install the gems locally to your project (rather than at system level) `bundle config set path 'vendor/bundle'`
* Install everything you need in your project folder: `bundle install`

## Run locally

* Run in the terminal `bundle exec jekyll serve --watch --incremental` (the flags `--watch` and `--incremental` are optional, they are useful if editing the project)
* The site is now locally accessible at `http://localhost:4000/tcl/`
