# 🚀 Enhanced Product Sync System

## ✅ **What's New:**

### **Complete Product Data:**
```
✅ ALL product images (not just first)
✅ ALL variants (sizes, colors, etc.)
✅ Inventory per variant
✅ Total inventory count
✅ Collections membership
✅ Prices (with compare-at for sales)
✅ In-stock status
✅ Product URLs
```

---

## 📋 **Setup (One Time):**

### **1. Run SQL in Supabase:**

```
Supabase Dashboard → SQL Editor → New Query
```

Copy contents from: `src/db/add-products-table.sql`

This creates:
- `shopify_products` table (complete product data)
- `shopify_collections` table (collections)

---

## 🔄 **How to Use:**

### **1. Sync Products (In UI):**
```
1. Go to Shopify tab
2. Click "Sync Products"
3. Wait ~30 seconds
4. See results:
   - Products synced: 17
   - Collections: 2
   - Images stored: 51 (3 per product)
   - Variants: 34
   - Total inventory: 500+
```

### **2. Filter by Collection:**
```javascript
API: GET /api/v1/shopify/products-enhanced?collectionId=123

UI: Dropdown to select collection
```

### **3. Filter by Inventory:**
```javascript
API: GET /api/v1/shopify/products-enhanced?minInventory=10

UI: Only show products with 10+ in stock
```

### **4. Multiple Images:**
```javascript
Product now has:
{
  title: "Gift Card",
  images: [
    { src: "front.jpg", width: 2048 },
    { src: "back.jpg", width: 2048 },
    { src: "detail.jpg", width: 2048 }
  ]
}

AI can pick:
- Hero: Most compelling image
- Grid: Product-focused image
- Detail: Close-up image
```

### **5. Variants with Inventory:**
```javascript
Product: T-Shirt
Variants:
[
  { title: "Small/Blue", price: "29.99", inventory: 0 },   ❌ Out of stock
  { title: "Medium/Blue", price: "29.99", inventory: 15 }, ✅ In stock
  { title: "Large/Blue", price: "29.99", inventory: 8 }    ✅ In stock
]

Email shows: Only in-stock variants
```

---

## 🎯 **What This Enables:**

### **Smart Product Selection:**
```
User: "Email for products under $50 with good inventory"

Query:
SELECT * FROM shopify_products
WHERE price < 50
  AND total_inventory > 10
  AND in_stock = true
ORDER BY total_inventory DESC
LIMIT 6

Result: Best-stocked affordable products
```

### **Collection-Based Campaigns:**
```
User: "Feature our Summer Sale collection"

System:
1. Find "Summer Sale" collection
2. Get all products in that collection
3. Only show in-stock items
4. Generate email with those products
```

### **Inventory-Aware:**
```
Don't promote products that are:
❌ Out of stock
❌ Low inventory (< threshold)
❌ Only 1 size left

Do promote:
✅ Well-stocked items
✅ Multiple variants available
✅ Good inventory levels
```

---

## 📊 **Data Structure:**

### **Products Table:**
```sql
shopify_products:
├── Basic: title, description, type
├── Pricing: price, compare_at_price
├── Images: ALL images as JSON array
├── Variants: ALL variants as JSON array
├── Inventory: total_inventory, in_stock
├── Collections: Which collections it belongs to
└── URLs: Direct product links
```

### **What Gets Stored:**
```json
{
  "title": "Premium T-Shirt",
  "price": 29.99,
  "compare_at_price": 49.99,
  "images": [
    {"src": "front.jpg", "width": 2048, "height": 2048},
    {"src": "back.jpg", "width": 2048, "height": 2048},
    {"src": "detail.jpg", "width": 2048, "height": 2048}
  ],
  "variants": [
    {"title": "S/Blue", "price": "29.99", "inventory_quantity": 15, "sku": "TSHIRT-S-BLUE"},
    {"title": "M/Blue", "price": "29.99", "inventory_quantity": 23, "sku": "TSHIRT-M-BLUE"},
    {"title": "L/Blue", "price": "29.99", "inventory_quantity": 8, "sku": "TSHIRT-L-BLUE"}
  ],
  "total_inventory": 46,
  "in_stock": true,
  "collections": [
    {"id": 123, "title": "Summer Collection", "handle": "summer"}
  ]
}
```

---

## 🎨 **Example Use Cases:**

### **1. Collection Campaign:**
```
Brief: "Feature summer collection"
→ Filters to summer collection only
→ Gets 6 best products from that collection
→ All in stock
```

### **2. Inventory Clearance:**
```
Brief: "Clearance sale on overstocked items"
→ Filters to products with inventory > 50
→ Shows items that need to move
```

### **3. New Arrivals:**
```
Brief: "Showcase new products"
→ Sorts by created_at DESC
→ Shows newest items
→ Only if in stock
```

### **4. Price-Based:**
```
Brief: "Gifts under $50"
→ Filters price < 50
→ Good inventory
→ Multiple variants
```

---

## ✅ **Next Steps:**

1. **Run the SQL** in Supabase (create tables)
2. **Railway deploys** (1 min)
3. **Re-sync products** in UI
4. **Generate email** - will have full data!

---

**Railway is deploying now. Run the SQL in Supabase while you wait!** 🚀

