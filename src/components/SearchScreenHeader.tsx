import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { showBlockingInfo } from '../utils/userFeedback';

interface SearchScreenHeaderProps {
  query: string;
  onChangeQuery: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchScreenHeader: React.FC<SearchScreenHeaderProps> = ({
  query,
  onChangeQuery,
  onSubmit,
  placeholder = 'Search products...',
  autoFocus = true,
}) => {
  const navigation = useNavigation();

  const handleCameraPress = () => {
    showBlockingInfo({
      title: 'Visual Search',
      message: 'Search by photo will be available in a future update.',
    });
  };

  return (
    <View className="flex-row items-center px-4 py-2 gap-2">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="w-10 h-10 items-center justify-center"
        hitSlop={8}
      >
        <Icon name="arrow-back" size={24} color="#4B5563" />
      </TouchableOpacity>

      <View className="flex-1 flex-row items-center bg-surface border border-border-color rounded-2xl px-3 h-11">
        <Icon name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoFocus={autoFocus}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-2 text-sm font-montserrat text-dark-gray py-0"
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => onChangeQuery('')} hitSlop={8}>
            <Icon name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={handleCameraPress} className="ml-2" hitSlop={8}>
          <Icon name="camera-outline" size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchScreenHeader;
