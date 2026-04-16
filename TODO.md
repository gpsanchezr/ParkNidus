# ParkNidus Redesign & Supabase Migration TODO

## [ ] 1. Git Backup
- [ ] git add .
- [ ] git commit -m "Initial backup before redesign"
- [ ] git branch -M main
- [ ] git push -u origin main

## [x] 2. Color Palette Redesign ✅
- [x] Update styles/globals.css (neon cyberpunk)
- [x] Update app/globals.css (neon cyberpunk)
- [ ] Test theme toggle (pnpm dev)

## [ ] 3. Supabase Setup (Pending User Creds)
- [ ] User creates Supabase project & tables
- [ ] Get URL + anon key
- [ ] pnpm add @supabase/supabase-js
- [ ] Create lib/supabase.ts
- [ ] Rewrite lib/data-store.ts
- [ ] Update lib/auth.ts
- [ ] Update all API routes
- [ ] Add .env.local
- [ ] Migrate sample data
- [ ] Test full flow

## [ ] 4. Polish & Deploy
- [ ] Add gradients/shadows for impact
- [ ] New GitHub PR (blackboxai/colors-supabase)

