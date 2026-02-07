# Century Training Plan PWA

A Progressive Web App for tracking your 13-week journey to completing a 100-mile century bike ride.

## 🚀 Features

- ✅ **Offline-first**: Works without internet after first load
- ✅ **Installable**: Add to your home screen like a native app
- ✅ **Persistent storage**: Your progress is saved locally
- ✅ **Real-time tracking**: Visual progress bars and statistics
- ✅ **Milestone celebrations**: Achievements for 30, 40, 50, 60, 70, 80 mile rides
- ✅ **Editable mileage**: Track actual distances vs planned
- ✅ **Skip tracking**: Mark rides as skipped vs completed

## 📁 Files

- `index.html` - Main HTML file
- `century-training-plan.jsx` - React component with all the logic
- `service-worker.js` - Enables offline functionality
- `manifest.json` - PWA configuration
- `icon.svg` - App icon (you'll need to convert to PNG)

## 🛠️ Setup & Deployment

### Option 1: GitHub Pages (Recommended - Free & Easy)

1. **Create a GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/century-training.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repo → Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/` (root)
   - Save

3. **Create PNG icons** (you need these for the PWA)
   - Convert `icon.svg` to PNG:
     - 192x192px → save as `icon-192.png`
     - 512x512px → save as `icon-512.png`
   - Upload both to your repo

4. **Access your app**
   - URL: `https://YOUR_USERNAME.github.io/century-training/`
   - Wait 2-3 minutes for deployment

### Option 2: Netlify (Also Free)

1. **Drag and drop**
   - Go to [netlify.com](https://netlify.com)
   - Drag the entire folder to Netlify Drop
   - Done! You get a URL like `your-app.netlify.app`

2. **Custom domain** (optional)
   - Netlify Settings → Domain Management
   - Add your custom domain

### Option 3: Vercel (Free, Fast)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts** - Done!

## 🎨 Creating Icons

You need to convert the SVG to PNG icons. Options:

### Online (easiest):
1. Go to [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Upload `icon.svg`
3. Set width to 192px → Download as `icon-192.png`
4. Repeat with 512px → Download as `icon-512.png`

### Command line:
```bash
# Using ImageMagick
convert -background none -resize 192x192 icon.svg icon-192.png
convert -background none -resize 512x512 icon.svg icon-512.png

# Using Inkscape
inkscape icon.svg -w 192 -h 192 -o icon-192.png
inkscape icon.svg -w 512 -h 512 -o icon-512.png
```

## 📱 Installing the PWA

### On Desktop (Chrome/Edge):
1. Visit your deployed URL
2. Look for the install icon in the address bar (➕)
3. Click "Install"

### On iPhone:
1. Open in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

### On Android:
1. Open in Chrome
2. Tap the three dots menu
3. Tap "Install app" or "Add to Home Screen"

## 🔧 Development

To test locally:

1. **Start a local server** (required for service workers):
   ```bash
   # Option 1: Python
   python -m http.server 8000
   
   # Option 2: Node.js
   npx serve
   
   # Option 3: PHP
   php -S localhost:8000
   ```

2. **Open browser**
   - Go to `http://localhost:8000`
   - Open DevTools → Application → Service Workers to debug

3. **Testing PWA features**
   - Chrome DevTools → Application tab
   - Check Manifest, Service Workers, Storage
   - Use Lighthouse to audit PWA score

## 🔄 Updates

When you make changes:

1. **Update the cache version** in `service-worker.js`:
   ```javascript
   const CACHE_NAME = 'century-training-v2'; // increment version
   ```

2. **Push changes** to your hosting
   ```bash
   git add .
   git commit -m "Update app"
   git push
   ```

3. **Users will see update prompt** on next visit

## ⚠️ HTTPS Required

PWAs require HTTPS. All the hosting options above provide HTTPS automatically.

For local development, service workers work on `localhost` without HTTPS.

## 📊 Check PWA Score

1. Open your deployed app
2. Open Chrome DevTools (F12)
3. Go to Lighthouse tab
4. Select "Progressive Web App"
5. Click "Generate report"
6. Aim for 90+ score!

## 🎯 Next Steps

- **Add notifications**: Remind users about upcoming rides
- **Add to calendar**: Export training plan to calendar
- **Dark mode**: Theme toggle
- **Export data**: Download progress as CSV
- **Social sharing**: Share achievements
- **Backend sync**: Add Firebase for cross-device sync

## 📝 Notes

- All data is stored locally (localStorage)
- No user accounts or backend required
- Works completely offline after first load
- iOS has some PWA limitations (no background sync)

## 🐛 Troubleshooting

**Service worker not registering?**
- Must use HTTPS or localhost
- Check browser console for errors
- Clear cache and hard reload (Ctrl+Shift+R)

**Install button not showing?**
- PWA requirements must be met (manifest, service worker, HTTPS)
- Check Lighthouse PWA audit for issues
- iOS Safari: no install prompt, users must manually "Add to Home Screen"

**Data lost?**
- iOS can clear PWA data if device is low on space
- Consider adding export/import functionality
- For critical data, add a backend sync option

---

Built with ❤️ for cyclists! 🚴‍♂️
