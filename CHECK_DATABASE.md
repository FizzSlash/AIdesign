# Check What's in Database

## Run in Supabase SQL Editor:

### 1. Check if ANY images were saved:
```sql
SELECT COUNT(*) as image_count 
FROM brand_assets 
WHERE user_id = '1d685177-3d0a-4305-84b0-c0fbbccce9c4';
```

### 2. See what's actually stored:
```sql
SELECT asset_type, category, subcategory, upload_source, created_at
FROM brand_assets 
WHERE user_id = '1d685177-3d0a-4305-84b0-c0fbbccce9c4'
ORDER BY created_at DESC
LIMIT 10;
```

### 3. Check for Shopify images specifically:
```sql
SELECT * 
FROM brand_assets 
WHERE user_id = '1d685177-3d0a-4305-84b0-c0fbbccce9c4'
  AND upload_source = 'shopify'
LIMIT 5;
```

---

## Expected Result:

Should show ~17+ images from Shopify sync.

If it shows 0, the sync didn't actually save anything (despite saying it succeeded).

**Run these queries and tell me what you see!**

