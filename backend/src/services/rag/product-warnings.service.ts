/**
 * PRODUCT WARNINGS SERVICE - Modulaire waarschuwingen voor RAG
 *
 * Genereert waarschuwingen op basis van productcontext (bijv. externe leverancier, Alibaba).
 * Eén plek voor alle product-gerelateerde disclaimers; geen hardcoding in prompts.
 *
 * Team: Product + Legal + RAG
 */

export interface ProductContext {
  slug?: string;
  title?: string;
  description?: string;
  price?: string | number;
  /** Externe link (bijv. Alibaba) - indien aanwezig kunnen extra waarschuwingen getoond worden */
  external_url?: string;
  [key: string]: unknown;
}

const EXTERNAL_SUPPLIER_KEYWORDS = [
  'alibaba',
  'aliexpress',
  'externe leverancier',
  'dropship',
  'wholesale',
  'factory direct',
];

/**
 * Bepaal waarschuwingen voor dit product (modulair, uitbreidbaar).
 */
export function getWarnings(productContext?: ProductContext | null): string[] {
  if (!productContext) return [];

  const warnings: string[] = [];
  const title = (productContext.title ?? '').toLowerCase();
  const desc = (productContext.description ?? '').toLowerCase();
  const combined = `${title} ${desc}`;
  const hasExternalUrl = Boolean(
    productContext.external_url &&
      String(productContext.external_url).trim().length > 0
  );

  // Waarschuwing: product kan via externe leverancier geleverd worden
  const looksExternal =
    hasExternalUrl ||
    EXTERNAL_SUPPLIER_KEYWORDS.some((k) => combined.includes(k));

  if (looksExternal) {
    warnings.push(
      'Dit product kan via een externe leverancier geleverd worden. Prijs en levertijd kunnen variëren.'
    );
  }

  // Optioneel: algemene disclaimer prijs/levertijd
  if (productContext.price !== undefined && productContext.price !== null) {
    // Geen extra warning alleen voor prijs; alleen combineren met externe leverancier
  }

  return warnings;
}
