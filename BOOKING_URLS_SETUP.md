# Booking URLs Configuration

## 🎯 Two Booking Types in Your App

The app now supports two booking flows, which need to be configured in Easy Appointment Booking.

---

## 📋 Required Easy Appointment Booking Setup

### **1. Single Session (Paid) - For One-Time Customers**

**Create Event in Easy Appointment Booking:**
- **Name:** "SpectraLight Single Session" (or similar)
- **Setting:** Book WITH payment ✓
- **Duration:** 30 minutes (or your standard)
- **Price:** Your single session rate
- **Product URL:** `https://waterlightforhealth.com/products/spectralight-therapy-bed-appointment-booking`

**App uses this URL for:** Customers who choose "Single Session" booking type

---

### **2. Package Holder Booking (Free) - For Package Holders**

**Create Event in Easy Appointment Booking:**
- **Name:** "SpectraLight Session (Package Holders)" (or similar)
- **Setting:** Book WITHOUT payment ✓ (toggle this in Edit Event page)
- **Duration:** 30 minutes (or your standard)
- **Price:** $0 (or hidden)
- **Product URL:** `https://waterlightforhealth.com/products/spectralight-session-package-holder`

**App uses this URL for:** Customers who choose "Package Holder" booking type

---

## 🔧 Update App URLs (If Needed)

If your actual Shopify product URLs are different, update in:

**File:** `src/pages/Booking.jsx`

```javascript
// Around line 55-60
if (bookingType === 'package') {
  // UPDATE THIS URL ↓
  baseUrl = 'https://waterlightforhealth.com/products/spectralight-session-package-holder';
} else {
  // UPDATE THIS URL ↓
  baseUrl = 'https://waterlightforhealth.com/products/spectralight-therapy-bed-appointment-booking';
}
```

---

## 🎯 How It Works

### **Customer Flow:**

1. Customer browses protocols in your app
2. Clicks "Book This Protocol"
3. Selects date/time
4. **NEW:** Chooses booking type:
   - **💳 Single Session** → Pay now for one session
   - **📦 Package Holder** → Book without payment (already have package)
5. Reviews details
6. Clicks continue → Opens Shopify booking page (iframe or new tab)
7. Completes booking (with or without payment based on selection)

---

## 📊 Booking Type Cards

The app now shows two cards for customers to choose:

### **Card 1: Single Session**
- Icon: 💳
- Description: "Pay now for one session"
- Perfect for: First-time visitors, trying new protocol, one-time treatment
- Button: "Book & Pay Now →"

### **Card 2: Package Holder**
- Icon: 📦
- Description: "Book without payment (already purchased package)"
- Perfect for: Package holders, multi-session protocols, already paid customers
- Button: "Book Session (No Payment) →"

---

## 🔗 Additional Features

**Link to Packages Page:**
- Below the booking type cards, there's a helpful link to the packages page
- Encourages single-session customers to consider buying a package

---

## ✅ Testing Checklist

After setting up both events in Easy Appointment Booking:

- [ ] Create both booking events in Easy Appointment Booking
- [ ] Verify "Book WITHOUT payment" is toggled ON for package holder event
- [ ] Test single session booking flow (should require payment)
- [ ] Test package holder booking flow (should NOT require payment)
- [ ] Verify protocol data appears in both booking types
- [ ] Check that iframe loads or fallback button works
- [ ] Test on mobile devices

---

## 💡 Package System Integration

**How packages work:**
1. Customer buys package on Shopify (e.g., 20 sessions for $500)
2. Easy Appointment Booking tracks package balance
3. Customer selects "Package Holder" booking type in your app
4. Books without payment
5. Easy Appointment Booking auto-deducts 1 session from their package
6. Repeat until package is used up

**Your app doesn't need to track package balance** - Easy Appointment Booking handles all of that automatically!

---

## 📧 Questions for Easy Appointment Booking Support

If you need help configuring:

1. "How do I create a second event for package holders that books without payment?"
2. "Can both events (paid and free) capture the same custom fields for protocol data?"
3. "How do I link the package purchase to the free booking event so it deducts sessions?"

---

## 🚀 Next Steps

1. Create both events in Easy Appointment Booking
2. Get the actual Shopify product URLs for each
3. Update `src/pages/Booking.jsx` with correct URLs if different from placeholders
4. Test both booking flows
5. Deploy!
