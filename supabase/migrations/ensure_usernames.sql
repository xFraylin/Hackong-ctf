-- Asegurarse de que todos los usuarios tengan un nombre de usuario
UPDATE profiles 
SET username = COALESCE(username, SPLIT_PART(email, '@', 1)) 
WHERE username IS NULL OR username = '';
