/**
 * Type declarations for @sudobility/subscription-components-rn
 *
 * Stub declarations for development. These types match the actual package
 * and will be replaced when the package is installed as a dependency.
 */
declare module '@sudobility/subscription-components-rn' {
  import type { ReactNode } from 'react';

  export interface SubscriptionProduct {
    id: string;
    title: string;
    description?: string;
    priceString: string;
    priceInCents: number;
    currencyCode: string;
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
    features: string[];
    isRecommended?: boolean;
    isCurrent?: boolean;
    originalPriceString?: string;
    savingsPercentage?: number;
    rcPackageId?: string;
    trialPeriod?: {
      days: number;
      priceString: string;
    };
  }

  export interface SubscriptionTileProps {
    product: SubscriptionProduct;
    isSelected?: boolean;
    onSelect?: (productId: string) => void;
    disabled?: boolean;
    className?: string;
  }

  export function SubscriptionTile(props: SubscriptionTileProps): JSX.Element;

  export interface SegmentOption<T extends string = string> {
    value: T;
    label: string;
    badge?: string;
    disabled?: boolean;
  }

  export interface SegmentedControlProps<T extends string = string> {
    options: SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
    disabled?: boolean;
    accessibilityLabel?: string;
  }

  export function SegmentedControl<T extends string = string>(
    props: SegmentedControlProps<T>,
  ): JSX.Element;

  export interface SubscriptionLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    headerContent?: ReactNode;
    footerContent?: ReactNode;
    direction?: 'vertical' | 'horizontal';
    spacing?: 'compact' | 'normal' | 'relaxed';
    scrollable?: boolean;
    className?: string;
    contentClassName?: string;
  }

  export function SubscriptionLayout(
    props: SubscriptionLayoutProps,
  ): JSX.Element;

  export interface SubscriptionFooterProps {
    termsText?: string;
    privacyText?: string;
    restoreText?: string;
    onRestore?: () => void;
    onTermsPress?: () => void;
    onPrivacyPress?: () => void;
    className?: string;
  }

  export function SubscriptionFooter(
    props: SubscriptionFooterProps,
  ): JSX.Element;
}
