import React from 'react';
import { View, ViewProps } from 'react-native';
import { SURFACE_CARD_CLASS, mergeSurfaceCardStyle } from '../utils/cardStyles';

type SurfaceCardProps = ViewProps & {
    className?: string;
};

const SurfaceCard: React.FC<SurfaceCardProps> = ({
    className = '',
    style,
    children,
    ...rest
}) => (
    <View className={`${SURFACE_CARD_CLASS} ${className}`} style={mergeSurfaceCardStyle(style)} {...rest}>
        {children}
    </View>
);

export default SurfaceCard;
