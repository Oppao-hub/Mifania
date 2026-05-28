import { getApp } from '@react-native-firebase/app';
import { getMessaging, requestPermission, getToken, AuthorizationStatus } from '@react-native-firebase/messaging';
import { ASSET_URL } from '../app/api/client';

export const registerDeviceForPush = async (userId: number, authToken: string) => {
    try {
        const messagingInstance = getMessaging(getApp());
        const authStatus = await requestPermission(messagingInstance);
        const enabled = 
            authStatus === AuthorizationStatus.AUTHORIZED || 
            authStatus === AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            const deviceToken = await getToken(messagingInstance);
            console.log('📱 FCM Device Token:', deviceToken);
            
            // Use your API Platform endpoint!
            const response = await fetch(`${ASSET_URL}/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/merge-patch+json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ deviceToken })
            });

            if (!response.ok) {
                console.error('Failed to save device token to backend');
            } else {
                console.log('✅ Device token saved successfully!');
            }
        }
    } catch (error) {
        console.error('Error registering device for push notifications:', error);
    }
};