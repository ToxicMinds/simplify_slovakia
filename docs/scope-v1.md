# Scope: What's In/Out for MVP 1.0

## IN SCOPE ✅

### Personas
- Non-EU employee, first entry to Slovakia, single, Bratislava

### Flows Covered
1. Apply for National Visa (Type D)
2. Enter Slovakia
3. Register with Foreign Police
4. Apply for Temporary Residence
5. Collect Residence Card
6. Register Housing Address
7. Open Bank Account
8. Get SIM Card
9. Register with Doctor/GP
10. Employer Tax/Insurance Alignment
11. Tax Residence & Annual Obligations

### Features
- Static checklist generation
- Step-by-step view with details
- Precondition/output state tracking
- Official government link references
- Mobile-responsive design
- Runs on AWS free tier

## OUT OF SCOPE ❌

### Personas Not Covered
- EU citizens (different rules)
- Family reunification (complex)
- Students (different visa type)
- Business/self-employed (future)
- Multiple cities beyond Bratislava (future)

### Features Not Included
- User accounts/login
- Progress saving (client-side only)
- Email reminders
- Document upload
- AI form filling
- Multi-language (English only)
- Notification system
- Social features

### Technical Exclusions
- Database (stateless MVP)
- Authentication
- Payment processing
- Analytics/tracking
- A/B testing
- Admin dashboard

## Rationale

**Why so limited?**

1. **Validate core value first** - Does deterministic checklist solve the problem?
2. **Keep costs zero** - Database/auth/analytics cost money
3. **Iterate based on feedback** - Don't build features nobody wants
4. **Parallel contributor work** - Once MVP proves value, expand scope

## v2.0 Candidates (Post-MVP)

- Additional personas (EU citizens, students)
- User accounts + progress saving
- More cities (Košice, Žilina, etc.)
- Multi-language support (Slovak, Ukrainian)
- Document templates download
- AI form filling assistance
- Email notification system

These are NOT commitments, just potential directions.
