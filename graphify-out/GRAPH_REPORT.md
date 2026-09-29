# Graph Report - perpustakaan-web  (2026-09-29)

## Corpus Check
- Corpus is ~15,635 words - fits in a single context window. You may not need a graph.

## Summary
- 256 nodes · 560 edges · 18 communities (17 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.82)
- Token cost: 2,888,904 input · 47,713 output

## Community Hubs (Navigation)
- Route Guards and Auth Pages
- Package Manifest, Scripts, and Lint
- Vite Scaffold and Project Docs
- API Client and Backend Integration
- Dashboard Views and Modals
- Book Detail and Edit Modals
- Staff Data and Storage Keys
- Development Tooling Dependencies
- Attendance and Shift Helpers
- Dashboard Shell and Loan Helpers
- Book Data Hook and Persistence
- Unused Social Icon Sprite Sheet
- Vite Template Favicon Artwork
- Landing Hero Illustration Asset
- Unused Vite Logo Asset
- Overview Panels and CSV Export
- Unused React Logo Asset
- Attendance Data Write and Reset

## God Nodes (most connected - your core abstractions)
1. `Dashboard()` - 40 edges
2. `react` - 12 edges
3. `ModalShell()` - 12 edges
4. `LAPORAN.md — Perpustakaan Web (Frontend) Work Report` - 11 edges
5. `getToken()` - 10 edges
6. `Final src/ File Structure` - 10 edges
7. `PageHeader()` - 9 edges
8. `AttendanceWidget()` - 9 edges
9. `useBooks()` - 9 edges
10. `react-router-dom` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Buku Model (id_buku, judul, penulis, deskripsi, gambar, stok)` --shares_data_with--> `normalizeBook()`  [INFERRED]
  LAPORAN.md → src/hooks/useBooks.js
- `html lang="id" (Indonesian)` --semantically_similar_to--> `LAPORAN.md — Perpustakaan Web (Frontend) Work Report`  [INFERRED] [semantically similar]
  index.html → LAPORAN.md
- `Minimal Single-Card Design Direction` --semantically_similar_to--> `React + Vite Minimal Template`  [INFERRED] [semantically similar]
  LAPORAN.md → README.md
- `index.css Leftover Sliding-Overlay Template CSS` --semantically_similar_to--> `React + Vite Minimal Template`  [INFERRED] [semantically similar]
  LAPORAN.md → README.md
- `favicon.svg Icon Link` --references--> `Favicon Mark (Abstract V Bolt)`  [EXTRACTED]
  index.html → public/favicon.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Login & Session Establishment Flow (endpoint → storage → guarded route)** — laporan_login_flow, laporan_api_endpoint_map, laporan_auth_session_helper, laporan_axios_client, laporan_routing_guards, src_pages_login_loginform_handlelogin, src_utils_auth_setsession, src_api_client [EXTRACTED 1.00]
- **2-Tier Bookshelf Landing Design (shelf rendering, book click-through, dummy fallback)** — laporan_landing_two_tier_bookshelf, laporan_book_click_to_login, laporan_landing_dummy_book_fallback, laporan_design_iteration_history, src_pages_landing [EXTRACTED 1.00]
- **Buku Data Integration Surface (endpoint, model, and the two consumers that render it)** — laporan_api_endpoint_map, laporan_buku_model, laporan_unauthenticated_buku_access, laporan_landing_two_tier_bookshelf, laporan_dashboard_catalog, laporan_frontend_scope_boundary [INFERRED 0.85]
- **Wide-Gamut Masked Glow Rendering Pipeline** — public_favicon_alpha_mask, public_favicon_gaussian_blur_glow, public_favicon_display_p3_wide_gamut, public_favicon_offcanvas_gallery_bleed [INFERRED 0.85]
- **Third-party brand mark row (social link set)** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_github_icon, public_icons_x_icon [INFERRED 0.75]
- **Landing hero art composition (illustration, surface, accent, background, technique)** — src_assets_hero_stacked_book_illustration, src_assets_hero_cream_rounded_cover, src_assets_hero_violet_page_edge_accent, src_assets_hero_soft_mint_background, src_assets_hero_thin_grey_outline_technique [EXTRACTED 1.00]
- **Vite Logo Mark Composition** — src_assets_vite, src_assets_vite_bolt_glyph, src_assets_vite_parenthesis_frame, src_assets_vite_brand_gradient, src_assets_vite_gaussian_blur_glow [EXTRACTED 1.00]

## Communities (18 total, 1 thin omitted)

### Community 0 - "Route Guards and Auth Pages"
Cohesion: 0.00
Nodes (21): Protected Route Guard (redirect to / when no token), RequireAdmin Route Guard (id_role === 1), App.jsx Routing and Route Guards, lucide-react, react, react-dom, react-router-dom, App() (+13 more)

### Community 1 - "Package Manifest, Scripts, and Lint"
Cohesion: 0.00
Nodes (26): dependencies, axios, lucide-react, react, react-dom, react-router-dom, @tailwindcss/vite, name (+18 more)

### Community 2 - "Vite Scaffold and Project Docs"
Cohesion: 0.00
Nodes (26): index.html (Vite SPA Entry Shell), Document Title 'Perpustakaan', favicon.svg Icon Link, html lang="id" (Indonesian), Module Script /src/main.jsx, <div id="root"> React Mount Point, Responsive Viewport Meta Tag, Build and Lint Verification (Vite 8, 1904 modules) (+18 more)

### Community 3 - "API Client and Backend Integration"
Cohesion: 0.00
Nodes (23): AdminResetPassword.jsx — Admin Password Reset (PUT), Rejection of Neon / AI-Generic UI Concepts, Backend Endpoint Integration Map, src/utils/auth.js — Token/Session Helper (set, get, clear), src/api/client.js — Axios Instance with Bearer Token Interceptor, Book Click → /login with bookTitle / bookColor Route State, Buku Model (id_buku, judul, penulis, deskripsi, gambar, stok), Dashboard.jsx — Book Catalog with Search (+15 more)

### Community 4 - "Dashboard Views and Modals"
Cohesion: 0.00
Nodes (18): BOOK_COVER_PALETTES, BookCover(), BookGrid(), Catalog(), CustomDropdown(), DEFAULT_SHIFT_OPTIONS, DUMMY_LOAN_MEMBERS, EXCLUDED_DUMMY_NAMES (+10 more)

### Community 5 - "Book Detail and Edit Modals"
Cohesion: 0.00
Nodes (13): DeleteConfirmModal(), BOOK_COVER_PALETTES, BookCover(), DetailBookModal(), getBookCoverPalette(), DEFAULT_GENRES, DEFAULT_PUBLISHERS, EditBookModal() (+5 more)

### Community 6 - "Staff Data and Storage Keys"
Cohesion: 0.00
Nodes (13): ATTENDANCE_STORAGE_KEY, formatShiftLabel(), LAST_ATTENDANCE_DATE_STORAGE_KEY, LEGACY_ATTENDANCE_STORAGE_KEY, LOANS_STORAGE_KEY, MOCK_FACILITIES, saveStaffData(), SHIFT_STORAGE_KEY (+5 more)

### Community 7 - "Development Tooling Dependencies"
Cohesion: 0.00
Nodes (13): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+5 more)

### Community 8 - "Attendance and Shift Helpers"
Cohesion: 0.00
Nodes (12): AttendanceWidget(), getLocalDateKey(), getShiftStartMinutes(), getUserShift(), isExcludedDummy(), normalizeAttendanceRecords(), normalizeUser(), parseLocalArray() (+4 more)

### Community 9 - "Dashboard Shell and Loan Helpers"
Cohesion: 0.00
Nodes (12): BooksManagement(), formatTransactionDate(), getDisplayName(), getInitials(), LibraryMark(), MobileHeader(), normalizeLoan(), readLoanData() (+4 more)

### Community 10 - "Book Data Hook and Persistence"
Cohesion: 0.00
Nodes (10): BOOK_COVER_PALETTES, getBookCoverPalette(), getInitials(), normalizeBook(), readBookData(), saveBookToBackend(), useBooks(), writeBookData() (+2 more)

### Community 11 - "Unused Social Icon Sprite Sheet"
Cohesion: 0.00
Nodes (10): icons.svg (SVG symbol sprite sheet), bluesky-clip clipPath definition, bluesky-icon symbol, discord-icon symbol, documentation-icon symbol, Filled brand-glyph icon style (fill #08060d, evenodd), github-icon symbol, social-icon symbol (+2 more)

### Community 12 - "Vite Template Favicon Artwork"
Cohesion: 0.00
Nodes (9): Favicon Mark (Abstract V Bolt), Abstract V Bolt Glyph, Alpha Mask (mask id="a"), Browser Tab / Bookmark Identity, Display-P3 Wide-Gamut Color Fallback, Gaussian Blur Glow Filters (stdDeviation 7.659 / 4.596), Off-Canvas Gallery Bleed Requiring Mask Crop, Vite Template Residue (Unmodified Default Asset) (+1 more)

### Community 13 - "Landing Hero Illustration Asset"
Cohesion: 0.00
Nodes (7): hero.png (landing illustration asset), Cream rounded-corner book cover surface, Isometric stacked-slab extrusion visual style, Soft mint-green flat background field, Stacked closed-book isometric illustration, Thin grey outline over flat-fill rendering, Violet page-edge accent on lower slab

### Community 14 - "Unused Vite Logo Asset"
Cohesion: 0.00
Nodes (8): Vite Logo SVG Asset, Vite Lightning-Bolt Glyph, Purple-to-Blue Brand Gradient (#9135ff / #8900ff / #00c2ff), Blurred-Ellipse Glow Layer (feGaussianBlur + alpha mask), Logo Parenthesis Frame, prefers-color-scheme Dark-Mode Fill Rule, Vite, Unused Vite Template Asset (no importer in src/ or index.html)

### Community 15 - "Overview Panels and CSV Export"
Cohesion: 0.00
Nodes (8): AttendanceReport(), downloadCsv(), formatRupiah(), LoansManagement(), Overview(), RecentLoans(), StatCard(), StatusBadge()

### Community 16 - "Unused React Logo Asset"
Cohesion: 0.00
Nodes (4): Iconify logos Icon Collection, React Logo Mark (Iconify), Single-Path Outline Geometry, Unreferenced Scaffold Asset

## Ambiguous Edges - Review These
- `Perpustakaan Web Frontend (React + Vite + Tailwind v4)` → `Dangling '# perpustakaan-frontend-ui' Heading`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **44 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 51 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Perpustakaan Web Frontend (React + Vite + Tailwind v4)` and `Dangling '# perpustakaan-frontend-ui' Heading`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `Route Guards and Auth Pages` to `Package Manifest, Scripts, and Lint`, `Vite Scaffold and Project Docs`, `Dashboard Views and Modals`, `Book Detail and Edit Modals`, `Staff Data and Storage Keys`, `Book Data Hook and Persistence`?**
  _High betweenness centrality (0.227) - this node is a cross-community bridge._
- **Why does `React + Vite Minimal Template` connect `Vite Scaffold and Project Docs` to `Route Guards and Auth Pages`, `API Client and Backend Integration`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `react-router-dom` connect `Route Guards and Auth Pages` to `Package Manifest, Scripts, and Lint`, `Landing Hero Illustration Asset`, `Staff Data and Storage Keys`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _44 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Route Guards and Auth Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.14532019704433496 - nodes in this community are weakly interconnected._
- **Should `Package Manifest, Scripts, and Lint` be split into smaller, more focused modules?**
  _Cohesion score 0.082010582010582 - nodes in this community are weakly interconnected._