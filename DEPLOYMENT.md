# 🚀 Deployment Guide

Complete guide for deploying your Resume Version Manager to production.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] FaunaDB collections and indexes created
- [ ] Google Drive folder shared with service account
- [ ] Tested locally with `netlify dev`
- [ ] All passwords hashed and stored
- [ ] Git repository initialized

## 🔧 Deployment Options

### Option 1: Netlify + GitHub (Recommended)

**Pros:**
- Automatic deployments on push
- Easy rollback
- Preview deployments for branches
- Build logs and monitoring

**Steps:**

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: Resume version manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resume-manager.git
git push -u origin main
```

2. **Connect to Netlify**
- Go to https://app.netlify.com/
- Click "Add new site" → "Import an existing project"
- Choose "GitHub"
- Authorize Netlify
- Select your repository

3. **Configure Build Settings**
```
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

4. **Add Environment Variables**
Go to: Site settings → Environment variables → Add a variable

Add each variable from your `.env` file:
```
FAUNADB_SECRET
GOOGLE_CLIENT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_DRIVE_FOLDER_ID
PASSWORD_HASH
ADMIN_PASSWORD_HASH
JWT_SECRET
```

⚠️ **Important**: For `GOOGLE_PRIVATE_KEY`, keep it as a single line with `\n` for newlines.

5. **Deploy**
- Click "Deploy site"
- Wait for build to complete
- Visit your site URL!

### Option 2: Netlify CLI

**Pros:**
- Quick deployment
- No GitHub required
- Direct control

**Steps:**

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login**
```bash
netlify login
```

3. **Initialize**
```bash
netlify init
```

Follow prompts:
- Create & configure new site
- Choose team
- Site name: resume-manager-[your-name]
- Build command: `npm run build`
- Directory: `dist`
- Functions: `netlify/functions`

4. **Add Environment Variables**
```bash
netlify env:set FAUNADB_SECRET "your_value"
netlify env:set GOOGLE_CLIENT_EMAIL "your_value"
netlify env:set GOOGLE_PRIVATE_KEY "your_value"
netlify env:set GOOGLE_DRIVE_FOLDER_ID "your_value"
netlify env:set PASSWORD_HASH "your_value"
netlify env:set ADMIN_PASSWORD_HASH "your_value"
netlify env:set JWT_SECRET "your_value"
```

5. **Deploy**
```bash
netlify deploy --prod
```

### Option 3: Manual Drag & Drop

**Pros:**
- Simplest method
- No CLI or Git needed

**Steps:**

1. **Build Locally**
```bash
npm run build
```

2. **Go to Netlify**
- https://app.netlify.com/drop

3. **Drag `dist` folder**
- Drop it in the upload area
- Wait for deployment

4. **Add Functions**
- Go to site settings
- Functions → Upload directory
- Upload `netlify/functions`

5. **Add Environment Variables**
- Site settings → Environment variables
- Add all variables manually

## 🌐 Custom Domain Setup

### Add Custom Domain

1. **Purchase Domain** (if needed)
   - Namecheap, Google Domains, etc.

2. **Add to Netlify**
   - Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain: `resume.yourdomain.com`

3. **Configure DNS**

**Option A: Netlify DNS (Recommended)**
- Add nameservers to your domain registrar:
```
dns1.p03.nsone.net
dns2.p03.nsone.net
dns3.p03.nsone.net
dns4.p03.nsone.net
```

**Option B: External DNS**
Add CNAME record:
```
Type: CNAME
Name: resume (or @)
Value: your-site.netlify.app
```

4. **Enable HTTPS**
- Automatic with Netlify
- Certificate issued by Let's Encrypt
- Force HTTPS in settings

## 🔒 Security Configuration

### Enable Security Headers

Already configured in `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Configure Rate Limits

Netlify automatically provides:
- DDoS protection
- Rate limiting
- Bot protection

Additional protection in functions via FaunaDB.

## 📊 Post-Deployment Verification

### 1. Functionality Tests

```bash
# Test main page loads
curl -I https://your-site.netlify.app

# Test function endpoints
curl https://your-site.netlify.app/.netlify/functions/list-versions
```

### 2. Security Tests

- [ ] HTTPS working
- [ ] Headers present (check with browser DevTools)
- [ ] Password protection working
- [ ] Rate limiting functional
- [ ] Admin authentication required

### 3. Performance Tests

Use tools:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

Target metrics:
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse Score > 90

## 📈 Monitoring & Analytics

### Netlify Analytics

Enable in site settings:
- Traffic overview
- Top pages
- Sources
- Bandwidth usage

### Function Logs

View in real-time:
```bash
netlify functions:log
```

Or in dashboard:
- Functions → Select function → Logs

### Error Monitoring

Add Sentry (optional):
```bash
npm install @sentry/react
```

Configure in `src/main.jsx`:
```javascript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
})
```

## 🔄 Continuous Deployment

### Auto-Deploy on Push (GitHub)

Already configured! Every push to `main` triggers:
1. Build process
2. Run tests (if configured)
3. Deploy to production

### Deploy Previews

Push to any branch:
```bash
git checkout -b feature/new-design
git push origin feature/new-design
```

Netlify creates preview URL:
- Test changes before merging
- Share with others
- Automatic cleanup on branch delete

## 🚨 Rollback Procedure

### Via Dashboard

1. Go to Deploys
2. Find previous working deploy
3. Click options → "Publish deploy"
4. Confirm

### Via CLI

```bash
netlify rollback
```

## 🔧 Troubleshooting Deployment

### Build Fails

Check build logs:
- Netlify dashboard → Deploys → Failed build
- Look for error messages

Common fixes:
```bash
# Clear cache
netlify build --clear-cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Functions Not Working

1. Check function logs
2. Verify environment variables
3. Test locally first:
```bash
netlify dev
```

4. Ensure node version:
```bash
# Add to netlify.toml
[build.environment]
  NODE_VERSION = "18"
```

### Environment Variables Issues

- Verify all variables set
- Check for typos
- Ensure no extra spaces
- Redeploy after adding variables

### 3D Effects Not Loading

Check build output:
```bash
# Ensure Three.js bundled
npm run build
ls -lh dist/assets/
```

Should see:
- three-[hash].js
- react-three-[hash].js

## 📝 Environment-Specific Configuration

### Development
```bash
# .env.development
NETLIFY_DEV=true
```

### Production
Set in Netlify dashboard only

### Staging (Optional)
Create separate site:
```bash
netlify sites:create --name resume-manager-staging
```

## ✅ Launch Checklist

Final checks before going live:

- [ ] All functionality tested
- [ ] Custom domain configured
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Rate limiting tested
- [ ] Password protection working
- [ ] Admin upload tested
- [ ] Download flow verified
- [ ] Mobile responsive checked
- [ ] Browser compatibility tested
- [ ] Performance optimized
- [ ] Error handling working
- [ ] Backup of .env file secured
- [ ] Documentation reviewed
- [ ] Monitoring configured

## 🎉 You're Live!

Congratulations! Your Resume Version Manager is now deployed.

### Next Steps

1. **Share Your URL**
   - Add to LinkedIn
   - Include in email signature
   - Add to personal website

2. **Monitor Performance**
   - Check Netlify analytics weekly
   - Review function logs
   - Monitor FaunaDB usage

3. **Maintain**
   - Update resume regularly
   - Keep dependencies updated
   - Monitor security advisories

4. **Customize**
   - Add custom domain
   - Adjust colors/branding
   - Add analytics if desired

---

Need help? Check the troubleshooting section or review the README.md!

