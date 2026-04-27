import Toast from 'react-native-toast-message';

interface AlertMsgConfig {
    title: string;
    message: string;
}

const AlertMsg = {
    customError: ({ title, message }: AlertMsgConfig) => {
        Toast.show({
            type: 'error',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
        });
    },

    customSuccess: ({ title, message }: AlertMsgConfig) => {
        Toast.show({
            type: 'success',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
        });
    },

    customInfo: ({ title, message }: AlertMsgConfig) => {
        Toast.show({
            type: 'info',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
        });
    }
};

export default AlertMsg;