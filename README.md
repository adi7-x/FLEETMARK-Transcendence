
## Architecture

```
                    +---------------------+
                    |   Browser (HTTPS)   |
                    +--------+------------+
                             |
                    +--------v------------+
                    |  NGINX + ModSecurity |  <- WAF (OWASP CRS)
                    |     WAF :8443       |
                    +--------+------------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v---+  +------v------+  +---v----------+
     |   React    |  |   Django    |  |  HashiCorp   |
     |  Frontend  |  |   Backend   |  |    Vault     |
     |   :5174    |  |   :8000     |  |   :8200      |
     +------------+  +------+------+  +--------------+
                            |
              +-------------+-------------+
              |                           |
     +--------v-------+         +--------v--------+
     |  PostgreSQL 15 |         |   ELK Stack     |
     |    :5432       |         | ES + Logstash   |
     +----------------+         | + Kibana :5601  |
                                +-----------------+
```

---

## Quick Start

```bash
# Clone
git clone https://github.com/adi7-x/FLEETMARK-Transcendence.git
cd FLEETMARK-Transcendence

# Configure
cp .env.example .env
# Edit .env to add your 42 Intra API keys

# Launch (builds and starts all 11 containers)
make up

# Access at https://localhost:8443
```

```

| Service | URL | Notes |
|---------|-----|-------|
| **App** | `https://localhost:8443` | Through WAF |
| **API Docs** | `https://localhost:8443/api/v1/schema/swagger-ui/` | OpenAPI 3.0 |
| **Kibana** | `https://localhost:5601` | ELK dashboards |

---

## Team

| Name | Role | Core Responsibility |
|------|------|---------------------|
| **Adil Bourji** (`aabourji`) | Product Owner / Frontend Lead | React SPA, custom design system, admin portal, i18n |
| **Mohamed Lahrech** (`mlahrech`) | Tech Lead / Backend | API design, reservation engine, data model |
| **Aamir Tahtah** (`atahtah`) | Project Manager / DevOps | Docker (11 containers), ELK, WAF |
| **Abderrahman Chakour** (`achakour`) | Backend Developer | 42 OAuth, JWT, HashiCorp Vault |
| **Ayoub El Haouti** (`aelhaouti`) | QA Engineer | 86 automated tests, OpenAPI docs |

---

## Module Scoring

**19/14 points** -- exceeds minimum by 5 points.

| Module | Type | Points |
|--------|------|--------|
| Framework (React + Django) | Major | 2 |
| ORM (Django ORM + PostgreSQL) | Minor | 1 |
| Public API (OpenAPI + API Key) | Major | 2 |
| Announcement System | Minor | 1 |
| Custom Design System | Minor | 1 |
| Multi-Language (EN/FR/AR) | Minor | 1 |
| RTL Support (Arabic) | Minor | 1 |
| User Management (RBAC) | Major | 2 |
| OAuth 2.0 (42 Intra) | Minor | 1 |
| TOTP 2FA | Minor | 1 |
| WAF + Vault | Major | 2 |
| ELK Stack | Major | 2 |
| GDPR Compliance | Minor | 1 |
| Analytics Dashboard | Minor | 1 |
| **Total** | **5 Major + 9 Minor** | **19** |

---

## Full Documentation

For detailed technical documentation including database schema, API endpoints, security architecture, and contribution guidelines:

-> **[Read the Full Documentation](./fleetmark/README.md)**

---

Built with heart at 1337 Coding School (42 Network) . Casablanca, Morocco
