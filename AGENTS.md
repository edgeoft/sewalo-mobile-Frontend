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
- **Asset Caching**: `expo-image` (Native memory & disk caching)
- **Secure Storage**: `expo-secure-store` (Hardware-backed keychain encryption)
- **Analytics & Observability**: `posthog-react-native`

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

## 2.1 Important Code Rules
Write code like an experienced engineer maintaining a production codebase, not an AI trying to maximize the number of lines it generates.

1. **Prefer Simplicity Over Defensive Boilerplate**:
   - Do not add redundant null checks, repeated `typeof` checks, chained property-existence checks, or defensive fallbacks without a concrete reason.
   - Do not guard against impossible states or inputs that are already prevented by the type system, framework, or established application contracts.
   - Trust well-defined library and API contracts. Handle realistic failure cases, not every theoretically imaginable combination of malformed values.
   - Never turn a straightforward operation into deeply nested conditionals when a simple expression, early return, or helper function is sufficient.
2. **Use Types and Existing Abstractions**:
   - Leverage TypeScript types, existing interfaces, API response types, and established error-handling utilities.
   - Do not repeatedly narrow `unknown` objects manually when a typed error interface, type guard, or existing utility can express the same intent.
   - Do not introduce `as` casts merely to silence the compiler. Fix the underlying type when practical.
   - Reuse existing abstractions instead of inventing new ones for trivial operations.
3. **No Unnecessary Complexity**:
   - Do not introduce abstractions, helper functions, generic utilities, or additional layers for one-off logic unless they materially improve readability or maintainability.
   - Avoid nested ternaries, excessive branching, redundant temporary variables, and duplicated fallback logic.
   - Prefer the smallest correct implementation that fits the existing architecture.
4. **Respect Existing Project Conventions**:
   - Inspect nearby code and reuse the project's existing patterns before implementing anything.
   - Use existing API clients, error handlers, translation utilities, validation schemas, and shared types where available.
   - Do not refactor unrelated code or expand the scope of a task without a clear reason.
5. **Error Handling Must Be Intentional**:
   - Handle errors according to the actual error types and response contracts used by the application.
   - Prefer existing error normalization utilities (`extractErrorMessage`) over manually traversing nested objects.
   - Do not silently swallow errors or display raw technical errors to users without justification.
6. **Optimize for Readability, Not Line Count Alone**:
   - Obvious control flow, meaningful names, explicit types, and minimal nesting.
7. **Required Before Adding Complexity**:
   - Is this failure mode realistic? Is it already handled by a type, framework, library, or existing utility? Does it materially improve correctness? Is there a simpler implementation? If not justified, do NOT add it.
8. **Final Standard**:
   - **Default rule**: Prefer simple, typed, maintainable code. Add complexity only when a concrete requirement justifies it.

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

## 6. Installed Agent Skills
Skills are locked in `skills-lock.json` and can be restored locally using `npx skills experimental_install`:
- `code-review`: Mobile code review, scans for unhandled nulls, FlatList frame drops, insecure AsyncStorage token storage, and architecture compliance (`mattpocock/skills`).
- `expo`: 42 mobile performance rules: Hermes bytecode precompilation, startup latency reduction, FlashList virtualization, and UI thread animations (`pproenca/dot-skills`).
- `expo-ui`: SwiftUI component guidelines and Liquid Glass UI patterns for iOS (`pproenca/dot-skills`).
- `react`: React 19 concurrent features, hooks, and modern patterns (`pproenca/dot-skills`).
- `react-hook-form`: Client-side mobile form performance and validation (`pproenca/dot-skills`).
- `tailwind`: Tailwind CSS styling rules and theme tokens (`pproenca/dot-skills`).
- `tanstack-query`: Mobile data fetching, offline query caching, screen focus refetch gating, and key invalidation scoping (`pproenca/dot-skills`).
- `typescript`: Senior TypeScript standards, compiler configuration, and strict typing (`pproenca/dot-skills`).
- `uniwind`: Uniwind best practices for React Native styling with Tailwind CSS (`pproenca/dot-skills`).
- `vercel-react-native-skills`: React Native best practices, memory management, and architecture (`vercel-labs/agent-skills`).
- `zod`: Zod runtime validation and type parsing (`pproenca/dot-skills`).
- `zustand`: Zustand state management best practices for store structure and selectors (`pproenca/dot-skills`).

---

## 7. Security Checklist
- Store all tokens in `expo-secure-store` (iOS Keychain / Android EncryptedSharedPreferences). Never use `AsyncStorage` for credentials.
- Validate incoming deep link parameters with Zod schemas.
- Never hardcode API secrets or private keys in the mobile bundle.
