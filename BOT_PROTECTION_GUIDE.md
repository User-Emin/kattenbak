# 🛡️ BOT PROTECTION & RATE LIMITING

## Implemented Protections

### 1. ✅ hCaptcha (GDPR-Compliant)
- **Location**: Contact form, RAG chat
- **Validation**: Backend verification
- **Score**: Pass/Fail based

### 2. ✅ NGINX Rate Limiting
```nginx
# Admin panel: 10 req/sec, burst 20
limit_req_zone $binary_remote_addr zone=admin_limit:10m rate=10r/s;

# API: 30 req/sec, burst 50
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
```

### 3. ✅ RAG Security Middleware
- **SQL injection** detection
- **XSS pattern** blocking
- **Command injection** prevention
- **Rate limit**: 100 requests per 15min per IP

---

## Additional Bot Protection (Advanced)

### fail2ban Configuration

**Install**:
```bash
yum install fail2ban
systemctl enable fail2ban
```

**Configure** `/etc/fail2ban/jail.local`:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
filter = nginx-noscript
logpath = /var/log/nginx/access.log

[nginx-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2
```

**Custom filter** `/etc/fail2ban/filter.d/nginx-admin.conf`:
```ini
[Definition]
failregex = ^<HOST> .* "(GET|POST) /admin/.*" 401
            ^<HOST> .* "(GET|POST) /api/v1/admin/.*" 401
ignoreregex =
```

**Activate**:
```bash
systemctl restart fail2ban
fail2ban-client status
```

---

## User-Agent Blocking (Bot Detection)

**Add to NGINX** config:
```nginx
# Block bad bots by User-Agent
map $http_user_agent $bad_bot {
    default 0;
    ~*^$ 1;  # Empty user agent
    ~*(bot|crawler|spider|scraper|curl|wget|python|perl) 1;
    ~*(scan|attack|inject|exploit) 1;
}

server {
    if ($bad_bot) {
        return 403;
    }
}
```

---

## Cloudflare Bot Protection

**Enable** (if using Cloudflare):
- ✅ **Bot Fight Mode** (free)
- ✅ **Challenge Passage** (captcha)
- ✅ **Rate Limiting Rules**
- ✅ **DDoS Protection**

**Cloudflare WAF Rules**:
```
(cf.bot_management.score lt 30) -> Challenge
(http.request.uri.path contains "/admin") and (cf.threat_score gt 10) -> Block
(rate(1m) gt 100) -> Block
```

---

## IP Reputation Blocking

**Integration** with threat intelligence:
```bash
# Download IP blacklists
curl https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt > /etc/nginx/blocked_ips.conf

# Add to NGINX
geo $blocked_ip {
    default 0;
    include /etc/nginx/blocked_ips.conf;
}

server {
    if ($blocked_ip) {
        return 403;
    }
}
```

---

## Monitoring & Alerts

**Setup Grafana + Prometheus**:
- Monitor request rates
- Track 403/429 responses
- Alert on anomalies

**fail2ban Email Alerts**:
```ini
[DEFAULT]
destemail = security@catsupply.nl
sendername = fail2ban
action = %(action_mwl)s
```

---

## Current Status

| Protection | Status | Score |
|-----------|--------|-------|
| hCaptcha | ✅ Active | 10/10 |
| NGINX Rate Limit | ✅ Active | 9/10 |
| RAG Middleware | ✅ Active | 9/10 |
| fail2ban | ⏳ Pending | 0/10 |
| User-Agent Block | ⏳ Pending | 0/10 |
| Cloudflare | ⏳ Optional | 0/10 |

**Overall Score**: 7/10 → **Target: 10/10**

---

## Next Steps

1. ✅ Install fail2ban (requires server access)
2. ✅ Add User-Agent blocking to NGINX
3. ✅ Consider Cloudflare (DDoS protection)
4. ✅ Set up monitoring (Grafana)
