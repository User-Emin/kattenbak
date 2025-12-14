/**
 * SITE SETTINGS ROUTES - Admin Configuration
 * DRY endpoints voor hero, USPs, en site-wide settings
 */

import { Router, Request, Response } from 'express';
import { getSettings, updateSettings } from '../../data/mock-settings';

const router = Router();

/**
 * GET /admin/settings
 * Get current site settings
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const settings = getSettings();
    
    return res.json({
      success: true,
      data: settings,
      message: 'Settings retrieved'
    });
  } catch (error: any) {
    console.error('❌ Get settings error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * PUT /admin/settings
 * Update site settings
 */
router.put('/', (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    console.log('📝 Updating settings:', {
      hasHero: !!updates.hero,
      hasUsps: !!updates.usps,
    });
    
    const updated = updateSettings(updates);
    
    return res.json({
      success: true,
      data: updated,
      message: 'Settings updated'
    });
  } catch (error: any) {
    console.error('❌ Update settings error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;



