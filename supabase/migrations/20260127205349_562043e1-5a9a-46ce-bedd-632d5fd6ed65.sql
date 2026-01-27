-- Tabla de actualizaciones de plataforma
CREATE TABLE platform_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('feature', 'improvement', 'fix', 'announcement')),
  icon VARCHAR(10) DEFAULT '✨',
  link VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  publish_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabla para trackear qué usuarios ya vieron cada actualización
CREATE TABLE user_update_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  update_id UUID REFERENCES platform_updates(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, update_id)
);

-- Índices
CREATE INDEX idx_platform_updates_active ON platform_updates(is_active, publish_at DESC);
CREATE INDEX idx_user_update_reads ON user_update_reads(user_id, update_id);

-- Enable RLS
ALTER TABLE platform_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_update_reads ENABLE ROW LEVEL SECURITY;

-- Políticas para platform_updates
CREATE POLICY "Everyone can view active platform updates"
ON platform_updates FOR SELECT
USING (is_active = true AND publish_at <= NOW());

CREATE POLICY "Admins can manage platform updates"
ON platform_updates FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para user_update_reads
CREATE POLICY "Users can view their own read status"
ON user_update_reads FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can mark updates as read"
ON user_update_reads FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own read status"
ON user_update_reads FOR DELETE
USING (user_id = auth.uid());