const stack: number[] = [];
let nextId = 0;

/** Registers an open side sheet and returns its stack id. */
export function registerOpenSideSheet(): number {
  nextId += 1;
  stack.push(nextId);
  return nextId;
}

/** Removes a side sheet from the open stack. */
export function unregisterOpenSideSheet(id: number): void {
  const index = stack.lastIndexOf(id);
  if (index >= 0) {
    stack.splice(index, 1);
  }
}

/** Whether this sheet is the topmost open side sheet. */
export function isTopOpenSideSheet(id: number): boolean {
  return stack[stack.length - 1] === id;
}

/** Test-only reset for isolated stack assertions. */
export function resetOpenSideSheetStack(): void {
  stack.length = 0;
  nextId = 0;
}
