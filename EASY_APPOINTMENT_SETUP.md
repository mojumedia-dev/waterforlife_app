# Easy Appointment Booking - Shopify Integration Guide

## ✅ Current Setup

The Water & Light wellness app now integrates with Easy Appointment Booking by:
1. Passing protocol data (name, frequencies, duration, condition) via URL
2. Attempting to embed the booking page in an iframe
3. Providing fallback to open in new tab if iframe is blocked

## 🎯 Recommended Shopify Configuration

### Step 1: Get Your Service/Event Unique ID

1. Open **Shopify Admin → Apps → Easy Appointment Booking**
2. Find your "SpectraLight Therapy Bed" service
3. Click **Edit → Marketing tab**
4. Copy the **Unique Event ID** (looks like: `eab-service-12345`)

### Step 2: Add Custom Fields (Optional but Recommended)

In Easy Appointment Booking settings:
1. Go to **Settings → Custom Fields**
2. Add these fields:
   - **Protocol Name** (text field)
   - **Frequency 1** (text field)
   - **Frequency 2** (text field)
   - **Frequency 3** (text field)
   - **Frequency 4** (text field)
   - **Target Condition** (text field)
   - **Recommended Duration** (text field)

This allows better tracking of which protocols customers book.

### Step 3: Enable Direct Booking Links

1. In Easy Appointment Booking app
2. Go to **Marketing → Direct Link**
3. Enable public booking link
4. Copy the direct booking URL

### Step 4: Update React App (if needed)

If your service has a unique ID or custom booking URL, update:

**File:** `src/pages/Booking.jsx`

```javascript
const baseUrl = 'https://waterlightforhealth.com/products/YOUR-PRODUCT-HANDLE';
// OR use direct event link:
// const baseUrl = 'https://waterlightforhealth.com/apps/easy-appointment/book/YOUR-EVENT-ID';
```

## 🔧 Alternative Approaches

### Option A: Use Easy Appointment Popup Widget

If iframe embedding doesn't work well, you can use their popup calendar widget:

1. Add Easy Appointment Booking's script to your index.html
2. Trigger their popup programmatically
3. Pre-fill with protocol data

### Option B: API Integration (Ultimate Plan)

With Ultimate plan, you may have API access:

```javascript
// Create booking via API
POST /api/bookings
{
  "service_id": "spectralight-therapy",
  "customer": {...},
  "notes": "Protocol: Arthritis | Frequencies: 50,750,900,9000 Hz",
  "custom_fields": {
    "protocol": "Arthritis General",
    "frequencies": "50, 750, 900, 9000"
  }
}
```

### Option C: Webhook Integration ⭐ (Ultimate Plan - SUPPORTED!)

**Easy Appointment Booking supports webhooks!** They send real-time booking events as JSON.

**Webhook Payload Includes:**
- `booking_id` - Unique booking identifier
- `customer_email`, `customer_phone` - Customer contact info
- `first_name`, `last_name` - Customer name
- `service_name`, `date`, `time`, `duration` - Booking details
- `notes` - Contains your protocol data!
- `event` - booking.created, booking.rescheduled, booking.cancelled

**See `WEBHOOK_INTEGRATION.md` for complete implementation guide.**

Quick Setup:
1. Easy Appointment Booking → Settings → Integrations → Webhooks
2. Add endpoint URL (Netlify Function or Railway API)
3. Select events: booking.created, booking.rescheduled, booking.cancelled
4. Parse protocol data from `notes` field
5. Save to database → Update dashboard in real-time

## 📋 Current Data Being Passed

When customers book through the wellness app, these details are included in the booking notes:

```
Protocol: Arthritis General
Condition: Arthritis General  
Frequencies: 50, 750, 900, 9000 Hz
Duration: 30 minutes
Recommended: 3x/week for 8 weeks
Source: Water & Light Wellness App
```

## 🚀 Testing Checklist

- [ ] Test booking flow from wellness app
- [ ] Verify protocol data appears in Shopify order notes
- [ ] Check if iframe loads or if fallback button works
- [ ] Confirm booking confirmation emails include protocol details
- [ ] Test on mobile devices
- [ ] Verify dashboard frequencies sync correctly after booking

## 📚 Resources

- [Easy Appointment Booking Help Center](https://intercom.help/easy-appointment-booking/en/)
- [How to take bookings on any Shopify page](https://intercom.help/easy-appointment-booking/en/articles/10362160)
- [Market and feature events with storefront widgets](https://intercom.help/easy-appointment-booking/en/articles/10352797)

## 💡 Future Enhancements

1. **Real-time availability** - Show available slots directly in the app
2. **Booking management** - View/manage bookings without going to Shopify
3. **Automated reminders** - Send protocol-specific instructions before appointments
4. **Progress tracking** - Track protocol completion across sessions
5. **Custom booking flow** - Fully branded booking experience in the app

## ❓ Need Help?

If iframe embedding isn't working well or you want to explore API integration, we can:
1. Use the direct link approach (opens in new tab - most reliable)
2. Build custom booking UI with Easy Appointment API
3. Set up webhook integration for real-time sync
