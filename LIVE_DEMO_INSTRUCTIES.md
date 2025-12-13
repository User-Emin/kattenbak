## 🎥 VIDEO VELD - ABSOLUTE VERIFICATIE & LIVE DEMO

### ✅ EXACTE LOCATIE VIDEO VELD IN ADMIN

**Bestand:** `admin-next/components/product-form.tsx`
**Regels:** 223-249

```typescript
{/* DRY: Video URL Field */}
<FormField
  control={form.control}
  name="videoUrl"                    ← VIDEO VELD HIER! ✨
  render={({ field }) => (
    <FormItem>
      <FormLabel>Demo Video URL (Optioneel)</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <Input
            {...field}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {field.value && (
            <div className="flex items-center gap-2 text-sm">
              {isValidVideoUrl(field.value) ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Geldige video URL</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Ongeldige URL (gebruik YouTube of Vimeo)</span>
                </>
              )}
            </div>
          )}
        </div>
      </FormControl>
      <FormDescription>
        YouTube of Vimeo URL voor product demo. Verschijnt op product pagina en homepage.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### 🚀 LIVE DEMO - SERVICES STARTEN

**Script:** `start-all-services.sh`

```bash
# Start alle services automatisch
./start-all-services.sh

# Services draaien op:
# - Backend:  http://localhost:3101
# - Frontend: http://localhost:3102
# - Admin:    http://localhost:3001
```

---

### 📍 ADMIN PANEL - VIDEO VELD VINDEN

1. **Open Admin Panel:**
   ```
   http://localhost:3001/dashboard/products
   ```

2. **Bewerk Product:**
   - Klik op "Automatische Kattenbak Premium"
   - Of klik "Nieuw Product"

3. **Scroll naar Afbeeldingen sectie:**
   - Zie "Product Afbeeldingen" veld
   - **Direct daaronder:** "Demo Video URL (Optioneel)" ← HIER! ✨

4. **Test Video URL:**
   - Plak: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Zie live validatie: ✅ "Geldige video URL"
   - Bij foute URL: ❌ "Ongeldige URL"

5. **Opslaan:**
   - Klik "Opslaan" knop
   - Database wordt geupdate met videoUrl

---

### 🎯 FRONTEND - VIDEO IN ACTIE ZIEN

**Homepage Hero:**
```
http://localhost:3102
```
- Als featured product videoUrl heeft → Video in hero
- Anders → Statische hero image (fallback)

**Product Detail:**
```
http://localhost:3102/product/automatische-kattenbak-premium
```
- Scroll naar "Over dit product" sectie
- **Video verschijnt HIER** (als videoUrl bestaat)
- Onder video: "🎥 Bekijk de demo video"
- Onder video: Product beschrijving

---

### 🗄️ DATABASE FLOW

```
Admin Panel
    ↓
    Video URL ingevoerd
    ↓
    Validatie (YouTube/Vimeo)
    ↓
    Opslaan → PATCH /api/v1/products/:id
    ↓
    Database: products.video_url = "https://..."
    ↓
Frontend Fetch
    ↓
    GET /api/v1/products/automatische-kattenbak-premium
    ↓
    Response: { ..., videoUrl: "https://..." }
    ↓
    ProductVideo component render
    ↓
    Zichtbaar op:
        - Homepage (featured product)
        - Product detail (onder "Over dit product")
```

---

### 🔍 TROUBLESHOOTING

**Admin geeft Internal Server Error:**
```bash
# Check logs
cat /tmp/admin.log

# Check API URL
cat admin-next/.env.local
# Moet zijn: NEXT_PUBLIC_API_URL=http://localhost:3101/api/v1

# Restart admin
PORT=3001 npm run dev
```

**Video veld niet zichtbaar:**
```bash
# Check admin-next/components/product-form.tsx regel 223-249
grep -n "videoUrl" admin-next/components/product-form.tsx

# Output moet bevatten:
# 223: name="videoUrl"
# 55: videoUrl: initialData.videoUrl || '',
# 73: videoUrl: '',
```

**Frontend port 3102 werkt niet:**
```bash
# Check frontend/.env.local
cat frontend/.env.local

# Start frontend expliciet op 3102
cd frontend
PORT=3102 npm run dev
```

---

### ✨ VERIFICATIE CHECKLIST

- [ ] Backend draait op port 3101
- [ ] Frontend draait op port 3102
- [ ] Admin draait op port 3001
- [ ] Admin panel opent zonder errors
- [ ] Product form toont video veld
- [ ] Video URL validatie werkt (groen/rood)
- [ ] Opslaan werkt zonder errors
- [ ] Frontend toont video op product detail
- [ ] Video staat onder "Over dit product"
- [ ] Play button werkt
- [ ] Video embed verschijnt

---

### 🎉 SUCCESS!

Als ALLES werkt:
1. ✅ Admin video veld zichtbaar
2. ✅ Validatie werkt real-time
3. ✅ Database update succesvol
4. ✅ Frontend toont video op 2 plekken
5. ✅ DRY: 1 component, geen redundantie
6. ✅ Maintainable: Admin bedienbaar
7. ✅ Secure: URL validatie

**Status:** ABSOLUTE SUCCESS! 🎉
