# Build Server

## Docker Commands

1. Run Docker Container: `docker run -it --env-file ./.env --entrypoint /bin/bash --name vercelclone vercelclone`

    - `-it`: interactive mode
    - `--env-file`: attach an .env file
    - `--entrypoint`: Change the default execution behavior

2. Build Docker Image: `docker build -t vercelclone:latest . && docker image prune -f`
