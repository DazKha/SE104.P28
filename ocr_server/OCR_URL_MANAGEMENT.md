# �� OCR URL Management - Easy Guide

**Problem:** Every time you restart the OCR server, you get a new ngrok URL and need to update the frontend.

**Solution:** Use these easy methods instead of manually editing files!

## Super Easy Method (Recommended)

### Step 1: Start your OCR server
```bash
cd ocr_server
jupyter notebook SERVER_OCR.ipynb
```
- Run all cells in the notebook
- Copy the ngrok URL from the final cell output

### Step 2: Update the frontend (one command!)
```bash
npm run update-ocr "https://your-new-url.ngrok-free.app/ocr"
```

---

## Alternative Methods

### Method 1: Interactive Mode
```bash
npm run update-ocr
```
Then type your URL when prompted.

### Method 2: Direct Script
```bash
node update-ocr-url.js "https://your-new-url.ngrok-free.app/ocr"
```

### Method 3: Manual Edit (if needed)
Edit `frontend/src/config/ocrConfig.js` and change the `SERVER_URL` line.

---

## 🎯 Complete Workflow Example

**Scenario:** You just restarted your OCR server and got a new URL

1. **From your OCR notebook, you see:**
   ```
   * ngrok tunnel: https://abc123-def456.ngrok-free.app
   ```

2. **Run this command:**
   ```bash
   npm run update-ocr "https://abc123-def456.ngrok-free.app/ocr"
   ```

3. **You'll see:**
   ```
   OCR URL updated successfully!
   New URL: https://abc123-def456.ngrok-free.app/ocr
   ```

4. **Restart your frontend if needed:**
   ```bash
   # Stop current frontend (Ctrl+C)
   npm run dev
   ```

---

## Important Notes

- **Always add `/ocr`** to the end of your ngrok URL
- **Example:** `https://abc123.ngrok-free.app` → `https://abc123.ngrok-free.app/ocr`
- **Restart frontend** after updating URL if OCR stops working

---

## Troubleshooting

### URL not working?
1. **Check the URL format:**
   - Should end with `/ocr`
   - Should start with `https://`
   - No extra spaces

2. **Test the command:**
   ```bash
   npm run update-ocr "https://test.ngrok-free.app/ocr"
   ```

3. **Check the config file:**
   ```bash
   cat frontend/src/config/ocrConfig.js
   ```

### Script not found?
```bash
# Make sure you're in the project root
cd /Users/minhkha/Desktop/SE104/SE104.P28

# Make script executable
chmod +x update-ocr-url.js
```

---

## Pro Tips

### Tip 1: Create a shortcut
Add this to your `~/.zshrc` or `~/.bashrc`:
```bash
alias ocr="npm run update-ocr"
```
Then just use: `ocr "your-url/ocr"`

### Tip 2: Copy from clipboard
```bash
# Copy URL to clipboard, then run:
pbpaste | xargs -I {} npm run update-ocr "{}"
```

### Tip 3: Keep URL history
```bash
# Save your URLs for quick reference
echo "https://abc123.ngrok-free.app/ocr" > ocr-urls.txt
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Update OCR URL | `npm run update-ocr "URL/ocr"` |
| Interactive mode | `npm run update-ocr` |
| Check current URL | `cat frontend/src/config/ocrConfig.js` |
| Make script executable | `chmod +x update-ocr-url.js` |

---

## Summary

**Before (manual):**
1. Open file in editor
2. Find line 15
3. Change URL manually
4. Save file
5. Restart frontend

**Now (automatic):**
1. `npm run update-ocr "URL/ocr"`
2. Done! 

