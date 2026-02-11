-- Actualizar los nombres de usuario en la tabla de perfiles basados en los emails de auth.users
UPDATE profiles
SET username = SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1)
FROM auth.users
WHERE profiles.id = auth.users.id
AND (profiles.username IS NULL OR profiles.username = '' OR profiles.username LIKE '%@%');
