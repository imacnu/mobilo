-- Verificar si el bucket existe y crearlo si no
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de acceso público
DROP POLICY IF EXISTS "Public access to images" ON storage.objects;
CREATE POLICY "Public access to images" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

-- Políticas de inserción (cualquiera puede subir)
DROP POLICY IF EXISTS "Anyone can insert images" ON storage.objects;
CREATE POLICY "Anyone can insert images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images');

-- Políticas de eliminación
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
CREATE POLICY "Anyone can delete images" ON storage.objects 
FOR DELETE USING (bucket_id = 'images');

-- Políticas de actualización
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
CREATE POLICY "Anyone can update images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'images');