-- Actualizar los nombres de usuario en la tabla de perfiles
UPDATE profiles
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL OR username = '' OR username LIKE '%@%';
