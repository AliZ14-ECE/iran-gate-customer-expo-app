# Iran Gate — Customer App Implementation Plan

Build a production-ready Expo (SDK 56) mobile app for customers to submit proxy-purchasing requests, review price quotes, pay, and track shipments through a multi-stage logistics pipeline.

## User Review Required

> [!IMPORTANT]
> **Styling approach:** The project was scaffolded from the default Expo SDK 56 template. Your request mentions "NativeWind or standard StyleSheet." I will use **standard `StyleSheet` with a centralized, rich theme file** (dark mode support, premium color palette, typography) since NativeWind isn't already configured and the default template uses `StyleSheet`. This avoids adding a Tailwind build step.

> [!IMPORTANT]
> **Tab Navigation:** Expo SDK 56's template uses `NativeTabs` from `expo-router/unstable-native-tabs`. I'll replace this with the standard Expo Router `Tabs` component (from `expo-router`) for broader compatibility and easier customization with custom tab bar styling. If you prefer native tabs, let me know.

> [!IMPORTANT]
> **Existing files cleanup:** The scaffolded template has boilerplate files (`explore.tsx`, `index.tsx`, `animated-icon.*`, `hint-row.tsx`, etc.). I'll **remove or replace** all template boilerplate — the entire `src/app/`, `src/components/`, and `src/constants/` will be rebuilt from scratch. Only `src/global.css`, `src/hooks/use-color-scheme.ts`, and `assets/` will be preserved.

## Open Questions

> [!NOTE]
> **Payment flow:** The spec mentions "Proceed to Payment" but no payment endpoint is listed. I'll implement the button as a placeholder that shows an alert ("Payment integration coming soon") since no `POST /orders/{id}/pay` endpoint was provided.

> [!NOTE]
> **`.env` file:** I'll create a `.env` file with `EXPO_PUBLIC_API_URL=https://irangate-api.onrender.com/api/v1` as the default. Adjust as needed.

---

## Proposed Changes

### Phase 0: Dependencies & Configuration

#### [MODIFY] [package.json](file:///c:/development/iran-gate/front-end/customer-app/package.json)
Install required dependencies:
- `axios` — HTTP client
- `zustand` — state management  
- `expo-secure-store` — secure JWT storage
- `expo-image-picker` — screenshot uploads
- `expo-notifications` — push notification tokens
- `@expo/vector-icons` — icon library (already available via Expo)

#### [NEW] [.env](file:///c:/development/iran-gate/front-end/customer-app/.env)
```
EXPO_PUBLIC_API_URL=https://irangate-api.onrender.com/api/v1
```

#### [MODIFY] [app.json](file:///c:/development/iran-gate/front-end/customer-app/app.json)
Add `expo-notifications` and `expo-image-picker` plugins for proper native configuration.

---

### Phase 1: Theme & Design System

#### [NEW] [src/theme/colors.ts](file:///c:/development/iran-gate/front-end/customer-app/src/theme/colors.ts)
Premium dark/light color palette with:
- **Primary**: Deep indigo/violet gradient tones
- **Accent**: Warm amber/gold for CTAs
- **Semantic**: Success (emerald), Warning (amber), Error (rose), Info (sky)
- **Surface**: Card, elevated, and backdrop colors

#### [NEW] [src/theme/typography.ts](file:///c:/development/iran-gate/front-end/customer-app/src/theme/typography.ts)
Font sizes, weights, and line heights for headings, body, captions.

#### [NEW] [src/theme/spacing.ts](file:///c:/development/iran-gate/front-end/customer-app/src/theme/spacing.ts)
4px-based spacing scale and border radius tokens.

#### [NEW] [src/theme/index.ts](file:///c:/development/iran-gate/front-end/customer-app/src/theme/index.ts)
Re-exports all theme tokens.

#### [DELETE] [src/constants/theme.ts](file:///c:/development/iran-gate/front-end/customer-app/src/constants/theme.ts)
Replace with the new theme system.

---

### Phase 2: API & Auth Infrastructure

#### [NEW] [src/services/api.ts](file:///c:/development/iran-gate/front-end/customer-app/src/services/api.ts)
Axios instance with:
- `baseURL` from `EXPO_PUBLIC_API_URL`
- Request interceptor to attach `Authorization: Bearer <token>` from SecureStore
- Response interceptor to catch 401s and trigger logout

#### [NEW] [src/services/authService.ts](file:///c:/development/iran-gate/front-end/customer-app/src/services/authService.ts)
- `login(email, password)` → `POST /auth/login`
- `register(name, email, password)` → `POST /auth/register`
- `registerPushToken(token)` → `POST /notifications/register`

#### [NEW] [src/services/orderService.ts](file:///c:/development/iran-gate/front-end/customer-app/src/services/orderService.ts)
- `createOrder(payload)` → `POST /orders`
- `getOrders()` → `GET /orders`
- `getOrderById(id)` → `GET /orders/{id}`
- `uploadImage(file)` → `POST /upload` (multipart/form-data)

#### [NEW] [src/services/catalogService.ts](file:///c:/development/iran-gate/front-end/customer-app/src/services/catalogService.ts)
- `getCatalog()` → `GET /catalog`

#### [NEW] [src/store/useAuthStore.ts](file:///c:/development/iran-gate/front-end/customer-app/src/store/useAuthStore.ts)
Zustand store managing:
- `token: string | null`
- `user: { id, name, email } | null`
- `isLoading: boolean`
- `login()`, `register()`, `logout()`, `hydrate()` actions
- `hydrate()` reads token from SecureStore on app start

#### [NEW] [src/utils/notifications.ts](file:///c:/development/iran-gate/front-end/customer-app/src/utils/notifications.ts)
Helper to request notification permissions and get Expo push token.

#### [NEW] [src/utils/formatters.ts](file:///c:/development/iran-gate/front-end/customer-app/src/utils/formatters.ts)
- `formatCurrency(amount)` — formats number to USD-style string
- `formatDate(dateString)` — human-readable date formatting
- `getStatusLabel(status)` — maps status enum to display string

---

### Phase 3: Reusable UI Components

#### [NEW] [src/components/ui/Button.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/components/ui/Button.tsx)
Primary, secondary, and outline button variants with loading state, press animation.

#### [NEW] [src/components/ui/Input.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/components/ui/Input.tsx)
Styled text input with label, error state, and icon support.

#### [NEW] [src/components/ui/Card.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/components/ui/Card.tsx)
Elevated card container with shadow and border radius.

#### [NEW] [src/components/ui/StatusBadge.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/components/ui/StatusBadge.tsx)
Colored badge showing order status with appropriate icon.

#### [NEW] [src/components/OrderCard.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/components/OrderCard.tsx)
List item card for the home screen showing order title, status badge, declared price, and date.

#### [NEW] [src/components/Timeline.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/components/Timeline.tsx)
Vertical status timeline component showing all 7 logistics stages:
`PENDING_QUOTATION → QUOTATION_PROVIDED → PAID → PURCHASED → ARRIVED_FOREIGN_WH → ARRIVED_LOCAL_WH → DELIVERED`

Each step shows: dot indicator (filled/outlined/active), label, and timestamp if available. Active step gets an animated pulse.

#### [NEW] [src/components/FAB.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/components/FAB.tsx)
Floating Action Button with shadow and press animation for "Create New Request."

#### [NEW] [src/components/EmptyState.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/components/EmptyState.tsx)
Illustrated empty state for when there are no orders.

#### [NEW] [src/components/LoadingScreen.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/components/LoadingScreen.tsx)
Full-screen loading indicator during auth hydration.

#### [DELETE] Template boilerplate files:
- `src/components/animated-icon.tsx`
- `src/components/animated-icon.web.tsx`
- `src/components/animated-icon.module.css`
- `src/components/app-tabs.tsx`
- `src/components/app-tabs.web.tsx`
- `src/components/external-link.tsx`
- `src/components/hint-row.tsx`
- `src/components/themed-text.tsx`
- `src/components/themed-view.tsx`
- `src/components/web-badge.tsx`
- `src/components/ui/` (existing subdirectory — will be replaced)

---

### Phase 4: App Routing & Screens

#### [NEW] [src/app/_layout.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/_layout.tsx)
Root layout:
- Wraps app in `ThemeProvider`
- Calls `useAuthStore.hydrate()` on mount
- Shows `LoadingScreen` while hydrating
- Uses Expo Router `Stack` for root navigation
- Auth guard: if no token → redirect to `(auth)/login`

#### [NEW] [src/app/(auth)/_layout.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/(auth)/_layout.tsx)
Stack layout for auth screens (no header).

#### [NEW] [src/app/(auth)/login.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/(auth)/login.tsx)
Login screen:
- Email & password inputs
- Login button with loading state
- Link to register screen
- On success: save JWT → request push permission → send push token → navigate to home
- Error handling with `Alert.alert`

#### [NEW] [src/app/(auth)/register.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/(auth)/register.tsx)
Register screen:
- Name, email, password inputs
- Register button with loading state
- Link back to login
- On success: auto-login → same post-login flow

#### [NEW] [src/app/(tabs)/_layout.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/(tabs)/_layout.tsx)
Tab layout with 3 tabs:
- **Home** (house icon) — order dashboard
- **Catalog** (grid icon) — product catalog
- **Profile** (user icon) — user profile & logout

Custom styled tab bar with premium styling.

#### [NEW] [src/app/(tabs)/index.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/(tabs)/index.tsx)
Home Dashboard:
- Header greeting with user name
- Summary stats (active orders count)
- `FlatList` of user's orders (`GET /orders`)
- Each item is an `OrderCard` linking to `/orders/[id]`
- FAB linking to `/orders/create`
- Pull-to-refresh
- Empty state if no orders

#### [NEW] [src/app/(tabs)/catalog.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/(tabs)/catalog.tsx)
Catalog screen:
- Grid (`FlatList` with `numColumns={2}`)
- Product cards with image, title, price
- Fetches from `GET /catalog`
- Pull-to-refresh

#### [NEW] [src/app/(tabs)/profile.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/(tabs)/profile.tsx)
Profile screen:
- User avatar (initial letter circle)
- Name & email display
- Logout button that clears SecureStore and resets auth state

#### [NEW] [src/app/orders/create.tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/orders/create.tsx)
Create Order screen:
- Form inputs: `source_url`, `title`, `description`, `declared_price`
- Image upload section (pick from gallery → upload to `POST /upload` → collect URLs)
- Thumbnail preview of uploaded images with remove ability
- Submit button → `POST /orders`
- On success: navigate to order detail

#### [NEW] [src/app/orders/[id].tsx](file:///c:/development/iran-gate/front-end/customer-app/src/app/orders/[id].tsx)
Order Detail & Tracking:
- Header with order title and status badge
- `Timeline` component showing current progress
- Order info section (source URL, description, declared price)
- **Quotation section** (visible when `status === 'QUOTATION_PROVIDED'`):
  - Displays `verified_price`, `shipping_fee`, `weight`
  - "Proceed to Payment" button
- Image gallery of attached screenshots

#### [DELETE] Template screen files:
- `src/app/index.tsx` (template home)
- `src/app/explore.tsx` (template explore)

---

### Phase 5: Cleanup & Polish

#### [MODIFY] [src/hooks/use-theme.ts](file:///c:/development/iran-gate/front-end/customer-app/src/hooks/use-theme.ts)
Update to use the new theme system.

#### [DELETE] [src/hooks/use-color-scheme.web.ts](file:///c:/development/iran-gate/front-end/customer-app/src/hooks/use-color-scheme.web.ts)
Not needed — we'll use `react-native`'s `useColorScheme` directly.

---

## File Summary

| Phase | New | Modified | Deleted |
|-------|-----|----------|---------|
| 0: Config | 1 (.env) | 2 (package.json, app.json) | 0 |
| 1: Theme | 4 | 0 | 1 |
| 2: Services | 7 | 0 | 0 |
| 3: Components | 9 | 0 | ~11 |
| 4: Screens | 10 | 0 | 2 |
| 5: Polish | 0 | 1 | 1 |
| **Total** | **~31** | **3** | **~15** |

---

## Verification Plan

### Automated Tests
```bash
npx expo start
```
- Verify the app starts without crashes
- Verify TypeScript compiles without errors

### Manual Verification
1. **Auth flow**: Register → Login → JWT saved → push token prompt
2. **Home**: Orders list renders, FAB navigates to create form
3. **Create Order**: Form validation, image upload, order submission
4. **Order Detail**: Timeline renders, quotation section appears conditionally
5. **Catalog**: Grid layout renders with product cards
6. **Profile**: Logout clears state and returns to login
7. **Error handling**: Disconnect backend → verify error alerts appear
