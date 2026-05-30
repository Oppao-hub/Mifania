import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Linking,
} from 'react-native';
import LoadingState from '../components/LoadingState';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState, CartItem, Customer } from '../utils/types';
import { getEmbeddedCustomer, getCustomerRefFromUser } from '../utils/apiResource';
import { ROUTES } from '../utils';
import {
    buildOrderPayload,
    calculateCheckoutTotals,
    getSelectedCartItems,
    parseCurrencyAmount,
    CheckoutSnapshot,
} from '../utils/checkout';
import ReusableOverlay from '../components/ReusableOverlay';
import { goToHomeTab, goToMyOrders } from '../utils/navigation';
import { PaymentMethods, PaymentMethodType } from '../constants/Payment';
import { ASSET_URL } from '../app/api/client';
import { getLoyaltyPolicyApi } from '../app/api/reward';
import * as Types from '../app/actions';
import Header from '../components/Header';
import AlertMsg from '../components/AlertMsg/AlertMsg';
import Button from '../components/Button';
import StickyBottomBar from '../components/StickyBottomBar';
import { mergeSurfaceCardStyle, SURFACE_CARD_CLASS } from '../utils/cardStyles';
import { hasDeliverableAddress } from '../utils/address';
import { showBlockingInfo } from '../utils/userFeedback';

const BRAND = '#52622E';
type OrderFlowStatus = 'processing' | 'success';

const SectionCard = ({
    icon,
    label,
    value,
    onPress,
}: {
    icon: string;
    label: string;
    value: string;
    onPress: () => void;
}) => (
    <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={mergeSurfaceCardStyle()}
        className={`${SURFACE_CARD_CLASS} px-4 py-3 mb-3`}
    >
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
                <Icon name={icon} size={16} color="#6B7280" />
                <Text className="ml-2 text-[14px] font-montserrat-bold text-dark-gray">{label}</Text>
            </View>
            <Icon name="chevron-forward" size={17} color="#9CA3AF" />
        </View>
        <Text className="text-xs font-montserrat text-gray mt-2" numberOfLines={2}>
            {value}
        </Text>
    </TouchableOpacity>
);

const SuccessIcon = () => (
    <View className="w-28 h-28 items-center justify-center mb-6">
        <View className="absolute w-3 h-3 rounded-full bg-brand/30 top-2 left-6" />
        <View className="absolute w-2 h-2 rounded-full bg-brand/40 top-8 right-4" />
        <View className="absolute w-2.5 h-2.5 rounded-full bg-brand/25 bottom-6 left-3" />
        <View className="absolute w-2 h-2 rounded-full bg-brand/35 bottom-4 right-6" />
        <View className="w-20 h-20 rounded-full bg-brand items-center justify-center">
            <Icon name="checkmark" size={44} color="#FFFFFF" />
        </View>
    </View>
);

const CheckoutOrderItem = ({ item }: { item: CartItem }) => {
    const { product, quantity, price, productName, productImageUrl } = item;

    const getImageUrl = (url?: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const separator = url.startsWith('/') ? '' : '/';
        return `${ASSET_URL}${separator}${url}`;
    };

    const productObj = typeof product === 'object' && product !== null ? product : null;
    const imageUri =
        typeof product === 'string'
            ? productImageUrl
            : productObj?.imageUrl || productObj?.image;

    const imageSource = imageUri
        ? { uri: getImageUrl(imageUri) ?? undefined }
        : require('../assets/logos/logo.png');

    const displayName =
        typeof product === 'string' ? productName : productObj?.name || productName || 'Product';

    const size = productObj?.size || 'N/A';
    const color = productObj?.color || 'N/A';
    const lineTotal = (parseFloat(price || '0') * quantity).toFixed(2);

    return (
        <View className="flex-row py-3 border-b border-border-color">
            <View className="w-[64px] h-[78px] rounded-lg bg-gray-100 overflow-hidden mr-3">
                <Image source={imageSource} className="w-full h-full" resizeMode="cover" />
            </View>
            <View className="flex-1 justify-between py-0.5">
                <View>
                    <Text
                        className="text-[14px] font-montserrat-bold text-dark-gray leading-5"
                        numberOfLines={2}
                    >
                        {displayName}
                    </Text>
                    <Text className="text-[11px] font-montserrat text-gray mt-1">Size: {size}</Text>
                    <View className="flex-row items-center mt-0.5">
                        <Text className="text-[11px] font-montserrat text-gray mr-1.5">
                            Color: {color}
                        </Text>
                        <View className="w-2.5 h-2.5 rounded-full bg-[#111827]" />
                    </View>
                    <Text className="text-[11px] font-montserrat text-gray mt-0.5">
                        Qty: {quantity}
                    </Text>
                </View>
                <Text className="text-[20px] font-montserrat-bold text-brand mt-1">
                    ₱{lineTotal}
                </Text>
            </View>
        </View>
    );
};

const CheckoutScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useDispatch();

    const { items: cartItems } = useSelector((state: RootState) => state.cart);
    const { data: authData } = useSelector((state: RootState) => state.authentication);
    const { data: customerFromSlice, isLoading: isCustomerLoading } = useSelector(
        (state: RootState) => state.customer,
    );
    const {
        isLoading: isOrdering,
        isError: isOrderError,
        error: orderError,
        lastCreatedOrder,
    } = useSelector((state: RootState) => state.order);
    const savedAddresses = useSelector((state: RootState) => state.address.items);

    const token = authData?.token;
    const customerRef = getCustomerRefFromUser(authData?.user);
    const customerData: Customer | null =
        customerFromSlice || getEmbeddedCustomer(authData?.user?.customer);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(PaymentMethods.CASH);
    const [selectedAddressId, setSelectedAddressId] = useState('home');
    const [selectedAddressName, setSelectedAddressName] = useState('Home');
    const [selectedAddressText, setSelectedAddressText] = useState('');
    const [selectedCustomerAddressIri, setSelectedCustomerAddressIri] = useState<string | undefined>();
    const [selectedDeliveryId, setSelectedDeliveryId] = useState('jt-express');
    const [selectedDeliveryName, setSelectedDeliveryName] = useState('J&T Express');
    const [selectedDeliveryEstimate, setSelectedDeliveryEstimate] = useState(
        '2–4 business days nationwide',
    );
    const [selectedDeliveryFee, setSelectedDeliveryFee] = useState('₱89.00');
    const [selectedPaymentId, setSelectedPaymentId] = useState('cash');
    const [selectedPaymentLabel, setSelectedPaymentLabel] = useState('Cash');
    const [selectedPaymentGatewayType, setSelectedPaymentGatewayType] = useState<'paypal' | 'direct'>(
        'direct',
    );
    const [selectedRedeemPoints, setSelectedRedeemPoints] = useState(0);
    const [selectedRedeemDiscount, setSelectedRedeemDiscount] = useState(0);
    const [selectedRedeemRate, setSelectedRedeemRate] = useState(10);
    const [policyMinOrder, setPolicyMinOrder] = useState(100);
    const [policyMaxRedeemPercent, setPolicyMaxRedeemPercent] = useState(0.3);
    const [paypalPreparedAmount, setPaypalPreparedAmount] = useState<string | null>(null);
    const [checkoutSnapshot, setCheckoutSnapshot] = useState<CheckoutSnapshot | null>(null);
    const [flowStatus, setFlowStatus] = useState<'idle' | OrderFlowStatus>('idle');
    const [pointsEarned, setPointsEarned] = useState(0);
    const [pointsUsed, setPointsUsed] = useState(0);
    const [pricingSnapshot, setPricingSnapshot] = useState<{ promoDiscount: number; finalTotal: number } | null>(
        null,
    );
    const orderPendingRef = useRef(false);
    const insets = useSafeAreaInsets();
    const scrollBottomPadding = Math.max(insets.bottom, 16) + 80;

    const selectedItems = useMemo(() => getSelectedCartItems(cartItems), [cartItems]);
    const deliveryFeeValue = useMemo(
        () => parseCurrencyAmount(selectedDeliveryFee),
        [selectedDeliveryFee],
    );
    const totals = useMemo(
        () => calculateCheckoutTotals(selectedItems, deliveryFeeValue),
        [selectedItems, deliveryFeeValue],
    );

    const displayItems = checkoutSnapshot?.items ?? selectedItems;
    const displayTotals = checkoutSnapshot?.totals ?? totals;

    const defaultSavedAddress = useMemo(
        () => savedAddresses.find((item) => item.isDefault) || savedAddresses[0],
        [savedAddresses],
    );

    const addressSummary = useMemo(() => {
        if (selectedAddressText) return selectedAddressText;
        if (defaultSavedAddress) {
            return [
                defaultSavedAddress.address,
                defaultSavedAddress.city,
                defaultSavedAddress.state,
                defaultSavedAddress.postalCode,
            ]
                .filter(Boolean)
                .join(', ');
        }
        if (!customerData?.address) return 'Add your delivery address';
        const parts = [
            customerData.address,
            customerData.city,
            customerData.state,
            customerData.postalCode,
        ].filter(Boolean);
        return parts.join(', ');
    }, [customerData, defaultSavedAddress, selectedAddressText]);

    const customerDisplayName = useMemo(() => {
        const firstName = customerData?.firstName?.trim() || '';
        const lastName = customerData?.lastName?.trim() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || 'Customer';
    }, [customerData]);

    const walletState = useSelector((state: RootState) => state.wallet.wallet);
    const availablePoints = walletState?.rewardPoints ?? 0;
    const walletBalance = parseCurrencyAmount(walletState?.balance ?? '0');

    const activePromoDiscount =
        pricingSnapshot?.promoDiscount ??
        Math.min(selectedRedeemDiscount, Number(displayTotals.totalFormatted));
    const activeFinalTotal = pricingSnapshot?.finalTotal ?? Number(displayTotals.totalFormatted) - activePromoDiscount;
    const activeFinalTotalFormatted = activeFinalTotal.toFixed(2);

    const paymentMethodSummary = useMemo(() => {
        if (paymentMethod === PaymentMethods.WALLET) {
            return `${selectedPaymentLabel}\nBalance: ₱${walletBalance.toFixed(2)} · Pay: ₱${activeFinalTotalFormatted}`;
        }
        return selectedPaymentLabel;
    }, [paymentMethod, selectedPaymentLabel, walletBalance, activeFinalTotalFormatted]);

    useEffect(() => {
        if (token) {
            dispatch({ type: Types.GET_ADDRESSES });
        }
    }, [token, dispatch]);

    useEffect(() => {
        if (token && customerRef) {
            dispatch({ type: Types.GET_WALLET, payload: { id: customerRef, token } });
        }
    }, [token, customerRef, dispatch]);

    useEffect(() => {
        if (!customerFromSlice && customerRef && token) {
            dispatch({
                type: Types.GET_CUSTOMER,
                payload: { id: customerRef, token },
            });
        }
    }, [customerFromSlice, customerRef, token, dispatch]);

    useEffect(() => {
        if (!token) return;

        getLoyaltyPolicyApi(token)
            .then((policy) => {
                setSelectedRedeemRate(policy.pointsPerCurrency);
                setPolicyMinOrder(policy.minOrderForRedemption);
                setPolicyMaxRedeemPercent(policy.maxRedemptionPercentage);
            })
            .catch(() => {
                // Keep defaults if policy endpoint is temporarily unavailable.
            });
    }, [token]);

    useEffect(() => {
        if (addressSummary && !selectedAddressText) {
            setSelectedAddressText(addressSummary);
        }
    }, [addressSummary, selectedAddressText]);

    useEffect(() => {
        if (!route.params?.selectedAddressName) {
            setSelectedAddressName(`Home (${customerDisplayName})`);
        }
    }, [customerDisplayName, route.params]);

    useEffect(() => {
        setSelectedRedeemDiscount(Number((selectedRedeemPoints / Math.max(1, selectedRedeemRate)).toFixed(2)));
    }, [selectedRedeemPoints, selectedRedeemRate]);

    useEffect(() => {
        const params = route.params || {};
        if (params.selectedAddressId) setSelectedAddressId(params.selectedAddressId);
        if (params.selectedAddressName) setSelectedAddressName(params.selectedAddressName);
        if (params.selectedAddress) setSelectedAddressText(params.selectedAddress);
        if (params.selectedCustomerAddressIri) {
            setSelectedCustomerAddressIri(params.selectedCustomerAddressIri);
        }
        if (params.selectedDeliveryId) setSelectedDeliveryId(params.selectedDeliveryId);
        if (params.selectedDeliveryName) setSelectedDeliveryName(params.selectedDeliveryName);
        if (params.selectedDeliveryEstimate) setSelectedDeliveryEstimate(params.selectedDeliveryEstimate);
        if (params.selectedDeliveryFee) setSelectedDeliveryFee(params.selectedDeliveryFee);
        if (params.selectedPaymentId) setSelectedPaymentId(params.selectedPaymentId);
        if (params.selectedPaymentLabel) setSelectedPaymentLabel(params.selectedPaymentLabel);
        if (params.selectedBackendPaymentMethod) {
            setPaymentMethod(params.selectedBackendPaymentMethod as PaymentMethodType);
        }
        if (params.selectedPaymentGatewayType) {
            setSelectedPaymentGatewayType(params.selectedPaymentGatewayType);
        }
        if (typeof params.selectedRedeemPoints === 'number') {
            setSelectedRedeemPoints(params.selectedRedeemPoints);
        }
        if (typeof params.selectedRedeemRate === 'number') {
            setSelectedRedeemRate(Math.max(1, params.selectedRedeemRate));
        }
    }, [route.params]);

    useEffect(() => {
        if (flowStatus !== 'idle' || checkoutSnapshot) {
            return;
        }
        if (selectedItems.length === 0) {
            navigation.goBack();
        }
    }, [selectedItems.length, flowStatus, checkoutSnapshot, navigation]);

    useEffect(() => {
        if (!orderPendingRef.current || isOrdering) {
            return;
        }

        orderPendingRef.current = false;

        if (isOrderError) {
            setFlowStatus('idle');
            setCheckoutSnapshot(null);
            AlertMsg.customError({
                title: 'Checkout Failed',
                message: orderError || 'Unable to place your order. Please try again.',
            });
            return;
        }

        const points =
            (lastCreatedOrder as { rewardPoints?: number; totalPoints?: number })?.rewardPoints ??
            (lastCreatedOrder as { totalPoints?: number })?.totalPoints ??
            0;
        setPointsEarned(points);
        setPointsUsed((lastCreatedOrder as { pointsRedeemed?: number })?.pointsRedeemed ?? selectedRedeemPoints);
        if (paymentMethod === PaymentMethods.WALLET && token && customerRef) {
            dispatch({ type: Types.GET_WALLET, payload: { id: customerRef, token } });
        }
        setFlowStatus('success');
    }, [isOrdering, isOrderError, orderError, lastCreatedOrder, paymentMethod, token, customerRef, dispatch, selectedRedeemPoints]);

    const resetCheckoutFlow = () => {
        setFlowStatus('idle');
        setCheckoutSnapshot(null);
        setPricingSnapshot(null);
        setPointsEarned(0);
        setPointsUsed(0);
    };

    const handleViewMyOrder = () => {
        goToMyOrders(navigation);
    };

    const handleBackHome = () => {
        goToHomeTab(navigation);
    };

    const handleConfirmOrder = () => {
        if (!token) {
            AlertMsg.customInfo({
                title: 'Notice',
                message: 'Please log in to place an order.',
            });
            return;
        }

        if (isCustomerLoading) {
            AlertMsg.customInfo({
                title: 'Notice',
                message: 'Loading your profile information... Please try again in a moment.',
            });
            return;
        }

        const canDeliver = hasDeliverableAddress(
            savedAddresses,
            customerData?.address,
            customerData?.contactNumber,
        );
        if (!canDeliver) {
            AlertMsg.customInfo({
                title: 'Notice',
                message:
                    'Please add a delivery address and contact number in Manage Addresses before placing an order.',
            });
            return;
        }

        const hasValidDelivery =
            Boolean(selectedDeliveryId?.trim()) &&
            Boolean(selectedDeliveryName?.trim()) &&
            deliveryFeeValue >= 0;
        if (!hasValidDelivery) {
            AlertMsg.customInfo({
                title: 'Delivery Required',
                message: 'Please select a valid delivery option before confirming your order.',
            });
            return;
        }

        const hasValidPayment =
            Boolean(selectedPaymentId?.trim()) &&
            Boolean(selectedPaymentLabel?.trim()) &&
            Boolean(paymentMethod);
        if (!hasValidPayment) {
            AlertMsg.customInfo({
                title: 'Payment Required',
                message: 'Please select a valid payment method before confirming your order.',
            });
            return;
        }

        if (paymentMethod === PaymentMethods.WALLET && walletBalance < activeFinalTotal) {
            AlertMsg.customInfo({
                title: 'Insufficient Wallet Balance',
                message: `You need ₱${activeFinalTotalFormatted} but your wallet has ₱${walletBalance.toFixed(2)}. Top up in My Wallet or choose another payment method.`,
            });
            return;
        }

        const needsPaypalGateway =
            selectedPaymentGatewayType === 'paypal' || paymentMethod === PaymentMethods.PAYPAL;
        if (needsPaypalGateway && paypalPreparedAmount !== activeFinalTotalFormatted) {
            const paypalUrl = `${ASSET_URL}/paypal/payment?amount=${encodeURIComponent(activeFinalTotalFormatted)}`;
            Linking.openURL(paypalUrl)
                .then(() => {
                    setPaypalPreparedAmount(activeFinalTotalFormatted);
                    AlertMsg.customInfo({
                        title: 'PayPal',
                        message:
                            'Complete your PayPal payment in the browser, then tap Confirm Order again.',
                    });
                })
                .catch(() => {
                    AlertMsg.customError({
                        title: 'PayPal',
                        message: 'Unable to open PayPal checkout. Please try again.',
                    });
                });
            return;
        }

        setCheckoutSnapshot({
            items: [...selectedItems],
            totals: { ...totals },
        });
        setPricingSnapshot({
            promoDiscount: activePromoDiscount,
            finalTotal: activeFinalTotal,
        });
        orderPendingRef.current = true;
        setFlowStatus('processing');

        // Backend applies pointsRedeemed — send gross total (fees included), not post-redemption total.
        const addressIri =
            selectedCustomerAddressIri ||
            (defaultSavedAddress
                ? defaultSavedAddress['@id'] ||
                  `/api/customer_addresses/${defaultSavedAddress.id}`
                : undefined);

        const orderData = buildOrderPayload(
            selectedItems,
            paymentMethod,
            displayTotals.totalFormatted,
            selectedRedeemPoints,
            {
                method: selectedDeliveryName,
                fee: displayTotals.deliveryFeeFormatted,
            },
            addressIri,
        );

        const idempotencyKey = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        dispatch({
            type: Types.CREATE_ORDER,
            payload: { data: orderData, token, idempotencyKey },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
            <Header
                title="Checkout"
                hideNotificationBell
                rightActions={[
                    {
                        icon: 'ellipsis-vertical',
                        onPress: () =>
                            showBlockingInfo({
                                title: 'Checkout Options',
                                message: 'More checkout actions will be available soon.',
                            }),
                    },
                ]}
            />

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
            >
                {/* Delivery Address */}
                <SectionCard
                    icon="location-outline"
                    label="Delivery Address"
                    value={`${selectedAddressName}\n${selectedAddressText || addressSummary}`}
                    onPress={() =>
                        navigation.navigate(ROUTES.CHOOSE_DELIVERY_ADDRESS, {
                            selectedAddressId,
                            sourceCheckoutRouteKey: route.key,
                        })
                    }
                />

                {/* Your Order */}
                <View
                    className={`${SURFACE_CARD_CLASS} px-4 pt-3 pb-1 mb-3`}
                    style={mergeSurfaceCardStyle()}
                >
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center flex-1">
                            <Text className="text-[14px] font-montserrat-bold text-dark-gray">
                                Your Order ({displayTotals.itemCount})
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('BottomTab', { screen: 'Cart' })
                            }
                            className="w-8 h-8 items-center justify-center"
                        >
                            <Icon name="add" size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    {displayItems.map((item, index) => (
                        <View
                            key={item.id?.toString() ?? index}
                            className={index === displayItems.length - 1 ? 'border-b-0' : ''}
                        >
                            <CheckoutOrderItem item={item} />
                        </View>
                    ))}
                </View>

                <SectionCard
                    icon="car-outline"
                    label="Delivery Options"
                    value={`${selectedDeliveryName}\n${selectedDeliveryEstimate}`}
                    onPress={() =>
                        navigation.navigate(ROUTES.CHOOSE_DELIVERY, {
                            selectedDeliveryId,
                            sourceCheckoutRouteKey: route.key,
                        })
                    }
                />

                <SectionCard
                    icon="card-outline"
                    label="Payment Methods"
                    value={paymentMethodSummary}
                    onPress={() =>
                        navigation.navigate(ROUTES.CHOOSE_PAYMENT_METHOD, {
                            selectedPaymentId,
                            checkoutTotal: activeFinalTotal,
                            sourceCheckoutRouteKey: route.key,
                        })
                    }
                />

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.navigate(ROUTES.PROMOS_VOUCHERS, {
                            sourceCheckoutRouteKey: route.key,
                            selectedRedeemPoints,
                            checkoutTotal: Number(totals.totalFormatted),
                        })
                    }
                    style={mergeSurfaceCardStyle()}
                    className={`${SURFACE_CARD_CLASS} px-4 py-3 mb-3`}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Icon name="pricetag-outline" size={18} color={BRAND} />
                            <Text className="ml-2 text-[14px] font-montserrat-bold text-dark-gray">
                                Promos & Vouchers
                            </Text>
                        </View>
                        <Icon name="chevron-forward" size={18} color="#9CA3AF" />
                    </View>
                    <View className="h-px bg-border-color mt-2.5 mb-2.5" />
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-sm font-montserrat-bold text-dark-gray">
                                {selectedRedeemPoints > 0 ? `${selectedRedeemPoints} pts applied` : 'No promo selected'}
                            </Text>
                            <Text className="text-xs font-montserrat text-gray mt-1">
                                Available points: {availablePoints} pts
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="w-8 h-8 items-center justify-center"
                            onPress={() => {
                                setSelectedRedeemPoints(0);
                                setSelectedRedeemDiscount(0);
                            }}
                        >
                            <Icon name="close" size={16} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>

                {/* Review Summary */}
                <View
                    className={`${SURFACE_CARD_CLASS} px-4 py-4 mt-1`}
                    style={mergeSurfaceCardStyle()}
                >
                    <Text className="text-[14px] font-montserrat-bold text-dark-gray mb-3">
                        Review Summary
                    </Text>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-[13px] font-montserrat text-gray">
                            Subtotal ({displayTotals.itemCount} items)
                        </Text>
                        <Text className="text-[13px] font-montserrat-bold text-dark-gray">
                            ₱{displayTotals.subtotalFormatted}
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-[13px] font-montserrat text-gray">Service Fee</Text>
                        <Text className="text-[13px] font-montserrat-bold text-dark-gray">
                            ₱{displayTotals.serviceFeeFormatted}
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-3">
                        <Text className="text-[13px] font-montserrat text-gray">Delivery Fee</Text>
                        <Text className="text-[13px] font-montserrat-bold text-dark-gray">
                            ₱{displayTotals.deliveryFeeFormatted}
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-3">
                        <Text className="text-[13px] font-montserrat text-gray">Tax</Text>
                        <Text className="text-[13px] font-montserrat-bold text-dark-gray">
                            ₱{displayTotals.taxFormatted}
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-3">
                        <Text className="text-[13px] font-montserrat text-gray">Promo</Text>
                        <Text className="text-[13px] font-montserrat-bold text-dark-gray">
                            - ₱{activePromoDiscount.toFixed(2)}
                        </Text>
                    </View>
                    <Text className="text-xs font-montserrat text-gray mb-3">
                        Max {(policyMaxRedeemPercent * 100).toFixed(0)}% redeem, min order ₱
                        {policyMinOrder.toFixed(2)}
                    </Text>

                    <View className="h-px bg-border-color mb-3" />

                    <View className="flex-row justify-between items-center">
                        <Text className="text-base font-montserrat-bold text-dark-gray">
                            Total Payment
                        </Text>
                        <Text className="text-lg font-montserrat-bold text-dark-gray">
                            ₱{activeFinalTotalFormatted}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <StickyBottomBar variant="sticky">
                <Button
                    label="Confirm Order"
                    onPress={handleConfirmOrder}
                    disabled={flowStatus !== 'idle'}
                    size="md"
                    shape="pill"
                />
            </StickyBottomBar>

            <ReusableOverlay
                visible={flowStatus === 'processing' || flowStatus === 'success'}
                closeOnBackdropPress={false}
                backdropClassName="flex-1 bg-black/50 justify-center items-center px-8"
                contentClassName="bg-white rounded-3xl w-full max-w-sm px-6 py-8 items-center"
            >
                {flowStatus === 'processing' ? (
                    <LoadingState
                        fill={false}
                        card={false}
                        message="Processing payment..."
                        className="w-full"
                    />
                ) : (
                    <>
                        <SuccessIcon />
                        <Text className="text-xl font-montserrat-bold text-dark-gray text-center mb-3">
                            Order Confirmed!
                        </Text>
                        <Text className="text-sm font-montserrat text-gray text-center leading-5 mb-2 px-2">
                            Peep your order details in &apos;My Order&apos; and start planning outfits.
                        </Text>
                        {pointsEarned > 0 && (
                            <View className="bg-brand/5 px-4 py-2 rounded-xl mb-4 flex-row items-center">
                                <Icon name="star" size={16} color={BRAND} />
                                <Text className="ml-2 text-brand font-montserrat-bold text-xs">
                                    You earned {pointsEarned} points!
                                </Text>
                            </View>
                        )}
                        {pointsUsed > 0 && (
                            <View className="bg-terracotta/10 px-4 py-2 rounded-xl mb-4 flex-row items-center">
                                <Icon name="gift-outline" size={16} color="#B45309" />
                                <Text className="ml-2 text-[#B45309] font-montserrat-bold text-xs">
                                    You redeemed {pointsUsed} points.
                                </Text>
                            </View>
                        )}
                        <Button
                            label="View My Order"
                            onPress={handleViewMyOrder}
                            size="md"
                            shape="pill"
                            className="mt-2 mb-3"
                        />
                        <Button
                            label="Back to Home"
                            onPress={handleBackHome}
                            variant="soft"
                            size="md"
                            shape="pill"
                        />
                    </>
                )}
            </ReusableOverlay>

        </SafeAreaView>
    );
};

export default CheckoutScreen;
