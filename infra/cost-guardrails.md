# Cost Guardrails

Simplify Slovakia must remain **free to operate** (within AWS free tier).

## Monthly Budget: $5 Hard Cap

If we exceed $5/month, we've failed the architecture constraint.

## Free Tier Resources

**Compute:**
- Lambda: 1M requests/month, 400K GB-seconds
- ECS Fargate: None (use spot instances if needed)

**Storage:**
- S3: 5GB, 20K GET, 2K PUT
- CloudFront: 50GB/month, 2M HTTP requests

**Database (future):**
- DynamoDB: 25GB storage, 25 read/write units
- RDS: 750 hours/month (t2.micro), 20GB storage

## Alarms

Set up CloudWatch billing alarms at:
- $1 (warning)
- $3 (critical)
- $5 (auto-shutdown)

## Cost Optimization

1. **Aggressive caching** - CloudFront + browser cache
2. **Minimal Lambda executions** - Cache resolved checklists client-side
3. **No persistent connections** - Stateless API
4. **Compress everything** - Gzip responses
5. **CDN-first** - Serve static assets from CloudFront, not Lambda

## If We Exceed Free Tier

1. Add donations/sponsorship
2. Switch to cheaper providers (Vercel, Netlify, etc.)
3. Open-source the data, let others host
