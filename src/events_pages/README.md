# Adding an event

1. Copy `_template` to a new event folder under `src/events_pages`.
2. Add its logo under `public/events_pages/<event-folder>/`.
3. Set `const SLUG` at the top of `event.config.ts` (this automatically populates `slug` and sets `imageKitPath` to `/booth_captures/<slug>/`) and complete the configuration. (No need to edit `registry.ts` or `api/images.ts` — event discovery and API allowlist update automatically on build).
4. Create the matching ImageKit folder under `/booth_captures/<slug>/`.
5. ON THE GLITCH BOOTH MACHINE, set `EVENT_SLUG = "<slug>"` in `server.py` so QR codes point to `https://glitchbooth.online/<slug>/p/{timestamp}`.
6. Run `npm run lint` and `npm run build`, then test the landing page, capture page, pagination, refresh, social link, and navigation.
7. Change the event status to `past` after the event.
