# 🔄 FaunaDB to MongoDB Migration Guide

This project has been migrated from FaunaDB to MongoDB Atlas due to FaunaDB's service changes.

## ✅ What Changed

### Database Provider
- **Before**: FaunaDB
- **After**: MongoDB Atlas (Free M0 Tier)

### Environment Variables
```diff
- FAUNADB_SECRET=your_fauna_secret
+ MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
+ MONGODB_DB_NAME=resume_manager
```

### NPM Scripts
```diff
- npm run setup:fauna
+ npm run setup:mongodb
+ npm run test:mongodb
```

### Dependencies
```diff
// netlify/functions/package.json
- "faunadb": "^4.8.0"
+ "mongodb": "^6.3.0"
```

## 🎯 Migration Steps

### For New Setup

If you're setting up this project for the first time:

1. Follow `MONGODB_SETUP.md` for detailed MongoDB Atlas setup
2. Skip any FaunaDB references in older docs
3. Use the new environment variables

### For Existing Projects

If you were using FaunaDB and need to migrate:

#### Step 1: Setup MongoDB Atlas (5 minutes)

1. Go to https://cloud.mongodb.com/
2. Create free account
3. Create M0 cluster (free forever)
4. Create database user
5. Whitelist all IPs (0.0.0.0/0)
6. Get connection string

See `MONGODB_SETUP.md` for detailed instructions.

#### Step 2: Update Dependencies

```bash
cd netlify/functions
npm install mongodb@latest
npm uninstall faunadb
cd ../..
```

#### Step 3: Update Environment Variables

Edit your `.env` file:

```env
# Remove old variable
# FAUNADB_SECRET=...

# Add new variables
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=resume_manager
```

#### Step 4: Initialize MongoDB

```bash
npm run setup:mongodb
```

This will create:
- `ip_attempts` collection with indexes
- `metadata` collection with indexes
- Initial versions document

#### Step 5: Migrate Data (If Needed)

If you have existing resume versions in FaunaDB:

**Option A: Manual Migration (Recommended for small datasets)**

1. Note your existing resume versions
2. Re-upload them through admin interface
3. They'll be automatically added to MongoDB

**Option B: Script Migration**

If you have many versions, export from FaunaDB dashboard and contact me for a migration script.

#### Step 6: Update Netlify Environment Variables

1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Remove: `FAUNADB_SECRET`
4. Add: `MONGODB_URI` and `MONGODB_DB_NAME`
5. Redeploy site

#### Step 7: Test Everything

```bash
# Test locally
netlify dev

# Test MongoDB connection
npm run test:mongodb

# Test functions
curl http://localhost:8888/.netlify/functions/list-versions
```

#### Step 8: Deploy

```bash
netlify deploy --prod
```

## 📊 Data Structure Comparison

### FaunaDB Structure
```javascript
// Collection: ip_attempts
{
  data: {
    ip: "192.168.1.1",
    attempts: 2,
    locked: false
  }
}

// Collection: metadata  
{
  data: {
    key: "versions",
    value: [...]
  }
}
```

### MongoDB Structure
```javascript
// Collection: ip_attempts
{
  _id: ObjectId("..."),
  ip: "192.168.1.1",
  attempts: 2,
  locked: false,
  updatedAt: ISODate("...")
}

// Collection: metadata
{
  _id: ObjectId("..."),
  key: "versions",
  value: [...],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

## 🔍 Code Changes

### Database Utility Functions

The API remains the same, only the implementation changed:

```javascript
// These functions work the same way
await getIPAttempts(ip)
await updateIPAttempts(ip, data)
await resetIPAttempts(ip)
await getVersionsMetadata()
await updateVersionsMetadata(versions)
```

### Connection Handling

**FaunaDB** (Old):
```javascript
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})
```

**MongoDB** (New):
```javascript
const client = await MongoClient.connect(process.env.MONGODB_URI)
const db = client.db(process.env.MONGODB_DB_NAME)
```

## 💡 Why MongoDB?

### Advantages

1. **Stable & Mature**: Industry standard with long-term support
2. **Free Tier**: 512MB storage, perfect for this project
3. **Better Performance**: Faster queries for our use case
4. **More Features**: TTL indexes for auto-cleanup
5. **Excellent Tools**: MongoDB Compass, Atlas UI
6. **Strong Community**: More resources and support

### Feature Parity

✅ All features work exactly the same:
- Rate limiting
- Password protection
- Version management
- Auto cleanup
- IP tracking

### Performance

MongoDB actually performs better for our use case:
- Faster IP lookups (indexed queries)
- Automatic TTL for expired locks
- Better connection pooling
- Lower latency for Netlify Functions

## 🆘 Troubleshooting

### "Authentication failed"
- Check password in connection string
- Ensure special characters are URL-encoded
- Verify database user exists in Atlas

### "Network timeout"
- Check Network Access in MongoDB Atlas
- Ensure 0.0.0.0/0 is whitelisted
- Try different region for cluster

### "Database not found"
- Run `npm run setup:mongodb`
- Check `MONGODB_DB_NAME` in .env
- MongoDB creates databases automatically

### "Too many connections"
- Free tier allows 100 connections
- Check for connection leaks
- Ensure connections are closed properly

### Migration Issues

If you encounter issues during migration:

1. **Backup first**: Export FaunaDB data
2. **Test locally**: Use `netlify dev`
3. **Check logs**: `netlify functions:log`
4. **Start fresh**: Can always start with empty MongoDB

## 📈 Monitoring

### MongoDB Atlas Dashboard

Monitor your database usage:
- Connections: Should be < 10 for this app
- Operations: Very low for personal use
- Storage: Should be < 10 MB
- Network: Minimal

### Performance Metrics

MongoDB provides:
- Real-time metrics
- Slow query analysis
- Index usage stats
- Connection statistics

## ✅ Verification Checklist

After migration, verify:

- [ ] MongoDB Atlas cluster created
- [ ] Connection string in .env
- [ ] `npm run setup:mongodb` successful
- [ ] `npm run test:mongodb` passes
- [ ] Netlify env variables updated
- [ ] Local testing works
- [ ] Production deployment successful
- [ ] Download flow works
- [ ] Upload flow works
- [ ] Rate limiting functional
- [ ] Previous versions display correctly

## 🎓 Learning Resources

- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Detailed setup guide

## 💬 Support

If you need help with migration:

1. Check `MONGODB_SETUP.md` for setup details
2. Review function logs for errors
3. Test connection with `npm run test:mongodb`
4. Verify all environment variables are set

## 🎉 Benefits of Migration

After migrating to MongoDB:
- ✅ More reliable long-term solution
- ✅ Better performance
- ✅ Automatic cleanup with TTL indexes
- ✅ Professional-grade database
- ✅ Still completely free for personal use
- ✅ Better monitoring and tools
- ✅ Stronger ecosystem

---

**Migration Status**: ✅ Complete

All documentation and code have been updated to use MongoDB Atlas.

**Last Updated**: 2024

