#!/bin/bash

# git -C ./avail-falcor pull

# --- remove running containers ---
sudo docker ps -aq --filter "name=falcor-container$" | xargs -r sudo docker rm -f
sudo docker ps -aq --filter "name=tig_dama_dev_db$" | xargs -r sudo docker rm -f
sudo docker ps -aq --filter "name=avail_auth$" | xargs -r sudo docker rm -f
sudo docker ps -aq --filter "name=clickhouse-server$" | xargs -r sudo docker rm -f

# --- remove existing images ---
sudo docker images --filter=reference=falcor --format "{{.ID}}" | xargs -r sudo docker rmi -f
sudo docker images --filter=reference=tig_dama --format "{{.ID}}" | xargs -r sudo docker rmi -f
sudo docker images --filter=reference=avail --format "{{.ID}}" | xargs -r sudo docker rmi -f
sudo docker images --filter=reference=clickhouse --format "{{.ID}}" | xargs -r sudo docker rmi -f

# run and publish
sudo docker-compose up -d --build
