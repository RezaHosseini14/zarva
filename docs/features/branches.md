# Branches

Production branch registry for multi-branch orgs.

- `GET/POST /branches`, `GET/PATCH/DELETE /branches/:id`, `POST /branches/:id/assign-user`
- Entitlement: `maxBranches` + module `branches`
- Permissions: `branches.read`, `branches.manage`
- UI: `/branches` RSC loader
