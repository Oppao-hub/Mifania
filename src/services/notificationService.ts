import messaging from '@react-native-firebase/messaging';

export const registerDeviceForPush = async (userId: number, authToken: string) => {
    try {
        const authStatus = await messaging().requestPermission();
        const enabled = 
            authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            const deviceToken = await messaging().getToken();
            console.log('📱 FCM Device Token:', deviceToken);
            
            // Use your API Platform endpoint!
            const response = await fetch(`https://sfl-mifania.up.railway.app/api/users/${userId}`, {
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