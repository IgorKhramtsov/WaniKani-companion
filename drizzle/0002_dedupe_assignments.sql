DELETE FROM assignments
WHERE id NOT IN (
  SELECT a1.id
  FROM assignments a1
  WHERE a1.updated_at = (
    SELECT MAX(a2.updated_at)
    FROM assignments a2
    WHERE a2.subject_id = a1.subject_id
  )
  AND a1.id = (
    SELECT MAX(a3.id)
    FROM assignments a3
    WHERE a3.subject_id = a1.subject_id
      AND a3.updated_at = a1.updated_at
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS assignments_subject_id_unique
  ON assignments(subject_id);
