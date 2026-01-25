# Future Extensions: Post-MVP Roadmap

**Important:** This is NOT a commitment. These are possibilities based on user feedback.

## Phase 2: Expand Personas

### New Personas
1. **EU Citizens** - Different rules, no visa needed
2. **Students** - Type D visa, different residence permit
3. **Family Reunification** - Complex, family member dependencies
4. **Self-Employed/Business** - Trade license requirements
5. **Investors** - Capital requirements

**Effort:** Medium. Architecture supports this (add new flows + rules).

**Value:** Covers 80%+ of expat scenarios.

## Phase 3: Geographic Expansion

### More Slovak Cities
- Košice (2nd largest)
- Žilina
- Prešov
- Nitra

**Effort:** Low. Rules mostly the same, different office addresses.

**Value:** Covers entire Slovakia.

### Other EU Countries
- Czech Republic (similar to Slovakia)
- Poland
- Hungary
- Germany
- Netherlands

**Effort:** High. Each country = new rule set.

**Value:** Massive. Could help millions.

**Constraint:** Requires local contributors per country.

## Phase 4: AI-Powered Features

### Form Filling Assistant
**What:** AI extracts info from your documents → pre-fills forms.

**Example:**
- Upload employment contract PDF
- AI reads: employer name, salary, start date
- System pre-fills Slovak residence form

**Value:** Saves hours of form filling.

**Risk:** AI errors = wrong applications.

**Mitigation:** Human verification required before submission.

### Document Translation
**What:** OCR + translation of Slovak documents.

**Example:**
- Photo of Slovak housing contract
- System translates to English
- Highlights key sections (rent amount, duration)

**Value:** Breaks language barrier.

**Constraint:** Costs money (translation APIs).

### Intelligent Chatbot
**What:** Ask questions about your situation, get checklist.

**Example:**
- User: "I'm from India, moving for a tech job, bringing my wife"
- AI: Identifies persona, asks clarifying questions
- System: Shows combined flow for employee + family

**Value:** Natural interface.

**Risk:** Can't hallucinate. Must redirect to checklist.

## Phase 5: Community Features

### User-Generated Content
- Reviews of government offices ("This office is fast/slow")
- Pro tips ("Bring extra passport photos")
- Experience sharing ("It took me 3 weeks")

**Value:** Crowdsourced wisdom.

**Risk:** Misinformation.

**Mitigation:** Voting system, moderation.

### Expert Network
- Connect users with immigration lawyers
- Vetted service providers (translators, notaries)
- Volunteer mentors who've done it before

**Value:** Human support when needed.

**Monetization:** Referral fees from lawyers?

## Phase 6: Notifications & Reminders

### Email/SMS Alerts
- "Your visa interview is in 3 days"
- "Don't forget to register housing within 10 days"
- "Tax deadline approaching"

**Value:** Prevent missed deadlines.

**Constraint:** Requires user accounts, backend database.

### Calendar Integration
- Add all deadlines to Google Calendar
- Sync with Outlook
- iPhone/Android reminders

**Value:** Seamless with existing tools.

## Phase 7: Mobile Apps

### Native iOS/Android
**Why:** Better offline support, notifications.

**Effort:** High (maintain 3 codebases: web, iOS, Android).

**Alternative:** Progressive Web App (PWA) - web app that feels native.

**Decision:** Start with PWA, go native if demand is high.

## Phase 8: API for Developers

### Public API
Let other developers build on top:
- Immigration law bots on Telegram
- Integration with relocation company software
- University portals for international students

**Monetization:** Free for non-commercial, paid tiers for commercial use?

**Value:** Extend reach without building UI.

## Phase 9: Multi-Language

### Supported Languages
1. Slovak (most important)
2. Ukrainian (large expat group)
3. Russian (many speakers)
4. German (western expats)
5. Spanish (Latin American expats)

**Constraint:** Human translation required (not machine).

**Strategy:** Crowdsource via community contributors.

## What's NOT on the Roadmap

Things we're explicitly NOT building:

1. **Job search** - Use LinkedIn, not Simplify Slovakia
2. **Housing search** - Use Nehnutelnosti.sk, not us
3. **Language learning** - Use Duolingo, not us
4. **Cultural integration** - Different product
5. **Legal advice** - Get a lawyer, not an app

**Reason:** Focus. Do one thing well.

## Prioritization Framework

How we'll decide what to build next:

1. **User feedback** - What are people asking for?
2. **Impact** - How many users does this help?
3. **Effort** - Can we build it in <2 months?
4. **Cost** - Does it break free tier?
5. **Mission alignment** - Does it help expats navigate bureaucracy?

**Formula:** Impact / (Effort × Cost) = Priority Score

## How You Can Help

**Vote on features:** [GitHub Discussions](#) (link TBD)

**Contribute:** [CONTRIBUTING.md](#) (guide TBD)

**Donate:** If we need paid features (translation APIs, etc.)

---

**Last Updated:** January 2026  
**Next Review:** After v1.0 user feedback
