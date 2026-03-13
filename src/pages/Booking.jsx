import { useState } from 'react';

function Booking({ protocol, availability, location, navigate }) {
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
    setShowConfirmation(true);
  };

  if (showConfirmation) {
    return (
      <div className="page booking-page">
        <div className="confirmation-card card">
          <div className="success-icon">✅</div>
          <h2>Booking Confirmed!</h2>
          <div className="confirmation-details">
            {protocol && (
              <div className="detail-row">
                <span className="icon">💡</span>
                <span className="label">Protocol:</span>
                <span className="value">{protocol.ailmentName}</span>
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
            <p>A confirmation email has been sent to your email address.</p>
            <p>We look forward to seeing you!</p>
          </div>
          <button className="btn primary large" onClick={() => navigate('dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page booking-page">
      <button className="back-btn" onClick={() => navigate(protocol ? 'protocol' : 'dashboard')}>
        ← Back
      </button>

      <div className="page-header">
        <h2>📅 Book Your Session</h2>
        {protocol && (
          <div className="booking-protocol-info">
            <span className="protocol-category">{protocol.category}</span>
            <span className="protocol-name">{protocol.ailmentName}</span>
            <span className="protocol-duration">{protocol.durationMinutes} minutes</span>
          </div>
        )}
      </div>

      <div className="booking-section">
        <h3>Select a Date</h3>
        <div className="date-grid">
          {availability.availableSlots.map((dateSlot) => (
            <button
              key={dateSlot.date}
              className={`date-card ${selectedDate?.date === dateSlot.date ? 'selected' : ''}`}
              onClick={() => handleDateSelect(dateSlot)}
            >
              <div className="date-day">{dateSlot.dayOfWeek}</div>
              <div className="date-date">
                {new Date(dateSlot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="date-slots">{dateSlot.slots.length} slots</div>
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="booking-section">
          <h3>Select a Time</h3>
          <div className="time-grid">
            {selectedDate.slots.map((time) => (
              <button
                key={time}
                className={`time-card ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="booking-summary card">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            {protocol && (
              <div className="summary-row">
                <span className="label">Protocol:</span>
                <span className="value">{protocol.ailmentName}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="label">Date:</span>
              <span className="value">{selectedDate.dayOfWeek}, {new Date(selectedDate.date).toLocaleDateString()}</span>
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
    </div>
  );
}

export default Booking;
