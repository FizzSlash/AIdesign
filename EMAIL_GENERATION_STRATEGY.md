# 📧 Complete Email Generation Strategy

## 🎯 **The 7-Step Process**

### **Step 1: User Input → AI Analysis** ✅ WORKING
```javascript
User types: "Holiday gift card sale - 30% off"

AI (GPT-4) analyzes:
├── Campaign type: "promotional"
├── Products: ["gift", "card", "holiday"]
├── Discount: "30%"
├── Urgency: "medium"
├── Tone: "warm"
└── Suggested subject: "Perfect Holiday Gifts - 30% Off"

Code: src/services/ai.service.ts → analyzeIntent()
Status: ✅ Working
```

---

### **Step 2: Product Selection** ✅ FIXING NOW
```javascript
AI extracted: keyProducts = ["gift", "card"]

Database query:
SELECT * FROM shopify_products
WHERE user_id = $1
  AND in_stock = true
  AND (
    title ILIKE '%gift%' 
    OR title ILIKE '%card%'
    OR product_type ILIKE '%gift%'
  )
ORDER BY total_inventory DESC
LIMIT 6

Returns: Products with ALL data (images, price, variants)

Code: src/services/email.service.ts → selectImages()
Status: ⚠️ Fixing JSON parse issue
```

---

### **Step 3: AI Copy Generation** ⏳ TODO
```javascript
For the email:

Headline Generation:
Prompt: "Write compelling headline for holiday gift card sale"
AI: "Give the Perfect Gift This Holiday Season"

Subheadline:
Prompt: "Write benefit-focused subheadline"
AI: "Shop our gift cards and let them choose their favorites"

Body Copy:
Prompt: "Write 2-3 sentences about gift cards for holidays"
AI: "Looking for the perfect gift that everyone will love? 
     Our gift cards give your loved ones the freedom to 
     choose exactly what they want..."

For each product:
Prompt: "Enhance this product description: 'Gift Card'"
AI: "The perfect last-minute gift - delivered instantly 
     and redeemable on everything in our store"

Code: src/services/ai.service.ts → generateEmailCopy(), generateHeroSection()
Status: ⏳ Code exists but not fully wired to MJML
```

---

### **Step 4: Image Selection (Multi-Image Support)** ⏳ TODO
```javascript
Product has 3 images:
[
  { src: "gift-card-front.jpg", alt: "Gift card front" },
  { src: "gift-card-back.jpg", alt: "Gift card back" },
  { src: "gift-card-styled.jpg", alt: "Gift card in envelope" }
]

AI decides:
Hero image: "gift-card-styled.jpg" (most emotional/lifestyle)
Product grid: "gift-card-front.jpg" (product-focused)

Code: Need to add image selection logic
Status: ⏳ Not implemented
```

---

### **Step 5: Layout Selection** ⏳ TODO
```javascript
AI analyzes campaign:
"This is a promotional gift card campaign
 Single product type
 Emotional appeal needed
 Simple is better"

Selects: "Hero + CTA" layout (not product grid)

Available layouts:
1. Hero + Product Grid (multi-product)
2. Hero + CTA (single product/concept)
3. Product Grid Heavy (many products)
4. Editorial (storytelling)

Code: Need to implement layout selection
Status: ⏳ Using default layout only
```

---

### **Step 6: MJML Assembly** ⚠️ PARTIALLY WORKING
```javascript
Takes:
├── AI Copy (headline, subheadline, body)
├── Products (images, titles, prices, URLs)
├── Brand (colors, fonts, logo)
└── Layout choice

Generates MJML:
<mjml>
  <mj-body bg="${brandColors.background}">
    <mj-section>  <!-- Header -->
      <mj-image src="${brandLogo}" />
    </mj-section>
    
    <mj-section>  <!-- Hero -->
      <mj-image src="${heroImage}" href="${productUrl}" />
      <mj-text fontSize="32px">${aiHeadline}</mj-text>
      <mj-text>${aiSubheadline}</mj-text>
      <mj-button href="${ctaUrl}">${aiCTA}</mj-button>
    </mj-section>
    
    <mj-section>  <!-- Products -->
      ${products.map(p => `
        <mj-column>
          <mj-image src="${p.image}" href="${p.url}" />
          <mj-text>${p.title}</mj-text>
          <mj-text>${p.aiDescription}</mj-text>
          <mj-text fontSize="20px">$${p.price}</mj-text>
          <mj-button href="${p.url}">Shop Now</mj-button>
        </mj-column>
      `)}
    </mj-section>
    
    <mj-section>  <!-- Footer -->
      <mj-text>Unsubscribe | Contact</mj-text>
    </mj-section>
  </mj-body>
</mjml>

Code: src/services/mjml.service.ts → assembleMJML()
Status: ⚠️ Works but needs full AI copy integration
```

---

### **Step 7: HTML Rendering** ✅ WORKING
```javascript
MJML → HTML converter

Takes MJML template
Converts to email-client compatible HTML
Inlines CSS
Optimizes for Gmail/Outlook/Apple Mail

Code: src/services/mjml.service.ts → renderMJMLToHTML()
Status: ✅ Working
```

---

## 🔧 **What Needs to be Fixed/Added:**

### **Immediate (Week 1):**
```
1. ✅ Fix JSON parse in selectImages() - DEPLOYING
2. ⏳ Wire up AI headline generation to MJML
3. ⏳ Wire up AI subheadline to MJML
4. ⏳ Add AI product descriptions
5. ⏳ Show prices in email
6. ⏳ Add product URLs (clickable)
```

### **Soon (Week 2):**
```
1. Multiple image selection (pick best from 3+ images)
2. Layout variety (3-5 layouts)
3. A/B headline generation
4. Better product matching
```

---

## 🚀 **Next Steps (In Order):**

1. **Fix JSON parse** (deploying now)
2. **Test email generation** (should work with images)
3. **Add full AI copy** to MJML (headlines, body, descriptions)
4. **Add prices and CTAs** to products
5. **Make emails clickable** (all images/buttons link to products)

---

**Let me know when Railway finishes, then we'll test and add the AI copy integration!** 🎨

This will make emails actually look good with full copy and images! ✨
