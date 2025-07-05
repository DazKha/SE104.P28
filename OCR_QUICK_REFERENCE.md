# OCR URL Quick Reference

## One Command Solution

```bash
npm run update-ocr "YOUR_NEW_URL/ocr"
```

---

## Step-by-Step

1. **Start OCR server**
   ```bash
   cd ocr_server
   jupyter notebook SERVER_OCR.ipynb
   ```

2. **Copy ngrok URL** from notebook output

3. **Update frontend**
   ```bash
   npm run update-ocr "https://abc123.ngrok-free.app/ocr"
   ```

4. **Restart frontend** (if needed)
   ```bash
   npm run dev
   ```

---

## Important

- **Always add `/ocr`** to your ngrok URL
- **Example:** `https://abc123.ngrok-free.app` → `https://abc123.ngrok-free.app/ocr`

---

## 🔧 Alternative Commands

| What you want to do | Command |
|---------------------|---------|
| Update URL | `npm run update-ocr "URL/ocr"` |
| Interactive mode | `npm run update-ocr` |
| Check current URL | `cat frontend/src/config/ocrConfig.js` |

---

## Pro Tips

- **Create alias:** `alias ocr="npm run update-ocr"`
- **Copy from clipboard:** `pbpaste | xargs -I {} npm run update-ocr "{}"`
- **Save URLs:** `echo "URL/ocr" >> ocr-urls.txt`

---

