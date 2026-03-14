import { useState } from 'react';

function Booking({ condition, protocol, availability, location, navigate }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(true); // Skip directly to booking type
  const [bookingType, setBookingType] = useState(null); // 'single' or 'package'

  const handleDateSelect = (dateSlot) => {
    setSelectedDate(dateSlot);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleConfirmBooking = () => {
    // Save booked protocol frequencies to dashboard
    if (protocol && protocol.frequencies) {
      const freqArray = protocol.frequencies.split(',').map(f => f.trim());
      const frequencies = {
        freq1: freqArray[0] || '',
        freq2: freqArray[1] || '',
        freq3: freqArray[2] || '',
        freq4: freqArray[3] || ''
      };
      
      // Save to localStorage for dashboard
      localStorage.setItem('sessionFrequencies', JSON.stringify(frequencies));
      
      // Save the protocol ID as selected condition
      if (protocol.id) {
        localStorage.setItem('selectedCondition', protocol.id);
      }
      
      // Save booking info for future reference
      localStorage.setItem('lastBookedProtocol', JSON.stringify({
        protocolId: protocol.id,
        protocolName: protocol.name,
        conditionName: condition?.conditionName,
        frequencies: protocol.frequencies,
        date: selectedDate.date,
        time: selectedTime,
        bookedAt: new Date().toISOString()
      }));
    }
    
    setShowConfirmation(true);
  };

  const [showBookingEmbed, setShowBookingEmbed] = useState(false);

  const handleContinueToBooking = () => {
    // Show embedded booking widget
    setShowBookingEmbed(true);
  };

  // Event configuration for Easy Appointment Booking
  const getEventConfig = () => {
    // Determine duration from protocol (default to 30 if not set)
    const duration = protocol?.durationMinutes || 30;
    
    // Map to closest available duration (15, 30, or 60)
    let selectedDuration = 30; // default
    if (duration <= 15) selectedDuration = 15;
    else if (duration <= 30) selectedDuration = 30;
    else selectedDuration = 60;
    
    // Event configurations for each booking type and duration
    const events = {
      single: {
        15: { product: '1477172625450', event: '5c916847-3084-4130-8143-8e7e1b9330eb', variant: '52544178225522' },
        30: { product: '1477172625450', event: '84cb48cb-0415-4cea-a89e-c44ab1525b46', variant: '52544178258290' },
        60: { product: '1477172625450', event: '09ef3036-0812-47dc-adcb-c496a5ec0760', variant: '52544178291058' }
      },
      package: {
        15: { product: '1477172625450', event: '2950a7c2-bc18-42f1-b475-e7d82624d2f1', variant: '60768399753586' },
        30: { product: '1477172625445', event: '870ab5f1-299d-4066-96f1-be892d817e83', variant: '60768399786354' },
        60: { product: '1477172625445', event: '2552a6f7-9383-4370-8eb2-3e09168cfccd', variant: '60768399819122' }
      }
    };
    
    return events[bookingType][selectedDuration];
  };

  // Build booking URL with protocol data for Easy Appointment Booking
  const buildBookingUrl = () => {
    const eventConfig = getEventConfig();
    
    // Build Servicify booking URL
    const baseUrl = 'https://waterlightforhealth.com/servicify-calendar';
    const params = new URLSearchParams({
      'servicify-product': eventConfig.product,
      'servicify-event': eventConfig.event,
      'servicify-variant': eventConfig.variant
    });
    
    // Add protocol data as notes (if Easy Appointment Booking supports it)
    if (protocol && condition) {
      const bookingNotes = [
        `Protocol: ${protocol.name}`,
        `Condition: ${condition.conditionName}`,
        `Frequencies: ${protocol.frequencies} Hz`,
        `Duration: ${protocol.durationMinutes} minutes`,
        `Recommended: ${protocol.frequencyPerWeek}x/week for ${protocol.recommendedWeeks} weeks`,
        `Source: Water & Light Wellness App`
      ].join(' | ');
      
      // Try adding as parameter (may or may not work depending on Easy Appointment Booking)
      params.append('notes', bookingNotes);
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Show embedded booking widget
  if (showBookingEmbed) {
    return (
      <div className="page booking-page">
        <button className="back-btn" onClick={() => setShowBookingEmbed(false)}>
          ← Back to Booking Details
        </button>

        <div className="page-header">
          <h2>📅 Complete Your Booking</h2>
          <p className="subtitle">Finalize your appointment details below</p>
        </div>

        {protocol && (
          <div className="booking-context card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{protocol.name}</strong>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {condition?.conditionName} • {protocol.durationMinutes} min • {protocol.frequencies} Hz
                </div>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                ✨ Frequencies Saved
              </div>
            </div>
          </div>
        )}

        <div className="booking-embed-container card">
          <iframe
            src={buildBookingUrl()}
            width="100%"
            height="800"
            frameBorder="0"
            title="Book Your Appointment"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            style={{
              borderRadius: 'var(--radius-md)',
              minHeight: '800px'
            }}
            onError={() => {
              // Fallback if iframe doesn't work (Shopify sometimes blocks iframes)
              console.log('Iframe blocked, opening in new window');
              window.open(buildBookingUrl(), '_blank');
              setShowBookingEmbed(false);
            }}
          />
        </div>
        
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#fffbeb',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #fbbf24'
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#92400e' }}>
            ⚠️ Booking widget not loading?
          </div>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#92400e' }}>
            Some browsers block embedded Shopify pages for security. If you see a blank space above:
          </p>
          <button 
            onClick={() => window.open(buildBookingUrl(), '_blank')}
            className="btn primary"
            style={{ width: '100%' }}
          >
            Open Booking Page in New Tab →
          </button>
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#f0f9ff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
            <strong>📋 Your protocol details will be included:</strong>
            <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
              {protocol && (
                <>
                  <li>Protocol: {protocol.name}</li>
                  <li>Frequencies: {protocol.frequencies} Hz</li>
                  <li>Duration: {protocol.durationMinutes} minutes</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#f0f9ff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #bfdbfe',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a' }}>
            💡 <strong>Tip:</strong> Your selected frequencies have been saved to your dashboard. 
            Visit your dashboard anytime to review them.
          </p>
        </div>
      </div>
    );
  }

  // Show booking type selector (skip date/time for MVP)
  if (!bookingType) {
    return (
      <div className="page booking-page">
        <button className="back-btn" onClick={() => navigate('wellness')}>
          ← Back to Wellness Guide
        </button>

        <div className="page-header">
          <h2>📋 Choose Your Booking Type</h2>
          <p className="subtitle">Select how you'd like to book this session</p>
        </div>

        {protocol && (
          <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--background)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--primary)' }}>{protocol.name}</strong>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {protocol.frequencies} Hz
              </span>
            </div>
            {selectedDate && selectedTime && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {selectedDate.dayOfWeek}, {new Date(selectedDate.date).toLocaleDateString()} at {selectedTime}
              </div>
            )}
          </div>
        )}

        <div className="booking-type-cards">
          <div 
            className="card booking-type-option"
            onClick={() => setBookingType('single')}
            style={{ cursor: 'pointer', border: '2px solid var(--border)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Single Session</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Pay now for one session
            </p>
            <div style={{ 
              padding: '0.75rem', 
              background: 'var(--background)', 
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: '600', color: 'var(--primary)' }}>Perfect for:</div>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                <li>First-time visitors</li>
                <li>Trying a new protocol</li>
                <li>One-time treatment</li>
              </ul>
            </div>
            <button className="btn primary large" style={{ width: '100%' }}>
              Book & Pay Now →
            </button>
          </div>

          <div 
            className="card booking-type-option"
            onClick={() => setBookingType('package')}
            style={{ cursor: 'pointer', border: '2px solid var(--border)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Package Holder</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Book without payment (already purchased package)
            </p>
            <div style={{ 
              padding: '0.75rem', 
              background: 'var(--background)', 
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: '600', color: 'var(--primary)' }}>Perfect for:</div>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                <li>Package holders</li>
                <li>Multi-session protocols</li>
                <li>Already paid customers</li>
              </ul>
            </div>
            <button className="btn secondary large" style={{ width: '100%' }}>
              Book Session (No Payment) →
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f0f9ff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #bfdbfe',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a' }}>
            💡 <strong>Need a package?</strong> Visit our{' '}
            <button 
              onClick={() => navigate('packages')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: 0
              }}
            >
              packages page
            </button>
            {' '}to save with bulk sessions!
          </p>
        </div>
      </div>
    );
  }

  // Show confirmation screen after booking type selected
  if (bookingType) {
    return (
      <div className="page booking-page">
        <button className="back-btn" onClick={() => setBookingType(null)}>
          ← Change Booking Type
        </button>

        <div className="confirmation-card card">
          <div className="success-icon">📋</div>
          <h2>Review Your Booking Details</h2>
          
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '0.75rem 1rem',
            background: bookingType === 'package' 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
              : 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.2rem' }}>
              {bookingType === 'package' ? '📦' : '💳'}
            </span>
            <span>
              {bookingType === 'package' 
                ? 'Package Holder Booking (No Payment)' 
                : 'Single Session (Payment Required)'}
            </span>
          </div>
          
          <div className="confirmation-details">
            {condition && (
              <div className="detail-row">
                <span className="icon">🎯</span>
                <span className="label">Condition:</span>
                <span className="value">{condition.conditionName}</span>
              </div>
            )}
            {protocol && (
              <div className="detail-row">
                <span className="icon">💡</span>
                <span className="label">Protocol:</span>
                <span className="value">{protocol.name}</span>
              </div>
            )}
            {selectedDate && (
              <div className="detail-row">
                <span className="icon">📅</span>
                <span className="label">Date:</span>
                <span className="value">{selectedDate.dayOfWeek}, {new Date(selectedDate.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
            {selectedTime && (
              <div className="detail-row">
                <span className="icon">🕐</span>
                <span className="label">Time:</span>
                <span className="value">{selectedTime}</span>
              </div>
            )}
            {protocol && (
              <div className="detail-row">
                <span className="icon">⏱️</span>
                <span className="label">Duration:</span>
                <span className="value">{protocol.durationMinutes} minutes</span>
              </div>
            )}
            <div className="detail-row">
              <span className="icon">📍</span>
              <span className="label">Location:</span>
              <span className="value">{location.name}</span>
            </div>
          </div>

          <div className="confirmation-message">
            <p>
              <strong>Ready to complete your booking!</strong>
            </p>
            {bookingType === 'package' ? (
              <p>
                As a package holder, you can book this session without payment. 
                Click below to confirm your appointment time.
              </p>
            ) : (
              <p>
                Your session details have been prepared. Click below to finalize your appointment 
                time and complete payment.
              </p>
            )}
            
            {protocol && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 'var(--radius-md)',
                color: 'white'
              }}>
                <strong>✨ Frequencies Saved to Dashboard!</strong><br />
                Your session frequencies ({protocol.frequencies} Hz) have been automatically saved. 
                Visit your dashboard anytime to review them.
              </div>
            )}
            
            <p style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
              <strong>📍 Location:</strong><br />
              {location.name}<br />
              {location.address}<br />
              📞 {location.phone}
            </p>
          </div>

          <div className="action-buttons">
            <button 
              className="btn primary large"
              onClick={handleContinueToBooking}
            >
              {bookingType === 'package' 
                ? 'Continue to Book Session (No Payment) →' 
                : 'Continue to Book & Pay →'}
            </button>
            <button 
              className="btn secondary large"
              onClick={() => navigate('dashboard')}
            >
              ← Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no protocol data, show error
  if (!protocol) {
    return (
      <div className="page booking-page">
        <button className="back-btn" onClick={() => navigate('wellness')}>
          ← Back to Wellness Guide
        </button>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>⚠️ No Protocol Selected</h2>
          <p>Please select a protocol from the Wellness Guide to book a session.</p>
          <button className="btn primary" onClick={() => navigate('wellness')}>
            Browse Protocols
          </button>
        </div>
      </div>
    );
  }

  const availableTimes = selectedDate ? selectedDate.timeSlots : [];

  return (
    <div className="page booking-page">
      <button className="back-btn" onClick={() => navigate('wellness')}>
        ← Back to Wellness Guide
      </button>

      <div className="page-header">
        <h2>📅 Book Your Session</h2>
        <p className="subtitle">Choose a date and time for your SpectraLight therapy</p>
      </div>

      {condition && (
        <div className="booking-context card">
          <h3>Session Details</h3>
          <div className="booking-protocol-info">
            <span className="protocol-category">{condition.category}</span>
            <span className="protocol-name">{condition.conditionName}</span>
            {protocol && (
              <>
                <span className="protocol-separator">→</span>
                <span className="protocol-source">{protocol.name}</span>
                <span className="protocol-duration">⏱️ {protocol.durationMinutes} min</span>
              </>
            )}
          </div>
          {protocol && (
            <div className="protocol-frequencies-info">
              <strong>Frequencies (Hz):</strong> {protocol.frequencies}
            </div>
          )}
        </div>
      )}

      <div className="booking-section card">
        <h3>📅 Select Date</h3>
        <div className="date-grid">
          {availability.map((dateSlot) => (
            <div
              key={dateSlot.date}
              className={`date-card ${selectedDate?.date === dateSlot.date ? 'selected' : ''}`}
              onClick={() => handleDateSelect(dateSlot)}
            >
              <div className="date-day">{dateSlot.dayOfWeek}</div>
              <div className="date-date">
                {new Date(dateSlot.date).getDate()}
              </div>
              <div className="date-slots">
                {dateSlot.slotsAvailable} slots
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="booking-section card">
          <h3>🕐 Select Time</h3>
          <div className="time-grid">
            {availableTimes.map((time) => (
              <div
                key={time}
                className={`time-card ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="booking-summary card">
          <h3>📋 Booking Summary</h3>
          <div className="summary-details">
            {condition && (
              <div className="summary-row">
                <span className="label">Condition:</span>
                <span className="value">{condition.conditionName}</span>
              </div>
            )}
            {protocol && (
              <div className="summary-row">
                <span className="label">Protocol:</span>
                <span className="value">{protocol.name}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="label">Date:</span>
              <span className="value">
                {selectedDate.dayOfWeek}, {new Date(selectedDate.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Time:</span>
              <span className="value">{selectedTime}</span>
            </div>
            {protocol && (
              <div className="summary-row">
                <span className="label">Duration:</span>
                <span className="value">{protocol.durationMinutes} minutes</span>
              </div>
            )}
            <div className="summary-row">
              <span className="label">Location:</span>
              <span className="value">{location.name}</span>
            </div>
          </div>
          <button 
            className="btn primary large"
            onClick={handleConfirmBooking}
          >
            Confirm Booking
          </button>
        </div>
      )}

      {(!selectedDate || !selectedTime) && (
        <div className="booking-help card highlight">
          <h3>ℹ️ Booking Instructions</h3>
          <ol>
            <li>Select a date from the available options above</li>
            <li>Choose a time slot that works for you</li>
            <li>Review your booking summary and confirm</li>
            <li>You'll receive a confirmation email with all details</li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default Booking;
