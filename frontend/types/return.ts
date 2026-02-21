/**
 * Return types - centralized source of truth
 * All return reason values and labels defined here (no hardcoding elsewhere)
 */

export enum ReturnReason {
  DEFECTIVE = 'DEFECTIVE',
  WRONG_ITEM = 'WRONG_ITEM',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  CHANGED_MIND = 'CHANGED_MIND',
  DAMAGED_IN_TRANSIT = 'DAMAGED_IN_TRANSIT',
  OTHER = 'OTHER',
}

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  [ReturnReason.DEFECTIVE]: 'Product is defect',
  [ReturnReason.WRONG_ITEM]: 'Verkeerd product ontvangen',
  [ReturnReason.NOT_AS_DESCRIBED]: 'Product komt niet overeen met beschrijving',
  [ReturnReason.CHANGED_MIND]: 'Van gedachten veranderd',
  [ReturnReason.DAMAGED_IN_TRANSIT]: 'Beschadigd tijdens transport',
  [ReturnReason.OTHER]: 'Andere reden',
};
