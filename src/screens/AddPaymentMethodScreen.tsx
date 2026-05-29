import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import Button from '../components/Button';
import StickyBottomBar from '../components/StickyBottomBar';
import SurfaceCard from '../components/SurfaceCard';
import { RootState } from '../utils/types';
import {
  formatCardNumberInput,
  parseCardDigits,
  SUPPORTED_CARD_BRANDS,
  WALLET_CONNECT_OPTIONS,
} from '../utils/paymentMethodUi';
import { createSavedPaymentMethod } from '../app/api/savedPaymentMethod';
import FormFieldError from '../components/FormFieldError';
import { showBlockingError, showBlockingInfo } from '../utils/userFeedback';

type PaymentFormErrors = {
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
  cvv?: string;
  submit?: string;
};

const MONTHS = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  return { label: month.toString().padStart(2, '0'), value: month };
});

const AddPaymentMethodScreen = () => {
  const navigation = useNavigation<any>();
  const token = useSelector((state: RootState) => state.authentication.data?.token);
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState<number | null>(null);
  const [expiryYear, setExpiryYear] = useState<number | null>(null);
  const [cvv, setCvv] = useState('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PaymentFormErrors>({});

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, index) => currentYear + index);
  }, []);

  const expiryLabel =
    expiryMonth && expiryYear
      ? `${expiryMonth.toString().padStart(2, '0')}/${String(expiryYear).slice(-2)}`
      : 'MM/YY';

  const handleSaveCard = async () => {
    if (!token) return;

    const nextErrors: PaymentFormErrors = {};
    const digits = parseCardDigits(cardNumber);
    if (digits.length < 13) {
      nextErrors.cardNumber = 'Enter a valid card number.';
    }
    if (!holderName.trim()) {
      nextErrors.holderName = 'Account holder name is required.';
    }
    if (!expiryMonth || !expiryYear) {
      nextErrors.expiry = 'Select an expiry date.';
    }
    if (cvv.length < 3) {
      nextErrors.cvv = 'Enter a valid CVV.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      await createSavedPaymentMethod(token, {
        providerType: 'card',
        cardNumber: digits,
        holderName: holderName.trim(),
        expiryMonth: expiryMonth!,
        expiryYear: expiryYear!,
      });
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save card.';
      showBlockingError({ title: 'Add Payment', message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectWallet = async (providerType: string) => {
    if (!token) return;

    setConnectingWallet(providerType);
    try {
      await createSavedPaymentMethod(token, { providerType });
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not connect payment method.';
      showBlockingError({ title: 'Connect Payment', message });
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10">
          <Icon name="close" size={26} color="#4B5563" />
        </TouchableOpacity>
        <Text className="text-xl font-montserrat-bold text-dark-gray">Add New Payment</Text>
        <TouchableOpacity className="w-10 items-end" onPress={() => showBlockingInfo({ title: 'Scan card', message: 'Card scanning is coming soon.' })}>
          <Icon name="scan-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text className="text-xs font-montserrat-bold text-gray mb-2 ml-1">Connect digital wallet</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {WALLET_CONNECT_OPTIONS.map((wallet) => (
            <TouchableOpacity
              key={wallet.providerType}
              onPress={() => handleConnectWallet(wallet.providerType)}
              disabled={Boolean(connectingWallet)}
              className="flex-1 min-w-[30%]"
            >
              <SurfaceCard className="py-3 items-center">
                {connectingWallet === wallet.providerType ? (
                  <ActivityIndicator size="small" color={wallet.color} />
                ) : (
                  <>
                    <Icon name={wallet.icon} size={24} color={wallet.color} />
                    <Text className="text-[11px] font-montserrat-bold text-dark-gray mt-1">
                      {wallet.label}
                    </Text>
                  </>
                )}
              </SurfaceCard>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs font-montserrat-bold text-gray mb-2 ml-1">Card details</Text>

        <View className="mb-4">
          <Text className="text-xs font-montserrat-medium text-gray mb-2 ml-1">Card Number</Text>
          <View className={`bg-white border rounded-2xl px-4 h-14 justify-center ${fieldErrors.cardNumber ? 'border-danger' : 'border-border-color'}`}>
            <TextInput
              value={cardNumber}
              onChangeText={(text) => {
                setCardNumber(formatCardNumberInput(text));
                setFieldErrors((prev) => ({ ...prev, cardNumber: undefined }));
              }}
              keyboardType="number-pad"
              placeholder="2640 4763 7569 8456"
              placeholderTextColor="#9CA3AF"
              className="font-montserrat text-dark-gray text-sm"
              maxLength={23}
            />
          </View>
          <FormFieldError message={fieldErrors.cardNumber} />
        </View>

        <View className="mb-4">
          <Text className="text-xs font-montserrat-medium text-gray mb-2 ml-1">Account Holder Name</Text>
          <View className={`bg-white border rounded-2xl px-4 h-14 justify-center ${fieldErrors.holderName ? 'border-danger' : 'border-border-color'}`}>
            <TextInput
              value={holderName}
              onChangeText={(text) => {
                setHolderName(text);
                setFieldErrors((prev) => ({ ...prev, holderName: undefined }));
              }}
              placeholder="Andrew Ainsley"
              placeholderTextColor="#9CA3AF"
              className="font-montserrat text-dark-gray text-sm"
              autoCapitalize="words"
            />
          </View>
          <FormFieldError message={fieldErrors.holderName} />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-xs font-montserrat-medium text-gray mb-2 ml-1">Expiry Date</Text>
            <TouchableOpacity
              onPress={() => {
                setShowMonthPicker((value) => !value);
                setShowYearPicker(false);
                setFieldErrors((prev) => ({ ...prev, expiry: undefined }));
              }}
              className={`bg-white border rounded-2xl px-4 h-14 flex-row items-center justify-between ${fieldErrors.expiry ? 'border-danger' : 'border-border-color'}`}
            >
              <Text className="font-montserrat text-dark-gray text-sm">{expiryLabel}</Text>
              <Icon name="chevron-down" size={18} color="#9CA3AF" />
            </TouchableOpacity>
            {showMonthPicker ? (
              <SurfaceCard className="mt-2 p-2 max-h-40">
                <ScrollView nestedScrollEnabled>
                  {MONTHS.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      className="py-2 px-2"
                      onPress={() => {
                        setExpiryMonth(month.value);
                        setShowMonthPicker(false);
                        setShowYearPicker(true);
                        setFieldErrors((prev) => ({ ...prev, expiry: undefined }));
                      }}
                    >
                      <Text className="font-montserrat text-dark-gray">{month.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </SurfaceCard>
            ) : null}
            <FormFieldError message={fieldErrors.expiry} />
          </View>

          <View className="flex-1">
            <Text className="text-xs font-montserrat-medium text-gray mb-2 ml-1">CVV</Text>
            <View className={`bg-white border rounded-2xl px-4 h-14 justify-center ${fieldErrors.cvv ? 'border-danger' : 'border-border-color'}`}>
              <TextInput
                value={cvv}
                onChangeText={(text) => {
                  setCvv(text.replace(/\D/g, '').slice(0, 4));
                  setFieldErrors((prev) => ({ ...prev, cvv: undefined }));
                }}
                keyboardType="number-pad"
                secureTextEntry
                placeholder="475"
                placeholderTextColor="#9CA3AF"
                className="font-montserrat text-dark-gray text-sm"
              />
            </View>
            {showYearPicker ? (
              <SurfaceCard className="mt-2 p-2 max-h-40">
                <ScrollView nestedScrollEnabled>
                  {yearOptions.map((year) => (
                    <TouchableOpacity
                      key={year}
                      className="py-2 px-2"
                      onPress={() => {
                        setExpiryYear(year);
                        setShowYearPicker(false);
                        setFieldErrors((prev) => ({ ...prev, expiry: undefined }));
                      }}
                    >
                      <Text className="font-montserrat text-dark-gray">{year}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </SurfaceCard>
            ) : null}
            <FormFieldError message={fieldErrors.cvv} />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-xs font-montserrat-medium text-gray mb-3 ml-1">Supported Payments:</Text>
          <View className="flex-row flex-wrap gap-2">
            {SUPPORTED_CARD_BRANDS.map((brand) => (
              <View
                key={brand}
                className="px-3 py-1.5 rounded-lg bg-white border border-border-color"
              >
                <Text className="text-[11px] font-montserrat-bold text-gray">{brand}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <StickyBottomBar>
        <Button
          label="Save"
          onPress={handleSaveCard}
          isLoading={isSaving}
          disabled={isSaving || Boolean(connectingWallet)}
          shape="pill"
          fullWidth
        />
      </StickyBottomBar>
    </SafeAreaView>
  );
};

export default AddPaymentMethodScreen;
