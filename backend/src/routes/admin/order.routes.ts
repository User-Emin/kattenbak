import { Router, Request, Response } from 'express';

const router = Router();

/**
 * ADMIN ORDER ROUTES - DRY & Mock Data
 * React Admin compatible
 */

// DRY: Mock orders
const MOCK_ORDERS = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerEmail: 'customer@example.com',
    customerName: 'Jan Pietersen',
    total: 299.99,
    subtotal: 299.99,
    tax: 0,
    shippingCost: 0,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    shippingAddress: {
      street: 'Teststraat 1',
      city: 'Amsterdam',
      postalCode: '1234AB',
      country: 'NL',
    },
    items: [
      {
        productId: '1',
        productName: 'Automatische Kattenbak Premium',
        quantity: 1,
        price: 299.99,
      },
    ],
    createdAt: new Date('2024-12-10').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

router.get('/', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  
  res.json({
    success: true,
    data: MOCK_ORDERS,
    meta: { page, pageSize, total: MOCK_ORDERS.length, totalPages: 1 },
  });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: MOCK_ORDERS[0],
  });
});

router.put('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { ...MOCK_ORDERS[0], ...req.body, id: req.params.id },
  });
});

export default router;

