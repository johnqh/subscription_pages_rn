import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import type { SubscriptionPlatform } from '@sudobility/types';
import type { BackendSubscriptionResult } from '@sudobility/subscription_lib';

const PLATFORM_NAMES: Record<string, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
  macos: 'macOS',
};

export interface CrossPlatformSubscriptionInfoProps {
  backendSubscription: BackendSubscriptionResult;
  managementUrl?: string;
  currentPlatform: SubscriptionPlatform;
}

export function CrossPlatformSubscriptionInfo({
  backendSubscription,
  managementUrl,
}: CrossPlatformSubscriptionInfoProps) {
  const platformName = backendSubscription.platform
    ? (PLATFORM_NAMES[backendSubscription.platform] ??
      backendSubscription.platform)
    : 'another platform';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription Active</Text>

      <Text style={styles.detail}>
        Entitlements:{' '}
        <Text style={styles.bold}>
          {backendSubscription.entitlements.join(', ')}
        </Text>
      </Text>

      {backendSubscription.subscriptionStartedAt && (
        <Text style={styles.detail}>
          Subscribed since:{' '}
          <Text style={styles.bold}>
            {new Date(
              backendSubscription.subscriptionStartedAt
            ).toLocaleDateString()}
          </Text>
        </Text>
      )}

      <Text style={styles.message}>
        Your subscription was purchased on{' '}
        <Text style={styles.bold}>{platformName}</Text>. To manage your
        subscription, please visit your {platformName} settings.
      </Text>

      {managementUrl && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL(managementUrl)}
        >
          <Text style={styles.buttonText}>Manage Subscription</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 12,
    backgroundColor: '#fffbeb',
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  detail: {
    fontSize: 14,
    color: '#374151',
  },
  bold: {
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
