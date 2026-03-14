# Shopify Booking Pages Setup

## 📋 Create 6 Pages in Shopify Theme Editor

The app now links to **specific duration pages** based on the protocol. Create these 6 pages:

---

## 🔧 How to Create Each Page:

1. **Shopify Admin → Online Store → Themes**
2. Click **"Customize"** on active theme
3. Click **"Pages"** dropdown (top center)
4. Click **"Create template"** → **"page"**
5. Name it with the exact URL handle below
6. Add **"Inline Calendar"** section (Apps → Inline Calendar)
7. Configure with event IDs below
8. **Save**

---

## 📄 Page 1: book-single-15min

**URL:** `/pages/book-single-15min`

**Title:** "Book Single Session - 15 Minutes"

**Inline Calendar Settings:**
- **Product ID:** `1477172625450`
- **Event Unique ID:** `5c916847-3084-4130-8143-8e7e1b9330eb`
- **Variant ID:** `52544178225522`

**Optional Heading (Rich text section):**
"Book Your 15-Minute Session - Pay Now"

---

## 📄 Page 2: book-single-30min

**URL:** `/pages/book-single-30min`

**Title:** "Book Single Session - 30 Minutes"

**Inline Calendar Settings:**
- **Product ID:** `1477172625450`
- **Event Unique ID:** `84cb48cb-0415-4cea-a89e-c44ab1525b46`
- **Variant ID:** `52544178258290`

**Optional Heading:**
"Book Your 30-Minute Session - Pay Now"

---

## 📄 Page 3: book-single-60min

**URL:** `/pages/book-single-60min`

**Title:** "Book Single Session - 60 Minutes"

**Inline Calendar Settings:**
- **Product ID:** `1477172625450`
- **Event Unique ID:** `09ef3036-0812-47dc-adcb-c496a5ec0760`
- **Variant ID:** `52544178291058`

**Optional Heading:**
"Book Your 60-Minute Session - Pay Now"

---

## 📄 Page 4: book-package-15min

**URL:** `/pages/book-package-15min`

**Title:** "Book Package Session - 15 Minutes"

**Inline Calendar Settings:**
- **Product ID:** `1477172625450`
- **Event Unique ID:** `2950a7c2-bc18-42f1-b475-e7d82624d2f1`
- **Variant ID:** `60768399753586`

**Optional Heading:**
"Book Your 15-Minute Session (Package Holders - No Payment)"

---

## 📄 Page 5: book-package-30min

**URL:** `/pages/book-package-30min`

**Title:** "Book Package Session - 30 Minutes"

**Inline Calendar Settings:**
- **Product ID:** `1477172625445`
- **Event Unique ID:** `870ab5f1-299d-4066-96f1-be892d817e83`
- **Variant ID:** `60768399786354`

**Optional Heading:**
"Book Your 30-Minute Session (Package Holders - No Payment)"

---

## 📄 Page 6: book-package-60min

**URL:** `/pages/book-package-60min`

**Title:** "Book Package Session - 60 Minutes"

**Inline Calendar Settings:**
- **Product ID:** `1477172625445`
- **Event Unique ID:** `2552a6f7-9383-4370-8eb2-3e09168cfccd`
- **Variant ID:** `60768399819122`

**Optional Heading:**
"Book Your 60-Minute Session (Package Holders - No Payment)"

---

## ✅ After Creating All 6 Pages:

**Set Visibility:**
- Can leave as "Visible" (they won't appear in nav unless you add them)
- Or set to "Hidden" if that works with your theme

**Test URLs:**
- https://waterlightforhealth.com/pages/book-single-15min
- https://waterlightforhealth.com/pages/book-single-30min
- https://waterlightforhealth.com/pages/book-single-60min
- https://waterlightforhealth.com/pages/book-package-15min
- https://waterlightforhealth.com/pages/book-package-30min
- https://waterlightforhealth.com/pages/book-package-60min

All should load with the booking calendar visible.

---

## 🎯 How the App Uses These Pages:

**30-minute protocol + Single Session:**
```
App redirects to: /pages/book-single-30min
Customer sees: ONLY the 30-min paid booking calendar
```

**60-minute protocol + Package Holder:**
```
App redirects to: /pages/book-package-60min
Customer sees: ONLY the 60-min free booking calendar
```

**Customer only sees ONE calendar** - the right duration for their protocol!

---

## 🚀 Quick Checklist:

- [ ] Page 1: book-single-15min created with event ID `5c916847...`
- [ ] Page 2: book-single-30min created with event ID `84cb48cb...`
- [ ] Page 3: book-single-60min created with event ID `09ef3036...`
- [ ] Page 4: book-package-15min created with event ID `2950a7c2...`
- [ ] Page 5: book-package-30min created with event ID `870ab5f1...`
- [ ] Page 6: book-package-60min created with event ID `2552a6f7...`
- [ ] All 6 pages tested and loading correctly
- [ ] App updated and deployed (already done!)

---

## 💡 Tips:

- **Use Theme Editor**, not regular Pages (so Servicify widgets load)
- **URL handles must match exactly** (book-single-30min, not book_single_30min)
- **Test each page** before publishing
- **Add branding** (logo, colors) to match your site
