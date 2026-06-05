# Deployment Guide - Render

This guide will help you deploy your Employee Management backend to **Render**.

## Prerequisites

1. **GitHub Account** - Your code must be on GitHub (Render deploys from GitHub)
2. **Render Account** - Sign up at [https://render.com](https://render.com)
3. **Git initialized** - Your Backend folder should be a Git repository

## Step 1: Push Code to GitHub

First, push your Backend code to a GitHub repository:

```bash
cd Backend
git init
git add .
git commit -m "Initial commit: Employee Management Backend"
git remote add origin https://github.com/YOUR_USERNAME/employee-management-backend.git
git branch -M main
git push -u origin main
```

## Step 2: Create Render Service

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select your repository
4. Configure the service:
   - **Name:** `employee-management-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command:** `npm start`
   - **Plan:** Free tier (for testing)

## Step 3: Add PostgreSQL Database (Render)

1. In the Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `employee-db`
   - **Database:** `employee_management`
   - **User:** `postgres`
   - **Plan:** Free tier
   - **Region:** Same as your web service

3. Once created, copy the **Internal Database URL** (looks like: `postgresql://user:password@host:port/dbname`)

## Step 4: Set Environment Variables

In your Render web service settings:

1. Go to **"Environment"** tab
2. Add the following variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/employee_management
PORT=5000
```

Use the PostgreSQL connection string from Step 3 for `DATABASE_URL`.

## Step 5: Manual Deployment Option (Alternative)

If you prefer to set up manually without `render.yaml`:

1. Create a new **Web Service** on Render
2. Point it to your GitHub repository's Backend folder
3. Set Root Directory: `Backend`
4. Add environment variables
5. Deploy!

## Post-Deployment

### Run Database Migrations
```bash
npm run build
npx prisma migrate deploy
```

### Seed Database (Optional)
After migrations, you can seed data:
```bash
npm run seed:tasks
npm run seed:circulars
npm run seed:attendance
```

### View Logs
In Render dashboard → Your service → **"Logs"** tab

## Environment Variables Summary

| Variable | Example | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | Set to production on Render |
| `DATABASE_URL` | `postgresql://...` | Render PostgreSQL connection string |
| `PORT` | `5000` | Render assigns this automatically |

## Troubleshooting

### Build Fails
- Check that `npm install` completes successfully
- Verify `tsconfig.json` has correct paths
- Ensure all TypeScript files compile with `npm run build`

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running on Render
- Ensure migrations have been applied

### Port Issues
- Don't hardcode PORT - use `process.env.PORT || 5000`
- Your backend currently does this ✅

## Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npx prisma migrate deploy

# Check database connection
npx prisma db execute --file=<file.sql>
```

## Getting Your API URL

After deployment, your API will be available at:
```
https://employee-management-api.onrender.com
```

Update your Frontend `axios.ts` configuration with this URL.

## Cost

- **Free tier:** 0.5 GB RAM, limited features
- **Paid:** From $7/month for more resources
- **PostgreSQL:** Free tier available

---

Need help? Check [Render Docs](https://render.com/docs) or contact support.
