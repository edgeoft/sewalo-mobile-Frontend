# Sewalo Mobile — Agent Directives

> [!IMPORTANT]
> **Project Branding & Identity:**
> This application is **Sewalo Mobile** (`sewalo-mobile-Frontend`), the cross-platform mobile client for consumers and service providers across iOS and Android. Never refer to the application as "Sipalu.com" in user-facing content, documentation, or code.

---

## 1. Project Context & Stack
- Cross-platform mobile app for consumers (discovery, booking) and service providers (jobs, earnings).
- **Framework**: Expo SDK 56 (Managed Workflow, Prebuild)
- **Core Engine**: React Native 0.85 (New Architecture enabled, Fabric renderer, TurboModules, JSI, Hermes engine)
- **UI Library**: React 19.2
- **Language**: TypeScript 6 (Strict Mode)
- **Routing**: Expo Router (Type-safe file-based navigation)
- **Styling**: Uniwind (Tailwind CSS utility classes in React Native)
- **State Management**: `@tanstack/react-query` v5 (server data) & `zustand` v5 (client UI/auth state)
- **Forms & Validation**: `react-hook-form` v7 & `zod` v4
- **Animations**: `react-native-reanimated` v4 (UI thread worklets)
- **List Rendering**: `@shopify/flash-list` (Virtualized list recycling)
- **Asset Caching**: `expo-image` (Native memory & disk caching)
- **Secure Storage**: `expo-secure-store` (Hardware-backed keychain encryption)
- **Observability**: `@sentry/react-native`

---

## 2. Non-Negotiable Golden Rules
1. **Smallest Diff**: Never rewrite a file wholesale. Make the smallest diff that satisfies the task.
2. **Zero "any" & Zero Casts**: Never use `any`. Never use `as` casts unless required at native boundaries.
3. **No Bare Fetch/Axios in Components**: All data fetching must flow through typed services (`src/api/services/`) and TanStack Query hooks. Never call `axios` or `fetch` directly in UI components.
4. **Styling Discipline**:
   - ❌ **NEVER** use hardcoded hex colors (`#ffffff`, `#000000`, `#22c55e`, `#ef4444`) or inline style colors (`style={{ backgroundColor: '#1a1a1a' }}`).
   - ❌ **NEVER** use arbitrary Tailwind classes like `bg-[#0f172a]`.
   - ❌ **NEVER** use negative pixel margins (`mt-[-10px]`, `top-[-12px]`, `marginVertical: -15`).
   - ❌ **NEVER** hardcode screen-width calculations like `width: 375` or `w-[360px]`.
   - ✅ **ALWAYS** use Uniwind semantic tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-destructive`.
   - ✅ **ALWAYS** use standard scale (`px-4`, `py-6`, `gap-2`, `gap-4`). Use `flex-1` for expanding containers and `SafeAreaView` from `react-native-safe-area-context`.
   - ✅ **Minimum tap target size**: 44x44 points (`min-h-[44px] min-w-[44px]` or `p-3`).
5. **Verification Command**:
   ```bash
   npx tsc --noEmit && npx expo lint
   ```
   Must pass with zero errors before completion.

---

## 3. Folder Structure & Placement
```
sewalo-mobile-Frontend/
├── android/ & ios/               # Native project wrappers
├── assets/                       # Static assets (fonts, icons, splash images)
├── scripts/                      # Build, release, and code-generation scripts
├── src/
│   ├── app/                      # Expo Router navigation tree (file-based)
│   │   ├── (auth)/               # Mobile auth screens: login, register, OTP verification
│   │   ├── (customer)/           # Customer flow: home, bookings, profile, search
│   │   ├── (provider)/           # Provider flow: dashboard, jobs, earnings, schedule
│   │   └── _layout.tsx           # Root navigation provider & modal stacks
│   ├── api/                      # Networking layer
│   │   ├── client/               # Axios instance, interceptors, queryConfig
│   │   └── services/             # Feature API services (actions.ts, hooks.ts, types.ts)
│   ├── components/               # UI components
│   │   ├── ui/                   # Core design system primitives (Button, Input, Snackbar)
│   │   └── shared/               # Composite shared widgets (Header, BookingCard)
│   ├── constants/                # Immutable constants (queryKeys, roles, images, services)
│   ├── features/                 # Domain-specific feature modules
│   │   ├── customer/             # Customer screens, sub-components, and logic
│   │   ├── onboarding/           # Onboarding walkthrough and carousel screens
│   │   └── services/             # Service filtering, discovery, and booking workflows
│   ├── hooks/                    # Reusable React hooks (location, network status, debounce)
│   ├── i18n/                     # Localization setup (en, ne)
│   ├── store/                    # Zustand stores (useAuthStore.ts, useServiceFiltersStore.ts)
│   └── types/                    # Canonical TypeScript interfaces & type definitions
├── app.config.ts                 # Dynamic Expo configuration & environment variables
└── metro.config.js               # Metro bundler configuration with Uniwind transformer
```

---

## 4. State Placement Rules
- **Server Data**: Handled strictly by TanStack Query (`@tanstack/react-query`) through typed service actions. Never call `axios` or `fetch` directly in UI components.
- **Cross-Screen Client State**: Managed by Zustand stores in `src/store/` (e.g., `useAuthStore.ts`, `useServiceFiltersStore.ts`).
- **Form State**: Managed by `react-hook-form` with `zod` schemas. Never use component `useState` for individual form inputs.
- **Ephemeral State**: Component-local `useState` for simple UI toggles.
- **Animation Values**: Use `useRef` or Reanimated Shared Values (`useSharedValue`). Never store per-frame values in `useState`.

---

## 5. Naming & Code Conventions
- **Variables & Properties**: `camelCase` (`selectedCategorySlug`, `serviceLocation`, `radius`)
- **Functions & Methods**: `camelCase` (`handleBookService()`, `setSelectedCategorySlug()`)
- **Boolean Flags**: `camelCase` starting with `is`, `has`, `can`, or `should` (`isLoading`, `hasActiveBooking`, `canProceed`)
- **Components & Files**: `PascalCase` (`BookingCard.tsx`, `ServiceFilterModal.tsx`)
- **Custom Hooks**: `camelCase` starting with `use` (`useLocation.ts`, `useNetworkStatus.ts`, `useAuth.ts`)
- **Types & Interfaces**: `PascalCase` (`BookingDetails`, `ServicePayload`, `CustomerProfile`)
- **Constants & Enum Maps**: `UPPER_SNAKE_CASE` with `as const` (`USER_ROLES`, `BOOKING_STATUSES`, `QUERY_KEYS`)
- **Zod Schemas**: `PascalCase` suffixed with `Schema` (`BookingPayloadSchema`, `ProfileUpdateSchema`)
- **Derived Schema Types**: `PascalCase` suffixed with `Payload` or `Values` (`type BookingPayload = z.infer<typeof BookingPayloadSchema>`)
- **Zustand Stores**: File `useXxxStore.ts`, export `useXxxStore` (`export const useAuthStore = create<AuthState>()(...)`)
- **TanStack Query Keys**: Centralized `QUERY_KEYS` (`QUERY_KEYS.BOOKINGS.DETAIL(id)`)
- **Query / Mutation Hooks**: `camelCase` (`useBookingDetailsQuery()`, `useCancelBookingMutation()`)
- **CSS Utility Classes**: `kebab-case` Uniwind Tailwind utility classes (`className="flex-1 bg-background px-4 text-foreground"`)

---

## 6. Installed Agent Skills (`.agents/skills/`)
The following official skills have been downloaded and installed directly into `.agents/skills/`:
- `code-review`: Mobile code review, scans for unhandled nulls, FlatList frame drops, insecure AsyncStorage token storage, and architecture compliance (`mattpocock/skills`).
- `typescript-pro`: Strict typing, discriminated unions with exhaustive checks, and branded IDs (`jeffallan/claude-skills`).
- `sentry-react-native-sdk`: Sentry React Native SDK configuration, crash tracing, breadcrumbs, and error boundaries (`getsentry/sentry-agent-skills`).
- `sentry-setup-ai-monitoring`: Sentry error capture and monitoring configuration (`getsentry/sentry-agent-skills`).
- `expo`: 42 mobile performance rules: Hermes bytecode precompilation, startup latency reduction, FlashList virtualization, and UI thread animations (`pproenca/dot-skills`).
- `expo-ui`: SwiftUI component guidelines and Liquid Glass UI patterns for iOS (`pproenca/dot-skills`).
- `vercel-react-native-skills`: React Native best practices, memory management, and architecture (`vercel-labs/agent-skills`).
- `web-design-guidelines`: Mobile UI best practices, accessible touch targets (min 44x44pt), and UX design guidelines (`vercel-labs/agent-skills`).
- `react`: React 19 concurrent features, hooks, and modern patterns (`pproenca/dot-skills`).
- `tailwind`: Uniwind / Tailwind CSS styling rules and theme tokens (`pproenca/dot-skills`).
- `tanstack-query`: Mobile data fetching, offline query caching, screen focus refetch gating, and key invalidation scoping (`pproenca/dot-skills`).
- `react-hook-form`: Client-side mobile form performance and validation (`pproenca/dot-skills`).
- `zod`: Zod runtime validation and type parsing (`pproenca/dot-skills`).

---

## 7. Security Checklist
- Store all tokens in `expo-secure-store` (iOS Keychain / Android EncryptedSharedPreferences). Never use `AsyncStorage` for credentials.
- Validate incoming deep link parameters with Zod schemas.
- Never hardcode API secrets or private keys in the mobile bundle.
