# Testing Checklist

This is the checklist this build was verified against before final packaging. Automated checks (build, lint, route smoke-test) were run directly; functional checks against a live Supabase backend should be re-run by you after deployment, since they require real data and email delivery.

## Automated (verified in this build)

- [x] `npm install` completes with no errors
- [x] `npx eslint src --ext js,jsx` returns zero errors/warnings
- [x] `npm run build` completes with **zero errors and zero warnings** (no chunk-size warnings — vendor code is split into `vendor-react`, `vendor-supabase`, `vendor-charts`, `vendor-icons`, `vendor-utils`; every dashboard page is route-level lazy-loaded)
- [x] `npm run preview` serves the production build; all 12 top-level routes (`/`, `/about`, `/history`, `/objectives`, `/events`, `/gallery`, `/contact`, `/login`, `/register`, `/member/dashboard`, `/admin/dashboard`, `/referee/dashboard`) return HTTP 200 with real rendered content
- [x] No fixed pixel widths or `overflow-x-scroll` patterns anywhere in `src/` that could force horizontal scrolling on a phone
- [x] Every list/table view (`DataTable`) renders as stacked cards below the `sm` breakpoint and a normal table at `sm`+
- [x] All interactive elements (`.btn`, `.input-field`, icon-only buttons, toggle switches) meet the 44px minimum touch-target guideline
- [x] Every async data view has a loading state (skeleton), an error state with retry, and an empty state with guidance — no page can render blank or stuck

## Manual — run these once connected to a real Supabase project

### Public site
- [ ] All public pages load on mobile (Android Chrome + iOS Safari), tablet, and desktop without horizontal scroll
- [ ] Hamburger menu opens/closes correctly on mobile; nav closes after navigating
- [ ] Contact form submits without error (currently a UI stub — see `src/pages/public/Contact.jsx` comment for wiring a real backend)

### Registration
- [ ] Sign up → email verification → log in → land in the registration wizard
- [ ] All 6 steps save correctly and persist on refresh (each step writes to Supabase immediately)
- [ ] Family Head vs Individual Member selection changes the Family ID field's required state correctly
- [ ] File uploads (profile photo, family photos, ID/address proof, supporting documents) succeed and appear in Supabase Storage
- [ ] Selecting referees and submitting moves `registration_status` to `pending_referee_verification` and (if Edge Functions are deployed) sends referee emails

### Referee flow
- [ ] Referee account sees pending applicants in Referee Dashboard
- [ ] Review modal shows full applicant detail, family members, and documents (signed URLs open correctly)
- [ ] Recommend / Reject with comments updates status and is visible to the admin

### Admin flow
- [ ] Registration Approval shows referee-by-referee decisions, comments, and timestamps
- [ ] Final Approve generates a `family_id` and sends an approval notification/email
- [ ] Member Management: suspend / reactivate works and reflects immediately
- [ ] Referee Management: promoting an approved member to referee works; activate/deactivate toggles correctly
- [ ] Manage Events / Notices / Gallery: full create/edit/delete cycle works, including image uploads
- [ ] Search Members and Export Members return correct filtered results; CSV downloads and opens correctly in Excel/Sheets
- [ ] Audit Logs show every action taken above, in order, with the correct actor
- [ ] System Settings saves and persists on reload

### Cross-cutting
- [ ] Test on an actual Android phone and an actual iPhone, not only desktop responsive-mode — confirm no zoom-on-input-focus, no overlapping elements, no off-screen content
- [ ] Test with a slow/throttled connection to confirm skeleton loaders appear before content (Chrome DevTools → Network → Slow 3G is a good proxy)
- [ ] Confirm a member cannot reach `/admin/*` or `/referee/*` routes (should redirect to `/unauthorized`)
- [ ] Confirm RLS by attempting (via browser devtools / Supabase API directly) to read another user's private documents — should be denied
