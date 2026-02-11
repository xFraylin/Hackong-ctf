-- Añadir nuevas columnas a la tabla challenges
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS challenge_type TEXT CHECK (challenge_type IN ('flag', 'quiz')) DEFAULT 'flag',
ADD COLUMN IF NOT EXISTS quiz_data JSONB DEFAULT NULL;

-- Añadir columna quiz_score a la tabla solved_challenges si no existe
ALTER TABLE solved_challenges
ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT NULL;
