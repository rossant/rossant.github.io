sudo docker build -t pelican .
docker run -t --name=pelican-run -v /home/cyrille/git/rossant.github.io:/site pelican
docker rm pelican-run
