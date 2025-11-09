# ⚡ Quick Reference Card

Essential commands and information for your Resume Version Manager.

## 🚀 Common Commands

### Development
```bash
# Start local development server
npm run dev

# Start with Netlify functions
netlify dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Setup
```bash
# Install all dependencies
npm install && cd netlify/functions && npm install && cd ../..

# Generate password hash
npm run setup:hash

# Setup FaunaDB collections
npm run setup:fauna
```

### Deployment
```bash
# Deploy to production
npm run deploy

# Deploy with Netlify CLI
netlify deploy --prod

# View deployment status
netlify status
```

### Functions
```bash
# Test functions locally
netlify functions:serve

# View function logs
netlify functions:log

# List all functions
netlify functions:list
```

### Environment
```bash
# Set environment variable
netlify env:set KEY "value"

# List environment variables
netlify env:list

# Import from .env file
netlify env:import .env
```

## 📋 Environment Variables Checklist

```env
✓ FAUNADB_SECRET
✓ GOOGLE_CLIENT_EMAIL
✓ GOOGLE_PRIVATE_KEY
✓ GOOGLE_DRIVE_FOLDER_ID
✓ PASSWORD_HASH
✓ ADMIN_PASSWORD_HASH
✓ JWT_SECRET
```

## 🔗 Important URLs

### Development
- Local: http://localhost:8888
- Functions: http://localhost:8888/.netlify/functions/

### Dashboards
- Netlify: https://app.netlify.com/
- FaunaDB: https://dashboard.fauna.com/
- Google Cloud: https://console.cloud.google.com/
- Google Drive: https://drive.google.com/

### API Endpoints (Production)
```
GET  /.netlify/functions/list-versions
GET  /.netlify/functions/check-attempts
POST /.netlify/functions/download-resume
POST /.netlify/functions/upload-resume
POST /.netlify/functions/admin-auth
```

## 🛠️ Troubleshooting Quick Fixes

### "Module not found"
```bash
cd netlify/functions
rm -rf node_modules
npm install
```

### "FaunaDB connection failed"
```bash
# Check .env file
cat .env | grep FAUNADB

# Re-run setup
npm run setup:fauna
```

### "Build failed"
```bash
# Clear cache and rebuild
rm -rf node_modules dist .netlify
npm install
npm run build
```

### "Functions not working"
```bash
# Test locally first
netlify dev

# Check environment variables
netlify env:list

# View logs
netlify functions:log
```

### "Can't download resume"
```bash
# Check Google Drive permissions
# Verify service account has access
# Check file exists in folder
# View function logs for errors
```

## 📁 Key Files

### Configuration
- `package.json` - Dependencies and scripts
- `vite.config.js` - Build configuration
- `tailwind.config.js` - Styling configuration
- `netlify.toml` - Netlify settings
- `.env` - Environment variables (DO NOT COMMIT)

### Source
- `src/App.jsx` - Main application
- `src/components/Background3D.jsx` - 3D effects
- `src/components/PasswordModal.jsx` - Download modal
- `src/components/AdminModal.jsx` - Upload interface

### Functions
- `netlify/functions/download-resume.js` - Handle downloads
- `netlify/functions/upload-resume.js` - Handle uploads
- `netlify/functions/utils/security.js` - Security utilities

### Documentation
- `README.md` - Complete documentation
- `SETUP_GUIDE.md` - Step-by-step setup
- `DEPLOYMENT.md` - Deployment guide
- `PROJECT_OVERVIEW.md` - Technical overview

## 🔐 Security Checklist

- [ ] Passwords hashed with bcrypt
- [ ] Environment variables not committed
- [ ] .env file in .gitignore
- [ ] Rate limiting configured
- [ ] HTTPS enabled on production
- [ ] Security headers configured
- [ ] Google Drive folder shared only with service account
- [ ] FaunaDB secret kept secure

## 🎨 Customization Quick Guide

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#6366f1',    // Change me
  secondary: '#8b5cf6',  // Change me
  accent: '#ec4899',     // Change me
}
```

### Change Rate Limit
Edit `netlify/functions/utils/security.js`:
```javascript
const MAX_ATTEMPTS = 3        // Change attempts
const LOCKOUT_DURATION = 24   // Change hours
```

### Change Version Retention
Edit `netlify/functions/upload-resume.js`:
```javascript
if (versions.length > 3) {    // Change number
```

## 📊 Monitoring Commands

```bash
# View site analytics
netlify sites:info

# Check function stats
netlify functions:list

# View recent deployments
netlify sites:list

# Open Netlify dashboard
netlify open
```

## 🆘 Emergency Procedures

### Rollback Deployment
```bash
netlify rollback
```

### Lock Out All Users (Emergency)
Set very high rate limit in database or temporarily disable functions.

### Reset All Attempts
Delete all documents in `ip_attempts` collection in FaunaDB dashboard.

### Change Passwords
```bash
# Generate new hash
npm run setup:hash

# Update environment variable
netlify env:set PASSWORD_HASH "new_hash"

# Redeploy
npm run deploy
```

## 💡 Pro Tips

1. **Test locally first**: Always run `netlify dev` before deploying
2. **Check logs**: Use `netlify functions:log` to debug issues
3. **Version control**: Commit often, push to backup
4. **Backup .env**: Keep secure copy of environment variables
5. **Monitor usage**: Check dashboards weekly
6. **Update dependencies**: Run `npm update` monthly
7. **Test on mobile**: Use browser dev tools
8. **Optimize images**: If adding images, compress them
9. **Use preview deployments**: Test branches before merging
10. **Document changes**: Update README when modifying

## 📞 Support Resources

- **Documentation**: Check README.md and guides
- **Netlify Docs**: https://docs.netlify.com/
- **FaunaDB Docs**: https://docs.fauna.com/
- **Stack Overflow**: Tag questions with relevant tech
- **GitHub Issues**: Report bugs in your repo

## ✅ Pre-Launch Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] FaunaDB setup complete
- [ ] Google Drive configured
- [ ] Passwords hashed
- [ ] Tested locally
- [ ] Test resume uploaded
- [ ] Download tested
- [ ] Rate limiting tested
- [ ] Admin access tested
- [ ] Mobile responsive checked
- [ ] Production deployed
- [ ] Custom domain (optional)
- [ ] HTTPS enabled
- [ ] Documentation reviewed

## 🎯 Testing Checklist

### User Flow
- [ ] Page loads with 3D effects
- [ ] Download button works
- [ ] Password modal appears
- [ ] Wrong password shows error
- [ ] Correct password downloads file
- [ ] Rate limiting triggers after 3 attempts
- [ ] Version history displays
- [ ] Previous versions downloadable

### Admin Flow
- [ ] Admin link works
- [ ] Admin password required
- [ ] File upload interface loads
- [ ] PDF upload works
- [ ] New version appears
- [ ] Old versions cleaned up (after 3+)
- [ ] Download new version works

### Performance
- [ ] Page loads in < 2s
- [ ] 3D animations smooth
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works on Chrome
- [ ] Works on Safari
- [ ] Works on Firefox

---

**Keep this file handy for quick reference!**

Print or bookmark for easy access during development and maintenance.

