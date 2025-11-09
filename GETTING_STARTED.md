# 🎯 Getting Started - Resume Version Manager

Welcome! This guide will get you from zero to deployed in under 30 minutes.

## 🎬 What You're Building

A beautiful, secure web app where:
- ✨ Visitors see a stunning 3D animated page
- 🔐 Downloads are password-protected
- 🛡️ Brute-force attacks are prevented (3 attempts per 24h)
- 📦 Your resume is automatically versioned
- ☁️ Everything is backed up to Google Drive & MongoDB
- 🚀 Hosted for free on Netlify

## 🎥 Visual Flow

```
┌─────────────────────────────────────┐
│     User visits your site           │
│  (Beautiful 3D animated background) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Click "Download Latest Resume"    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Password Modal Appears         │
│   (Shows remaining attempts: 3/3)   │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │           │
    Wrong ▼      Correct ▼
┌──────────────┐  ┌──────────────┐
│ Attempt -1   │  │   File       │
│ (2 left)     │  │  Downloads   │
│ Try again    │  │   Success!   │
└──────────────┘  └──────────────┘
```

## 🏃 Quick Start (5 Steps)

### 1️⃣ Install Dependencies
```bash
npm install
cd netlify/functions && npm install && cd ../..
```
⏱️ *2 minutes*

### 2️⃣ Setup Services

**MongoDB Atlas** (Database)
1. Visit https://cloud.mongodb.com/
2. Create free M0 cluster
3. Get connection string
⏱️ *5 minutes* | See `MONGODB_SETUP.md` for details

**Google Drive** (Storage)
1. Visit https://console.cloud.google.com/
2. Create project → Enable Drive API
3. Create service account → Download JSON
4. Create Drive folder → Share with service account
⏱️ *8 minutes*

### 3️⃣ Configure Environment
```bash
# Copy example file
cp env.example .env

# Generate passwords
npm run setup:hash
# Run twice (once for user, once for admin)

# Edit .env with your values
nano .env
```
⏱️ *5 minutes*

### 4️⃣ Initialize Database
```bash
npm run setup:fauna
```
⏱️ *1 minute*

### 5️⃣ Deploy!
```bash
# Test locally first
netlify dev

# Deploy to production
netlify deploy --prod
```
⏱️ *5 minutes*

## 🎨 What You Get

### 🖥️ Frontend Features
```
Landing Page
├── 3D Animated Spheres (Three.js)
├── Glass Morphism Design
├── Smooth Animations (Framer Motion)
├── Download Button
│   └── Password Modal
│       ├── Attempt Counter
│       └── Lockout Timer
├── Version History
│   └── Previous 2 Versions
└── Admin Access Link
    └── Upload Interface
```

### 🔧 Backend Features
```
Netlify Functions
├── download-resume.js
│   ├── Password Verification
│   ├── Rate Limiting
│   └── File Streaming
├── upload-resume.js
│   ├── Admin Authentication
│   ├── Version Management
│   └── Auto Cleanup
├── list-versions.js
├── check-attempts.js
└── admin-auth.js
```

### 🔐 Security Features
```
Multi-Layer Security
├── Password Protection (bcrypt)
├── Rate Limiting (IP-based)
├── 24h Lockout
├── JWT Authentication (Admin)
├── Secure Headers
├── No Direct File Links
└── Encrypted Storage
```

## 📱 How To Use (After Deployment)

### For Users (Anyone)
1. Visit your site URL
2. Click "Download Now"
3. Enter password
4. Get resume instantly
5. Can view 2 previous versions too

### For Admin (You)
1. Click "Admin Access"
2. Enter admin password
3. Upload new PDF
4. System handles everything:
   - Creates version name
   - Uploads to Drive
   - Updates database
   - Cleans old versions
   - Refreshes page

## 🎯 Key Files to Know

### Must Configure
```
.env                  ← Your secrets (NEVER commit!)
netlify.toml         ← Netlify settings (already configured)
```

### Customize These
```
tailwind.config.js   ← Colors, fonts, animations
src/components/      ← UI components
Background3D.jsx     ← 3D scene customization
```

### Don't Touch (Unless You Know)
```
netlify/functions/   ← Backend logic
vite.config.js      ← Build configuration
```

## 🎨 Quick Customizations

### Change Colors (2 minutes)
```javascript
// tailwind.config.js
colors: {
  primary: '#6366f1',    // Purple-blue
  secondary: '#8b5cf6',  // Purple
  accent: '#ec4899',     // Pink
}
```

### Change Site Title (1 minute)
```html
<!-- index.html -->
<title>Your Name - Resume</title>
```

### Change Hero Text (1 minute)
```javascript
// src/components/Hero.jsx
<h1>Your Name</h1>
<p>Your tagline here</p>
```

## 📊 What's Included

### Documentation
- ✅ `README.md` - Complete guide
- ✅ `SETUP_GUIDE.md` - Step-by-step setup
- ✅ `DEPLOYMENT.md` - Deployment instructions
- ✅ `PROJECT_OVERVIEW.md` - Technical details
- ✅ `QUICK_REFERENCE.md` - Command cheat sheet
- ✅ `GETTING_STARTED.md` - This file!

### Scripts
- ✅ `scripts/generate-hash.js` - Password hasher
- ✅ `scripts/setup-fauna.js` - Database initializer

### Configuration
- ✅ All config files ready
- ✅ Optimized build settings
- ✅ Security headers configured
- ✅ Performance optimized

## 🚨 Common First-Time Issues

### Issue: "Module not found"
```bash
# Solution: Install dependencies
npm install
cd netlify/functions && npm install
```

### Issue: "FaunaDB connection failed"
```bash
# Solution: Check .env file
cat .env | grep FAUNADB_SECRET
# Should show: FAUNADB_SECRET=fnAE...
```

### Issue: "Google Drive 403 error"
```bash
# Solution: Share folder with service account
# 1. Open folder in Drive
# 2. Click Share
# 3. Add service account email
# 4. Give Editor permission
```

### Issue: "Build fails on Netlify"
```bash
# Solution: Check environment variables
# Netlify Dashboard → Site Settings → Environment Variables
# Ensure all 7 variables are set
```

## 💡 Pro Tips for First Deploy

1. **Test Everything Locally First**
   ```bash
   netlify dev
   # Visit http://localhost:8888
   ```

2. **Use Small Test PDF**
   - First upload: use a 1-page test PDF
   - Verify it works
   - Then upload real resume

3. **Save Your Passwords**
   - User password: for downloads
   - Admin password: for uploads
   - Keep them safe!

4. **Check All Services**
   - FaunaDB: Can you see collections?
   - Google Drive: Can you see folder?
   - Netlify: Is site live?

5. **Mobile Test**
   - Open on phone
   - Test all features
   - Check animations

## 🎉 Success Checklist

After setup, you should be able to:
- [ ] Visit your live site
- [ ] See 3D animations
- [ ] Click download button
- [ ] Enter wrong password (see error)
- [ ] Enter correct password (file downloads)
- [ ] Access admin panel
- [ ] Upload new resume
- [ ] See new version listed
- [ ] Download new version
- [ ] View on mobile

## 🔗 Useful Links

### Your Services
- [Netlify Dashboard](https://app.netlify.com/) - Site hosting
- [MongoDB Atlas](https://cloud.mongodb.com/) - Database
- [Google Cloud Console](https://console.cloud.google.com/) - API management
- [Google Drive](https://drive.google.com/) - File storage

### Documentation
- [Netlify Docs](https://docs.netlify.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Three.js](https://threejs.org/)

## 🆘 Need Help?

### In Order:
1. **Check Documentation** - Start with README.md
2. **Review Logs** - `netlify functions:log`
3. **Check Environment** - `netlify env:list`
4. **Test Locally** - `netlify dev`
5. **Check Service Dashboards** - Look for errors

### Debug Checklist
```bash
# 1. Check all services are configured
netlify env:list

# 2. Check functions deploy correctly  
netlify functions:list

# 3. Check for build errors
netlify sites:info

# 4. View function logs
netlify functions:log

# 5. Test locally
netlify dev
```

## 🎓 Learning Path

If you want to understand and modify:

1. **Week 1**: Understand React basics
   - Components in `src/components/`
   - How state works
   - Event handling

2. **Week 2**: Understand backend
   - Netlify Functions
   - API endpoints
   - Database queries

3. **Week 3**: Customize design
   - Tailwind CSS
   - 3D animations
   - Color schemes

4. **Week 4**: Add features
   - Analytics
   - Multiple file types
   - Email notifications

## 🚀 What's Next?

After successful deployment:

### Immediate (Day 1)
- [ ] Share your resume link
- [ ] Add to LinkedIn
- [ ] Update email signature
- [ ] Test from different devices

### Short-term (Week 1)
- [ ] Customize colors to your brand
- [ ] Add custom domain (optional)
- [ ] Set up monitoring
- [ ] Upload final resume version

### Long-term (Month 1+)
- [ ] Monitor analytics
- [ ] Update resume regularly
- [ ] Tweak designs
- [ ] Add new features

## 🎊 Congratulations!

You now have:
- ✨ Professional online presence
- 🔐 Secure resume distribution
- 📦 Automatic version control
- ☁️ Cloud backup
- 🚀 Fast, modern web app

**All for $0/month!**

---

Ready to get started? Open `SETUP_GUIDE.md` for detailed instructions!

**Questions?** Check the comprehensive `README.md`

**Need help?** Review `QUICK_REFERENCE.md` for commands

**Technical details?** See `PROJECT_OVERVIEW.md`

**Deployment help?** Read `DEPLOYMENT.md`

---

*Built with ❤️ using modern web technologies*

