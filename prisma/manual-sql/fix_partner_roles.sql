-- Fix accounts that can't log into the affiliate/ambassador portal because their
-- user role isn't "affiliate". In this system BOTH affiliates and ambassadors use
-- the "affiliate" user role; the ambassador distinction lives in affiliate.type.
-- These statements only repoint roleId / set type. They DELETE NOTHING.

-- 0) Sanity: confirm an "affiliate" role row exists (login/signup depend on it)
SELECT id, name FROM roles;

-- ────────────────────────────────────────────────────────────────────────────
-- A) FIX ONE ACCOUNT  (replace the email in both statements)
-- Run the affiliate.type update FIRST (while the role is still the old one),
-- then move the user onto the "affiliate" role.
-- ────────────────────────────────────────────────────────────────────────────

-- Mark the partner as an ambassador (skip / set 'affiliate' if they are a plain affiliate)
UPDATE affiliate
SET type = 'ambassador'
WHERE userId = (SELECT id FROM users WHERE email = 'YOUR_TEST_EMAIL');

-- Put the user on the "affiliate" portal role
UPDATE users
SET roleId = (SELECT id FROM roles WHERE LOWER(name) = 'affiliate' LIMIT 1)
WHERE email = 'YOUR_TEST_EMAIL';

-- ────────────────────────────────────────────────────────────────────────────
-- B) BULK FIX  — migrate EVERY legacy "ambassador"-role account at once.
-- Safe to run even if there is no "ambassador" role (it just affects 0 rows).
-- ────────────────────────────────────────────────────────────────────────────

-- 1) tag their affiliate rows as ambassador (before we move them off the role)
UPDATE affiliate a
JOIN users u ON u.id = a.userId
JOIN roles r ON r.id = u.roleId
SET a.type = 'ambassador'
WHERE LOWER(r.name) = 'ambassador';

-- 2) move those users onto the "affiliate" role
UPDATE users u
JOIN roles r ON r.id = u.roleId
SET u.roleId = (SELECT id FROM roles WHERE LOWER(name) = 'affiliate' LIMIT 1)
WHERE LOWER(r.name) = 'ambassador';

-- 3) verify: should return 0 rows once fixed
SELECT u.email, r.name
FROM users u JOIN roles r ON r.id = u.roleId
WHERE LOWER(r.name) = 'ambassador';
