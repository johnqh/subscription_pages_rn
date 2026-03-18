import React, { useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import {
  useAllOfferings,
  useOfferingPackages,
  useUserSubscription,
  getSubscriptionInstance,
  refreshSubscription,
  restoreSubscription,
} from '@sudobility/subscription_lib';
import type { SubscriptionPackage } from '@sudobility/subscription_lib';
import type { SubscriptionProduct as RnSubscriptionProduct } from '@sudobility/subscription-components-rn';
import {
  SubscriptionLayout,
  SegmentedControl,
  SubscriptionTile,
  SubscriptionFooter,
} from '@sudobility/subscription-components-rn';

export interface SubscriptionByOfferPageProps {
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
}

function mapToRnProduct(
  pkg: SubscriptionPackage,
  features: string[],
  isCurrent: boolean,
): RnSubscriptionProduct {
  return {
    id: pkg.packageId,
    title: pkg.name,
    description: pkg.product?.description,
    priceString: pkg.product?.priceString ?? 'Free',
    priceInCents: Math.round((pkg.product?.price ?? 0) * 100),
    currencyCode: pkg.product?.currency ?? 'USD',
    period: pkg.product?.period ?? 'monthly',
    features,
    isCurrent,
    rcPackageId: pkg.packageId,
  };
}

export function SubscriptionByOfferPage({
  userId,
  userEmail,
  featuresByPackage = {},
  freeFeatures = [],
  title = 'Choose Your Plan',
  onPurchaseSuccess,
  onRestoreSuccess,
}: SubscriptionByOfferPageProps) {
  const {
    offerings,
    isLoading: isLoadingOfferings,
    error: offeringsError,
  } = useAllOfferings();

  const {
    subscription,
    isLoading: isLoadingSub,
    error: subError,
  } = useUserSubscription({ userId, userEmail });

  const [selectedSegment, setSelectedSegment] = useState<string>('free');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Always call useOfferingPackages -- hooks can't be conditional.
  // Use the first offering's ID as fallback when 'free' is selected.
  const fallbackOfferId = offerings[0]?.offerId ?? '';
  const activeOfferId = selectedSegment === 'free' ? fallbackOfferId : selectedSegment;
  const {
    packages: offeringPackages,
    isLoading: isLoadingPkgs,
  } = useOfferingPackages(activeOfferId);

  const isLoading = isLoadingOfferings || isLoadingSub;
  const error = offeringsError || subError;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
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

  const handlePurchase = async (packageId: string, offeringId: string) => {
    try {
      setIsPurchasing(true);
      const service = getSubscriptionInstance();
      await service.purchase({ packageId, offeringId, customerEmail: userEmail });
      await refreshSubscription();
      onPurchaseSuccess?.();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Purchase failed');
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
      Alert.alert('Error', err instanceof Error ? err.message : 'Restore failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCancelSubscription = () => {
    if (!subscription?.managementUrl) {
      Alert.alert('Error', 'Unable to open subscription management.');
      return;
    }
    Alert.alert(
      'Cancel Subscription',
      'You will be redirected to manage your subscription. Are you sure?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Manage',
          onPress: () => {
            Linking.openURL(subscription.managementUrl!);
          },
        },
      ],
    );
  };

  const hasSubscription = subscription?.isActive ?? false;
  const currentPackageId = subscription?.packageId;

  // Segment options: Free + each offering
  const segmentOptions = [
    { value: 'free', label: 'Free' },
    ...offerings.map((o) => ({
      value: o.offerId,
      label: o.offerId.charAt(0).toUpperCase() + o.offerId.slice(1),
    })),
  ];

  // Build free tile product
  const freeProduct = mapToRnProduct(
    { packageId: 'free', name: 'Free', entitlements: [] },
    freeFeatures,
    !hasSubscription,
  );

  const showFree = selectedSegment === 'free';

  return (
    <View style={styles.container}>
      {/* Current subscription status */}
      {hasSubscription && subscription && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusTitle}>Current Plan</Text>
          <Text style={styles.statusDetail}>
            {subscription.packageId ?? 'Active Subscription'}
            {subscription.period ? ` (${subscription.period})` : ''}
          </Text>
          {subscription.expirationDate && (
            <Text style={styles.statusExpiry}>
              {subscription.willRenew ? 'Renews' : 'Expires'}{' '}
              {subscription.expirationDate.toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      <SubscriptionLayout
        title={title}
        direction="vertical"
        scrollable
        headerContent={
          segmentOptions.length > 1 ? (
            <SegmentedControl
              options={segmentOptions}
              value={selectedSegment}
              onChange={setSelectedSegment}
            />
          ) : undefined
        }
        footerContent={
          <SubscriptionFooter onRestore={handleRestore} />
        }
      >
        {showFree ? (
          /* Free Tile */
          <SubscriptionTile
            product={freeProduct}
            isSelected={!hasSubscription}
            onSelect={
              hasSubscription
                ? () => handleCancelSubscription()
                : undefined
            }
            disabled={isPurchasing}
          />
        ) : (
          /* Offering Packages */
          isLoadingPkgs ? (
            <View style={styles.center}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : (
            offeringPackages.map((pkg) => {
              const features = featuresByPackage[pkg.packageId] ?? [];
              const isCurrent = currentPackageId === pkg.packageId;
              const product = mapToRnProduct(pkg, features, isCurrent);

              return (
                <SubscriptionTile
                  key={pkg.packageId}
                  product={product}
                  isSelected={isCurrent}
                  onSelect={
                    isCurrent
                      ? undefined
                      : () => handlePurchase(pkg.packageId, selectedSegment)
                  }
                  disabled={isPurchasing}
                />
              );
            })
          )
        )}
      </SubscriptionLayout>

      {/* Purchasing overlay */}
      {isPurchasing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
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
  statusBanner: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusDetail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginTop: 2,
  },
  statusExpiry: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
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
