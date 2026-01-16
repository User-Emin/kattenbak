# 🔍 ANALYSE: Foto's verdwijnen bij Git Pull

## Probleem
Geüploade foto's verdwijnen na `git pull` op de server.

## Root Cause Analyse

### 1. Upload Locatie
- **Server**: `/var/www/uploads/products` (backend/src/middleware/upload.middleware.ts:51)
- **Database**: Images opgeslagen als JSON array in `products.images` field
- **Git**: Uploads directory staat NIET in .gitignore, maar bestanden worden niet gecommit

### 2. Waarom verdwijnen foto's?

#### Scenario A: Git Pull overschrijft directory
- Git pull kan de uploads directory niet overschrijven (niet in git)
- MAAR: Als er een deployment script is dat de directory verwijdert/herstructureert, kunnen bestanden verdwijnen

#### Scenario B: Database vs Filesystem mismatch
- Database bevat image paths zoals `/uploads/products/filename.jpg`
- Bestanden staan op `/var/www/uploads/products/filename.jpg`
- Als bestanden worden verwijderd maar database niet wordt geüpdatet, ontstaat mismatch

#### Scenario C: Geen cleanup bij product update
- **GEVONDEN**: In `backend/src/routes/admin/products.routes.ts` wordt bij product update GEEN cleanup gedaan van oude images
- Oude images blijven in database maar kunnen van disk verwijderd zijn

### 3. Code Analyse

#### ✅ Geen automatische cleanup
```typescript
// backend/src/routes/admin/products.routes.ts:284
const product = await prisma.product.update({
  where: { id: req.params.id },
  data: { ...data }, // Images worden gewoon overschreven, oude images niet verwijderd
});
```

#### ✅ Geen orphan cleanup
- Geen functie die ongebruikte images van disk verwijdert
- Geen functie die database entries valideert tegen filesystem

## Oplossing

### Oplossing 1: Cleanup bij product update (AANBEVOLEN)
Voeg cleanup toe bij product update om oude images te verwijderen:

```typescript
// In backend/src/routes/admin/products.routes.ts
// Voor product update:
const oldImages = existing.images as string[];
const newImages = data.images as string[];

// Find images that are no longer used
const imagesToDelete = oldImages.filter(img => !newImages.includes(img));

// Delete unused images from disk
for (const imagePath of imagesToDelete) {
  const filename = imagePath.replace('/uploads/products/', '');
  await deleteFile(`/var/www/uploads/products/${filename}`);
}
```

### Oplossing 2: Backup uploads directory
Zorg dat uploads directory wordt gebackupt voor deployment:

```bash
# In deployment script
# Backup uploads before pull
cp -r /var/www/uploads /var/www/uploads.backup.$(date +%Y%m%d-%H%M%S)

# After pull, restore if needed
# (Alleen als er problemen zijn)
```

### Oplossing 3: Valideer image paths
Voeg validatie toe om te checken of image files bestaan:

```typescript
// Helper functie
async function validateImagePaths(images: string[]): Promise<string[]> {
  const validImages: string[] = [];
  for (const imagePath of images) {
    const filePath = path.join('/var/www/uploads', imagePath);
    try {
      await fs.access(filePath);
      validImages.push(imagePath);
    } catch {
      console.warn(`Image not found: ${imagePath}`);
    }
  }
  return validImages;
}
```

## Aanbevolen Actie

1. **Direct**: Implementeer cleanup bij product update (Oplossing 1)
2. **Kort termijn**: Voeg backup toe aan deployment script (Oplossing 2)
3. **Lange termijn**: Implementeer orphan cleanup job (Oplossing 3)

## Security Check
✅ Geen security issues gevonden - dit is een data consistency probleem, geen security risico.
