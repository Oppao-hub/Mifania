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
import { mergeSurfaceCardStyle } from '../utils/cardStyles';

export type MenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AnchorMenuItem = {
  key: string;
  label: string;
  icon: string;
  tone?: 'default' | 'danger';
  onPress: () => void;
};

interface AnchorActionMenuProps {
  visible: boolean;
  anchor: MenuAnchor | null;
  items: AnchorMenuItem[];
  onClose: () => void;
  menuWidth?: number;
}

const MENU_VERTICAL_GAP = 6;
const SCREEN_EDGE_PADDING = 12;
const ITEM_HEIGHT = 48;

const AnchorActionMenu: React.FC<AnchorActionMenuProps> = ({
  visible,
  anchor,
  items,
  onClose,
  menuWidth = 200,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const menuLayout = useMemo(() => {
    if (!anchor) return null;

    const menuHeight = items.length * ITEM_HEIGHT + 8;
    let top = anchor.y + anchor.height + MENU_VERTICAL_GAP;
    let left = anchor.x + anchor.width - menuWidth;

    if (top + menuHeight > screenHeight - SCREEN_EDGE_PADDING) {
      top = anchor.y - menuHeight - MENU_VERTICAL_GAP;
    }

    top = Math.max(
      SCREEN_EDGE_PADDING,
      Math.min(top, screenHeight - menuHeight - SCREEN_EDGE_PADDING),
    );
    left = Math.max(
      SCREEN_EDGE_PADDING,
      Math.min(left, screenWidth - menuWidth - SCREEN_EDGE_PADDING),
    );

    return { top, left, width: menuWidth, height: menuHeight };
  }, [anchor, items.length, menuWidth, screenWidth, screenHeight]);

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
            <View
              className="bg-surface rounded-card py-1 border border-border-color overflow-hidden"
              style={mergeSurfaceCardStyle()}
            >
              {items.map((item) => {
                const isDanger = item.tone === 'danger';
                const iconColor = isDanger
                  ? getThemeColor('danger')
                  : getThemeColor('brand.DEFAULT');
                const textClass = isDanger ? 'text-danger' : 'text-dark-gray';

                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      item.onPress();
                    }}
                    className="flex-row items-center px-4 py-3"
                  >
                    <Icon name={item.icon} size={18} color={iconColor} />
                    <Text className={`ml-3 text-sm font-montserrat-medium ${textClass}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default AnchorActionMenu;
