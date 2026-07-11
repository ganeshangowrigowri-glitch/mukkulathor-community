# Responsive & Accessibility Standards

These rules are followed in every module of this project (already applied to
Modules 1–2, and binding for Member/Referee/Admin dashboards in Modules 3–5).

## Breakpoints (Tailwind defaults)
`base` (<640px, phones) · `sm` (≥640px, large phones/small tablets) ·
`md` (≥768px, tablets) · `lg` (≥1024px, laptops) · `xl` (≥1280px, desktops)

Every layout is written mobile-first: unprefixed classes target phones,
`sm:`/`md:`/`lg:` progressively enhance for larger screens. Multi-column grids
always start at 1 column (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, etc.).

## No horizontal scrolling
- Tables use `<DataTable>`, which renders as **stacked cards below `sm`** and
  a normal table at `sm` and up — never a horizontally-scrolling table on a
  phone.
- Long text uses `truncate` / `break-words` inside flex/grid items that have
  `min-w-0` so it wraps or truncates instead of pushing layout wide.
- Forms stack to a single column on phones (`grid sm:grid-cols-2`).

## Touch targets & inputs
- `.btn` and `.input-field` both enforce `min-h-[44px]` (Apple/Android
  minimum recommended tap target).
- Form inputs render at `text-base` (16px) on phones — `sm:text-sm` only
  kicks in on larger screens — to prevent iOS Safari's auto-zoom-on-focus.
- Icon-only buttons (modal close, notification bell, etc.) use a minimum
  `h-9 w-9` hit area.

## Navigation
- Public site: full nav on `lg:flex`, hamburger + slide-down menu below `lg`.
- Dashboards: fixed sidebar on `lg:static`, slide-in drawer with overlay
  below `lg` (`DashboardSidebar`), toggled from the top bar hamburger.

## Performance
- Vite code-splitting via route-level lazy loading is used once dashboard
  modules grow large (see each module's notes).
- Images use explicit `loading="lazy"` outside the first viewport (gallery,
  event banners).

## Accessibility
- All interactive icon-only controls have `aria-label`.
- Focus states are visible (`:focus-visible` ring defined globally).
- Color contrast follows WCAG AA against the navy/white/grey/gold palette.
- Semantic elements (`label`, `nav`, `header`, `main`, `dl/dt/dd` for stacked
  card data) are used instead of generic `div`s where it affects meaning.
