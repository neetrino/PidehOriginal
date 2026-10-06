import 'server-only';

import { calculateBonusEarnAmount } from '@/features/bonuses/domain/bonus-rules';
import { getStoreBonusSettings } from '@/features/settings/application/queries';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * Points a signed-in shopper will earn when this merchandise is delivered.
 * Guests earn nothing, so the preview is 0.
 */
export async function previewCartEarnPoints(merchandiseBaseAmd: number): Promise<number> {
  if (merchandiseBaseAmd <= 0) {
    return 0;
  }

  const user = await getCurrentUser();
  if (!user) {
    return 0;
  }

  const settings = await getStoreBonusSettings();
  return calculateBonusEarnAmount(merchandiseBaseAmd, settings.accrualPercent);
}
