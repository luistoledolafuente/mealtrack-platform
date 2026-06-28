# Backend Quick Reference

Full documentation is at the repository root `docs/`.

Key files to read before implementing:
- `docs/api.md` — Full REST contract (12 resources)
- `docs/modelo-datos.md` — Entities, attributes, relationships
- `docs/reglas-negocio.md` — 32 business rules
- `docs/arquitectura.md` — Architecture, components, flows

Module mapping (API resource → module):
| API Resource | Module |
|---|---|
| /auth/* | auth |
| /users/* | users |
| /restaurants/* | restaurants |
| /meal-plans/* | meal-plans |
| /subscriptions/* | subscriptions |
| /daily-meals/* | daily-meals |
| /adjustment-requests/* | adjustment-requests |
| /payments/* | payments |
| /notifications/* | notifications |
| /dashboards/* | dashboards |
| /audit-logs/* | audit |
