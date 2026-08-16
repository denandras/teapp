-- Teahouse rating breakdown RPC
-- Returns aggregate rating stats grouped by tea_type for all teas owned by a given teahouse.
-- Used in Settings → Taste Profile for teahouse owners to see which of their
-- tea types are most liked by the community (all users' logs, not just the owner's).
--
-- SECURITY DEFINER: bypasses RLS on tea_logs to compute aggregates without
-- exposing individual ratings. Returns only { tea_type, avg, count, sum } per type.

CREATE OR REPLACE FUNCTION get_teahouse_rating_breakdown(owner_id_val UUID)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(q) ORDER BY q.sum DESC), '[]'::json)
  FROM (
    SELECT
      t.tea_type,
      COALESCE(ROUND(AVG(tl.rating)::NUMERIC, 1), 0) AS avg,
      COUNT(tl.*) AS count,
      COALESCE(SUM(tl.rating), 0) AS sum
    FROM tea_logs tl
    JOIN teas t ON tl.tea_id = t.id
    WHERE t.owner_id = owner_id_val
      AND t.source_type = 'teahouse'
    GROUP BY t.tea_type
  ) q;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_teahouse_rating_breakdown(UUID) TO authenticated;