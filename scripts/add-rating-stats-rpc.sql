-- Tea rating stats RPC function
-- Returns aggregate (avg + count) rating for a tea, without exposing individual logs.
-- Called by teahouse owners viewing their own teas.
-- RLS on tea_logs restricts individual rows; this SECURITY DEFINER function
-- bypasses RLS to compute the aggregate, returning only avg + count.

CREATE OR REPLACE FUNCTION get_tea_rating_stats(tea_slug_val TEXT)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'avg', COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0),
    'count', COUNT(*)
  )
  FROM tea_logs tl
  JOIN teas t ON tl.tea_id = t.id
  WHERE t.slug = tea_slug_val;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_tea_rating_stats(TEXT) TO authenticated;