---
version: 1
slug: "web-download-index-html"
primary_target: "web/download/index.html"
related_targets: []
---

# Download page (/download)

Scope: the public download and landing page at /download, served by the Cloudflare Worker. Mode: Persuade.
Audience: parents and teachers deciding to install LunarCade Hub for Year 5 pupils; pupils may read it too.
Action: download the Windows app or Android app, or play online. Secondary: read and leave real reviews.
Proof: the live Moon, real game screenshots, real version and file sizes from the latest GitHub release, real reviews only (starts empty).
Constraints: game's palette and fonts (approved tokens), no invented ratings or counts, works on phones, reduced motion respected, installers are unsigned so install help must be honest.

## Direction contract
THESIS: The page is one lunar month. A live, photoreal Moon stays pinned while the visitor scrolls, and each chapter of the page is one of the eight phases the game teaches, so reading the page is the lesson. It refuses the category default: hero, three feature cards, download buttons.
OWN-WORLD: Night sky indigo ground (#090b1f) with one faint radial, a live Moon rendered from the NASA LRO map with Lommel-Seeliger shading and earthshine, with Nova, the game's astronaut, floating in front of it as a 3D render. Moonlight gold (#ffd36b) fills only the primary action and the active phase, and draws thin lines for focus, hover underlines and reel progress; Nova cyan (#8fe3ff) only in the phase readout. Nunito, the game's face, heavy for display. Hairline panels, real screenshots in swipeable reels framed without device chrome.
STORY: Day 1 New Moon: what this is and the three ways to get it. Days 4 to 11: watch it, prove it in a game, draw it. Day 15 Full Moon: the downloads with real version and size. Days 18 to 23: reviews from real people, then honest install help and safety facts. Day 26: one closing invitation.
FIRST VIEWPORT: Left column (4.6 of 12): the live Moon playing the month as a time-lapse, Nova's 3D render floating at its lower-left edge, readout under it "Day N · N% lit", the phase name and one short sentence, then the eight-phase dial. Right column (7.4 of 12): Nova's helmet and the wordmark in the header, headline "Explore the Moon. Play Among the Stars." with the second sentence in gold, one short lede ("Moon phases for Year 5 Science, as a game..."), primary "Download for Windows", secondary "Download for Android", then version, languages (English · BM · 中文), "Works offline" and a "Play online" link in one muted line.
FORM: Lunar month in one scroll, position 1 of 7 on my ordered list; surface seed key 97260bf0.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Memorable moment: scrolling makes the real Moon wax to full exactly where the downloads are.
Unresolved: Mac download appears only when a release carries a .dmg.
