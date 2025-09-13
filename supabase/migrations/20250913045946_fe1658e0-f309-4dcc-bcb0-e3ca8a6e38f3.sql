-- Create storage bucket for work photos
INSERT INTO storage.buckets (id, name, public) VALUES ('work-photos', 'work-photos', true);

-- Create policies for work photos storage
CREATE POLICY "Work photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'work-photos');

CREATE POLICY "Professionals can upload their work photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'work-photos' AND auth.uid() IN (
  SELECT user_id FROM professionals WHERE id::text = (storage.foldername(name))[1]
));

CREATE POLICY "Professionals can update their work photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'work-photos' AND auth.uid() IN (
  SELECT user_id FROM professionals WHERE id::text = (storage.foldername(name))[1]
));

CREATE POLICY "Professionals can delete their work photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'work-photos' AND auth.uid() IN (
  SELECT user_id FROM professionals WHERE id::text = (storage.foldername(name))[1]
));