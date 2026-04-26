/**
 * Position Management Service
 * Handles normalization, validation, and calculations for sequential positions
 * Used by all reordering operations
 */

/**
 * Normalize positions to be sequential (0, 1, 2, ...)
 * @param items Items with position field
 * @returns Normalized items
 */
export const normalizePositions = (items: any[]): any[] => {
  return items
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({
      ...item,
      position: index,
    }));
};

/**
 * Validate positions are sequential (no gaps, no duplicates)
 * @param items Items with position field
 * @returns true if valid
 */
export const validatePositions = (items: any[]): boolean => {
  if (!Array.isArray(items) || items.length === 0) return true;

  const positions = items
    .map((item) => item.position)
    .sort((a, b) => a - b);

  // Check for gaps: should be [0, 1, 2, ...]
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] !== i) {
      return false;
    }
  }

  return true;
};

/**
 * Generate reorder payload from current state
 * @param items Current items in order
 * @returns Array of { id, position }
 */
export const generateReorderPayload = (
  items: any[]
): Array<{ id: number; position: number }> => {
  return items.map((item, index) => ({
    id: item.id,
    position: index,
  }));
};

/**
 * Calculate next position for new item in a menu
 * @param existingItems Items already in the menu
 * @returns Next position value
 */
export const calculateNextPosition = (existingItems: any[]): number => {
  if (existingItems.length === 0) return 0;
  const maxPosition = Math.max(...existingItems.map((item) => item.position));
  return maxPosition + 1;
};

/**
 * Recalculate positions after deletion
 * @param items Items remaining after deletion
 * @returns Items with recalculated positions
 */
export const recalculatePositionsAfterDeletion = (items: any[]): any[] => {
  return items.map((item, index) => ({
    ...item,
    position: index,
  }));
};

/**
 * Find position conflicts (duplicate or invalid positions)
 * @param items Items to check
 * @returns Array of conflict descriptions
 */
export const findPositionConflicts = (items: any[]): string[] => {
  const conflicts: string[] = [];
  const positions = new Map<number, any[]>();

  items.forEach((item) => {
    const pos = item.position;
    if (!positions.has(pos)) {
      positions.set(pos, []);
    }
    positions.get(pos)!.push(item);
  });

  // Check for duplicates
  positions.forEach((itemsAtPos, pos) => {
    if (itemsAtPos.length > 1) {
      conflicts.push(
        `Position ${pos} has ${itemsAtPos.length} items: ${itemsAtPos.map((i) => i.id).join(", ")}`
      );
    }
  });

  // Check for gaps
  const expectedPositions = new Set<number>();
  for (let i = 0; i < items.length; i++) {
    expectedPositions.add(i);
  }

  positions.forEach((_, pos) => {
    if (!expectedPositions.has(pos)) {
      conflicts.push(`Position ${pos} is out of sequence`);
    }
  });

  return conflicts;
};
