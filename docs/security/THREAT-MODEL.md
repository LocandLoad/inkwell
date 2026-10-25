# docs/security/THREAT-MODEL.md
## Attack Surface
- POST /api/auth/register — unauthenticated, accepts email/displayName/password
- POST /api/auth/login — unauthenticated, accepts email/password
- POST /api/posts — authenticated, accepts title/body/tags
- GET /api/posts — unauthenticated, returns paginated feed
- JWT access tokens — bearer, sent in Authorization header
## STRIDE Analysis, with Risk Rating
| Component | Threat | Category | Likelihood | Impact | Risk Rating | Mitigation |
|---|---|---|---|---|---|---|
| POST /api/posts | A user forges another user's `authorId` to publish as them | Spoofing | High | High | Critical | Derive author from the authenticated token, never trust client-supplied authorId (Section 5.2) |
| GET /api/posts | Response includes fields beyond what the feed needs (e.g., email) | Information Disclosure | High | Medium | High | Explicit response shaping / DTO (Section 5.3) |
| POST /api/auth/login | Unlimited login attempts enable brute-force credential guessing | Denial of Service / Broken Auth | Medium | High | High | Rate limiting (Section 5.4) |
| POST /api/posts | Untrusted `body` content rendered unsanitized on the client, enabling stored XSS | Tampering / Info Disclosure | Medium | High | High | Output encoding on render (Section 5.5) |