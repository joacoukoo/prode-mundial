-- Agrega columna previous_rank a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS previous_rank INTEGER DEFAULT NULL;

-- Función que snapshottea el ranking actual antes de cargar resultados
CREATE OR REPLACE FUNCTION snapshot_previous_ranks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET previous_rank = ranked.rn
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             ORDER BY total_points DESC,
                      correct_results DESC,
                      created_at ASC
           ) AS rn
    FROM profiles
  ) ranked
  WHERE profiles.id = ranked.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: dispara UNA sola vez por statement antes de guardar resultados
DROP TRIGGER IF EXISTS snapshot_ranks_before_result ON match_results;
CREATE TRIGGER snapshot_ranks_before_result
BEFORE INSERT OR UPDATE ON match_results
FOR EACH STATEMENT
EXECUTE FUNCTION snapshot_previous_ranks();
