# OpenAI Game Hackathon in Seoul

Static frontend for the event website. The canonical source branch is `main`;
`gh-pages` is the current deployment mirror.

## Run locally

There is no package install or build step. Serve the repository root over HTTP:

```powershell
python -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Application structure

- `index.html`: page markup, forms, dialogs, and route sections
- `site.css`: responsive layout and visual styles
- `app.js`: hash routing, interactions, validation, and demo submission flow
- `assets/`: wordmarks, guest images, and UI assets

The site uses client-side hash routes, so no server rewrite rules are required:

- `#home`: main page
- `#apply`: event details
- `#submit`: login and application form
- `#gallery`: submitted game gallery

## Server handoff

1. Serve the repository root as static files with `index.html` as the entry
   document.
2. Connect the application form in `app.js` to the production submission API.
   The current handler validates the form and renders the success screen without
   persisting data to a server.
3. Define the upload contract for the game thumbnail. The UI accepts JPG or PNG
   files and recommends a square image up to 10 MB.
4. Return field-level API errors in a shape that can be mapped to the existing
   validation feedback.
5. Replace placeholder social and legal URLs when the final event destinations
   are confirmed.

## Google sign-in and production domain

Create a Google OAuth web client and add its client ID to the
`google-oauth-client-id` meta tag in `index.html`. Register both the production
domain and local preview URL as authorized JavaScript origins.

Do not commit OAuth secrets. Only the public web client ID belongs in the HTML
meta tag.

## Pre-deployment check

- Verify `#home`, `#apply`, `#submit`, and `#gallery` on desktop and mobile.
- Confirm the production OAuth origin and account-switch flow.
- Test form validation, thumbnail upload, API failure handling, and successful
  submission.
- Confirm the custom domain serves all files in `assets/` with the expected
  relative paths.
