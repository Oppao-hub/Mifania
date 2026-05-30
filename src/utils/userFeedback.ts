import Toast from 'react-native-toast-message';

export type FeedbackVariant = 'success' | 'error';

export interface BlockingMessageOptions {
  title: string;
  message: string;
}

/** Lightweight, auto-dismissing feedback for quick successes or minor failures. */
export const showFeedbackToast = (
  message: string,
  variant: FeedbackVariant = 'success',
) => {
  Toast.show({
    type: variant === 'success' ? 'feedbackSuccess' : 'feedbackError',
    text1: message,
    position: 'bottom',
    bottomOffset: 96,
    visibilityTime: 2600,
  });
};

/** Blocks the flow until dismissed — use for checkout, payment, or action failures. */
export const showBlockingError = ({ title, message }: BlockingMessageOptions) => {
  Toast.show({
    type: 'modalError',
    text1: title,
    text2: message,
    position: 'top',
    topOffset: 0,
    autoHide: false,
  });
};

/** Important success the user should acknowledge (e.g. email verification instructions). */
export const showBlockingSuccess = ({ title, message }: BlockingMessageOptions) => {
  Toast.show({
    type: 'modalSuccess',
    text1: title,
    text2: message,
    position: 'top',
    topOffset: 0,
    autoHide: false,
  });
};

/** Placeholder for features not yet shipped. */
export const showComingSoon = (feature: string) => {
  showBlockingInfo({
    title: feature,
    message: 'This feature is coming soon.',
  });
};

/** Informational overlay (not an error). */
export const showBlockingInfo = ({ title, message }: BlockingMessageOptions) => {
  Toast.show({
    type: 'modalInfo',
    text1: title,
    text2: message,
    position: 'top',
    topOffset: 0,
    autoHide: false,
  });
};
