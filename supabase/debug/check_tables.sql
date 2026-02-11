-- Verificar la estructura de la tabla profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Verificar si hay datos en la tabla profiles
SELECT id, username, email 
FROM profiles 
LIMIT 10;

-- Verificar la estructura de la tabla auth.users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth';

-- Verificar si hay datos en la tabla auth.users
SELECT id, email, raw_user_meta_data 
FROM auth.users 
LIMIT 10;
