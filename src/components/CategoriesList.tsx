import React from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import FeatureItem from './FeatureItem';
import { Category } from '../types';

interface CategoriesListProps {
  categories: Category[];
  isLoading: boolean;
  onCategoryPress?: (category: Category) => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ 
  categories, 
  isLoading, 
  onCategoryPress 
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={{ paddingVertical: 10 }}
    >
      {categories.map((category) => (
        <FeatureItem
          key={category.id} 
          name={category.name}
          onPress={() => onCategoryPress?.(category)}
        />
      ))}
      {isLoading && categories.length === 0 && (
         <ActivityIndicator size="small" color="#52622E" className="ml-4" />
      )}
    </ScrollView>
  );
};

export default CategoriesList;