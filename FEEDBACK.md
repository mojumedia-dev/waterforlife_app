# Water For Life App — Feedback & Backlog

Running list of feedback and feature ideas from Adam. Newest on top.

## 2026-10-07

- Session area: add a place to record which BAND they're using on the frequency.
  - Context: each frequency (Hz) already carries a band (see FrequencyDetail.jsx: band.name / purpose / commonApplications / dutyCycle / intensity). The idea is that when a user logs a session (Dashboard, Previous Sessions), they can also capture which band they ran on that frequency.
  - Build sketch: add an optional "Band" field to the session entry, show it in the Previous Sessions list and in the session detail. Prefill with the frequency's band options where we have them.
  - Adam's answer: free-text.
  - Status: DONE (2026-10-07). Added a free-text "Band" field to every channel in Session Frequencies (handleChannelChange handles it, so it persists to localStorage and the saved session automatically). Shows as a band chip next to each frequency in Previous Sessions. Build clean, verified in a headless browser. Shipped.
