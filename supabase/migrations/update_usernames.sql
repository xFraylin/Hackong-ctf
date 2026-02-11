-- Actualizar los nombres de usuario para todos los usuarios
-- Extraer la parte del nombre de usuario del correo electrónico
UPDATE profiles p
SET username = SPLIT_PART(auth.users.email, '@', 1)
FROM auth.users
WHERE p.id = auth.users.id
AND (p.username IS NULL OR p.username = '' OR p.username LIKE '%@%');
