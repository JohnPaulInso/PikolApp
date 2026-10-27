# Graph Report - Paddly  (2026-10-27)

## Corpus Check
- 82 files · ~296,833 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .xml 10, (none) 3, .bat 3)

## Summary
- 380 nodes · 661 edges · 29 communities (14 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Court Booking & Venues
- Court Booking & Venues
- Court Booking & Venues
- Court Booking & Venues
- Court Booking & Venues
- Court Booking & Venues
- Court Booking & Venues
- Court Booking & Venues
- Referee & Match Scoring
- Mobile Platform & Capacitor
- Court Booking & Venues
- Court Booking & Venues
- UI Components & Styling
- Referee & Match Scoring
- Community Feed & Social
- Mobile Platform & Capacitor
- Module 18 Services
- Module 25 Services
- Module 26 Services
- Module 27 Services

## God Nodes (most connected - your core abstractions)
1. `syncRef()` - 25 edges
2. `getGameConfig()` - 16 edges
3. `teamName()` - 15 edges
4. `renderMatchStory()` - 14 edges
5. `icons()` - 12 edges
6. `updateSplitBill()` - 12 edges
7. `renderSchedule()` - 12 edges
8. `venueById()` - 11 edges
9. `setAdminSubPage()` - 10 edges
10. `openGameOnboarding()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `renderCommunityDiscovery()` --calls--> `icons()`  [EXTRACTED]
  js/community.js → js/community.js  _Bridges community 10 → community 11_
- `selectSplitOrder()` --calls--> `icons()`  [EXTRACTED]
  js/community.js → js/community.js  _Bridges community 10 → community 6_

## Import Cycles
- None detected.

## Communities (29 total, 15 thin omitted)

### Community 0 - "Court Booking & Venues"
Cohesion: 0.05
Nodes (74): addPoint(), addWarning(), applyRevenueRange(), clearStack(), closeWinnerOverlay(), confirmGameOnboarding(), contrastForColor(), courtColorPresets (+66 more)

### Community 1 - "Court Booking & Venues"
Cohesion: 0.08
Nodes (52): applyCourtColors(), applyCourtPalette(), backdropClose(), bookingDates, buildBookingDates(), changeOwnerCount(), chooseCustomDate(), closeModal() (+44 more)

### Community 2 - "Court Booking & Venues"
Cohesion: 0.06
Nodes (19): courtQrLinks, demoSplitOrders, downloadPasaloGraphic(), gearList, joinedOpenPlays, _legacyAddMatchGame(), liked, openPasaloForm() (+11 more)

### Community 3 - "Court Booking & Venues"
Cohesion: 0.15
Nodes (26): addMember(), closeAllCourtMenus(), courtColors, getVenueCourtSettings(), initAdminPortal(), jumpToCourtBookings(), jumpToCourtQr(), markPaid() (+18 more)

### Community 4 - "Court Booking & Venues"
Cohesion: 0.10
Nodes (16): applyBookingRoute(), clearCourtSearch(), courtList, downloadAnnouncement(), filterCourtCatalog(), focusCourt(), focusVenueCourt(), games (+8 more)

### Community 5 - "Court Booking & Venues"
Cohesion: 0.13
Nodes (9): getTimeGreeting(), getUserFirstName(), hasActiveAdvancedFilters(), isCourtFavorited(), renderGreetingHeader(), renderMapPlaceholder(), renderSearchFilterRow(), renderStatsStrip() (+1 more)

### Community 6 - "Court Booking & Venues"
Cohesion: 0.17
Nodes (16): addSplitPlayer(), copySplitSummary(), deleteSplitPlayer(), ensureSplitPlayers(), handlePlayerKey(), moneyFmt(), renderSplitOrders(), renderSplitVenue() (+8 more)

### Community 7 - "Court Booking & Venues"
Cohesion: 0.21
Nodes (11): demoAccounts, drawTabs(), handleLogin(), loginWithRole(), openLoginScreen(), quickDemoLogin(), setLoginRole(), signOutDemo() (+3 more)

### Community 8 - "Referee & Match Scoring"
Cohesion: 0.14
Nodes (13): dependencies, @capacitor/android, @capacitor/cli, @capacitor/core, name, scripts, build, dev (+5 more)

### Community 10 - "Court Booking & Venues"
Cohesion: 0.18
Nodes (12): icons(), manualSplitAmountChanged(), openLeaderboardMarket(), openPasaloDetails(), renderCourtDayBoard(), renderCourtDayBoardInit(), renderFeed(), renderMarket() (+4 more)

### Community 11 - "Court Booking & Venues"
Cohesion: 0.20
Nodes (11): initCarouselControls(), joinOpenPlay(), openPlayCard(), pasaloCard(), renderCommunityDiscovery(), renderSkillLevelBadge(), renderVenueCommunity(), requestPasalo() (+3 more)

### Community 12 - "UI Components & Styling"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 13 - "Referee & Match Scoring"
Cohesion: 0.25
Nodes (5): dirsToCopy, filesToCopy, fs, outDir, path

### Community 14 - "Community Feed & Social"
Cohesion: 0.40
Nodes (5): ensureQrLinks(), loadQrEditor(), renderQrEditor(), saveQrLinkDraft(), updateQrPreview()

## Knowledge Gaps
- **6 isolated node(s):** `@capacitor/android`, `@capacitor/cli`, `@capacitor/core`, `index.html (Application Shell)`, `index.backup.html (Backup Shell)` (+1 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 139 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `@capacitor/android`, `@capacitor/cli`, `@capacitor/core` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Court Booking & Venues` be split into smaller, more focused modules?**
  _Cohesion score 0.05335628227194492 - nodes in this community are weakly interconnected._
- **Should `Court Booking & Venues` be split into smaller, more focused modules?**
  _Cohesion score 0.08208020050125313 - nodes in this community are weakly interconnected._
- **Should `Court Booking & Venues` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._
- **Should `Court Booking & Venues` be split into smaller, more focused modules?**
  _Cohesion score 0.10098522167487685 - nodes in this community are weakly interconnected._
- **Should `Court Booking & Venues` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Should `Referee & Match Scoring` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._