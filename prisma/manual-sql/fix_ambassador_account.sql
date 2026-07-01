-- Fix: ambassador@gazaarabia.com can't log in ("Invalid role: affiliate").
-- Cause: the account was created with the user role "ambassador". In this system
-- ambassadors are affiliate-role users distinguished by affiliate.type.
-- These statements only ensure the role exists and repoint roleId / set type.
-- They DELETE NOTHING.

-- 1) Make sure the "affiliate" portal role exists (no-op if it already does)
INSERT IGNORE INTO roles (name) VALUES ('affiliate');

-- 2) Mark this partner's affiliate record as an ambassador
UPDATE affiliate
SET type = 'ambassador'
WHERE userId = (SELECT id FROM users WHERE email = 'ambassador@gazaarabia.com');

-- 3) Move the user onto the "affiliate" role
UPDATE users
SET roleId = (SELECT id FROM roles WHERE LOWER(name) = 'affiliate' LIMIT 1)
WHERE email = 'ambassador@gazaarabia.com';

-- 4) Verify — should show roleName = affiliate, affiliateType = ambassador
SELECT u.email, r.name AS roleName, a.type AS affiliateType
FROM users u
LEFT JOIN roles r ON r.id = u.roleId
LEFT JOIN affiliate a ON a.userId = u.id
WHERE u.email = 'ambassador@gazaarabia.com';
