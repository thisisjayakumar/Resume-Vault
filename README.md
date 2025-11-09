# 🎯 Secure Personal Resume Version Manager

A modern, secure, and beautifully designed web application for managing and distributing your resume with version control, password protection, and anti-brute-force security.

## ✨ Features

- 🎨 **Modern 3D Design** - Stunning visual effects with Three.js and React Three Fiber
- 🔐 **Password Protected** - Secure download access with bcrypt encryption
- 🛡️ **Rate Limiting** - Anti-brute-force protection (3 attempts per 24 hours)
- 📦 **Automatic Versioning** - Smart version naming: `Resume_YYYY-MM-DD_vX.X.pdf`
- ☁️ **Cloud Storage** - Google Drive integration for reliable file storage
- 🚀 **Fast Performance** - Optimized loading with code splitting and lazy loading
- 📱 **Responsive Design** - Beautiful on all devices
- 🔄 **Auto Cleanup** - Keeps only the latest 3 versions

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Three.js** - 3D graphics and animations
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Utility-first styling

### Backend
- **Netlify Functions** - Serverless backend
- **Node.js** - Runtime environment
- **Google Drive API** - File storage
- **FaunaDB** - Database for tracking

### Security
- **bcryptjs** - Password hashing
- **JWT** - Session tokens
- **IP-based rate limiting** - Brute-force protection

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Netlify account (free tier works)
- A Google Cloud account
- A FaunaDB account (free tier works)
- Git installed

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd resume-versioning
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install function dependencies
cd netlify/functions
npm install
cd ../..
```

### 3. Set Up FaunaDB

1. Go to [FaunaDB Dashboard](https://dashboard.fauna.com/)
2. Create a new database (e.g., "resume-manager")
3. Go to Security → New Key
4. Create a key with "Server" role
5. Copy the secret key

Run the setup script:

```bash
# Create .env file first (see step 5)
node scripts/setup-fauna.js
```

### 4. Set Up Google Drive API

#### Create a Service Account:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. Create Service Account:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Fill in details and click "Create"
   - Grant it "Editor" role
   - Click "Done"

5. Create Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create New Key"
   - Choose "JSON" and click "Create"
   - Download and save the JSON file

#### Create Google Drive Folder:

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder (e.g., "Resume Versions")
3. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
   ```
4. Share the folder with your service account email:
   - Right-click folder → Share
   - Add service account email (from JSON file)
   - Give "Editor" permission

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# FaunaDB
FAUNADB_SECRET=your_fauna_secret

# Google Drive
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Security
PASSWORD_HASH=generate_using_script
ADMIN_PASSWORD_HASH=generate_using_script
JWT_SECRET=your_random_32_char_secret
```

#### Generate Password Hashes:

```bash
node scripts/generate-hash.js
```

Run this twice - once for user password, once for admin password.

### 6. Test Locally

```bash
# Install Netlify CLI globally if not installed
npm install -g netlify-cli

# Run development server
netlify dev
```

Visit `http://localhost:8888` to test the application.

### 7. Deploy to Netlify

#### Option A: Deploy via Git (Recommended)

1. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [Netlify Dashboard](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

6. Add environment variables:
   - Go to Site settings → Environment variables
   - Add all variables from your `.env` file

7. Deploy!

#### Option B: Deploy via CLI

```bash
netlify login
netlify init
netlify deploy --prod
```

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#6366f1',    // Your primary color
      secondary: '#8b5cf6',  // Your secondary color
      accent: '#ec4899',     // Your accent color
    },
  },
}
```

### Change 3D Effects

Edit `src/components/Background3D.jsx` to modify sphere colors, positions, and animations.

### Adjust Rate Limiting

Edit `netlify/functions/utils/security.js`:

```javascript
const LOCKOUT_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const MAX_ATTEMPTS = 3
```

### Change Version Retention

Edit `netlify/functions/upload-resume.js`:

```javascript
if (versions.length > 3) { // Change 3 to your desired number
```

## 📱 Usage

### For Users (Downloading Resume)

1. Visit your deployed site
2. Click "Download Now"
3. Enter the password you set
4. Resume downloads automatically
5. View previous versions in the history section

### For Admin (Uploading New Resume)

1. Click "Admin Access" at the bottom
2. Enter admin password
3. Select PDF file to upload
4. Click "Upload Resume"
5. Old versions are automatically managed

## 🔒 Security Features

### Password Protection
- All downloads require password
- Passwords are hashed with bcrypt
- Hashes stored in environment variables

### Rate Limiting
- Maximum 3 attempts per IP per 24 hours
- Automatic lockout after failed attempts
- Tracked in FaunaDB

### Secure File Delivery
- Files served through backend functions
- No direct Google Drive links exposed
- IP-based access control

### Data Privacy
- Files stored in your Google Drive
- Full control over data
- No third-party data sharing

## 🐛 Troubleshooting

### "Failed to load versions"

- Check FaunaDB connection
- Verify FAUNADB_SECRET in environment variables
- Run `node scripts/setup-fauna.js` again

### "Upload failed"

- Verify Google Drive credentials
- Check service account has access to folder
- Ensure folder ID is correct

### "Download failed"

- Check password hash is correct
- Verify file exists in Google Drive
- Check FaunaDB connection

### 3D Effects Not Loading

- Check if Three.js dependencies installed
- Verify WebGL is supported in browser
- Check browser console for errors

## 📊 Performance Optimization

The app is optimized for fast loading:

- ⚡ Code splitting with lazy loading
- 🎯 Tree shaking for smaller bundles
- 🖼️ GPU-accelerated animations
- 📦 Asset optimization
- 🔄 Efficient caching strategies

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this for your own resume management needs!

## 🙏 Acknowledgments

- React Three Fiber for amazing 3D capabilities
- Netlify for seamless deployment
- FaunaDB for reliable database
- Google Drive for file storage

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review environment variables
3. Check Netlify function logs
4. Verify all services are configured correctly

## 🎉 Next Steps

After deployment:

1. Test all functionality
2. Upload your first resume
3. Test download with password
4. Verify rate limiting works
5. Share your site URL!

---

Built with ❤️ for secure resume management

