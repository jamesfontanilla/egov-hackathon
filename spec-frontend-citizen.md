# 👥 SPEC 3: Citizen Portal & AI Module (Developer C — Frontend)
## ePondo — Public Transparency, Reporting & AI Assistant

> **Owner:** Developer C (Frontend — Citizen)  
> **Stack:** Nuxt 3 (Vue.js) + TailwindCSS + Leaflet (map) + Pinia  
> **Runs on:** Laptop 3  
> **Depends on:** Laptop 1 (Backend API at `http://<laptop1-ip>:3000`)  
> **Coordination:** Consumes REST API from Backend; no direct eGov API calls

---

## Scope

This spec covers:
- Public project transparency page (no login required)
- Citizen login via eGovPH SSO
- Citizen complaint filing (eReport integration)
- OTP verification flow
- Complaint tracking by case number
- AI Budget Assistant chatbot
- Laws & Regulations query interface
- Multilingual support (Translator integration)
- Landing page & marketing site

This spec does NOT cover:
- Backend/API logic (Spec 1)
- Treasurer/CBO dashboard (Spec 2)

---

## Task 1: Project Scaffolding

### 1.1 Initialize Nuxt 3 Project

```bash
npx nuxi@latest init epondo-citizen
cd epondo-citizen
npm install @pinia/nuxt @nuxtjs/tailwindcss
npm install @vueuse/core axios leaflet @types/leaflet
npm install marked    # For rendering AI markdown responses
npx tailwindcss init
```

### 1.2 Project Structure

```
epondo-citizen/
├── layouts/
│   ├── default.vue          # Public layout (header + footer)
│   ├── app.vue              # Authenticated citizen layout
│   └── chat.vue             # Full-screen AI chat layout
├── pages/
│   ├── index.vue            # Landing page / marketing
│   ├── login.vue            # eGovPH SSO for citizens
│   ├── callback.vue         # SSO callback
│   ├── projects/
│   │   ├── index.vue        # Public project browser (no auth)
│   │   └── [barangay].vue   # Projects in a specific barangay
│   ├── report/
│   │   ├── index.vue        # Start new complaint
│   │   ├── submit.vue       # Complaint form (multi-step)
│   │   ├── verify.vue       # OTP verification
│   │   └── track.vue        # Track by case number
│   ├── assistant/
│   │   ├── index.vue        # AI Budget Assistant chat
│   │   └── laws.vue         # Laws & Regulations query
│   └── about.vue            # About ePondo
├── components/
│   ├── landing/
│   │   ├── HeroSection.vue
│   │   ├── FeaturesGrid.vue
│   │   ├── ApiShowcase.vue
│   │   └── CtaSection.vue
│   ├── projects/
│   │   ├── ProjectCard.vue
│   │   ├── ProjectMap.vue
│   │   └── BarangaySelector.vue
│   ├── report/
│   │   ├── LocationPicker.vue       # Map + cascading dropdowns
│   │   ├── EvidenceUpload.vue       # Photo/document upload
│   │   ├── OtpInput.vue             # 6-digit OTP entry
│   │   ├── ComplaintForm.vue        # Full form component
│   │   └── CaseTracker.vue          # Status timeline
│   ├── assistant/
│   │   ├── ChatWindow.vue           # Message list
│   │   ├── ChatInput.vue            # Text input + send
│   │   ├── ChatBubble.vue           # Individual message
│   │   ├── SuggestedQuestions.vue   # Quick prompts
│   │   └── LanguageToggle.vue       # EN/FIL switcher
│   └── common/
│       ├── PublicHeader.vue
│       ├── PublicFooter.vue
│       ├── MobileNav.vue
│       └── LoadingDots.vue
├── composables/
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useReport.ts
│   ├── useAssistant.ts
│   └── useTranslator.ts
├── stores/
│   ├── auth.store.ts
│   ├── report.store.ts
│   └── chat.store.ts
└── middleware/
    ├── citizen-auth.ts      # Require login for complaint filing
    └── public.ts            # Allow unauthenticated access
```

---

## Task 2: Landing Page & Public Pages

### 2.1 Landing Page (`pages/index.vue`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [ePondo Logo]                    [Projects] [Report] [AI] Login │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│              🇵🇭 ePondo                                           │
│     Transparent Local Governance                                  │
│     for Every Filipino                                            │
│                                                                   │
│     Track your barangay's budget,                                │
│     report issues, and ask questions                             │
│     powered by eGov APIs.                                        │
│                                                                   │
│     [View Projects]  [File a Report]  [Ask AI]                   │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ 📊 Budget    │  │ 🛡️ Verified  │  │ 🔗 Blockchain         │  │
│  │ Transparency │  │ by PhilSys   │  │ Anchored              │  │
│  │              │  │ + Liveness   │  │ on eGovchain          │  │
│  └──────────────┘  └──────────────┘  └───────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Powered by 7 eGov APIs:                                    │  │
│  │ [eGovPH] [NationalID] [Face Liveness] [COMPASS]            │  │
│  │ [eMessage] [eReport] [eGov AI]                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Footer: Built for eGovHackathon 2026 • DICT                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Public Projects Browser (`pages/projects/index.vue`)

**No authentication required.**

- Top: BarangaySelector (cascading: Region → Province → Municipality → Barangay)
  - Fetches from: `GET /api/reports/datasets/regions`, etc.
- Map view: Leaflet map showing project locations (from disbursement data)
- List view: ProjectCard components showing:
  - Project name
  - Fund category badge (SK / Calamity / General)
  - Amount (₱ formatted)
  - Status
  - Barangay name
- Source: `GET /api/budgets` (public scope — returns only OPERATIVE/ARCHIVED budgets with disbursements)

### 2.3 Barangay Detail (`pages/projects/[barangay].vue`)

- Budget summary for selected barangay (total, SK ceiling, calamity ceiling)
- Progress bars showing fund utilization
- List of active projects/disbursements
- "Report a Problem" CTA button for each project
- Blockchain hash badge for OPERATIVE/ARCHIVED budgets

---

## Task 3: Citizen Authentication

### 3.1 Citizen Login (`pages/login.vue`)

- Same eGovPH SSO flow as Spec 2 but routes to citizen pages
- "Login with eGov" button → redirect to backend `/api/auth/login`
- Callback stores JWT + user profile (role = CITIZEN)
- Login only required for: filing reports, accessing AI assistant

### 3.2 Auth Middleware

- `/projects/*` pages: PUBLIC (no auth needed)
- `/report/*` pages: require CITIZEN auth
- `/assistant/*` pages: require CITIZEN auth
- Landing page: PUBLIC

---

## Task 4: Citizen Complaint Filing (eReport)

### 4.1 Report Landing (`pages/report/index.vue`)

- Hero: "Report a Problem in Your Community"
- Description: "File a geotagged complaint about delayed, ghost, or substandard local projects. Your report is verified via OTP and tracked by case number."
- Two options:
  - [File New Report] → goes to /report/submit
  - [Track My Report] → goes to /report/track

### 4.2 Complaint Form — Multi-Step Wizard (`pages/report/submit.vue`)

```
Step 1: LOCATION
├── Region dropdown (from /api/reports/datasets/regions)
├── Province dropdown (filtered by region)
├── Municipality dropdown (filtered by province)
├── Barangay dropdown (filtered by municipality)
├── Map with draggable pin (Leaflet)
│   └── Auto-captures latitude + longitude
└── [Next]

Step 2: DETAILS
├── Report Type dropdown (from /api/reports/datasets/report-types)
├── Short description / excerpt (text, max 200 chars)
├── Full message / complaint body (textarea, max 2000 chars)
├── Evidence upload (up to 3 photos/documents)
│   └── Upload to backend, receive URLs
└── [Next]

Step 3: VERIFICATION
├── Complainant info (pre-filled from eGovPH profile):
│   ├── First name, middle name, last name
│   ├── Gender
│   ├── Mobile number
│   └── Email address
├── [Request OTP] → calls POST /api/reports/verify/request { email }
├── OTP Input (6 digits) → calls POST /api/reports/verify/confirm { email, otp }
└── [Submit Report]

Step 4: CONFIRMATION
├── ✅ "Report Submitted Successfully"
├── Case Number: PFM 072226 0001
├── "You will receive updates via email and SMS"
└── [Track This Report] [File Another]
```

### 4.3 LocationPicker Component

```vue
<!-- components/report/LocationPicker.vue -->
<!-- 
  Features:
  - Cascading dropdowns: Region → Province → Municipality → Barangay
  - Leaflet map with draggable marker
  - Reverse geocoding to auto-fill PSGC codes
  - Emits: { psgcCode, provinceName, municipalityCode, municipalityName, 
             barangayCode, barangayName, latitude, longitude }
-->
```

### 4.4 EvidenceUpload Component

```vue
<!-- components/report/EvidenceUpload.vue -->
<!--
  Features:
  - Drag & drop or click to upload
  - Accept: .jpg, .jpeg, .png, .pdf (max 5MB each)
  - Preview thumbnails
  - Max 3 files
  - Upload to backend storage → returns array of URLs
  - Emits: { evidences: string[] }
-->
```

### 4.5 OtpInput Component

```vue
<!-- components/report/OtpInput.vue -->
<!--
  Features:
  - 6 individual digit boxes
  - Auto-advance on input
  - Paste support (pastes full OTP)
  - Timer: "Resend OTP in 60s"
  - Emits: { otp: string } when all 6 digits filled
-->
```

---

### 4.6 Report Tracking (`pages/report/track.vue`)

- Input: Case number field (format: `PFM MMDDYY XXXX`)
- Button: "Track Report"
- Calls: `GET /api/reports/:caseNumber`
- Displays:
  - Status timeline (submitted → under review → resolved)
  - Original complaint details
  - Any updates/responses
  - Barangay + location on mini-map

### 4.7 CaseTracker Component

```vue
<!-- components/report/CaseTracker.vue -->
<!--
  Props: { caseData: ReportDetail }
  Features:
  - Vertical timeline with status nodes
  - Each node: date, status label, description
  - Active/completed/pending visual states
  - Location mini-map (read-only Leaflet)
-->
```

---

## Task 5: AI Budget Assistant

### 5.1 Chat Interface (`pages/assistant/index.vue`)

```
┌─────────────────────────────────────────────────┐
│  🤖 ePondo AI Assistant         [FIL/EN toggle] │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │ Welcome! I can help you understand your     │  │
│  │ barangay's budget. Ask me anything about:   │  │
│  │ • SK Fund allocation                        │  │
│  │ • Calamity Fund rules                       │  │
│  │ • Project spending in your area             │  │
│  │ • Philippine budget laws                    │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │ Suggested Questions:                        │  │
│  │ [What is the SK 10% allocation?]            │  │
│  │ [How much is our calamity fund?]            │  │
│  │ [Ano ang RA 10742?]                         │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  ┌─ User ──────────────────────────────────────┐  │
│  │ How much of our barangay budget goes to SK? │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  ┌─ AI ────────────────────────────────────────┐  │
│  │ Under RA 10742 (SK Reform Act), 10% of the │  │
│  │ annual barangay budget must be allocated... │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
├─────────────────────────────────────────────────┤
│  [Type your question...]              [Send ▶]  │
└─────────────────────────────────────────────────┘
```

### 5.2 Chat Store (`stores/chat.store.ts`)

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;      // Markdown content for AI responses
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  language: 'en' | 'fil';
  isTyping: boolean;
  credits: { total: number; remaining: number } | null;
}
```

### 5.3 Chat Flow Logic (`composables/useAssistant.ts`)

```typescript
async function sendMessage(prompt: string) {
  // 1. Add user message to store
  // 2. Set isTyping = true
  // 3. If language === 'fil', translate prompt to English first:
  //    POST /api/ai/translate { prompt, source_lang: "fil", target_lang: "en" }
  // 4. Send to AI Assistant:
  //    POST /api/ai/assistant { prompt: translatedPrompt, category: "PH" }
  // 5. If language === 'fil', translate response back:
  //    POST /api/ai/translate { prompt: response, source_lang: "en", target_lang: "fil" }
  // 6. Add AI response to store (render as Markdown)
  // 7. Set isTyping = false
  
  // Credit awareness:
  // Each call uses credits. Check /api/ai/credits periodically.
  // If credits_remaining < 10, show warning banner.
}
```

### 5.4 LanguageToggle Component

```vue
<!-- components/assistant/LanguageToggle.vue -->
<!-- 
  Toggle between English and Filipino
  When Filipino selected:
  - User input sent through Translator before AI
  - AI response translated back to Filipino
  - Suggested questions shown in Filipino
-->
```

### 5.5 SuggestedQuestions Component

```vue
<!-- components/assistant/SuggestedQuestions.vue -->
<!--
  English suggestions:
  - "What is the SK 10% allocation under RA 10742?"
  - "How is the calamity fund calculated?"
  - "Can I check my barangay's budget status?"
  - "What laws govern local government budgets?"
  
  Filipino suggestions:
  - "Ano ang 10% SK allocation sa RA 10742?"
  - "Paano kinakalkula ang calamity fund?"
  - "Pwede ko bang tingnan ang budget ng barangay namin?"
  - "Anong batas ang sumasaklaw sa budget ng LGU?"
-->
```

---

## Task 6: Laws & Regulations Page

### 6.1 Laws Query Interface (`pages/assistant/laws.vue`)

- Separate page focused on legal/regulatory queries
- Pre-built query templates:
  - "What does RA 7160 say about barangay budget preparation?"
  - "What are the penalties for exceeding SK allocation?"
  - "What is the role of the City Budget Officer in budget approval?"
- Input: Natural language question
- Calls: `POST /api/ai/laws { prompt, category: "PH" }`
- Response: Rendered as Markdown with legal context
- Attribution: "Powered by eGov AI — Laws & Regulations"

---

## Task 7: Multilingual Support

### 7.1 Static String Translations

```typescript
// i18n/index.ts
const translations = {
  en: {
    nav: { projects: 'Projects', report: 'Report', assistant: 'AI Assistant', login: 'Login' },
    hero: { title: 'Transparent Local Governance for Every Filipino', subtitle: '...' },
    report: { title: 'Report a Problem', step1: 'Location', step2: 'Details', step3: 'Verify' },
    // ...
  },
  fil: {
    nav: { projects: 'Mga Proyekto', report: 'Mag-report', assistant: 'AI Katulong', login: 'Mag-login' },
    hero: { title: 'Transparent na Pamamahala para sa Bawat Pilipino', subtitle: '...' },
    report: { title: 'Mag-report ng Problema', step1: 'Lokasyon', step2: 'Detalye', step3: 'Beripikasyon' },
    // ...
  }
};
```

### 7.2 Dynamic Content Translation

For AI responses and notification text, use the Translator endpoint:
```typescript
// POST /api/ai/translate
{ "prompt": "Your report has been submitted.", "source_lang": "en", "target_lang": "fil" }
```

---

## Task 8: Map Integration (Leaflet)

### 8.1 Project Map (`components/projects/ProjectMap.vue`)

```typescript
// Features:
// - Leaflet map centered on Philippines (lat: 12.8797, lng: 121.7740, zoom: 6)
// - Clustered markers for projects by barangay
// - Marker popup: project name, amount, fund category, status
// - Click marker → navigate to barangay detail page
// - OpenStreetMap tiles (free, no API key needed)

// Tile URL: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### 8.2 Location Picker Map (for reports)

```typescript
// Features:
// - Draggable marker for precise location
// - Default: center on user's municipality (from profile)
// - On drag end: capture lat/lng
// - Reverse geocode display: "Brgy. Poblacion, Alaminos, Pangasinan"
// - Zoom controls + geolocation button ("Use my location")
```

---

## Task 9: Responsive Design & PWA

### 9.1 Mobile-First Layout

- All pages designed for 360px minimum width
- Bottom navigation bar on mobile (Projects | Report | AI | Profile)
- Touch-friendly: minimum 44px tap targets
- Swipe gestures for wizard steps

### 9.2 PWA Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ePondo — Transparent Local Governance',
      short_name: 'ePondo',
      theme_color: '#1a56db',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ]
    }
  }
});
```

### 9.3 Offline Capability (Service Worker)

- Cache: landing page, static assets, last-viewed project data
- Offline banner: "You're offline. Some features may be limited."
- Queue complaint submissions when offline → sync when back online

---

## Task 10: Credits & Rate Limit Awareness

### 10.1 AI Credits Display

- Show remaining credits in AI Assistant header: "Credits: 185/200"
- Warning banner when < 20 credits: "Limited AI queries remaining"
- If 0 credits: disable AI send button, show "Credits exhausted" message

### 10.2 Credit Check

```typescript
// On assistant page mount:
const { data } = await useApi().client.get('/api/ai/credits');
// { credits_total: 200, credits_used: 15, credits_remaining: 185 }
```

---

## Deliverables Checklist

- [ ] Nuxt 3 project running on Laptop 3
- [ ] Landing page with hero, features, API showcase
- [ ] Public projects browser (no auth): map + list view
- [ ] Barangay detail page with budget summary + disbursements
- [ ] Citizen eGovPH SSO login
- [ ] Complaint filing multi-step wizard:
  - [ ] Cascading location dropdowns (Region→Province→Municipality→Barangay)
  - [ ] Leaflet map with draggable pin
  - [ ] Evidence photo upload (up to 3)
  - [ ] OTP email verification (request + 6-digit confirm)
  - [ ] Success page with case number
- [ ] Report tracking by case number
- [ ] AI Budget Assistant chat interface
  - [ ] Markdown rendering for AI responses
  - [ ] Language toggle (English/Filipino with Translator)
  - [ ] Suggested questions
  - [ ] Credit counter
- [ ] Laws & Regulations query page
- [ ] Filipino/English static string translations
- [ ] Responsive design (360px mobile-first)
- [ ] PWA manifest + service worker basics

---

## Integration Contract with Backend (Laptop 1)

### Key API Calls from This Frontend
```
# Public (no auth)
GET  /api/budgets?status=OPERATIVE,ARCHIVED&public=true  → Public project data
GET  /api/reports/datasets/regions                        → Location dropdowns
GET  /api/reports/datasets/provinces?region_code=X
GET  /api/reports/datasets/municipalities?province_code=X
GET  /api/reports/datasets/barangays?municipality_code=X
GET  /api/reports/datasets/report-types

# Authenticated (CITIZEN role)
POST /api/auth/callback                                   → Login
GET  /api/auth/me                                         → Profile

# eReport flow
POST /api/reports/verify/request    { email }             → Send OTP
POST /api/reports/verify/confirm    { email, otp }        → Verify OTP
POST /api/reports/submit            { full complaint }    → Submit report
GET  /api/reports/:caseNumber                             → Track report
GET  /api/reports                                         → My reports list

# AI endpoints
POST /api/ai/assistant    { prompt, category: "PH" }     → Budget query
POST /api/ai/laws         { prompt, category: "PH" }     → Laws query
POST /api/ai/translate    { prompt, source_lang, target_lang }  → Translate
GET  /api/ai/credits                                      → Check credits
```

---

## Parallel Development Notes

| What | This Spec (Laptop 3) | Backend (Laptop 1) | Official UI (Laptop 2) |
|------|----------------------|--------------------|-----------------------|
| Auth | Same SSO flow, but routes to citizen pages | Provides unified `/api/auth/*` | Routes to official pages |
| Projects | Public read access | Returns public-scoped data | Not shown (CBO sees all) |
| Reports | Full complaint flow | Proxies to eReport API | Not applicable |
| AI | Chat + Laws + Translate | Proxies to eGov AI API | Only document extractor |
| Map | Leaflet for projects + location picker | Returns lat/lng data | Not applicable |
| COMPASS | Not shown to citizens | Provides to CBO only | Full COMPASS explorer |

**No merge conflicts:** Each laptop works on its own Nuxt project. Backend exposes unified API consumed by both frontends via different endpoints/scopes.
