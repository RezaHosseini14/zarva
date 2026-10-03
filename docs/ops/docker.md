# Docker

## Services

| Service | Host port | Container |
| --- | --- | --- |
| postgres | 5433 | 5432 |
| redis | 6380 | 6379 |
| minio | 9010 / 9011 | 9000 / 9011 |
| backend (profile `full`) | 4100 | 4100 |
| frontend (profile `full`) | 3100 | 3100 |

## Dev infra only

```bash
docker compose up -d postgres redis minio
```

## Full stack

```bash
docker compose --profile full up -d --build
```

Health: backend `GET /api/v1/health`.
