# Graph Report - Paddly  (2026-10-25)

## Corpus Check
- 7 files · ~74,260 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 18 nodes · 15 edges · 5 communities (3 shown, 2 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 1,250 input · 480 output

## Community Hubs (Navigation)
- Court Booking & Exchange Ecosystem
- Package Configuration & Scripts
- Scoring, Split & State Engine
- Brand Banner Assets
- Splash Screen Assets

## God Nodes (most connected - your core abstractions)
1. `Court Booking System` - 7 edges
2. `scripts` - 3 edges
3. `Client State & Routing Engine` - 3 edges
4. `Live Referee Scorecard Engine` - 2 edges
5. `Split Bill Calculator` - 2 edges
6. `dev` - 1 edges
7. `Open Play Discovery` - 1 edges
8. `Pasalo Court Resale Exchange` - 1 edges
9. `Admin Venue Management Portal` - 1 edges
10. `Social Story Card Generator` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Pikol Brand Logo Asset` --references--> `Court Booking System`  [EXTRACTED]
  assets/pikol-logo.png → index.html
- `Pikol Design & Architecture Spec` --references--> `Court Booking System`  [EXTRACTED]
  skill.md → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Community Exchange & Booking Ecosystem** — index_html_court_booking, index_html_open_play, index_html_pasalo_exchange, index_html_split_bill [INFERRED 0.95]

## Communities (5 total, 2 thin omitted)

### Community 0 - "Court Booking & Exchange Ecosystem"
Cohesion: 0.33
Nodes (6): Pikol Brand Logo Asset, Admin Venue Management Portal, Court Booking System, Open Play Discovery, Pasalo Court Resale Exchange, Pikol Design & Architecture Spec

### Community 1 - "Package Configuration & Scripts"
Cohesion: 0.33
Nodes (5): name, scripts, dev, start, version

### Community 2 - "Scoring, Split & State Engine"
Cohesion: 0.50
Nodes (4): Social Story Card Generator, Live Referee Scorecard Engine, Split Bill Calculator, Client State & Routing Engine

## Knowledge Gaps
- **8 isolated node(s):** `Open Play Discovery`, `Pasalo Court Resale Exchange`, `Admin Venue Management Portal`, `Social Story Card Generator`, `Pikol Design & Architecture Spec` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 12 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Court Booking System` connect `Court Booking & Exchange Ecosystem` to `Scoring, Split & State Engine`?**
  _High betweenness centrality (0.221) - this node is a cross-community bridge._
- **What connects `Open Play Discovery`, `Pasalo Court Resale Exchange`, `Admin Venue Management Portal` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `Client State & Routing Engine` connect `Scoring, Split & State Engine` to `Court Booking & Exchange Ecosystem`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._