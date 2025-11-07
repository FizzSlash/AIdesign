# Create Brand Profile in Database

## Run This SQL in Supabase:

```sql
-- Create brand profile for test user
INSERT INTO brand_profiles (
    user_id,
    brand_name,
    brand_voice,
    color_palette,
    typography,
    analysis_status
) VALUES (
    '1d685177-3d0a-4305-84b0-c0fbbccce9c4',
    'My Store',
    'professional',
    '{"primary":"#000000","secondary":"#666666","accent":"#0066CC","background":"#FFFFFF","text":"#1F1F1F"}',
    '{"heading":{"font":"Arial, sans-serif","size":"32px","weight":"bold"},"body":{"font":"Arial, sans-serif","size":"14px","weight":"normal"}}',
    'completed'
);
```

---

## Steps:

1. Supabase Dashboard → SQL Editor
2. New query
3. Paste SQL above
4. Run
5. Should see: "Success. 1 row affected"

Then try generating email again!

