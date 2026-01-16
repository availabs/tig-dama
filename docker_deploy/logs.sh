#!/bin/bash

# Get the ID of the container
container_id=$(sudo docker ps -aqf "name=falcor-container$")

# Get the logs of the container
sudo docker logs -ft $container_id

# Save the logs to a file
#docker logs $container_id > logs.txt
