# Instructions
## To restart:
1. (Optional) Navigate to the `avail-falcor` directory, update code/configs
    - `/home/deploy/gateway2/avail-falcor`
2. Navigate to the `docker_deploy` directory
    - `/home/deploy/gateway2/docker_deploy`
3. Run `./docker_stop.sh` to stop the 4 containers
    - `falcor-container`, `tig_dama_dev_db`, `avail_auth`, `clickhouse-server`
4. Run `./docker_run.sh` to create and deploy the 4 containers
