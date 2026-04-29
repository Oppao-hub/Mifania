import React from 'react';
import { ScrollView, ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Category } from '../types';

interface CategoriesListProps {
  categories: Category[];
  isLoading: boolean;
  activeId?: number | string | null; // Controlled from parent (HomeScreen)
  onCategoryPress?: (category: Category) => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ 
  categories, 
  isLoading, 
  activeId,
  onCategoryPress 
}) => {
  return (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginHorizontal: -16 }} // Expands scroll area to screen edges
        contentContainerStyle={{ 
          paddingVertical: 10,
          paddingHorizontal: 16 // Matches HomeScreen padding
        }}
      >
        {categories.map((category) => {
          const isActive = activeId === category.id;

          return (
            <TouchableOpacity 
              key={category.id}
              onPress={() => onCategoryPress?.(category)}
              activeOpacity={0.7}
              className={`px-5 py-2.5 rounded-2xl border mr-3 ${
                isActive 
                  ? 'bg-brand border-brand' 
                  : 'bg-white border-border-color' 
              }`}
            >
              <Text 
                className={`text-sm font-montserrat-bold tracking-wide ${
                  isActive ? 'text-white' : 'text-gray'
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {isLoading && categories.length === 0 && (
           <ActivityIndicator size="small" color="#52622E" className="ml-4" />
        )}
      </ScrollView>
    </View>
  );
};

export default CategoriesList;