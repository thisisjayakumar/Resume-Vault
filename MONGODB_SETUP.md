# 🍃 MongoDB Atlas Setup Guide

Complete guide to setting up MongoDB Atlas for your Resume Version Manager.

## Why MongoDB Atlas?

- ✅ **Free Forever**: 512MB storage, perfect for this app
- ✅ **Reliable**: 99.995% uptime SLA
- ✅ **Easy Setup**: 5 minutes to get started
- ✅ **Automatic Backups**: Built-in disaster recovery
- ✅ **Global**: Deploy in your preferred region

## 📋 Quick Setup (5 Minutes)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose "Shared" (Free tier)
4. No credit card required!

### Step 2: Create a Cluster

1. After login, click **"Build a Database"**
2. Choose **"M0 Free"** tier
3. Select your preferred region (closest to you)
4. Cluster Name: `resume-cluster` (or any name)
5. Click **"Create"**
6. Wait 1-3 minutes for cluster creation

### Step 3: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `resume_admin` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** (save this!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add your server's IP address
5. Click **"Confirm"**

⚠️ **Security Note**: For production, restrict to specific IPs. For Netlify functions, "Allow from Anywhere" is required since function IPs are dynamic.

### Step 5: Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **6.0 or later**
6. Copy the connection string:
   ```
   mongodb+srv://resume_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Important**: Replace `<password>` with your actual password

### Step 6: Update .env File

```env
MONGODB_URI=mongodb+srv://resume_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=your-db-name
```

## 🔧 Initialize Database

After setting up your `.env` file:

```bash
# Install dependencies if not already done
cd netlify/functions
npm install
cd ../..

# Run setup script
npm run setup:mongodb

# Test connection
npm run test:mongodb
```

You should see:
```
✅ MongoDB setup complete!
Database: your-db-name
Collections: ip_attempts, metadata
```

## 📊 Database Structure

Your MongoDB will have:

### Database: `your-db-name`

#### Collection: `ip_attempts`
```json
{
  "_id": ObjectId("..."),
  "ip": "192.168.1.1",
  "attempts": 2,
  "locked": false,
  "lockExpiry": null,
  "lastAttempt": 1699564800000,
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes:**
- `ip` (unique): Fast lookups by IP address
- `lockExpiry` (TTL): Auto-cleanup expired locks

#### Collection: `metadata`
```json
{
  "_id": ObjectId("..."),
  "key": "versions",
  "value": [
    {
      "id": "google_drive_file_id",
      "name": "Resume_2024-01-15_v1.0.pdf",
      "date": "2024-01-15T10:30:00.000Z",
      "createdTime": "2024-01-15T10:30:00.000Z"
    }
  ],
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes:**
- `key` (unique): Fast lookups by metadata key

## 🔍 Using MongoDB Compass (Optional)

MongoDB Compass is a GUI tool to view your data:

1. Download from https://www.mongodb.com/try/download/compass
2. Install and open
3. Paste your connection string
4. Click "Connect"
5. Browse your database visually!

## 🌐 For Netlify Deployment

When deploying to Netlify:

1. Go to your site settings
2. Navigate to "Environment variables"
3. Add:
   ```
   MONGODB_URI=mongodb+srv://...
   MONGODB_DB_NAME=your-db-name
   ```
4. Deploy your site
5. Check function logs to verify connection

## 🛠️ Troubleshooting

### "Authentication failed"
```bash
# Check your password in the connection string
# Ensure special characters are URL-encoded
# Example: password "p@ss!" becomes "p%40ss%21"
```

### "Network timeout"
```bash
# Check Network Access in MongoDB Atlas
# Ensure 0.0.0.0/0 is whitelisted (or your IP)
# Try a different region for the cluster
```

### "Database not found"
```bash
# MongoDB creates databases automatically
# Just ensure MONGODB_DB_NAME is set in .env
# Run: npm run setup:mongodb
```

### "Connection string invalid"
```bash
# Ensure you replaced <password> with actual password
# Check for extra spaces or line breaks
# Verify the format: mongodb+srv://username:password@...
```

### "Too many connections"
```bash
# Free tier allows 100 concurrent connections
# Ensure connections are being closed properly
# Check for connection leaks in your code
```

## 📈 Monitoring

### Check Usage

1. MongoDB Atlas Dashboard
2. Click on your cluster
3. View **"Metrics"** tab:
   - Connections
   - Operations per second
   - Storage usage
   - Network traffic

### Free Tier Limits

- **Storage**: 512 MB
- **RAM**: Shared
- **vCPU**: Shared
- **Connections**: 100 concurrent
- **Backup**: Manual only

**Estimated Usage for Resume Manager:**
- Storage: ~1-5 MB (mostly metadata)
- Connections: 1-10 (serverless functions)
- Operations: Well within free limits

## 🔒 Security Best Practices

### For Development
```env
# .env file
MONGODB_URI=mongodb+srv://...
# Network Access: Allow from Anywhere (0.0.0.0/0)
```

### For Production
1. Use strong passwords (generated)
2. Restrict Network Access to known IPs
3. Use MongoDB roles (read/write only what's needed)
4. Enable audit logs
5. Regular backups
6. Monitor unusual activity

### Connection String Security
- ✅ Store in environment variables
- ✅ Never commit to git
- ✅ Use different credentials for dev/prod
- ✅ Rotate passwords periodically
- ❌ Never hardcode in source files
- ❌ Never expose in client-side code

## 🚀 Advanced Features (Optional)

### Enable Backups
1. Upgrade to M2 tier ($9/month)
2. Automatic continuous backups
3. Point-in-time recovery

### Add Replicas
1. Upgrade to M10+ tier
2. Multi-region deployment
3. Automatic failover

### Performance Insights
1. Enable profiling in Atlas
2. View slow queries
3. Optimize indexes

## 🆘 Need Help?

- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [MongoDB Node.js Driver Docs](https://www.mongodb.com/docs/drivers/node/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [Community Forums](https://www.mongodb.com/community/forums/)

## ✅ Checklist

Before moving forward, ensure:

- [ ] MongoDB Atlas account created
- [ ] M0 Free cluster deployed
- [ ] Database user created and password saved
- [ ] Network access configured (0.0.0.0/0 for Netlify)
- [ ] Connection string copied
- [ ] `.env` file updated with MONGODB_URI
- [ ] `npm run setup:mongodb` executed successfully
- [ ] `npm run test:mongodb` passed all tests
- [ ] Can connect using MongoDB Compass (optional)

## 🎓 Next Steps

After MongoDB setup:
1. Continue with the main setup guide
2. Configure Google Drive API
3. Generate password hashes
4. Test locally with `netlify dev`
5. Deploy to Netlify

---

**Your MongoDB Atlas setup is now complete!** 🎉

The free tier is perfect for personal resume management and can handle thousands of downloads per month.

