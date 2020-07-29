import { Intent } from '@blueprintjs/core';

const createToast = (toaster, intent, message) => {
  let icon = null;
  switch (intent) {
    case Intent.SUCCESS:
      icon = 'tick';
      break;
    case Intent.DANGER:
      icon = 'error';
      break;
    default:
      break;
  }

  toaster.show({
    message,
    intent,
    icon,
  });
};

export default createToast;
