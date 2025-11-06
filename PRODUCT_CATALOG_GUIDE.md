# 🛍️ Product Catalog Integration Guide

## ✅ **YES! Pull Products Directly from Klaviyo**

You **don't need Shopify integration**. Klaviyo already syncs products from Shopify/WooCommerce/BigCommerce automatically!

---

## 🔄 **How It Works**

```
Shopify/WooCommerce Store
         ↓
    (auto-syncs)
         ↓
   Klaviyo Catalog
         ↓
   (your API pulls)
         ↓
  AI Email Designer
```

**One integration = Access to all products!**

---

## 📋 **What You Get from Klaviyo Catalog**

```json
{
  "title": "Summer Maxi Dress",
  "description": "Beautiful floral print maxi dress",
  "price": 89.99,
  "url": "https://store.com/products/summer-dress",
  "imageUrl": "https://cdn.shopify.com/dress.jpg",
  "published": true,
  "categories": ["Dresses", "Summer Collection"],
  "metadata": {
    "color": "Blue",
    "size": "M",
    "sku": "DRESS-001"
  }
}
```

**Everything needed for email design!**

---

## 🚀 **API Endpoints (Now Available)**

### **1. Get All Products**
```bash
GET /api/v1/products
Authorization: Bearer YOUR_TOKEN

# Optional filters:
?category=Dresses
?search=summer
?limit=20
```

**Response:**
```json
{
  "products": [
    {
      "id": "item_123",
      "title": "Summer Maxi Dress",
      "description": "Beautiful floral print",
      "price": 89.99,
      "url": "https://store.com/products/dress",
      "imageUrl": "https://cdn.shopify.com/dress.jpg",
      "categories": ["Dresses"]
    }
  ],
  "count": 45
}
```

### **2. Get Categories**
```bash
GET /api/v1/products/categories
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "categories": [
    { "id": "cat_1", "name": "Dresses" },
    { "id": "cat_2", "name": "Tops" },
    { "id": "cat_3", "name": "Shoes" }
  ]
}
```

### **3. Search Products**
```bash
GET /api/v1/products/search?q=dress&limit=10
Authorization: Bearer YOUR_TOKEN
```

### **4. Get Specific Product**
```bash
GET /api/v1/products/item_123
Authorization: Bearer YOUR_TOKEN
```

### **5. Sync Catalog**
```bash
POST /api/v1/products/sync
Authorization: Bearer YOUR_TOKEN
```

Caches all products in your database for faster access.

---

## 🎨 **How AI Uses Products**

### **Example: Generate Dress Campaign**

```javascript
// 1. User says: "Summer dress sale email"
POST /api/v1/emails/generate
{
  "campaignBrief": "Summer dress sale - 30% off"
}

// 2. AI extracts intent
{
  keyProducts: ["dress", "summer"]
}

// 3. System searches Klaviyo catalog
GET /api/v1/products?category=Dresses&search=summer

// 4. Gets real products
[
  { title: "Blue Maxi Dress", price: 89.99, image: "..." },
  { title: "Floral Sundress", price: 69.99, image: "..." },
  { title: "White Beach Dress", price: 79.99, image: "..." }
]

// 5. AI generates email with REAL products
- Uses actual product names
- Shows real prices
- Includes product images
- Links to product pages
```

---

## 💡 **Benefits of Klaviyo Catalog**

### **✅ Advantages:**

1. **One Integration**
   - No need for Shopify, WooCommerce, etc.
   - Klaviyo already has everything

2. **Always Synced**
   - Klaviyo keeps products updated
   - You always get latest data

3. **Rich Data**
   - Product images (full + thumbnail)
   - Prices
   - Descriptions
   - Categories
   - Custom metadata

4. **Fast Access**
   - Products already on Klaviyo's CDN
   - Images load quickly in emails

5. **Works with Any Store**
   - Shopify
   - WooCommerce
   - BigCommerce
   - Magento
   - Custom stores

---

## 🔧 **Setup Flow**

### **For Your Users:**

```
Step 1: Connect Klaviyo
  → Enter API key
  → System validates connection

Step 2: Sync Products (automatic)
  → Fetches all products from Klaviyo
  → Caches in database
  → Ready to use!

Step 3: Generate Emails
  → AI automatically uses real products
  → No manual product selection needed
```

### **First Time Setup:**

```bash
# 1. User connects Klaviyo
POST /api/v1/klaviyo/connect
{
  "privateKey": "pk_..."
}

# 2. System auto-syncs products
POST /api/v1/products/sync
# → Fetches all products
# → Stores in database
# → Returns count

# 3. Ready to generate!
POST /api/v1/emails/generate
{
  "campaignBrief": "New product launch"
}
# → AI automatically finds relevant products
# → Uses real data in email
```

---

## 📊 **Example Use Cases**

### **1. Product Launch Email**
```javascript
"Launch our new summer dress collection"

→ AI finds all products in "Summer Dresses" category
→ Selects 6 best products
→ Generates email with real images, prices, links
```

### **2. Sale Email**
```javascript
"40% off all shoes this weekend"

→ AI finds all products in "Shoes" category
→ Calculates sale prices
→ Creates urgency-driven email
```

### **3. Category Showcase**
```javascript
"Feature our best-selling tops"

→ AI searches for "tops"
→ Sorts by popularity (if available)
→ Creates product grid email
```

### **4. New Arrivals**
```javascript
"Showcase new arrivals"

→ AI finds recently added products
→ Groups by category
→ Creates "What's New" email
```

---

## 🎯 **What This Means for Your SaaS**

### **You Can:**

✅ Generate emails with **real products**  
✅ Show **actual prices**  
✅ Use **product images** from store  
✅ Link to **actual product pages**  
✅ Filter by **category**  
✅ Search by **keyword**  
✅ Work with **any e-commerce platform** (via Klaviyo)  

### **You Don't Need:**

❌ Shopify API integration  
❌ WooCommerce API integration  
❌ Multiple platform integrations  
❌ Product data management  
❌ Image hosting (Klaviyo handles it)  

---

## 🚀 **Testing It**

### **1. Connect Klaviyo**
```bash
curl -X POST http://localhost:3000/api/v1/klaviyo/connect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"privateKey": "pk_your_klaviyo_key"}'
```

### **2. Get Products**
```bash
curl http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **3. Search for Dresses**
```bash
curl "http://localhost:3000/api/v1/products/search?q=dress" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **4. Generate Email with Products**
```bash
curl -X POST http://localhost:3000/api/v1/emails/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignBrief": "Summer dress sale - 30% off"
  }'
```

---

## 💡 **Pro Tips**

### **1. Cache Products**
```javascript
// Run sync periodically to keep cache fresh
POST /api/v1/products/sync

// Or sync when user connects Klaviyo
// Or sync daily via cron job
```

### **2. Smart Product Selection**
```javascript
// AI can now:
- Match products to campaign intent
- Filter by category automatically
- Select diverse products
- Prioritize best-sellers (if Klaviyo provides that data)
```

### **3. Dynamic Pricing**
```javascript
// If running a sale:
"30% off all dresses"

// AI can:
- Fetch original prices from Klaviyo
- Calculate sale prices
- Show both in email
```

---

## ✅ **Bottom Line**

**YES, you can pull products from Klaviyo!**

**NO, you don't need Shopify integration!**

Klaviyo's Catalog API gives you everything:
- ✅ Product names
- ✅ Descriptions  
- ✅ Prices
- ✅ Images (hosted on CDN)
- ✅ URLs
- ✅ Categories
- ✅ Custom metadata

**One integration = All products from any store!** 🎉

---

## 🔗 **Reference**

- [Klaviyo Catalog API Docs](https://developers.klaviyo.com/en/reference/api_overview)
- Your implementation: `src/services/product-catalog.service.ts`
- API routes: `src/routes/products.routes.ts`

**Ready to use!** Just connect Klaviyo and start pulling products! 🚀

