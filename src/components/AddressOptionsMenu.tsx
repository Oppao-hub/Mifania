import React, { useMemo } from 'react';
import {
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getThemeColor } from '../theme';

export type MenuAnchor = {
    x: number;
    y: number;
    width: number;
    height: number;
};

interface AddressOptionsMenuProps {
    visible: boolean;
    anchor: MenuAnchor | null;
    onClose: () => void;
    onSetPrimary: () => void;
    onDelete: () => void;
    showSetPrimary?: boolean;
}

const MENU_WIDTH = 248;
const MENU_VERTICAL_GAP = 6;
const SCREEN_EDGE_PADDING = 12;

const AddressOptionsMenu: React.FC<AddressOptionsMenuProps> = ({
    visible,
    anchor,
    onClose,
    onSetPrimary,
    onDelete,
    showSetPrimary = true,
}) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const menuLayout = useMemo(() => {
        if (!anchor) {
            return null;
        }

        const itemCount = showSetPrimary ? 2 : 1;
        const menuHeight = itemCount * 52 + 8;

        let top = anchor.y + anchor.height + MENU_VERTICAL_GAP;
        let left = anchor.x + anchor.width - MENU_WIDTH;

        if (top + menuHeight > screenHeight - SCREEN_EDGE_PADDING) {
            top = anchor.y - menuHeight - MENU_VERTICAL_GAP;
        }

        top = Math.max(
            SCREEN_EDGE_PADDING,
            Math.min(top, screenHeight - menuHeight - SCREEN_EDGE_PADDING),
        );
        left = Math.max(
            SCREEN_EDGE_PADDING,
            Math.min(left, screenWidth - MENU_WIDTH - SCREEN_EDGE_PADDING),
        );

        return { top, left, width: MENU_WIDTH, height: menuHeight };
    }, [anchor, showSetPrimary, screenWidth, screenHeight]);

    if (!visible || !menuLayout) {
        return null;
    }

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable className="flex-1" onPress={onClose}>
                <View
                    pointerEvents="box-none"
                    style={{
                        position: 'absolute',
                        top: menuLayout.top,
                        left: menuLayout.left,
                        width: menuLayout.width,
                    }}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View className="bg-surface rounded-card py-1 border border-border-color overflow-hidden shadow-sm">
                            {showSetPrimary ? (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onClose();
                                        onSetPrimary();
                                    }}
                                    className="flex-row items-center px-5 py-3.5"
                                >
                                    <Icon name="location-outline" size={20} color={getThemeColor('brand.DEFAULT')} />
                                    <Text className="ml-3 text-[15px] font-montserrat-medium text-brand">
                                        Set As Primary Address
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    onClose();
                                    onDelete();
                                }}
                                className="flex-row items-center px-5 py-3.5"
                            >
                                <Icon name="trash-outline" size={20} color={getThemeColor('danger')} />
                                <Text className="ml-3 text-[15px] font-montserrat-medium text-danger">
                                    Delete Address
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
};

export default AddressOptionsMenu;
