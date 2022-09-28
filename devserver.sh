echo "type ./develop_server.sh restart 8000"
sudo docker run --rm -it -p 8000:8000 -v $(pwd):/site rossant/pelican bash
