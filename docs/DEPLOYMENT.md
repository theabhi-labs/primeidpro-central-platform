# Production Deployment Guide — Prime ID Pro

> **Frontend Domain**: [https://primeidpro.online](https://primeidpro.online)  
> **API Domain**: [https://api.primeidpro.online](https://api.primeidpro.online)  
> **Target Hosting**: Render (Web Service + Static Site) or Vercel + Render  
> **Database**: MongoDB Atlas (Dedicated / Shared ReplicaSet Cluster)  
> **Object Storage**: Cloudflare R2 (Private S3-Compatible Bucket)  
> **Payment Gateway**: Razorpay (Live Gateway)

---

## 1. Production Architecture Overview

```text
                    INTERNET
                       │
                 Cloudflare DNS
                       │
              ┌────────┴────────┐
              ▼                 ▼
      primeidpro.online    api.primeidpro.online
              │                 │
              ▼                 ▼
        React Frontend      Render API
        (Static Site)     (Node Web Service)
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
          MongoDB Atlas    Cloudflare R2    Razorpay
```

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Create MongoDB Atlas Production Database
1. Create a project and cluster in MongoDB Atlas (recommended: AWS / Mumbai `ap-south-1`).
2. Create a dedicated database user with `readWrite` permissions on database `primeidpro`.
3. In **Network Access**, add the IP access list (allow Render outbound IPs or `0.0.0.0/0` with strong password).
4. Copy the SRV connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/primeidpro?retryWrites=true&w=majority`

### Step 2: Create Cloudflare R2 Private Bucket
1. In Cloudflare Dashboard → **R2** → Create Bucket `primeidpro-private-temp-photos`.
2. Ensure **Public Access is disabled**.
3. Under **Manage R2 API Tokens**, create an API Token with **Object Read & Write** permissions for this bucket.
4. Note the:
   - **Endpoint URL**: `https://<account-id>.r2.cloudflarestorage.com`
   - **Access Key ID**
   - **Secret Access Key**
   - **Bucket Name**: `primeidpro-private-temp-photos`

### Step 3: Configure Razorpay Gateway
1. In Razorpay Dashboard → **Settings** → **API Keys** → Generate Live Key ID & Secret.
2. In **Webhooks**, add endpoint URL:
   `https://api.primeidpro.online/api/v1/webhooks/razorpay`
3. Select active webhook events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Set a strong Webhook Secret and note it down.

### Step 4: Create Render Web Service for Central API
1. In Render Dashboard → **New** → **Web Service** → Connect your GitHub repository `primeidpro-central-platform`.
2. Configure settings:
   - **Name**: `primeidpro-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/v1/health/ready`

### Step 5: Configure Production Environment Variables in Render
Under the API Web Service **Environment** tab, configure:

| Environment Variable | Value / Description |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render default) |
| `CLIENT_URL` | `https://primeidpro.online` |
| `DOMAIN` | `https://api.primeidpro.online` |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@...` |
| `USE_MEMORY_DB_FALLBACK` | `false` |
| `JWT_SECRET` | *(64+ random characters generated secret)* |
| `DEVICE_JWT_SECRET` | *(64+ random characters generated secret)* |
| `JWT_EXPIRES_IN` | `7d` |
| `RAZORPAY_KEY_ID` | `rzp_live_xxxxxxxxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | `your_live_razorpay_secret` |
| `RAZORPAY_WEBHOOK_SECRET`| `your_razorpay_webhook_secret` |
| `PAYMENT_TEST_MODE` | `false` |
| `STORAGE_DRIVER` | `R2` |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_BUCKET_NAME` | `primeidpro-private-temp-photos` |
| `R2_ACCESS_KEY_ID` | `your_cloudflare_r2_access_key` |
| `R2_SECRET_ACCESS_KEY` | `your_cloudflare_r2_secret_key` |
| `R2_REGION` | `auto` |
| `PHOTO_RETENTION_MINUTES`| `10` |
| `UPLOAD_RETENTION_HOURS` | `2` |
| `SIGNED_URL_EXPIRES_SECONDS`| `900` |
| `CLEANUP_INTERVAL_MS` | `60000` |

### Step 6: Deploy Frontend Static Site
1. In Render Dashboard → **New** → **Static Site** (or deploy on Vercel).
2. Configure settings:
   - **Name**: `primeidpro-client`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Environment Variables:
   - `VITE_API_URL`: `https://api.primeidpro.online/api/v1`
4. Routing / Rewrite rules are automatically read from `client/public/_redirects` or `render.yaml`.

### Step 7: Configure Custom DNS Records
In your DNS provider (e.g. Cloudflare DNS):

| Type | Hostname | Target / Value | Proxy Status |
|---|---|---|---|
| `CNAME` | `primeidpro.online` | `<your-render-client>.onrender.com` | DNS Only or Proxied |
| `CNAME` | `www` | `primeidpro.online` | Proxied |
| `CNAME` | `api` | `<your-render-api>.onrender.com` | DNS Only or Proxied |

### Step 8: Post-Deployment Verification Checklist
1. Verify Liveness: `curl -I https://api.primeidpro.online/api/v1/health` → `200 OK`
2. Verify Readiness: `curl https://api.primeidpro.online/api/v1/health/ready` → `{"ready": true, "checks": {"database": {"status": "CONNECTED"}, "storage": {"status": "READY"}}}`
3. Verify CORS: Request with unknown origin is rejected with `403 Forbidden`.
4. Verify SPA routing: Direct load of `https://primeidpro.online/csc/dashboard` loads React app without 404.
