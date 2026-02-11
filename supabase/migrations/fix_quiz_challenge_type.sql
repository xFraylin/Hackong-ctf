-- Asegurarse de que las columnas existan
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS challenge_type TEXT CHECK (challenge_type IN ('flag', 'quiz')) DEFAULT 'flag',
ADD COLUMN IF NOT EXISTS quiz_data JSONB DEFAULT NULL;

-- Añadir columna quiz_score a la tabla solved_challenges si no existe
ALTER TABLE solved_challenges
ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT NULL;

-- Actualizar los retos existentes que tienen datos de quiz en la descripción
UPDATE challenges
SET challenge_type = 'quiz',
    quiz_data = (regexp_match(description, '<!-- QUIZ_DATA: (.*?) -->'))[1]::jsonb->'questions'
WHERE description LIKE '%<!-- QUIZ_DATA:%';

-- Limpiar la descripción de los retos tipo quiz
UPDATE challenges
SET description = regexp_replace(description, '<!-- QUIZ_DATA: .*? -->', '', 'g')
WHERE challenge_type = 'quiz';
