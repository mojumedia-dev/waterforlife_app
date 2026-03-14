# Easy Appointment Booking - Webhook Integration Guide

## Overview

Easy Appointment Booking (Ultimate plan) supports webhooks that send **real-time booking events** to your endpoint as JSON. This enables automatic sync between Shopify bookings and the Water & Light wellness app.

---

## 🎯 What Webhooks Enable

### **Real-Time Sync**
- ✅ Customer books on Shopify → App dashboard updates automatically
- ✅ Booking rescheduled → App reflects new date/time
- ✅ Booking cancelled → App removes from dashboard
- ✅ No manual data entry or refresh needed

### **Customer Tracking**
- Tie bookings to customer accounts via `customer_email` or `customer_phone`
- Track booking history across sessions
- Send confirmation emails with protocol frequencies
- Update session counts and package usage

### **Protocol Data Capture**
- Extract protocol details from booking notes
- Save frequencies to customer profile
- Track which protocols are most popular
- Measure outcomes over time

---

## 📋 Webhook Events

Easy Appointment Booking sends webhooks for:

1. **Booking Created** - New appointment booked
2. **Booking Rescheduled** - Date/time changed
3. **Booking Cancelled** - Appointment cancelled

---

## 🔧 Webhook Payload Structure

```json
{
  "event": "booking.created",
  "booking_id": "bkg-12345",
  "customer_email": "customer@example.com",
  "customer_phone": "+1-555-123-4567",
  "first_name": "John",
  "last_name": "Doe",
  "service_name": "SpectraLight Therapy Bed",
  "date": "2026-03-20",
  "time": "10:00",
  "duration": 30,
  "notes": "Protocol: Arthritis General | Condition: Arthritis General | Frequencies: 50, 750, 900, 9000 Hz | Duration: 30 minutes | Source: Water & Light Wellness App",
  "status": "confirmed",
  "created_at": "2026-03-14T14:00:00Z"
}
```

---

## 🚀 Implementation Options

### **Option 1: Serverless Function** ⭐ (Recommended for MVP)

**Use Netlify/Vercel Functions or Railway Serverless**

**Pros:**
- ✅ No server management
- ✅ Auto-scaling
- ✅ Pay only for usage
- ✅ Easy deployment

**Setup:**

1. Create webhook endpoint:
```javascript
// netlify/functions/booking-webhook.js
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  
  // Extract protocol data from notes
  const protocolMatch = body.notes.match(/Protocol: ([^\|]+)/);
  const frequenciesMatch = body.notes.match(/Frequencies: ([^\|]+)/);
  
  const bookingData = {
    bookingId: body.booking_id,
    customerEmail: body.customer_email,
    customerPhone: body.customer_phone,
    firstName: body.first_name,
    lastName: body.last_name,
    date: body.date,
    time: body.time,
    protocol: protocolMatch ? protocolMatch[1].trim() : null,
    frequencies: frequenciesMatch ? frequenciesMatch[1].trim() : null,
    event: body.event
  };
  
  // Store in database or send notification
  await saveToDatabase(bookingData);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

2. Deploy to Netlify/Vercel
3. Get endpoint URL: `https://your-app.netlify.app/.netlify/functions/booking-webhook`
4. Configure in Easy Appointment Booking app

---

### **Option 2: Railway Backend API** 🏗️ (Full Control)

**Add Express.js backend to your Railway deployment**

**Pros:**
- ✅ Complete control
- ✅ Direct database access
- ✅ Can add authentication
- ✅ Existing Railway infrastructure

**Setup:**

1. Add Express server to project:
```javascript
// server/index.js
const express = require('express');
const app = express();

app.post('/api/webhook/booking', express.json(), async (req, res) => {
  const { booking_id, customer_email, notes, event } = req.body;
  
  // Parse protocol data
  const protocolData = parseProtocolNotes(notes);
  
  // Save to database
  await db.bookings.create({
    bookingId: booking_id,
    customerEmail: customer_email,
    ...protocolData,
    eventType: event,
    receivedAt: new Date()
  });
  
  res.json({ success: true });
});

app.listen(3001);
```

2. Update Railway deployment to run both React app + API server
3. Webhook URL: `https://waterforlife-app-production.up.railway.app/api/webhook/booking`

---

### **Option 3: Supabase Realtime** ⚡ (Modern Stack)

**Use Supabase for database + realtime subscriptions**

**Pros:**
- ✅ Real-time updates to all connected clients
- ✅ No backend code needed
- ✅ Built-in authentication
- ✅ Free tier generous

**Setup:**

1. Create Supabase project
2. Create `bookings` table
3. Add Edge Function for webhook:
```javascript
// supabase/functions/booking-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const body = await req.json()
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  await supabase.from('bookings').insert({
    booking_id: body.booking_id,
    customer_email: body.customer_email,
    protocol: parseProtocol(body.notes),
    frequencies: parseFrequencies(body.notes),
    event_type: body.event
  })
  
  return new Response(JSON.stringify({ success: true }))
})
```

4. Dashboard subscribes to changes:
```javascript
// Real-time updates in React
supabase
  .from('bookings')
  .on('INSERT', payload => {
    // Update dashboard automatically
    updateDashboard(payload.new)
  })
  .subscribe()
```

---

## 🔐 Security Best Practices

### **1. Verify Webhook Authenticity**

Easy Appointment Booking may include signature headers:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return signature === expectedSignature;
}
```

### **2. Environment Variables**

Never hardcode secrets:

```bash
# .env
WEBHOOK_SECRET=your-webhook-secret
DATABASE_URL=your-database-url
EASY_APPOINTMENT_API_KEY=your-api-key
```

### **3. Rate Limiting**

Prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/webhook', limiter);
```

---

## 📊 Data Flow

### **Complete Booking → Dashboard Flow**

```
Customer books on Shopify
         ↓
Easy Appointment Booking creates booking
         ↓
Webhook sent to your endpoint
         ↓
Parse protocol data from notes
         ↓
Save to database (Supabase/PostgreSQL/MongoDB)
         ↓
Real-time subscription updates React app
         ↓
Dashboard shows new booking + frequencies
         ↓
Customer sees booking in their dashboard automatically
```

---

## 🛠️ Easy Appointment Booking Configuration

### **Step 1: Enable Webhooks**

1. Shopify Admin → Apps → Easy Appointment Booking
2. Settings → Integrations → Webhooks
3. Click "Add Webhook"

### **Step 2: Configure Endpoint**

```
URL: https://your-app.netlify.app/.netlify/functions/booking-webhook
Events: booking.created, booking.rescheduled, booking.cancelled
Format: JSON
Authentication: Bearer token (optional)
```

### **Step 3: Test Webhook**

Easy Appointment Booking should have a "Send Test Event" button:
- Click to send sample payload
- Check your endpoint logs
- Verify data is received correctly

---

## 🧪 Testing Locally

### **Use ngrok for local development:**

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
npm run dev  # Port 3000

# Expose local server
ngrok http 3000

# Use the ngrok URL in Easy Appointment Booking
# Example: https://abc123.ngrok.io/api/webhook/booking
```

### **Sample Test Payload**

```bash
curl -X POST http://localhost:3000/api/webhook/booking \
  -H "Content-Type: application/json" \
  -d '{
    "event": "booking.created",
    "booking_id": "test-123",
    "customer_email": "test@example.com",
    "notes": "Protocol: Arthritis General | Frequencies: 50, 750, 900, 9000 Hz"
  }'
```

---

## 📈 What You Can Track

Once webhooks are set up, you can:

### **Customer Insights**
- Total bookings per customer
- Favorite protocols
- Booking frequency patterns
- Cancellation rates

### **Business Metrics**
- Most popular protocols
- Peak booking times
- Average session duration
- Package conversion rates

### **Outcome Tracking**
- Protocol effectiveness (if customers book follow-ups)
- Customer retention
- Treatment completion rates

---

## 🎯 Recommended Quick Start

**For MVP (This Weekend):**

1. ✅ **Deploy Netlify Function** (30 mins)
   - Create simple webhook endpoint
   - Log received data to console
   - Test with Easy Appointment Booking

2. ✅ **Store in localStorage** (temporary)
   - Parse booking data
   - Save to localStorage for now
   - Display on dashboard

3. ✅ **Add Supabase** (1-2 hours)
   - Set up free Supabase project
   - Create bookings table
   - Connect webhook to Supabase
   - Add realtime subscriptions to React app

**For Production (Next Week):**

4. 🔐 Add webhook signature verification
5. 📧 Send confirmation emails with protocol details
6. 📊 Build analytics dashboard
7. 🔄 Sync booking status changes (reschedule/cancel)

---

## 💡 Next Steps

1. **Choose implementation** (Netlify Functions recommended for quick start)
2. **Set up webhook endpoint**
3. **Configure in Easy Appointment Booking**
4. **Test with sample booking**
5. **Add real-time dashboard updates**

Need help implementing any of these options? I can set up the webhook endpoint and database integration!
