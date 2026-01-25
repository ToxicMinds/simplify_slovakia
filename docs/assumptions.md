# Assumptions: What We're Taking as Given

## User Assumptions

### 1. English Proficiency
**Assumption:** Users can read English at B2+ level.

**Why:** Slovak bureaucracy is already complex. Adding machine translation adds another failure mode.

**Risk:** Excludes non-English speakers.

**Mitigation (v2.0):** Community translations, not machine translation.

### 2. Digital Literacy
**Assumption:** Users can navigate websites, click links, use forms.

**Why:** Government e-services require this anyway.

**Risk:** Excludes less tech-savvy users.

**Mitigation:** Design for simplicity. Large buttons, clear language.

### 3. Document Access
**Assumption:** Users have (or can obtain) required documents before starting.

**Why:** We can't help with "How do I get my birth certificate?"

**Risk:** Users start the process, get blocked by missing docs.

**Mitigation:** Show document requirements upfront, before step 1.

### 4. Legal Entry Intent
**Assumption:** Users want to enter Slovakia legally.

**Why:** We're not helping with visa fraud or illegal immigration.

**Risk:** None (this is a feature, not a bug).

### 5. Employment Contract Exists
**Assumption:** For employee flows, user already has a job offer.

**Why:** Visa applications require a contract. We can't help with job search.

**Risk:** Users expect us to find them jobs.

**Mitigation:** Clear scope in docs: "This is post-job-offer navigation."

## Technical Assumptions

### 1. Government Websites Stay Up
**Assumption:** Official government websites are accessible.

**Why:** We link to them as source of truth.

**Risk:** Links break, sites go down.

**Mitigation:** Periodic link checking. Community reports of broken links.

### 2. Laws Don't Change Mid-Flow
**Assumption:** Immigration laws are stable month-to-month.

**Why:** Can't track daily law changes in v1.

**Risk:** Outdated advice.

**Mitigation:** Version numbers in flows. Clear "last updated" dates.

### 3. AWS Free Tier Exists
**Assumption:** AWS keeps their free tier offer.

**Why:** Our "free forever" depends on it.

**Risk:** AWS ends free tier.

**Mitigation:** Architecture is portable. Can move to Vercel, Netlify, etc.

### 4. YAML is Sufficient
**Assumption:** YAML files can encode all rule complexity.

**Why:** Keeping it simple.

**Risk:** Some rules might need programming logic.

**Mitigation (future):** Add rule engine if YAML becomes limiting.

## Scope Assumptions

### 1. Bratislava First
**Assumption:** Most expats go to Bratislava.

**Why:** Capital city, most jobs.

**Risk:** Other cities feel excluded.

**Mitigation:** Architecture supports multiple cities. Add them based on demand.

### 2. Employment First
**Assumption:** Most non-EU people come for jobs.

**Why:** Largest cohort.

**Risk:** Students, family reunification, investors not covered.

**Mitigation:** Add personas based on user feedback.

### 3. Single People First
**Assumption:** Singles before families.

**Why:** Simplest case.

**Risk:** People with families feel excluded.

**Mitigation:** Family flows are next priority in v2.

## Known Limitations

### What We DON'T Handle (v1.0)

1. **Appeals** - If your visa is denied, we can't help with appeals
2. **Special cases** - Refugees, asylum seekers, stateless persons
3. **Legal interpretation** - "Can I work two jobs?" → Ask a lawyer
4. **Form filling** - We show what forms, not how to fill them
5. **Timelines** - "How long does it take?" → Varies by office
6. **Costs** - Fee amounts may change
7. **Language barriers** - All content in English
8. **Offline use** - Requires internet connection

### When These Become Blockers

If user feedback says "I can't use this because X," we'll revisit.

Example: If 80% of users say "I need Slovak language," we prioritize translation.

## Validation Strategy

**How we'll test these assumptions:**

1. **User interviews** - Talk to 10 expats who recently went through the process
2. **Beta testing** - Release to small group, gather feedback
3. **Analytics** (v2.0) - See where users drop off
4. **Community feedback** - GitHub issues, Reddit posts

**Success metric:** 80%+ of users in target persona complete the flow without external help.
