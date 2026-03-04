

# Plan: Fix search to include `profession` column (user calls it "category")

## Problem
When a user types "plomero" in the search bar, the synonym engine resolves it to "Plomero / Gasista" and filters with `profession.ilike.%Plomero / Gasista%`. This misses professionals whose `profession` column is just "Plomero" (without the "/ Gasista" part). Additionally, the matched-profession branch (line 262) only filters by `profession` — it does not also search `full_name` or `description` with the original keywords.

Note: The DB column is called `profession`, not `category`. The user refers to it as "category" but they mean the same field.

## Fix (single file: `src/hooks/useAdvancedSearch.ts`)

### Change 1 — Matched-profession branch (lines 260-275)
When professions are resolved via synonyms, currently only `profession.ilike` is used. Change this to also include `full_name.ilike` and `description.ilike` with the **original raw keywords**, so results are a union (OR) of:
- profession matches from synonym resolution
- full_name/description matches from original keywords

```
// Build combined OR filter:
// 1. profession matches from resolved professions
// 2. full_name/description matches from raw keywords
const allConditions = [
  ...matchedProfessions.map(p => `profession.ilike.%${p}%`),
  ...rawKeywords.flatMap(kw => [
    `full_name.ilike.%${kw}%`,
    `description.ilike.%${kw}%`,
    `profession.ilike.%${kw}%`
  ])
];
professionalsQuery = professionalsQuery.or(allConditions.join(','));
```

### Change 2 — No-match fallback branch (lines 276-292)
Already searches `full_name, profession, location, description` — this is correct. No change needed here since it already covers all three fields.

### Result
Any text typed in the search bar will always match against `full_name`, `description`, and `profession` via ILIKE OR, regardless of whether the synonym engine resolves a profession or not.

