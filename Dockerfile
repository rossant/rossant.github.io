FROM python:3
MAINTAINER rossant <cyrille.rossant@gmail.com>

# Update OS
RUN sed -i 's/# \(.*multiverse$\)/\1/g' /etc/apt/sources.list
RUN apt-get update
RUN apt-get -y upgrade

# Install dependencies
RUN apt-get install make git tex-common texlive pandoc -y
#RUN easy_install pip
RUN pip install pelican Markdown ghp-import
RUN pip install --upgrade pelican Markdown ghp-import
# RUN git clone https://github.com/getpelican/pelican-plugins /site/

WORKDIR /site
# Need to mount /site/content
CMD pelican content/ -o output/ -s publishconf.py
