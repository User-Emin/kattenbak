import { redirect } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/config';

/** ✅ SEO: Product focus – /producten leidt direct naar productpagina */
export default function ProductenPage() {
  redirect(`/product/${SITE_CONFIG.DEFAULT_PRODUCT_SLUG}`);
}
