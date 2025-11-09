# 🚀 Quick Setup Guide

This guide will help you get your Resume Version Manager up and running in about 30 minutes.

## ⚡ Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Netlify account created
- [ ] Google Cloud account created
- [ ] FaunaDB account created
- [ ] Repository cloned

## 📝 Step-by-Step Setup

### Step 1: Install Dependencies (2 minutes)

```bash
npm install
cd netlify/functions && npm install && cd ../..
```

### Step 2: MongoDB Atlas Setup (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Create database user with password
4. Configure Network Access (Allow from Anywhere: 0.0.0.0/0)
5. Get connection string
6. Replace `<password>` in connection string

**📖 Detailed Guide**: See `MONGODB_SETUP.md` for step-by-step instructions

### Step 3: Google Drive Setup (10 minutes)

#### A. Enable API
1. Go to https://console.cloud.google.com/
2. Create new project: "Resume Manager"
3. Go to "APIs & Services" → "Library"
4. Search "Google Drive API" → Enable

#### B. Create Service Account
1. "APIs & Services" → "Credentials"
2. "Create Credentials" → "Service Account"
3. Name: "resume-manager-service"
4. Role: "Editor"
5. Click "Done"

#### C. Create Key
1. Click on service account name
2. "Keys" tab → "Add Key" → "Create New Key"
3. Choose "JSON" → Download file
4. Open JSON file, you need:
   - `client_email`
   - `private_key`

#### D. Create Drive Folder
1. Go to https://drive.google.com/
2. Create folder: "Resume Versions"
3. Copy folder ID from URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```
4. Right-click folder → Share
5. Add service account email (from JSON)
6. Give "Editor" permission

### Step 4: Configure Environment (5 minutes)

1. Copy the example file:
```bash
cp env.example .env
```

2. Generate password hashes:
```bash
# For user password
node scripts/generate-hash.js
# Enter: yourUserPassword123
# Copy the hash

# For admin password
node scripts/generate-hash.js
# Enter: yourAdminPassword456
# Copy the hash
```

3. Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Edit `.env` file with all values:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=resume_manager
GOOGLE_CLIENT_EMAIL=resume-manager-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i
PASSWORD_HASH=$2a$10$...your_user_hash
ADMIN_PASSWORD_HASH=$2a$10$...your_admin_hash
JWT_SECRET=abc123...your_jwt_secret
```

### Step 5: Initialize Database (2 minutes)

```bash
npm run setup:mongodb
```

You should see:
```
✅ MongoDB setup complete!
```

Test connection:
```bash
npm run test:mongodb
```

### Step 6: Test Locally (3 minutes)

```bash
netlify dev
```

Visit http://localhost:8888

Test:
- [ ] Page loads with 3D effects
- [ ] Click "Download Now"
- [ ] Enter password (should fail - no resume yet)
- [ ] Click "Admin Access"
- [ ] Login with admin password
- [ ] Upload a test PDF

### Step 7: Deploy to Netlify (5 minutes)

#### Option A: Via GitHub (Recommended)

1. Create GitHub repo
2. Push code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/resume-manager.git
git push -u origin main
```

3. Netlify Dashboard:
   - "Add new site" → "Import from Git"
   - Select GitHub → Select repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Functions directory: `netlify/functions`
   
4. Add environment variables:
   - Site settings → Environment variables
   - Add all from your .env file
   
5. Deploy!

#### Option B: Via CLI

```bash
netlify login
netlify init
# Follow prompts
netlify deploy --prod
```

Add environment variables:
```bash
netlify env:set FAUNADB_SECRET "your_value"
netlify env:set GOOGLE_CLIENT_EMAIL "your_value"
# ... repeat for all env vars
```

### Step 8: Verify Deployment (2 minutes)

1. Visit your Netlify URL
2. Test download flow
3. Test admin upload
4. Check previous versions display

## 🎉 You're Done!

Your resume manager is now live! 

### What's Next?

1. **Customize Colors**: Edit `tailwind.config.js`
2. **Custom Domain**: Netlify → Domain settings
3. **Add SSL**: Automatically provided by Netlify
4. **Monitor**: Check Netlify function logs

## 🐛 Common Issues

### "Module not found" errors
```bash
cd netlify/functions
rm -rf node_modules
npm install
```

### MongoDB connection failed
- Double-check MONGODB_URI and password
- Ensure IP is whitelisted (0.0.0.0/0)
- Check Network Access in MongoDB Atlas
- Run setup-mongodb.js again

### Google Drive "403 Forbidden"
- Verify service account has folder access
- Check folder ID is correct
- Ensure API is enabled

### 3D effects not working
- Check browser supports WebGL
- Try different browser
- Check console for errors

## 💡 Tips

1. **Save your passwords**: Store them in a password manager
2. **Backup .env**: Keep it secure, don't commit it
3. **Test uploads**: Try different PDF sizes
4. **Monitor usage**: Check Netlify/MongoDB Atlas dashboards
5. **Update regularly**: Keep dependencies updated

## 📞 Need Help?

- Check README.md for detailed info
- Review Netlify function logs
- Check browser console
- Verify all environment variables

---

Happy resume managing! 🎊

