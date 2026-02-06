# Supabase Self-Hosted Configuration

This directory contains configuration for running Supabase services both locally and on AWS ECS.

## Directory Structure

```
supabase/
├── docker-compose.yml       # Local development compose (all-in-one)
├── nginx.conf               # Nginx gateway config
├── init/                    # Database initialization scripts
│   ├── 00-auth-schema.sql
│   ├── 02-grants.sql
│   └── 03-roles.sql
└── aws/                     # AWS ECS deployment configs
    ├── task-definition-auth.json
    ├── task-definition-rest.json
    ├── task-definition-gateway.json
    └── nginx.conf.template
```

## Local Development

### Quick Start

```bash
# Start all services
cd supabase
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Services & Ports

| Service   | Port  | Description                    |
|-----------|-------|--------------------------------|
| Gateway   | 54321 | Supabase API (auth + rest)     |
| Database  | 54322 | PostgreSQL                     |
| Studio    | 54323 | Supabase Studio UI             |
| Inbucket  | 54324 | Email testing UI               |
| SMTP      | 54325 | Inbucket SMTP server           |

### Environment Variables for Next.js

Add to `.env.local`:

```bash
NEXT_PUBLIC_AUTH_MODE=supabase
AUTH_REQUIRED=true
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcwMjE3MjkxLCJleHAiOjIwODU1NzcyOTF9.B5qF832-Nu4tCx_8xuk7n3u9_kS_h6jL-SNfJ9viWl4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzAyMTcyOTEsImV4cCI6MjA4NTU3NzI5MX0.1V_CGxhp_cHe8scBv9U31o6YzmjYTXi6nD42QCmyyAA
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Testing Email (Inbucket)

1. Open http://localhost:54324
2. Invite a user or request a magic link
3. Check Inbucket for the email
4. Click the link to authenticate

## AWS ECS Deployment

### Architecture

```
Internet → ALB (HTTPS) → ECS Cluster
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Next.js App         Supabase Gateway (nginx)
                                        │
                              ┌─────────┴─────────┐
                              │                   │
                           GoTrue            PostgREST
                           (Auth)             (REST)
                              │                   │
                              └─────────┬─────────┘
                                        │
                                   AWS RDS
                                (PostgreSQL)
```

### Prerequisites

1. AWS RDS PostgreSQL instance with Supabase schema
2. AWS Secrets Manager secrets:
   - `supabase/jwt-secret`
   - `supabase/rds-connection-string`
   - `supabase/rds-authenticator-uri`
   - `ses/smtp-host`, `ses/smtp-port`, `ses/smtp-user`, `ses/smtp-pass`
3. ECR repository for gateway image
4. ECS cluster with Fargate
5. AWS Cloud Map namespace for service discovery

### Deploy Task Definitions

```bash
# Replace variables in task definitions
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=us-east-1

# Register task definitions
aws ecs register-task-definition \
  --cli-input-json file://aws/task-definition-auth.json

aws ecs register-task-definition \
  --cli-input-json file://aws/task-definition-rest.json

aws ecs register-task-definition \
  --cli-input-json file://aws/task-definition-gateway.json
```

### Build & Push Gateway Image

```bash
# Build gateway image with production nginx config
docker build -t supabase-gateway -f aws/Dockerfile.gateway .

# Push to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

docker tag supabase-gateway:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/supabase-gateway:latest

docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/supabase-gateway:latest
```

### Production Environment Variables

```bash
NEXT_PUBLIC_AUTH_MODE=supabase
AUTH_REQUIRED=true
NEXT_PUBLIC_SUPABASE_URL=https://supabase-api.your-domain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Security Notes

- **Local dev keys are NOT secure** - they are committed to the repo for convenience
- **Production secrets** must be stored in AWS Secrets Manager
- **GOTRUE_DISABLE_SIGNUP=true** in production (invite-only)
- **GOTRUE_MAILER_AUTOCONFIRM=false** in production (require email verification)

## Invite-Only Authentication

This setup uses invite-only authentication:

1. Admin invites user via `/api/admin/invite` endpoint
2. User receives magic link email
3. User clicks link → session created
4. Existing users can request new magic links via login page

To invite a user locally:
```bash
curl -X POST http://localhost:3000/api/admin/invite \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Future: Microsoft SSO

When ready to add Azure AD authentication, add these GoTrue environment variables:

```bash
GOTRUE_EXTERNAL_AZURE_ENABLED=true
GOTRUE_EXTERNAL_AZURE_CLIENT_ID=<azure-client-id>
GOTRUE_EXTERNAL_AZURE_SECRET=<azure-client-secret>
GOTRUE_EXTERNAL_AZURE_URL=https://login.microsoftonline.com/<tenant-id>
GOTRUE_EXTERNAL_AZURE_REDIRECT_URI=https://supabase-api.your-domain.com/auth/v1/callback
```
