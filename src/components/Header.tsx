import React from 'react';
import { View, TouchableOpacity, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { IMG } from '../utils';

interface HomeHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HomeHeaderProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <View className="bg-app-bg">
      {/* --- Top Row --- */}
      <View className="px-4 py-3 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Image 
            source={IMG.LOGO} 
            className="w-10 h-10" 
            resizeMode="contain" 
          />
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 p-1">
            <Icon name="notifications-outline" size={26} color="#4B5563" />
            <View className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full border border-white" />
          </TouchableOpacity>
          <TouchableOpacity className="p-1">
            <Icon name="chatbubble-ellipses-outline" size={26} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Search Bar --- */}
      <View className="px-4 pb-2">
        <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-12 shadow-sm">
          <Icon name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for fashion..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-sm font-montserrat text-dark-gray"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default Header;