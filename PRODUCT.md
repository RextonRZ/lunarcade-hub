# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: parents and teachers in Malaysia who find, judge and install LunarCade Hub for Year 5 pupils (about 10 to 11 years old). They decide whether it is safe, worthwhile and easy to install, often on a family laptop or an Android phone.
Players: Year 5 pupils, who play in English, Bahasa Melayu or Chinese, at home or in class.

## Product Purpose
LunarCade Hub teaches Moon phases, a Year 5 Science topic, through an animated concept lab with a 3D Sun, Earth and Moon simulator, an Astro-Jump quiz platformer, a Galactic Racer game, interactive notes and a Draw the Moon activity, guided by Nova the astronaut. Success: a pupil can explain why the Moon's shape changes and name the eight phases, and wants to come back to play.

## Positioning
The Moon phase lesson is the game itself: pupils watch the mechanism in 3D, then prove it by steering, jumping and drawing, all in three languages, and it works offline once installed.

## Operating Context
- Website: https://lunarcade.lunarcadehub.workers.dev (game), /download (download page). Cloudflare Worker + D1, free plan.
- Apps: Windows installer (.exe, about 131 MB) and Android APK (about 30 MB), hosted on GitHub Releases (RextonRZ/lunarcade-hub) and served through /download/windows and /download/android. iPhone players use the website (Add to Home Screen).
- A shared live leaderboard across web, desktop and Android; nicknames, no accounts.
- Installers are not code-signed: Windows shows SmartScreen ("More info, Run anyway"); Android asks to allow installs from the browser.

## Capabilities and Constraints
- Version and file sizes come from the latest GitHub release; the page must never hard-code them as the only source.
- Reviews: visitors may leave a heart rating and a short comment with a nickname; stored on the server and shown publicly. Audience includes children, so reviews need length limits, filtering and a way for the owner to hide one.
- The game's smallest layout is 900 x 520; the website fits any phone by scaling and turning the game.

## Brand Commitments
- Name: LUNARCADE HUB (wordmark in capitals). Mascot: Nova, the astronaut. Taglines from the creator: "Explore the Moon. Play Among the Stars.", "Explore. Learn. Play."
- The game's own typefaces: Nunito, Huninn and Noto Sans SC. Game palette: night-sky indigo, moonlight gold, Nova's cyan.
- Credit belongs to the game's creator; the site does not name helpers.

## Evidence on Hand
- Real screenshots: docs/screenshots/*.jpg (home, concept lab, simulator, quiz, racer, leaderboards, notes, draw, settings, Chinese UI, phone).
- Nova artwork: art/app-icon.png (portrait icon). No other illustration exists.
- No reviews, ratings, download counts or testimonials exist yet. Never invent them; the review section starts empty and fills with real submissions.

## Product Principles
1. Show the Moon doing its job: every claim about learning is demonstrated with the real game or a live Moon, not illustrated.
2. Adults decide, children play: reassure the adult (size, safety, offline, languages) without losing the joy.
3. Only real facts: version, size, languages, topic. No invented proof.
4. Works on every screen, offline after install.

## Accessibility & Inclusion
Readable by parents with mixed English fluency: short plain sentences, Malay and Chinese present in the game. Respect reduced motion. Children may read the page, so public review text is filtered and limited.
