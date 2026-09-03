# deploy/compose

The compose file `docker compose up` actually reads lives at the **repo root**
(`../../docker-compose.yml`), not here - `docker compose` looks in the current directory by
default, and §48's promised developer experience is `git clone && ... && docker compose up` with
no extra flags. Nesting it here would mean every contributor needs `-f deploy/compose/docker-compose.yml`.

This directory documents that decision and is the reserved home for any future compose overlays
(e.g. a `docker-compose.override.yml` for multi-provider-per-container experiments, or a
`docker-compose.ci.yml`) once there's more than one compose file to organize.

The image itself is built from [`../docker/Dockerfile`](../docker/Dockerfile).
