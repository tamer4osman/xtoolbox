# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Project: xtoolbox

A client-side web app with 150+ online tools.

### Build Commands
- `npm run dev` - Dev server at localhost:3000
- `npm run build` - Production build to dist/
- `npm run test` - Playwright E2E tests

### Recent Fixes
- Crypto price tracker: Added fallback icons for failed CoinGecko images
- Sunrise/sunset: Fixed "Invalid Date" for golden hour (empty response)
- Readability score: Fixed Analyze button (missing #desc element)

### External APIs Used
- CoinGecko (crypto prices)
- wttr.in / Open-Meteo (weather)
- Free Dictionary API
- Open Library
- CoinGecko markets API

---

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
