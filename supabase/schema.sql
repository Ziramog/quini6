-- Tabla principal de sorteos
CREATE TABLE IF NOT EXISTS sorteos (
  id            TEXT PRIMARY KEY,
  num           INTEGER NOT NULL,
  fecha         DATE NOT NULL,
  fecha_display TEXT NOT NULL,
  n1            SMALLINT NOT NULL CHECK (n1 BETWEEN 0 AND 46),
  n2            SMALLINT NOT NULL CHECK (n2 BETWEEN 0 AND 46),
  n3            SMALLINT NOT NULL CHECK (n3 BETWEEN 0 AND 46),
  n4            SMALLINT NOT NULL CHECK (n4 BETWEEN 0 AND 46),
  n5            SMALLINT NOT NULL CHECK (n5 BETWEEN 0 AND 46),
  n6            SMALLINT NOT NULL CHECK (n6 BETWEEN 0 AND 46),
  tipo          TEXT NOT NULL CHECK (tipo IN ('SALE', 'REV')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sorteos_fecha      ON sorteos (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_sorteos_tipo       ON sorteos (tipo);
CREATE INDEX IF NOT EXISTS idx_sorteos_fecha_tipo ON sorteos (fecha DESC, tipo);

-- Log de sincronizaciones
CREATE TABLE IF NOT EXISTS sync_log (
  id           SERIAL PRIMARY KEY,
  ejecutado_en TIMESTAMPTZ DEFAULT now(),
  nuevos       INTEGER NOT NULL DEFAULT 0,
  total        INTEGER NOT NULL DEFAULT 0,
  error        TEXT
);

-- RLS
ALTER TABLE sorteos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura_publica_sorteos"
  ON sorteos FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "escritura_service_role_sorteos"
  ON sorteos FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "lectura_publica_sync_log"
  ON sync_log FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "escritura_service_role_sync_log"
  ON sync_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Función para reasignar campo num (1 = más reciente)
CREATE OR REPLACE FUNCTION recalcular_nums()
RETURNS void AS $$
  UPDATE sorteos s
  SET num = sub.rn
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY fecha DESC, tipo DESC) AS rn
    FROM sorteos
  ) sub
  WHERE s.id = sub.id;
$$ LANGUAGE sql SECURITY DEFINER;