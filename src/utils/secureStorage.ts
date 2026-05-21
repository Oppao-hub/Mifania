import * as Keychain from 'react-native-keychain';

const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: key });
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.log('Keychain could not be accessed!', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(key, value, { service: key });
    } catch (error) {
      console.log('Keychain could not be accessed!', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: key });
    } catch (error) {
      console.log('Keychain could not be accessed!', error);
    }
  },
};

export default secureStorage;
