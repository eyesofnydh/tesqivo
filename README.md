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
