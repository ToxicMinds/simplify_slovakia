# Architecture: How Simplify Slovakia Works

## System Overview
## Data Flow

### 1. User Request
User navigates to frontend → selects "Non-EU Employee, First Entry, Bratislava"

### 2. Frontend Request
Frontend sends `GET /flow/sk_non_eu_employee_first_entry_bratislava_v1`

### 3. Backend Resolution
```python
1. Load flow YAML (gets step IDs + order)
2. For each step_id:
   - Load step YAML
   - Attach order from flow
3. Return JSON with complete flow data
```

### 4. Frontend Display
```javascript
1. Receive JSON
2. Parse steps array
3. Render checklist with:
   - Title
   - Description
   - Preconditions (what's needed first)
   - Outputs (what this produces)
   - Official links
   - Failure modes
```

## Key Design Decisions

### Decision 1: YAML Over Database

**Why YAML?**
- Git-trackable (see who changed what, when)
- Human-readable (non-developers can contribute)
- No database costs
- Version control built-in
- Easy to review in PRs

**Tradeoff:**
- Can't do complex queries
- File I/O on every request (mitigated by caching)

**When to reconsider:**
- If we need user-generated content
- If queries become complex
- If we exceed free tier storage

### Decision 2: Deterministic Resolution

**What it means:**
Same input = same output, always. No randomness, no AI inference.

**Why?**
- Auditable (can verify correctness)
- Debuggable (reproducible bugs)
- Trustworthy (no hallucinations)
- Legally defensible (shows we don't interpret)

**Tradeoff:**
- Less "magical" UX than chatbots
- Requires more upfront rule design

### Decision 3: Stateless Backend

**What it means:**
Backend doesn't remember users. Every request is independent.

**Why?**
- Simpler architecture
- No database needed
- Easy to scale (Lambda-friendly)
- Free tier compatible

**Tradeoff:**
- Can't save user progress server-side
- No user accounts in v1

**Solution:**
Client-side progress saving (localStorage)

### Decision 4: Frontend-Heavy

**What it means:**
Most logic in React, backend is just data provider.

**Why?**
- Rich interactions without server round-trips
- Can run offline (with cached data)
- Easier to deploy (static hosting)

**Tradeoff:**
- Duplicated validation logic
- Larger JavaScript bundle

## Tech Stack Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| Backend Language | Python | YAML parsing, familiar to contributors |
| Backend Framework | FastAPI | Fast, typed, auto-docs, async |
| Frontend Framework | React | Component reuse, large ecosystem |
| Styling | Tailwind CSS | Rapid prototyping, small bundle |
| Deployment | AWS Lambda + S3 | Free tier, serverless |
| Data Format | YAML | Human-readable, git-friendly |

## Security Considerations

### Current (v1.0)
- No auth = no auth vulnerabilities
- Static content = minimal attack surface
- Read-only API = no data modification risks

### Future (v2.0+)
If we add user accounts:
- OAuth2 with JWT
- Rate limiting
- Input validation (Pydantic)
- CORS properly configured

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Page load | <2s | CDN caching, code splitting |
| API response | <500ms | In-memory YAML cache |
| Mobile load | <3s on 3G | Image optimization, lazy loading |

## Monitoring (Future)

v1.0: None (keeping it simple)

v2.0+:
- CloudWatch for Lambda errors
- Frontend error tracking (Sentry?)
- Basic analytics (Plausible, not Google)

## Deployment Strategy

**Backend:**
1. Build Docker image
2. Push to AWS ECR
3. Deploy to Lambda (or ECS Fargate)
4. API Gateway in front

**Frontend:**
1. `npm run build`
2. Upload to S3 bucket
3. CloudFront distribution
4. Invalidate cache on deploy

**Cost:** $0-2/month on free tier
