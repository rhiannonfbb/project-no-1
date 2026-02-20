# Product Requirements Document

## Vision
Ein Voting Board, auf dem Nutzer Produktideen einreichen und per Upvote/Downvote priorisieren können. Als Product Manager erhältst du ein transparentes, datengetriebenes Tool, um zu verstehen, welche Features deine Nutzer am meisten wollen.

## Target Users

### Primäre Nutzer
- **Endnutzer/Kunden:** Können Produktideen einreichen und für andere Ideen abstimmen. Wollen gehört werden und sehen, dass ihr Feedback ernst genommen wird.
- **Product Manager (Admin):** Moderiert Ideen, setzt Status-Updates (Geplant, In Arbeit, Erledigt) und nutzt die Voting-Daten für Priorisierungsentscheidungen.

### Bedürfnisse & Pain Points
- Nutzer wollen eine einfache Möglichkeit, Feature-Wünsche zu äußern
- Nutzer wollen sehen, ob ihre Ideen umgesetzt werden (Status-Tracking)
- PM braucht einen zentralen Ort für Feature-Requests statt verstreuter E-Mails/Slack-Nachrichten
- PM will datenbasiert priorisieren statt nach Bauchgefühl

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | PROJ-1: User Authentication | Planned |
| P0 (MVP) | PROJ-2: Public Idea Board | Planned |
| P0 (MVP) | PROJ-3: Idea Submission | Planned |
| P0 (MVP) | PROJ-4: Voting System | Planned |
| P0 (MVP) | PROJ-5: Admin Moderation & Status-Tracking | Planned |
| P1 (Post-MVP) | PROJ-6: Language Switcher (DE/EN) | Planned |

## Success Metrics
- Anzahl eingereichte Ideen pro Woche
- Anzahl aktive Voter pro Woche
- Durchschnittliche Votes pro Idee
- Anteil der Ideen mit Status-Update vom PM

## Constraints
- **Timeline:** MVP in 1-2 Wochen
- **Team:** Solo-Entwicklung mit AI-Unterstützung
- **Tech Stack:** Next.js + Supabase (Auth + PostgreSQL)
- **Budget:** Supabase Free Tier, Vercel Free Tier

## Non-Goals
- Keine Kommentarfunktion auf Ideen (v1)
- Keine Kategorien/Tags (v1)
- Keine E-Mail-Benachrichtigungen
- Kein OAuth/Social Login (nur E-Mail + Passwort)
- Keine öffentliche API
- Kein Multi-Board-Support (nur ein Board)

---

Use `/requirements` to create detailed feature specifications for each item in the roadmap above.
