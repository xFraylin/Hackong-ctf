-- Crear políticas de almacenamiento para el bucket 'challenges'

-- Primero, asegurarse de que el bucket existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenges', 'challenges', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política para permitir lectura pública
CREATE POLICY "Challenge files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'challenges');

-- Política para permitir a los administradores subir archivos
CREATE POLICY "Admins can upload challenge files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'challenges' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Política para permitir a los administradores actualizar archivos
CREATE POLICY "Admins can update challenge files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'challenges' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Política para permitir a los administradores eliminar archivos
CREATE POLICY "Admins can delete challenge files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'challenges' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
