import Toast from 'react-native-toast-message';

interface AlertMsgConfig {
    title: string;
    message: string;
}

const AlertMsg = {
    customError: ({ title, message }: AlertMsgConfig) => {
        Toast.show({
            type: 'modalError',
            text1: title,
            text2: message,
            position: 'top', 
            topOffset: 0,
            autoHide: false,
        });
    },

    customSuccess: ({ title, message }: AlertMsgConfig) => {
        Toast.show({
            type: 'modalSuccess',
            text1: title,
            text2: message,
            position: 'top',
            topOffset: 0,
            autoHide: false,
        });
    },

    customInfo: ({ title, message }: AlertMsgConfig) => {
        Toast.show({
            type: 'modalInfo',
            text1: title,
            text2: message,
            position: 'top',
            topOffset: 0,
            autoHide: false,
        });
    }
};

export default AlertMsg;