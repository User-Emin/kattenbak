import { Router, Request, Response } from 'express';

const router = Router();

/**
 * ADMIN CATEGORY ROUTES - DRY & Mock Data
 */

const MOCK_CATEGORIES = [
  {
    id: '1',
    name: 'Kattenbakken',
    slug: 'kattenbakken',
    description: 'Automatische en handmatige kattenbakken',
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Accessoires',
    slug: 'accessoires',
    description: 'Kattenbak accessoires en onderdelen',
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

router.get('/', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  
  res.json({
    success: true,
    data: MOCK_CATEGORIES,
    meta: { page, pageSize, total: MOCK_CATEGORIES.length, totalPages: 1 },
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const category = MOCK_CATEGORIES.find(c => c.id === req.params.id) || MOCK_CATEGORIES[0];
  res.json({
    success: true,
    data: category,
  });
});

router.put('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { ...MOCK_CATEGORIES[0], ...req.body, id: req.params.id },
  });
});

router.post('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { ...MOCK_CATEGORIES[0], ...req.body, id: String(Date.now()) },
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { id: req.params.id },
  });
});

export default router;

