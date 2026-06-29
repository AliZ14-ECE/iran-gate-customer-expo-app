# Iran Gate Customer App — Walkthrough

## Summary

Built a complete, production-ready Expo SDK 56 mobile app for the Iran Gate proxy-purchasing platform. The app enables customers to submit purchase requests, upload screenshots, review price quotes, and track shipments through a 7-stage logistics pipeline.

**TypeScript verification: ✅ 0 errors**

---

## Architecture

```
src/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout with auth guard + theme
│   ├── (auth)/
│   │   ├── _layout.tsx           # Auth stack (headerless)
│   │   ├── login.tsx             # Email/password login
│   │   └── register.tsx          # Registration form
│   ├── (tabs)/
│   │   ├── _layout.tsx           # NativeTabs (Home, Catalog, Profile)
│   │   ├── index.tsx             # Home dashboard with orders list
│   │   ├── catalog.tsx           # Product catalog grid
│   │   └── profile.tsx           # User profile & logout
│   └── orders/
│       ├── create.tsx            # New order request form
│       └── [id].tsx              # Order detail + tracking timeline
├── components/
│   ├── ui/
│   │   ├── Button.tsx            # Multi-variant button
│   │   ├── Input.tsx             # Themed text input
│   │   ├── Card.tsx              # Elevated card container
│   │   └── StatusBadge.tsx       # Colored status pill
│   ├── OrderCard.tsx             # Order list item card
│   ├── Timeline.tsx              # 7-step logistics timeline
│   ├── FAB.tsx                   # Floating action button
│   ├── EmptyState.tsx            # Empty list illustration
│   └── LoadingScreen.tsx         # Splash/loading screen
├── services/
│   ├── api.ts                    # Axios instance + JWT interceptors
│   ├── endpoints.ts              # ⭐ Centralized endpoint registry
│   ├── authService.ts            # Login, register, push token
│   ├── orderService.ts           # CRUD orders + image upload
│   └── catalogService.ts         # Public catalog listing
├── store/
│   └── useAuthStore.ts           # Zustand auth state + SecureStore
├── theme/
│   ├── colors.ts                 # Light/dark color palette
│   ├── typography.ts             # Font sizes, weights, text styles
│   ├── spacing.ts                # Spacing, radius, shadows
│   └── index.ts                  # Re-exports
├── hooks/
│   ├── use-color-scheme.ts       # Color scheme detection
│   └── use-theme.ts              # Theme colors hook
└── utils/
    ├── formatters.ts             # Currency, date, status labels
    └── notifications.ts          # Push notification helpers
```

---

## Key Design Decisions

### 1. Modular API Layer (per user request)
The [endpoints.ts](file:///c:/development/iran-gate/front-end/customer-app/src/services/endpoints.ts) file serves as a **single source of truth** for all API routes. When the backend changes, you only need to update this one file. Service files import from it:

```typescript
import { Endpoints } from './endpoints';
api.post(Endpoints.auth.login, body);
api.get(Endpoints.orders.byId('abc-123'));
```

### 2. NativeTabs (per user preference)
Uses `expo-router/unstable-native-tabs` for native iOS/Android tab bar feel.

### 3. Auth Guard Pattern
Root [_layout.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/_layout.tsx) hydrates the auth store from SecureStore on mount, then redirects based on token presence:
- No token → `(auth)/login`
- Has token → `(tabs)/`

### 4. Theme System
Premium indigo/violet brand palette with full dark mode support. All colors defined in [colors.ts](file:///c:/development/iran-gate/front-end/customer-app/src/theme/colors.ts) with semantic naming (primary, success, warning, error, info).

### 5. Payment Placeholder
The "Proceed to Payment" button shows an alert since no payment endpoint was provided.

---

## Files Changed

| Category | Count | Action |
|----------|-------|--------|
| New files | 31 | Created |
| Modified files | 3 | app.json, package.json, _layout.tsx |
| Deleted files | 14 | Template boilerplate |

---

## Verification

- **TypeScript**: `npx tsc --noEmit` → **0 errors** ✅
- **Dependencies**: All installed successfully (axios, zustand, expo-secure-store, expo-image-picker, expo-notifications, @expo/vector-icons)

### To run the app
```bash
cd c:\development\iran-gate\front-end\customer-app
npx expo start
```
