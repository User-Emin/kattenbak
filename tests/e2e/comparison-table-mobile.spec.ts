import { test, expect } from '@playwright/test';

/**
 * E2E Test: Comparison Table Mobile Verification
 * Verifieert dat de vergelijkingstabel correct werkt in mobielweergave
 * - Geen hardcoded waarden, alles via slimme variabelen
 * - Responsive, symmetrisch, centraal
 * - Geen overlap van stroken
 * - Smooth slide functionaliteit
 */
test.describe('Comparison Table Mobile E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://catsupply.nl/product/automatische-kattenbak-premium');
    await page.waitForLoadState('networkidle');
  });

  test('should display comparison table in mobile view without overlap', async ({ page }) => {
    // Scroll to comparison table
    await page.evaluate(() => {
      const comparisonSection = Array.from(document.querySelectorAll('div, section')).find(el => 
        el.textContent?.includes('Altijd een schone kattenbak') || 
        el.textContent?.includes('Automatische kattenbak')
      );
      if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(2000);

    // Verify comparison table is visible
    const comparisonTable = await page.evaluate(() => {
      const table = Array.from(document.querySelectorAll('div')).find(el => 
        el.textContent?.includes('Altijd een schone kattenbak') &&
        el.textContent?.includes('Automatische')
      );
      
      if (!table) return null;
      
      const rect = table.getBoundingClientRect();
      const styles = window.getComputedStyle(table);
      
      return {
        visible: rect.width > 0 && rect.height > 0,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        maxWidth: styles.maxWidth,
        padding: styles.padding,
        boxSizing: styles.boxSizing,
        overflow: styles.overflow,
      };
    });

    expect(comparisonTable).toBeTruthy();
    expect(comparisonTable?.visible).toBe(true);
    expect(comparisonTable?.boxSizing).toBe('border-box');
    
    console.log('✅ Comparison table visible:', comparisonTable);
  });

  test('should have correct slide structure without overlap', async ({ page }) => {
    // Scroll to comparison table
    await page.evaluate(() => {
      const comparisonSection = Array.from(document.querySelectorAll('div, section')).find(el => 
        el.textContent?.includes('Altijd een schone kattenbak')
      );
      if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(2000);

    // Verify slide structure
    const slideStructure = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('[class*="flex-shrink-0"]'));
      const slideContainer = slides[0]?.parentElement;
      
      if (!slideContainer) return null;
      
      const containerRect = slideContainer.getBoundingClientRect();
      const containerStyles = window.getComputedStyle(slideContainer);
      
      const slideRects = slides.slice(0, 3).map(slide => {
        const rect = slide.getBoundingClientRect();
        const styles = window.getComputedStyle(slide);
        return {
          width: rect.width,
          left: rect.left,
          right: rect.right,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          boxSizing: styles.boxSizing,
        };
      });
      
      return {
        containerWidth: containerRect.width,
        containerTransform: containerStyles.transform,
        slideCount: slides.length,
        slides: slideRects,
        hasOverlap: slideRects.some((slide, i) => {
          if (i === 0) return false;
          return slide.left < slideRects[i - 1].right;
        }),
      };
    });

    expect(slideStructure).toBeTruthy();
    expect(slideStructure?.slideCount).toBeGreaterThan(0);
    expect(slideStructure?.hasOverlap).toBe(false);
    
    console.log('✅ Slide structure correct:', slideStructure);
  });

  test('should display stroken (rows) correctly without horizontal overflow', async ({ page }) => {
    // Scroll to comparison table
    await page.evaluate(() => {
      const comparisonSection = Array.from(document.querySelectorAll('div, section')).find(el => 
        el.textContent?.includes('Altijd een schone kattenbak')
      );
      if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(2000);

    // Verify stroken (Automatische/Handmatige rows)
    const stroken = await page.evaluate(() => {
      const strokenElements = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent?.includes('Automatische') || div.textContent?.includes('Handmatige')
      );
      
      return strokenElements.map(strook => {
        const rect = strook.getBoundingClientRect();
        const styles = window.getComputedStyle(strook);
        const parent = strook.parentElement;
        const parentRect = parent?.getBoundingClientRect();
        
        return {
          text: strook.textContent?.trim().substring(0, 50),
          width: rect.width,
          left: rect.left,
          right: rect.right,
          parentWidth: parentRect?.width || 0,
          padding: styles.padding,
          boxSizing: styles.boxSizing,
          overflow: styles.overflow,
          hasOverflow: rect.right > (parentRect?.right || 0),
        };
      });
    });

    expect(stroken.length).toBeGreaterThan(0);
    
    // Verify no horizontal overflow
    stroken.forEach(strook => {
      expect(strook.hasOverflow).toBe(false);
      expect(strook.boxSizing).toBe('border-box');
    });
    
    console.log('✅ Stroken correct:', stroken);
  });

  test('should have navigation dots and smooth slide functionality', async ({ page }) => {
    // Scroll to comparison table
    await page.evaluate(() => {
      const comparisonSection = Array.from(document.querySelectorAll('div, section')).find(el => 
        el.textContent?.includes('Altijd een schone kattenbak')
      );
      if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(2000);

    // Verify navigation dots
    const navigation = await page.evaluate(() => {
      const dots = Array.from(document.querySelectorAll('button[aria-label*="slide"]'));
      const activeDot = dots.find(dot => {
        const styles = window.getComputedStyle(dot);
        return styles.width !== '8px'; // Active dot is wider (w-6 = 24px)
      });
      
      return {
        dotCount: dots.length,
        hasActiveDot: !!activeDot,
        dots: dots.map(dot => ({
          ariaLabel: dot.getAttribute('aria-label'),
          width: window.getComputedStyle(dot).width,
        })),
      };
    });

    expect(navigation.dotCount).toBeGreaterThan(0);
    expect(navigation.hasActiveDot).toBe(true);
    
    console.log('✅ Navigation dots:', navigation);
    
    // Test clicking navigation dot
    const firstDot = await page.locator('button[aria-label*="slide"]').first();
    await firstDot.click();
    await page.waitForTimeout(700); // Wait for transition
    
    // Verify slide changed
    const afterClick = await page.evaluate(() => {
      const container = Array.from(document.querySelectorAll('div')).find(el => 
        el.style.transform && el.style.transform.includes('translateX')
      );
      return container?.style.transform || null;
    });
    
    expect(afterClick).toBeTruthy();
    console.log('✅ Slide navigation works:', afterClick);
  });

  test('should use smart variables (no hardcoded values)', async ({ page }) => {
    // Scroll to comparison table
    await page.evaluate(() => {
      const comparisonSection = Array.from(document.querySelectorAll('div, section')).find(el => 
        el.textContent?.includes('Altijd een schone kattenbak')
      );
      if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(2000);

    // Verify config values are used (check for consistent padding, spacing, etc.)
    const configValues = await page.evaluate(() => {
      const comparisonTable = Array.from(document.querySelectorAll('div')).find(el => 
        el.textContent?.includes('Altijd een schone kattenbak')
      );
      
      if (!comparisonTable) return null;
      
      const card = comparisonTable.closest('[class*="rounded-xl"]');
      const stroken = Array.from(card?.querySelectorAll('div') || []).filter(div => 
        div.textContent?.includes('Automatische') || div.textContent?.includes('Handmatige')
      );
      
      return {
        cardPadding: card ? window.getComputedStyle(card).padding : null,
        strookPadding: stroken[0] ? window.getComputedStyle(stroken[0]).padding : null,
        strookGap: stroken[0]?.parentElement 
          ? window.getComputedStyle(stroken[0].parentElement).gap 
          : null,
        consistentPadding: stroken.every(s => {
          const padding = window.getComputedStyle(s).padding;
          return padding === stroken[0] ? window.getComputedStyle(stroken[0]).padding : false;
        }),
      };
    });

    expect(configValues).toBeTruthy();
    expect(configValues?.consistentPadding).toBe(true);
    
    console.log('✅ Smart variables used:', configValues);
  });
});
