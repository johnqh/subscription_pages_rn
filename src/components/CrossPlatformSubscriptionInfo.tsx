import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { colors } from '@sudobility/design';
import type {
  SubscriptionPlatform,
  BackendSubscriptionResult,
} from '@sudobility/types';

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
    borderColor: colors.raw.amber[400],
    borderRadius: 12,
    backgroundColor: colors.raw.amber[50],
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.raw.neutral[900],
  },
  detail: {
    fontSize: 14,
    color: colors.raw.neutral[700],
  },
  bold: {
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: colors.raw.amber[800],
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.raw.blue[600],
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  buttonText: {
    color: colors.raw.neutral[0],
    fontSize: 14,
    fontWeight: '600',
  },
});
