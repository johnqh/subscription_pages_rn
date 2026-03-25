import { useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import { SubscriptionPlatform } from '@sudobility/types';
import type { SubscriptionPeriod, NetworkClient } from '@sudobility/types';
import {
  usePackagesByDuration,
  useUserSubscription,
  useBackendSubscription,
  getSubscriptionInstance,
  refreshSubscription,
  restoreSubscription,
} from '@sudobility/subscription_lib';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {
  SubscriptionLayout,
  SubscriptionTile,
  SubscriptionFooter,
} from '@sudobility/subscription-components-rn';
import { CrossPlatformSubscriptionInfo } from '../components/CrossPlatformSubscriptionInfo';

export interface SubscriptionByDurationPageProps {
  /** User ID for subscription lookup (required on RN) */
  userId: string;
  /** User email for subscription operations */
  userEmail?: string;
  /** Features list for each package, keyed by packageId */
  featuresByPackage?: Record<string, string[]>;
  /** Features for the free tier */
  freeFeatures?: string[];
  /** Custom title */
  title?: string;
  /** Called after successful purchase */
  onPurchaseSuccess?: () => void;
  /** Called after successful restore */
  onRestoreSuccess?: () => void;
  /** Current platform (required on RN: ios, android, or macos) */
  currentPlatform?: SubscriptionPlatform;
  /** Network client for backend subscription fetch */
  networkClient?: NetworkClient;
  /** Backend API base URL */
  baseUrl?: string;
  /** Auth token for backend API */
  token?: string;
  /** Include sandbox purchases */
  testMode?: boolean;
}

function getPeriodLabel(period?: string): string | undefined {
  switch (period) {
    case 'weekly':
      return '/week';
    case 'monthly':
      return '/month';
    case 'quarterly':
      return '/quarter';
    case 'yearly':
      return '/year';
    default:
      return undefined;
  }
}

export function SubscriptionByDurationPage({
  userId,
  userEmail,
  featuresByPackage = {},
  freeFeatures = [],
  title = 'Choose Your Plan',
  onPurchaseSuccess,
  onRestoreSuccess,
  currentPlatform,
  networkClient,
  baseUrl,
  token,
  testMode,
}: SubscriptionByDurationPageProps) {
  const {
    packagesByDuration,
    availableDurations,
    isLoading: isLoadingPackages,
    error: packagesError,
  } = usePackagesByDuration();

  const {
    subscription,
    isLoading: isLoadingSub,
    error: subError,
  } = useUserSubscription({ userId, userEmail });

  // Backend subscription for platform detection
  const hasBackendConfig = !!(networkClient && baseUrl && token && userId);
  const backendSub = useBackendSubscription(
    networkClient ?? ({} as NetworkClient),
    baseUrl ?? '',
    token ?? '',
    userId ?? '',
    { testMode, enabled: hasBackendConfig }
  );

  const subscriptionPlatform = backendSub.data?.platform ?? null;
  const isPlatformMatch =
    !subscriptionPlatform ||
    !currentPlatform ||
    subscriptionPlatform === currentPlatform;

  const [selectedDuration, setSelectedDuration] =
    useState<SubscriptionPeriod | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const isLoading = isLoadingPackages || isLoadingSub;
  const error = packagesError || subError;

  // Set default selected duration once loaded
  const activeDuration = selectedDuration ?? availableDurations[0] ?? null;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#2563eb' />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  // Cross-platform: show info instead of purchase UI
  if (!isPlatformMatch && backendSub.data && currentPlatform) {
    return (
      <View style={styles.container}>
        <SubscriptionLayout title={title}>
          <CrossPlatformSubscriptionInfo
            backendSubscription={backendSub.data}
            managementUrl={subscription?.managementUrl}
            currentPlatform={currentPlatform}
          />
        </SubscriptionLayout>
      </View>
    );
  }

  const handlePurchase = async (packageId: string, offeringId: string) => {
    try {
      setIsPurchasing(true);
      const service = getSubscriptionInstance();
      await service.purchase({
        packageId,
        offeringId,
        customerEmail: userEmail,
      });
      await refreshSubscription();
      onPurchaseSuccess?.();
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Purchase failed'
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      const result = await restoreSubscription();
      if (result?.isActive) {
        Alert.alert('Success', 'Your purchases have been restored.');
        onRestoreSuccess?.();
      } else {
        Alert.alert('No Purchases', 'No previous purchases were found.');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Restore failed'
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const openManagementUrl = () => {
    if (!subscription?.managementUrl) {
      Alert.alert('Error', 'Unable to open subscription management.');
      return;
    }
    Linking.openURL(subscription.managementUrl);
  };

  const currentPackages = activeDuration
    ? (packagesByDuration[activeDuration] ?? [])
    : [];
  const hasSubscription = subscription?.isActive ?? false;
  const currentPackageId = subscription?.packageId;

  // Duration segment options
  const segmentLabels = availableDurations.map(
    d => d.charAt(0).toUpperCase() + d.slice(1)
  );
  const selectedIndex = activeDuration
    ? availableDurations.indexOf(activeDuration)
    : 0;

  return (
    <View style={styles.container}>
      <SubscriptionLayout
        title={title}
        currentStatus={
          hasSubscription && subscription
            ? {
                isActive: true,
                activeContent: {
                  title: subscription.productId ?? 'Active Subscription',
                  fields: [
                    ...(subscription.period
                      ? [{ label: 'Period', value: subscription.period }]
                      : []),
                    ...(subscription.expirationDate
                      ? [
                          {
                            label: subscription.willRenew
                              ? 'Renews'
                              : 'Expires',
                            value:
                              subscription.expirationDate.toLocaleDateString(
                                undefined,
                                { dateStyle: 'long' }
                              ),
                          },
                        ]
                      : []),
                  ],
                  ...(subscription.platform
                    ? {
                        platform: {
                          label: 'Subscription Platform',
                          value: subscription.platform,
                        },
                      }
                    : {}),
                },
              }
            : undefined
        }
        aboveProducts={
          segmentLabels.length > 0 ? (
            <SegmentedControl
              values={segmentLabels}
              selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
              onChange={event => {
                const idx = event.nativeEvent.selectedSegmentIndex;
                setSelectedDuration(
                  availableDurations[idx] as SubscriptionPeriod
                );
              }}
            />
          ) : undefined
        }
        footerContent={<SubscriptionFooter onRestore={handleRestore} />}
      >
        {/* Free Tile — "Current" badge when no subscription, no CTA */}
        <SubscriptionTile
          id='free'
          title='Free'
          price='Free'
          features={freeFeatures}
          isSelected={false}
          isCurrentPlan={!hasSubscription}
          topBadge={
            !hasSubscription ? { text: 'Current', color: 'blue' } : undefined
          }
          onSelect={() => {}}
          disabled={isPurchasing}
        />

        {/* Paid Tiles — management URL when subscribed, purchase when not */}
        {currentPackages.map(({ package: pkg, offerId }) => {
          const features = featuresByPackage[pkg.packageId] ?? [];
          const isCurrent =
            currentPackageId === pkg.packageId &&
            subscription?.offeringId === offerId;

          return (
            <SubscriptionTile
              key={`${offerId}-${pkg.packageId}`}
              id={pkg.packageId}
              title={pkg.name}
              price={pkg.product?.priceString ?? 'Free'}
              periodLabel={getPeriodLabel(pkg.product?.period)}
              features={features}
              isSelected={isCurrent}
              isCurrentPlan={isCurrent}
              onSelect={
                hasSubscription
                  ? openManagementUrl
                  : () => handlePurchase(pkg.packageId, offerId)
              }
              disabled={isPurchasing}
            />
          );
        })}
      </SubscriptionLayout>

      {/* Purchasing overlay */}
      {isPurchasing && (
        <View style={styles.overlay}>
          <ActivityIndicator size='large' color='#fff' />
          <Text style={styles.overlayText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});
