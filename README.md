# @sudobility/subscription_pages_rn

Subscription page components for React Native applications. Provides ready-to-use screens for choosing subscription plans by billing period or by offering.

## Installation

```bash
bun add @sudobility/subscription_pages_rn
```

## Usage

```tsx
import {
  SubscriptionByDurationPage,
  SubscriptionByOfferPage,
} from '@sudobility/subscription_pages_rn';

// Plans grouped by billing period (monthly, yearly, etc.)
<SubscriptionByDurationPage
  userId={user.uid}
  userEmail={user.email}
  featuresByPackage={{
    pro_monthly: ['Unlimited access', 'Priority support'],
    pro_yearly: ['Unlimited access', 'Priority support', 'Early features'],
  }}
  freeFeatures={['Basic access', '5 items per month']}
  onPurchaseSuccess={() => navigation.goBack()}
/>

// Plans grouped by offering with Free tab
<SubscriptionByOfferPage
  userId={user.uid}
  userEmail={user.email}
  featuresByPackage={{
    starter: ['10 items', 'Basic support'],
    pro: ['Unlimited items', 'Priority support'],
  }}
  freeFeatures={['3 items', 'Community support']}
  onPurchaseSuccess={() => navigation.goBack()}
/>
```

## API

### Pages

| Component | Description |
|-----------|-------------|
| `SubscriptionByDurationPage` | Plans grouped by billing period with segmented control |
| `SubscriptionByOfferPage` | Plans grouped by offering with Free tab |

### Props

| Interface | Key Props |
|-----------|-----------|
| `SubscriptionByDurationPageProps` | `userId`, `userEmail?`, `featuresByPackage?`, `freeFeatures?`, `title?`, `onPurchaseSuccess?`, `onRestoreSuccess?` |
| `SubscriptionByOfferPageProps` | `userId`, `userEmail?`, `featuresByPackage?`, `freeFeatures?`, `title?`, `onPurchaseSuccess?`, `onRestoreSuccess?` |

### Peer Dependencies

- `react` >= 18
- `react-native` >= 0.74
- `@sudobility/subscription_lib` ^0.0.25
- `@sudobility/subscription-components-rn` ^1.0.0
- `@sudobility/types` ^1.9.58

## Development

```bash
bun run build        # Build TypeScript to dist/
bun run typecheck    # TypeScript check (no emit)
```

## License

BUSL-1.1
