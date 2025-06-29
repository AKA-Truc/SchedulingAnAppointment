# 🚀 Deployment Guide - Railway

This guide will help you deploy the Hospital Appointment Backend API to Railway.

## 📋 Prerequisites

- **Railway Account**: Sign up at [railway.app](https://railway.app)
- **GitHub Repository**: Your code should be pushed to GitHub
- **Environment Variables**: Values for all required configuration

## 🗄️ Step 1: Setup Database Services

### PostgreSQL Database
1. Go to Railway Dashboard
2. Click **New Project** → **Provision PostgreSQL**
3. Railway will automatically provide `DATABASE_URL` environment variable

### Redis Database (Optional)
1. In your project, click **New Service** 
2. Select **Redis**
3. Railway will automatically provide `REDIS_URL` environment variable

### MongoDB Database (Optional)
1. In your project, click **New Service**
2. Select **MongoDB** 
3. Railway will automatically provide `MONGODB_URL` environment variable

## 🔧 Step 2: Setup Environment Variables

1. Go to your Railway project
2. Click on your backend service
3. Go to **Variables** tab
4. Add the following environment variables:

### Required Variables
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
JWT_ACCESS_TOKEN_SECRET=your-secret-key
JWT_REFRESH_TOKEN_SECRET=another-secret-key
JWT_ACCESS_TOKEN_EXPIRATION=1d
JWT_REFRESH_TOKEN_EXPIRATION=7d
```

### Optional Variables (if using features)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.railway.app/auth/google/redirect

# VNPay Payment
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://your-frontend-domain.com/payment-success

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🚀 Step 3: Deploy Backend

1. In Railway dashboard, click **New Service**
2. Select **GitHub Repo**
3. Choose your backend repository
4. Railway will automatically:
   - Detect it's a Node.js project
   - Run `npm install`
   - Run `npm run build`
   - Start with `npm run deploy:start`

## 🔍 Step 4: Monitor Deployment

### Check Logs
1. Go to your service in Railway
2. Click **Deployments** tab
3. View real-time logs

### Health Check
Once deployed, visit:
- **API**: `https://your-service.railway.app/`
- **Health Check**: `https://your-service.railway.app/health`
- **API Docs**: `https://your-service.railway.app/api`

## 🐛 Troubleshooting

### Deployment Fails
1. **Check Logs**: Look for error messages in Railway logs
2. **Environment Variables**: Ensure all required variables are set
3. **Database Connection**: Verify DATABASE_URL is correctly provided
4. **Build Errors**: Check if npm install/build works locally

### Health Check Fails
1. **Port Binding**: App should listen on `0.0.0.0:PORT`
2. **Environment**: Check if NODE_ENV=production
3. **Database**: Ensure database is accessible
4. **Redis**: If Redis fails, app should still start (it's optional)

### Common Issues

#### Error: "Service Unavailable"
```bash
# Solution: Check if app is listening on correct port
const port = process.env.PORT ?? 3000;
await app.listen(port, '0.0.0.0');
```

#### Error: "Database Connection Failed"
```bash
# Solution: Check DATABASE_URL environment variable
# It should be automatically provided by Railway PostgreSQL service
```

#### Error: "Redis Connection Failed"
```bash
# Solution: Redis is optional, app should start without it
# Check if REDIS_URL is provided, or app handles Redis connection gracefully
```

## 🔄 Step 5: Post-Deployment

### Run Database Migrations
1. Go to Railway service
2. Click **Deploy** → **Manual Deploy**
3. The deployment will automatically run:
   ```bash
   npm run deploy:start
   # This runs: npm run deploy:migrate && npm run start:prod
   ```

### Update Frontend Environment
Update your frontend `.env` files:
```env
NEXT_PUBLIC_URL_SERVER=https://your-backend.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

## 📈 Step 6: Production Optimizations

### Custom Domain
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update environment variables accordingly

### Auto-Deploy
1. Go to **Settings** → **Service**
2. Enable **Auto Deploy** from main branch
3. Every push to main will auto-deploy

### Monitoring
1. Set up **Railway Metrics** for monitoring
2. Configure **Alerts** for downtime
3. Monitor **Logs** for errors

## ✅ Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Redis database created (optional)
- [ ] All environment variables set
- [ ] Backend service deployed successfully
- [ ] Health check endpoint responding
- [ ] API documentation accessible
- [ ] Database migrations completed
- [ ] Frontend updated with backend URLs
- [ ] Google OAuth configured (if used)
- [ ] Payment gateways configured (if used)
- [ ] Email service configured (if used)

## 🆘 Need Help?

1. **Railway Docs**: [docs.railway.app](https://docs.railway.app)
2. **Railway Discord**: Join Railway community
3. **GitHub Issues**: Create an issue in your repository
4. **Logs**: Always check deployment logs first

---

**🎉 Congratulations! Your Hospital Appointment API is now live on Railway!** 