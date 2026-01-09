# SkillVore - Netlify Deployment Guide

## 🚀 Complete Setup for Netlify Hosting

This project is configured for Netlify hosting with serverless functions connecting to MongoDB Atlas.

---

## 📁 Project Structure

```
/app/
├── index.html              # Main landing page
├── admin.html             # Admin dashboard (optional)
├── thank-you.html         # Thank you page
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies for functions
├── netlify/
│   └── functions/
│       ├── waitlist.js          # Submit waitlist entry
│       ├── waitlist-all.js      # Get all entries (admin)
│       └── waitlist-count.js    # Get total count
└── frontend/
    └── public/
        ├── index.html     # React build output
        └── admin.html     # Admin dashboard
```

---

## 🔧 Netlify Setup Steps

### Step 1: Connect to Netlify

1. **Log into Netlify**: https://app.netlify.com
2. **Import from Git**:
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

### Step 2: Build Settings

**Configure build settings:**

```
Build command: (leave empty)
Publish directory: .
Functions directory: netlify/functions
```

### Step 3: Environment Variables

**Add this environment variable in Netlify:**

Go to: **Site settings** → **Environment variables** → **Add a variable**

```
Key: MONGODB_URI
Value: mongodb+srv://vikasaistudio_db_user:9kJ8ABuhE52BlPbK@cluster0.fbuxepe.mongodb.net/?appName=Cluster0
```

⚠️ **Important**: Never commit this connection string to public repositories!

### Step 4: Deploy

Click **"Deploy site"**

---

## 🔗 Serverless Functions Endpoints

Once deployed, your functions will be available at:

### Production URLs
```
https://your-site.netlify.app/.netlify/functions/waitlist          (POST)
https://your-site.netlify.app/.netlify/functions/waitlist-all     (GET)
https://your-site.netlify.app/.netlify/functions/waitlist-count   (GET)
```

### API Alias (via netlify.toml redirect)
```
https://your-site.netlify.app/api/waitlist          (POST)
https://your-site.netlify.app/api/waitlist-all     (GET)
https://your-site.netlify.app/api/waitlist-count   (GET)
```

---

## 🗄️ MongoDB Atlas Configuration

### Database Details
- **Connection**: MongoDB Atlas (Cloud)
- **Cluster**: cluster0.fbuxepe.mongodb.net
- **Database**: skillvore_db
- **Collection**: waitlist_signups
- **User**: vikasaistudio_db_user

### Database Structure
```javascript
{
  "_id": ObjectId,
  "full_name": String,
  "work_email": String (unique, lowercase),
  "company_name": String,
  "business_type": String,
  "created_at": Date,
  "updated_at": Date
}
```

### Access Your Data

**Option 1: MongoDB Compass**
1. Download MongoDB Compass
2. Connect using: `mongodb+srv://vikasaistudio_db_user:9kJ8ABuhE52BlPbK@cluster0.fbuxepe.mongodb.net/`
3. Navigate to: `skillvore_db` → `waitlist_signups`

**Option 2: MongoDB Atlas Web UI**
1. Go to: https://cloud.mongodb.com
2. Login with your credentials
3. Browse Data → skillvore_db → waitlist_signups

**Option 3: Admin Dashboard**
- Visit: `https://your-site.netlify.app/admin.html`
- Export data as CSV or JSON

---

## 🌐 Custom Domain Setup

### Connect www.skillvore.com to Netlify

1. **In Netlify**:
   - Go to: **Site settings** → **Domain management**
   - Click **"Add custom domain"**
   - Enter: `www.skillvore.com`
   - Follow verification steps

2. **In GoDaddy**:
   - Go to DNS Management for skillvore.com
   - **Delete all existing A records**
   - Add CNAME record:
     ```
     Type: CNAME
     Name: www
     Value: your-site.netlify.app
     TTL: 600
     ```
   - Save changes

3. **SSL Certificate**:
   - Netlify automatically provisions SSL certificates
   - Wait 5-10 minutes for HTTPS to activate

---

## ✅ Testing Your Deployment

### Test Waitlist Form
1. Visit your Netlify URL
2. Click "Join Waitlist"
3. Fill in the form
4. Submit

### Verify Data Saved
- Option A: Check MongoDB Atlas dashboard
- Option B: Visit `/admin.html` on your site
- Option C: Use MongoDB Compass

### Test API Endpoints
```bash
# Test count
curl https://your-site.netlify.app/.netlify/functions/waitlist-count

# Test all entries (admin)
curl https://your-site.netlify.app/.netlify/functions/waitlist-all
```

---

## 🔒 Security Best Practices

### For Production:

1. **Protect MongoDB Connection String**:
   - Use Netlify environment variables (already configured)
   - Never commit credentials to Git

2. **Protect Admin Dashboard**:
   - Add password protection via Netlify Identity
   - Or use Netlify's password protection feature
   - Go to: Site settings → Visitor access → Password protection

3. **Database Security**:
   - Enable MongoDB Atlas IP Whitelist
   - Use strong passwords
   - Enable 2FA on MongoDB Atlas account

---

## 📊 Monitoring

### View Function Logs
1. Go to Netlify dashboard
2. **Functions** tab
3. Click on any function to see logs
4. View execution time and errors

### Check Deploy Status
- **Deploys** tab in Netlify
- See build logs and deploy previews

---

## 🐛 Troubleshooting

### Form Submission Not Working
1. Check Netlify function logs
2. Verify MongoDB connection string in environment variables
3. Test function endpoint directly with curl
4. Check browser console for errors

### MongoDB Connection Errors
1. Verify connection string is correct
2. Check MongoDB Atlas cluster is running
3. Verify database user has correct permissions
4. Check IP whitelist in MongoDB Atlas (allow all: 0.0.0.0/0)

### Duplicate Email Error Expected
- This is normal behavior
- Prevents duplicate signups
- Returns: "This email is already registered"

---

## 📦 Dependencies

The project uses:
- **mongodb**: ^6.3.0 (MongoDB Node.js driver)

These are installed automatically by Netlify during deployment.

---

## 🔄 Continuous Deployment

Once connected to Git:
1. Push changes to your repository
2. Netlify automatically detects changes
3. Builds and deploys new version
4. Functions are updated automatically

---

## 📈 What's Included

✅ Waitlist form with validation
✅ MongoDB Atlas integration
✅ Serverless functions (no backend server needed)
✅ Admin dashboard for viewing signups
✅ CSV/JSON export functionality
✅ Duplicate email prevention
✅ CORS enabled for all origins
✅ Production-ready error handling

---

## 🎯 Quick Deploy Checklist

- [ ] Connect repository to Netlify
- [ ] Set build settings (publish directory: `.`)
- [ ] Add MONGODB_URI environment variable
- [ ] Deploy site
- [ ] Test waitlist form submission
- [ ] Verify data in MongoDB Atlas
- [ ] Set up custom domain (optional)
- [ ] Enable SSL certificate
- [ ] Add password protection to admin.html (optional)

---

## 💡 Tips

1. **Keep MongoDB connection string secret** - use environment variables
2. **Test locally with Netlify CLI**: `netlify dev`
3. **Monitor function execution** in Netlify dashboard
4. **Export data regularly** for backup
5. **Set up MongoDB Atlas backups** in their dashboard

---

## 📞 Support

For MongoDB Atlas: https://cloud.mongodb.com/support
For Netlify: https://docs.netlify.com

---

Your SkillVore waitlist is now ready for production on Netlify! 🚀
