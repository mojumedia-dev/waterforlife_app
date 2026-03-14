import { useState } from 'react';

function Booking({ condition, protocol, availability, location, navigate }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const handleContinueToBooking = () => {
    // Option 1: Open in new tab (users can easily return)
    window.open('https://waterlightforhealth.com/products/spectralight-therapy-bed-appointment-booking', '_blank');
    
    // Option 2: Add protocol info to URL for Easy Appointments
    // const bookingUrl = `https://waterlightforhealth.com/book?protocol=${protocol?.id}&condition=${condition?.conditionName}`;
    // window.open(bookingUrl, '_blank');
  };

  if (showConfirmation) {
    return (
      <div className="page booking-page">
        <div className="confirmation-card card">
          <div className="success-icon">📋</div>
          <h2>Review Your Booking Details</h2>
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
            <p>
              Click the button below to finalize your appointment on our secure Shopify booking system. 
              You'll be able to confirm your preferred time slot and complete the booking process.
            </p>
            
            {protocol && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 'var(--radius-md)',
                color: 'white'
              }}>
                <strong>✨ Dashboard Updated!</strong><br />
                Your session frequencies have been automatically saved to your dashboard. 
                Visit your dashboard anytime to review the frequencies for this protocol.
              </div>
            )}
            
            <p style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
              <strong>📍 Location:</strong><br />
              {location.name}<br />
              {location.address}<br />
              📞 {location.phone}
            </p>
          </div>

          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#f0f9ff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
              <strong style={{ color: '#1e40af' }}>Booking will open in a new tab</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a' }}>
              You'll stay logged in here. Complete your booking in the new tab, then return to view your dashboard.
            </p>
          </div>

          <div className="action-buttons">
            <button 
              className="btn primary large"
              onClick={handleContinueToBooking}
            >
              Open Booking System in New Tab →
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
