import {
  showBlockingError,
  showBlockingInfo,
  showBlockingSuccess,
} from '../../utils/userFeedback';

interface AlertMsgConfig {
  title: string;
  message: string;
}

const AlertMsg = {
  customError: ({ title, message }: AlertMsgConfig) => {
    showBlockingError({ title, message });
  },

  customSuccess: ({ title, message }: AlertMsgConfig) => {
    showBlockingSuccess({ title, message });
  },

  customInfo: ({ title, message }: AlertMsgConfig) => {
    showBlockingInfo({ title, message });
  },
};

export default AlertMsg;
