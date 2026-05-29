import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type EmbeddedQrTagProps = {
  value: string;
  imageUrl?: string | null;
  size?: number;
  onPress?: () => void;
};

const EmbeddedQrTag: React.FC<EmbeddedQrTagProps> = ({
  value,
  imageUrl,
  size = 48,
  onPress,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const qrSize = Math.max(size - 8, 24);
  const scanValue = value?.trim() ?? '';

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl, scanValue]);

  const canGenerate = scanValue.length > 0;
  const useServerImage = Boolean(imageUrl) && !imageFailed && !canGenerate;

  const content = canGenerate ? (
    <QRCode value={scanValue} size={qrSize} />
  ) : useServerImage ? (
    <Image
      source={{ uri: imageUrl! }}
      style={{ width: qrSize, height: qrSize }}
      resizeMode="contain"
      onError={() => setImageFailed(true)}
    />
  ) : null;

  if (!content) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
      className="absolute bottom-2 right-2 bg-white p-1 rounded-lg shadow-md border border-gray-100"
    >
      <View className="items-center justify-center">{content}</View>
    </TouchableOpacity>
  );
};

export default EmbeddedQrTag;
