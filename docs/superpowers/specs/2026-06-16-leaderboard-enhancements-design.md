# Leaderboard Enhancements Design
Date: 2026-06-16

## Overview

Three visual improvements to `LeaderboardTable`: position-change arrows, paid checkmark, and remaining points in play.

---

## Feature 1: Position-Change Arrows

### Goal
Show each player whether they moved up, down, or stayed the same compared to their position before the last match result was saved.

### Database

**Migration:** Add column to `profiles`:
```sql
ALTER TABLE profiles ADD COLUMN previous_rank INTEGER DEFAULT NULL;
```

**Trigger function:** Snapshots all current ranks before any match result is written:
```sql
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
```

**Trigger:** Fires once per statement (not per row) before any insert/update on `match_results`:
```sql
CREATE TRIGGER snapshot_ranks_before_result
BEFORE INSERT OR UPDATE ON match_results
FOR EACH STATEMENT
EXECUTE FUNCTION snapshot_previous_ranks();
```

This ensures `previous_rank` always reflects the state before the most recent batch of results, and that a multi-row insert only triggers one snapshot.

### Frontend

- Update `Profile` type in `src/lib/supabase/types.ts` to include `previous_rank: number | null`
- In `LeaderboardTable`, current rank = `i + 1` (array index, already sorted by points)
- Delta indicator placed to the right of the rank number in the rank cell:
  - `current < previous` → `▲` in `text-green-400`
  - `current > previous` → `▼` in `text-red-400`
  - equal or `previous_rank` is null → `—` in `text-muted-foreground/40`
- Font size: `text-[10px]`, doesn't displace existing layout

---

## Feature 2: Paid Checkmark

### Goal
Publicly show which players have paid their entry fee.

### Database
No changes. `paid: boolean` already exists in `profiles`.

### Frontend
- In the player name row of `LeaderboardTable`, render a `✓` (`CheckCircle2` icon from lucide, size 13) in `text-green-400` immediately after the display name
- Only shown when `player.paid === true`
- Not interactive (admin toggle stays in `/admin`)

---

## Feature 3: Points in Play

### Goal
Show each player how many points they can still earn (max possible from remaining matches).

### Database
No changes. Calculated as `(TOTAL_MATCHES - matches_played) * POINTS_PER_EXACT`.

### Frontend
- The formula already exists in the component as `maxPossible`; extract `remainingPoints = maxPossible - total_points`
- Render below the `total_points` value in the Pts cell:
  - Small secondary text: `+{remainingPoints} en juego` in `text-[10px] text-muted-foreground/50`
- **Not shown** when the player is mathematically eliminated (already shows `máx X` in that case)
- **Not shown** when `remainingPoints === 0` (all matches played)

---

## Files Changed

| File | Change |
|------|--------|
| Supabase migration | Add `previous_rank` column + trigger |
| `src/lib/supabase/types.ts` | Add `previous_rank: number \| null` to `Profile` |
| `src/components/LeaderboardTable.tsx` | Render arrows, checkmark, points in play |
