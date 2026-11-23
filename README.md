# Tesqivo

Static academy website. The fonts, compiled styling, and images are served locally so the page does not depend on browser-time Tailwind generation or Google Fonts requests.

## Build

```sh
npm ci
npm run build
```

Publish `dist/`. Netlify uses the included `netlify.toml` configuration.

Update layout and content in `index.html`, custom styling in `styles/input.css`, and run the build after changes. The compiled stylesheet is also written to `assets/site.css` for local previews.

The existing batch enquiry form prepares a WhatsApp message. WhatsApp links open the configured chat without showing its phone number in page text. Email is only a `mailto:learnwithtesqivo@gmail.com` button, with no separate email form. Batch Details scrolls to the Let's Talk section. The footer uses a transparent symbol, live brand name, gray tagline, and copyright.

The logo master is cropped directly from the supplied third design in `assets/tesqivo-wordmark.png`. Its smaller website version is `assets/tesqivo-wordmark-web.png`. Font licenses are included in `assets/fonts/`.

After scrolling 12% of the page's scrollable distance, visitors see the existing enquiry form in a dismissible popup. It appears once per tab session (once per page load if session storage is unavailable). The header and close button stay visible while the form scrolls on smaller screens. Closing it returns the same form and any entered values to the Let's Talk section. Links directly to that section skip the popup. Submission still prepares a WhatsApp message for the visitor to send; details are not saved to a database. Popup behaviour lives in `assets/enquiry-popup.js`.

The popup uses a white-and-indigo split layout inspired by the supplied reference; the decorative illustration panel is hidden on narrow screens to keep the form accessible. The new hero artwork is in `assets/qa-learning-hero.jpg` and its 768px version in `assets/qa-learning-hero-small.jpg`. It was created with built-in image generation; the final prompt is recorded in `assets/qa-learning-artwork-prompt.txt`.

The calendar in `assets/booking-calendar.js` repeats the owner's monthly schedule: 14–23 fully booked, 24–30 partially booked; February stops at 28 or 29. Other dates ask visitors to check with a mentor. These are configured labels, not live booking counts. It opens on the current month in Asia/Kolkata time and updates across midnight, month/year boundaries, and tab wake-up. A visitor browsing another month keeps that view. Edit the `schedule` object if actual availability changes.
