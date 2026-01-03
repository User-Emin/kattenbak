/**
 * HEALTH CHECK ROUTES
 * Endpoints for system monitoring
 */

import { Router } from 'express';
import { HealthCheckController } from '@/controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Comprehensive health check
 * @access  Public
 */
router.get('/', HealthCheckController.getHealth);

/**
 * @route   GET /api/v1/health/ready
 * @desc    Readiness probe
 * @access  Public
 */
router.get('/ready', HealthCheckController.getReadiness);

/**
 * @route   GET /api/v1/health/live
 * @desc    Liveness probe
 * @access  Public
 */
router.get('/live', HealthCheckController.getLiveness);

export default router;
