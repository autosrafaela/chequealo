-- Add RLS policies for chat file uploads in avatars bucket
-- Users can upload chat files to conversations they're part of
CREATE POLICY "Users can upload chat files to their conversations"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'chat-files'
  AND auth.uid() IN (
    SELECT user_id FROM conversations 
    WHERE id::text = (storage.foldername(name))[2]
    UNION
    SELECT p.user_id FROM conversations c
    JOIN professionals p ON p.id = c.professional_id
    WHERE c.id::text = (storage.foldername(name))[2]
  )
);

-- Users can view chat files from their conversations
CREATE POLICY "Users can view chat files from their conversations"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'chat-files'
  AND auth.uid() IN (
    SELECT user_id FROM conversations 
    WHERE id::text = (storage.foldername(name))[2]
    UNION
    SELECT p.user_id FROM conversations c
    JOIN professionals p ON p.id = c.professional_id
    WHERE c.id::text = (storage.foldername(name))[2]
  )
);

-- Users can delete their own chat files
CREATE POLICY "Users can delete their own chat files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'chat-files'
  AND auth.uid() IN (
    SELECT user_id FROM conversations 
    WHERE id::text = (storage.foldername(name))[2]
    UNION
    SELECT p.user_id FROM conversations c
    JOIN professionals p ON p.id = c.professional_id
    WHERE c.id::text = (storage.foldername(name))[2]
  )
);