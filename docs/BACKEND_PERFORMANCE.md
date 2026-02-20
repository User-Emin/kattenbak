# Backend performance – 4vCPU / 16GB

**Doel:** Maximaal rendement voor duizenden concurrente gebruikers. 4 vCPU, 16GB RAM, 200GB NVMe, 16TB bandwidth. Volgens [SECURITY_POLICY.md](./SECURITY_POLICY.md).

---

## Ultra-slim balancer

| Component | Configuratie |
|-----------|--------------|
| **Backend** | PM2 cluster, 4 workers (1 per vCPU), poort 3101 |
| **Frontend** | 2 Next.js instances (3102, 3104), nginx `least_conn` |
| **Nginx** | Upstream keepalive 64, failover, retry |

---

## PM2 cluster (backend)

| Setting | Waarde | Reden |
|---------|--------|-------|
| `instances` | 4 | 1 worker per vCPU |
| `exec_mode` | cluster | Eén poort, load spread over workers |
| `wait_ready` | true | Zero-downtime deploy |

**Tuning:** `BACKEND_INSTANCES` via env op de server.

---

## Nginx frontend upstream

```
upstream frontend {
    least_conn;
    server 127.0.0.1:3102 ...;
    server 127.0.0.1:3104 ...;
    keepalive 64;
}
```

---

## Database pooling

- `connection_limit=10` per worker → 40 totaal bij 4 workers
- PostgreSQL `max_connections` meestal 100

---

## Memory budget (16GB)

- Backend: 4 × 384MB ≈ 1,5GB
- Frontend: 2 × 800MB ≈ 1,6GB
- Admin: 500MB
- Nginx/OS/DB: ~2–3GB

---

## Nginx tuning (optioneel)

Zie `deployment/nginx-tuning-4vCPU.conf`: `worker_processes 4`, `worker_connections 4096`.

---

## Verificatie

```bash
pm2 list    # backend: 4 instances, frontend + frontend2 online
pm2 monit
```
