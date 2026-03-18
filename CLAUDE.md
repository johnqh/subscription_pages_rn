# subscription_pages_rn - AI Development Guide

## Overview

React Native page components for subscription management. Provides ready-to-use screens for choosing subscription plans by duration (billing period) or by offer (product catalog). Uses `@sudobility/subscription_lib` hooks for data fetching and `@sudobility/subscription-components-rn` for UI tiles.

- **Package**: `@sudobility/subscription_pages_rn`
- **Version**: 0.0.1
- **License**: BUSL-1.1
- **Package Manager**: Bun (never npm)
- **TypeScript**: ^5.5.0, target ES2020, bundler module resolution, strict mode
- **Build output**: `dist/` (declarations + JS)

## Project Structure

```
subscription_pages_rn/
├── package.json
├── bun.lock
├── tsconfig.json              # Base TS config (strict, declarations, outDir: dist/)
├── tsconfig.build.json        # Build config (extends base, excludes tests)
└── src/
    ├── index.ts               # Barrel exports (all pages + prop types)
    └── pages/
        ├── index.ts           # Page barrel exports
        ├── SubscriptionByDurationPage.tsx  # Plans grouped by billing period
        └── SubscriptionByOfferPage.tsx     # Plans grouped by offering
```

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `SubscriptionByDurationPage` | component | Subscription plans grouped by billing period (monthly, yearly, etc.) |
| `SubscriptionByOfferPage` | component | Subscription plans grouped by offering with Free tab |
| `SubscriptionByDurationPageProps` | interface | Props: `userId`, `userEmail?`, `featuresByPackage?`, `freeFeatures?`, `title?`, `onPurchaseSuccess?`, `onRestoreSuccess?` |
| `SubscriptionByOfferPageProps` | interface | Props: `userId`, `userEmail?`, `featuresByPackage?`, `freeFeatures?`, `title?`, `onPurchaseSuccess?`, `onRestoreSuccess?` |

## Commands

```bash
bun run build        # Build TypeScript to dist/ (uses tsconfig.build.json)
bun run typecheck    # TypeScript check (no emit)
```

## Peer Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | >=18 | React core |
| `react-native` | >=0.74 | React Native framework |
| `@sudobility/subscription_lib` | ^0.0.25 | Subscription hooks and service singleton |
| `@sudobility/subscription-components-rn` | ^1.0.0 | RN subscription UI components (SubscriptionTile, SegmentedControl, SubscriptionLayout) |
| `@sudobility/types` | ^1.9.58 | Shared type definitions (SubscriptionPeriod) |

## Coding Patterns

- **RN-only: userId is required** -- no anonymous/logged-out state. Users are always authenticated on mobile.
- **Uses subscription_lib hooks directly** -- pages call `usePackagesByDuration`, `useAllOfferings`, `useOfferingPackages`, `useUserSubscription`.
- **Uses subscription-components-rn for UI** -- `SubscriptionLayout` (with `currentStatus`, `aboveProducts`, `footerContent`), `SegmentedControl`, `SubscriptionTile` (individual props: `id`, `title`, `price`, `features`, etc.), `SubscriptionFooter`.
- **Passes individual props to SubscriptionTile** -- subscription_lib `SubscriptionPackage` fields are mapped directly to tile props (`id`, `title`, `price`, `periodLabel`, `features`, `isCurrentPlan`). Uses `getPeriodLabel()` helper to convert period strings to display labels.
- **SubscriptionLayout handles status display** -- current subscription status is passed via `currentStatus` prop (with `activeContent.title` and `activeContent.fields`) instead of custom StyleSheet banner.
- **RN StyleSheet.create for page-level styling** -- loading/error states and purchasing overlays use plain React Native styles.
- **Alert.alert for confirmations** -- cancel subscription and error handling use native alerts.
- **Linking.openURL for management** -- cancel/manage subscription redirects to the store management URL.
- **Hooks always called unconditionally** -- `useOfferingPackages` in ByOffer page uses a fallback offerId when 'free' is selected.
- **Purchasing overlay** -- semi-transparent overlay with ActivityIndicator during purchase/restore operations.

## Related Projects

- **subscription_lib** (`@sudobility/subscription_lib`) -- provides hooks (`usePackagesByDuration`, `useAllOfferings`, `useOfferingPackages`, `useUserSubscription`) and singleton (`getSubscriptionInstance`, `refreshSubscription`, `restoreSubscription`).
- **subscription-components-rn** (`@sudobility/subscription-components-rn`) -- provides UI components (`SubscriptionTile`, `SubscriptionLayout`, `SegmentedControl`, `SubscriptionFooter`).
- **subscription_pages** (`@sudobility/subscription_pages`) -- web counterpart of this package.
