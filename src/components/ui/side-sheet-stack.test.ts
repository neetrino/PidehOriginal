import { describe, expect, it, beforeEach } from 'vitest';

import {
  isTopOpenSideSheet,
  registerOpenSideSheet,
  resetOpenSideSheetStack,
  unregisterOpenSideSheet,
} from '@/components/ui/side-sheet-stack';

describe('side-sheet-stack', () => {
  beforeEach(() => {
    resetOpenSideSheetStack();
  });

  it('treats the last registered sheet as top', () => {
    const first = registerOpenSideSheet();
    const second = registerOpenSideSheet();

    expect(isTopOpenSideSheet(first)).toBe(false);
    expect(isTopOpenSideSheet(second)).toBe(true);

    unregisterOpenSideSheet(second);
    expect(isTopOpenSideSheet(first)).toBe(true);
  });
});
