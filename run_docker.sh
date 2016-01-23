#sudo docker build -t pelican .
docker pull rossant/pelican
docker run -t --name=pelican-run -v $TRAVIS_BUILD_DIR:/site rossant/pelican
docker rm pelican-run
