import { Router, Request, Response } from 'express';

const router = Router();

/**
 * ADMIN SHIPMENT ROUTES - DRY & Mock Data
 */

const MOCK_SHIPMENTS = [
  {
    id: '1',
    orderId: '1',
    trackingNumber: 'TRACK123456789',
    carrier: 'MyParcel',
    status: 'IN_TRANSIT',
    shippedAt: new Date('2024-12-09').toISOString(),
    estimatedDelivery: new Date('2024-12-11').toISOString(),
    createdAt: new Date('2024-12-09').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

router.get('/', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  
  res.json({
    success: true,
    data: MOCK_SHIPMENTS,
    meta: { page, pageSize, total: MOCK_SHIPMENTS.length, totalPages: 1 },
  });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: MOCK_SHIPMENTS[0],
  });
});

router.put('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { ...MOCK_SHIPMENTS[0], ...req.body, id: req.params.id },
  });
});

export default router;

