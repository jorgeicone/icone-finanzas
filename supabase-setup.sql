-- ═══════════════════════════════════════════════════════════
-- ICONE FINANZAS — Setup de Supabase
-- Proyecto: nvgkhdrrxqdgxktfkioa
-- Ejecutar UNA SOLA VEZ desde: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1) Tabla principal: una fila por usuario con TODO su estado financiero
CREATE TABLE IF NOT EXISTS finanzas_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE finanzas_data IS 'Estado completo de ICONE Finanzas por usuario (cuentas, saldos, ingresos, egresos, módulos custom)';

-- 2) Row Level Security: cada usuario solo ve y modifica SU fila
ALTER TABLE finanzas_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own finanzas" ON finanzas_data;
CREATE POLICY "Users can view own finanzas"
  ON finanzas_data FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own finanzas" ON finanzas_data;
CREATE POLICY "Users can insert own finanzas"
  ON finanzas_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own finanzas" ON finanzas_data;
CREATE POLICY "Users can update own finanzas"
  ON finanzas_data FOR UPDATE
  USING (auth.uid() = user_id);

-- 3) Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_finanzas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS finanzas_set_updated_at ON finanzas_data;
CREATE TRIGGER finanzas_set_updated_at
  BEFORE UPDATE ON finanzas_data
  FOR EACH ROW
  EXECUTE FUNCTION update_finanzas_timestamp();

-- ═══════════════════════════════════════════════════════════
-- LISTO. Verificar:
-- ═══════════════════════════════════════════════════════════
SELECT 'Tabla creada' AS status,
       COUNT(*) AS politicas
FROM pg_policies
WHERE tablename = 'finanzas_data';
-- Debe retornar: politicas = 3
