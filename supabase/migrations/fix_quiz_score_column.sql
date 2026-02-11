-- Asegurarse de que la columna quiz_score exista en solved_challenges
ALTER TABLE solved_challenges
ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT NULL;

-- Actualizar los retos existentes para marcar correctamente el tipo de quiz
UPDATE challenges
SET challenge_type = 'quiz'
WHERE description LIKE '%<!-- QUIZ_DATA:%' OR quiz_data IS NOT NULL;
