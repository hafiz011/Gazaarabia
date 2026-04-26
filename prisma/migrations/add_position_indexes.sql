-- Migration: Optimize Submenus Positioning

-- Add index for menu-based ordering
ALTER TABLE submenus ADD INDEX IF NOT EXISTS idx_menuId_position (menuId, position);

-- Ensure position is NOT NULL with DEFAULT 0
ALTER TABLE submenus MODIFY COLUMN position INT NOT NULL DEFAULT 0;

-- Add composite index for efficient queries
ALTER TABLE submenus ADD INDEX IF NOT EXISTS idx_menu_position_id (menuId, position, id);

-- Verify no gaps or duplicates exist
-- SELECT menuId, COUNT(*) as cnt, MAX(position) as max_pos
-- FROM submenus
-- GROUP BY menuId
-- HAVING cnt != max_pos + 1
-- ORDER BY menuId;
