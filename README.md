# Water For Life - Light Therapy Web App Prototype

**Mobile-first responsive web app prototype for light therapy wellness center**

---

## 🎯 Project Overview

This is a **front-end prototype** built to validate user flow, navigation, search, and booking functionality for a light therapy business. It uses **mocked data only** and does not connect to live services.

### What This Prototype Demonstrates

✅ Mobile-first responsive design (works on all screen sizes)  
✅ Dashboard with session balance and upcoming appointments  
✅ Searchable wellness guide with 20+ protocols  
✅ Protocol detail pages with treatment recommendations  
✅ Booking flow with date/time selection  
✅ Package purchasing (mocked checkout)  
✅ Account management  
✅ Single location support (architected to scale to multiple)

---

## 🏗️ Architecture

### Tech Stack
- **React** - Component-based UI
- **Vite** - Fast dev server and build tool
- **Vanilla CSS** - Mobile-first responsive design
- **JSON** - Mocked data (easily swappable to API)

### Project Structure

```
src/
├── data/              # Mock data (JSON files)
│   ├── location.json
│   ├── userProfile.json
│   ├── packages.json
│   ├── protocols.json
│   └── availability.json
├── pages/             # Main screen components
│   ├── Dashboard.jsx
│   ├── WellnessGuide.jsx
│   ├── ProtocolDetail.jsx
│   ├── Booking.jsx
│   ├── Packages.jsx
│   └── Account.jsx
├── App.jsx            # Main app with routing
├── App.css            # Mobile-first styles
└── index.css          # Global resets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Git installed

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mojumedia-dev/waterforlife_app
   cd waterforlife_app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Local: `http://localhost:5173`
   - Network: Check terminal for network URL

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder, ready to deploy.

---

## 📱 Screens

### 1. Dashboard
- Session balance display
- Current package progress
- Upcoming appointment details
- Quick actions (Book, Wellness Guide, Buy Sessions)
- Location information

### 2. Wellness Guide (Search)
- Search bar with autocomplete
- Category filters (Musculoskeletal, Neurological, etc.)
- 20+ protocols with details
- Fast, client-side filtering

### 3. Protocol Detail
- Full protocol information
- Treatment frequency, duration, program length
- Recommended package suggestion
- Book button with context

### 4. Booking
- Date selection (mocked 7-day availability)
- Time slot selection
- Booking summary
- Confirmation screen

### 5. Packages
- 3 session packages (5, 10, 20 sessions)
- Package comparison
- Mocked purchase flow (placeholder for Shopify)

### 6. Account
- User profile information
- Current location display
- Settings (placeholders)
- Prototype information

---

## 📊 Mock Data

### Location
- Single location: "Water For Life Wellness Center" (Phoenix, AZ)
- Architecture supports multiple locations (location ID referenced throughout)

### User Profile
- Mock user: Sarah Johnson
- 7 sessions remaining
- Current package: Health Optimizer (10 sessions)
- Upcoming appointment on March 15, 2026

### Protocols
- 20 sample protocols from full frequency database (4,894 total)
- Categories: Musculoskeletal, Neurological, Mental Health, Respiratory, etc.
- Each protocol includes:
  - Frequency per week
  - Session duration
  - Recommended weeks
  - Total sessions
  - Notes
  - Suggested package

### Packages
1. **Starter Package** - 5 sessions, $275 ($55/session)
2. **Health Optimizer** - 10 sessions, $500 ($50/session) - MOST POPULAR
3. **Complete Wellness** - 20 sessions, $900 ($45/session) - BEST VALUE

### Availability
- Mocked 7-day calendar
- Multiple time slots per day
- Easy to swap to real-time API

---

## 🎨 Design Features

### Mobile-First Responsive
- Designed for mobile (320px+)
- Scales beautifully to tablet and desktop
- Touch-friendly tap targets
- Bottom navigation on mobile
- Header navigation on desktop

### Modern UI
- Clean, wellness-oriented aesthetic
- Card-based layouts
- Clear visual hierarchy
- Smooth transitions and hover states
- Accessible color contrast

### User Experience
- Fast search (client-side filtering)
- Clear CTAs (call-to-action buttons)
- Progress indicators
- Confirmation screens
- Error states (no results, missing data)

---

## 🔮 Future Integrations

This prototype is architected for easy integration with:

### Shopify
- Replace mocked package purchase with Shopify Buy SDK
- Real product catalog
- Secure checkout flow

### Easy Appointment
- Replace mocked availability with real-time calendar API
- Two-way sync (bookings update calendar)
- Location-specific schedules

### Google Calendar
- Sync confirmed appointments to user's calendar
- Send calendar invites via email

### Authentication
- User login/signup
- Secure session management
- Profile management

### Backend API
- User profiles
- Session balance tracking
- Appointment history
- Location management

### Multiple Locations
- Location selector on first launch
- Location-specific availability
- Location-specific packages
- User can switch locations

---

## 📝 Notes

### Build Brief Compliance

✅ **Single location to start** - Done (Phoenix location)  
✅ **Architected to scale** - Location ID referenced throughout  
✅ **Mobile-first responsive** - All screens fully responsive  
✅ **Mocked data only** - No API calls, easy to swap  
✅ **Searchable protocol database** - Fast client-side search  
✅ **Booking flow** - Date/time selection with confirmation  
✅ **Package purchasing** - Mocked Shopify checkout  
✅ **Clean, modern UI** - Wellness-oriented design  

### Prototype Limitations

This is a **front-end prototype** with:
- ❌ No authentication
- ❌ No live booking system
- ❌ No payment processing
- ❌ No backend database
- ❌ No email confirmations
- ❌ Mocked data only

---

## 🛠️ Customization

### Adding More Protocols

Edit `src/data/protocols.json` and add new entries:

```json
{
  "id": "prot-XXX",
  "ailmentName": "Your Condition",
  "category": "Category Name",
  "tags": ["tag1", "tag2"],
  "frequencyPerWeek": 3,
  "durationMinutes": 30,
  "recommendedWeeks": 8,
  "totalSuggestedSessions": 24,
  "notes": "Treatment notes...",
  "suggestedPackageId": "pkg-002",
  "frequencies": "100, 200, 300"
}
```

### Adding Locations

1. Add location to `src/data/location.json` (or create `locations.json` array)
2. Update `App.jsx` to support location selection
3. Add location-specific availability and packages

### Changing Colors/Branding

Edit CSS variables in `src/App.css`:

```css
:root {
  --primary: #2563EB;  /* Your brand color */
  --secondary: #10B981;
  --accent: #F59E0B;
}
```

---

## 📧 Contact

**Developer:** Adam @ MojuMedia  
**Repository:** https://github.com/mojumedia-dev/waterforlife_app  
**Build Date:** March 13, 2026

---

## 📄 License

Proprietary - Built for Water For Life Wellness Center
