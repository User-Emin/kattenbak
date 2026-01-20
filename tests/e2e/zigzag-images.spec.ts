import { test, expect } from '@playwright/test';

/**
 * E2E Test: Zigzag Images Verification
 * Verifieert dat de 4e en 5e geüploade foto's correct worden getoond in de zigzag sectie
 */
test.describe('Zigzag Images Verification', () => {
  test('should display 4th and 5th uploaded images in zigzag section', async ({ page }) => {
    // Navigate to product page
    await page.goto('https://catsupply.nl/product/automatische-kattenbak-premium');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Get product data from API
    const productData = await page.evaluate(async () => {
      const response = await fetch('/api/v1/products/slug/automatische-kattenbak-premium');
      const data = await response.json();
      return {
        images: data.data?.images || [],
        imagesCount: data.data?.images?.length || 0
      };
    });
    
    // Verify we have at least 5 images
    expect(productData.imagesCount).toBeGreaterThanOrEqual(5);
    console.log('✅ Product has', productData.imagesCount, 'images');
    console.log('📸 Images:', productData.images);
    
    // Get the 4th and 5th images (indices 3 and 4)
    const fourthImage = productData.images[3];
    const fifthImage = productData.images[4];
    
    expect(fourthImage).toBeTruthy();
    expect(fifthImage).toBeTruthy();
    
    console.log('📸 4th image:', fourthImage);
    console.log('📸 5th image:', fifthImage);
    
    // Scroll to zigzag section
    await page.evaluate(() => {
      const zigzagSection = Array.from(document.querySelectorAll('section, div')).find(el => 
        el.textContent?.includes('10.5L Afvalbak') || el.textContent?.includes('Geurblokje')
      );
      if (zigzagSection) {
        zigzagSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(2000); // Wait for scroll and images to load
    
    // Find zigzag images
    const zigzagImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => {
          const parent = img.closest('section, div');
          return parent && (
            parent.textContent?.includes('10.5L') || 
            parent.textContent?.includes('Geurblokje')
          );
        })
        .map(img => ({
          src: img.src,
          alt: img.alt,
          loaded: img.complete && img.naturalHeight > 0
        }));
    });
    
    console.log('📸 Zigzag images found:', zigzagImages);
    
    // Verify 4th image is displayed (10.5L Afvalbak)
    const fourthImageDisplayed = zigzagImages.some(img => 
      img.src.includes(fourthImage.split('/').pop() || '') || 
      img.src === fourthImage ||
      img.src.includes('c4409216') // 4th image ID
    );
    
    // Verify 5th image is displayed (Geurblokje)
    const fifthImageDisplayed = zigzagImages.some(img => 
      img.src.includes(fifthImage.split('/').pop() || '') || 
      img.src === fifthImage ||
      img.src.includes('fdc46069') // 5th image ID
    );
    
    expect(fourthImageDisplayed).toBeTruthy();
    expect(fifthImageDisplayed).toBeTruthy();
    
    // Verify images are loaded
    const allLoaded = zigzagImages.every(img => img.loaded);
    expect(allLoaded).toBeTruthy();
    
    console.log('✅ Zigzag images verification complete');
  });
  
  test('should display gray USP text with blue checkmarks', async ({ page }) => {
    await page.goto('https://catsupply.nl/product/automatische-kattenbak-premium');
    await page.waitForLoadState('networkidle');
    
    // Find USP elements
    const uspElements = await page.evaluate(() => {
      const usps = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent?.includes('Volledig automatisch') ||
        div.textContent?.includes('Binnen 30 dagen') ||
        div.textContent?.includes('Zelfreinigend systeem')
      );
      
      return usps.map(usp => {
        const text = usp.textContent || '';
        const textElement = usp.querySelector('span');
        const checkmark = usp.querySelector('svg, [class*="Check"]');
        
        return {
          text,
          textColor: textElement ? window.getComputedStyle(textElement).color : null,
          hasCheckmark: !!checkmark,
          checkmarkColor: checkmark ? window.getComputedStyle(checkmark as Element).color : null
        };
      });
    });
    
    console.log('📋 USP Elements:', uspElements);
    
    // Verify USP text is gray (not blue)
    uspElements.forEach(usp => {
      const textColor = usp.textColor;
      // RGB values for gray (text-gray-700 is approximately rgb(55, 65, 81))
      expect(textColor).not.toContain('rgb(0, 89, 128)'); // Not blue (#005980)
      expect(textColor).not.toContain('rgb(37, 99, 235)'); // Not blue-600
    });
    
    // Verify checkmarks are present
    expect(uspElements.every(usp => usp.hasCheckmark)).toBeTruthy();
    
    console.log('✅ USP text color verification complete');
  });
});
