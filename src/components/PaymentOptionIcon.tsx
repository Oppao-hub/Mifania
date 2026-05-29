import React from 'react';
import { Image, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SvgUri } from 'react-native-svg';
import { PaymentOption } from '../utils/checkoutOptions';
import { getCheckoutPaymentVisual } from '../utils/checkoutPaymentUi';

type PaymentOptionIconProps = {
    option: PaymentOption;
    size?: number;
};

const PaymentOptionIcon: React.FC<PaymentOptionIconProps> = ({ option, size = 44 }) => {
    const visual = getCheckoutPaymentVisual(option);
    const glyphSize = Math.round(size * 0.62);

    return (
        <View
            className="rounded-full bg-white border border-border-color items-center justify-center overflow-hidden"
            style={{ width: size, height: size }}
        >
            {visual.type === 'image' ? (
                <Image
                    source={visual.source}
                    style={{ width: glyphSize, height: glyphSize }}
                    resizeMode="contain"
                />
            ) : null}
            {visual.type === 'svg' ? (
                <SvgUri uri={visual.uri} width={glyphSize} height={glyphSize} />
            ) : null}
            {visual.type === 'icon' ? (
                <Icon name={visual.name} size={Math.round(size * 0.48)} color={visual.color} />
            ) : null}
        </View>
    );
};

export default PaymentOptionIcon;
