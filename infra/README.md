# Infrastructure

AWS deployment configurations for free-tier operation.

## Goal

Host the entire application on AWS free tier (~$0-2/month).

## Planned Setup

**Backend:**
- AWS Lambda + API Gateway (1M requests/month free)
- OR ECS Fargate spot instances (minimal cost)

**Frontend:**
- S3 static hosting (basically free)
- CloudFront CDN (50GB/month free)

**Database (future):**
- DynamoDB free tier
- OR RDS PostgreSQL free tier

## Cost Guardrails

- CloudWatch billing alarms
- Resource limits in Terraform/CloudFormation
- Monthly budget: $5 hard cap

See `cost-guardrails.md` for detailed budget strategy.
