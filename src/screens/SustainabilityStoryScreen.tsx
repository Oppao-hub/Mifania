import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ASSET_URL } from '../app/api/client';
import { Product, Story } from '../utils/types';
import SurfaceCard from '../components/SurfaceCard';

type RouteParams = {
  product: Product;
  story: Story;
};

type TimelineStage = {
  label: string;
  title: string;
  content: string;
  icon: string;
};

const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const separator = url.startsWith('/') ? '' : '/';
  return `${ASSET_URL}${separator}${url}`;
};

export default function SustainabilityStoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { product, story } = (route.params || {}) as RouteParams;

  const heroImage =
    getImageUrl(product?.imageUrl) ||
    getImageUrl(product?.image) ||
    null;

  const stages: TimelineStage[] = [
    {
      label: 'Raw Materials',
      title: story?.title || 'Regenerative Origins',
      content:
        story?.materialContent ||
        'Every fiber begins in rich, volcanic soil. We prioritize regenerative agriculture and organic sourcing.',
      icon: 'leaf-outline',
    },
    {
      label: 'Ethical Craft',
      title: 'The Mifania Collective',
      content:
        story?.artisanContent ||
        'Hand-cut and sewn by local artisans with fair living wages, ensuring dignity in every stitch.',
      icon: 'cut-outline',
    },
    {
      label: 'Eco-Dyeing',
      title: 'Botanical Pigments',
      content:
        story?.dyeingContent ||
        'Using recycled rainwater and plant-based dyes, we keep harmful chemicals out of local ecosystems.',
      icon: 'water-outline',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View className="absolute top-0 left-0 right-0 z-20">
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center justify-between px-4 h-14">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
            >
              <Icon name="arrow-back" color="#FFFFFF" size={22} />
            </TouchableOpacity>
            <Text className="text-white text-sm font-bold uppercase tracking-widest">
              Transparency
            </Text>
            <View className="w-10" />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="h-72 bg-gray-900 relative overflow-hidden">
          {heroImage ? (
            <Image source={{ uri: heroImage }} className="absolute inset-0 w-full h-full opacity-40" blurRadius={2} />
          ) : null}
          <View className="absolute inset-0 bg-black/50" />
          <View className="flex-1 items-center justify-center px-6 pt-16">
            <Text className="text-[10px] font-bold tracking-[0.35em] text-white/90 uppercase mb-3 text-center">
              Mifania Transparency Passport
            </Text>
            <Text className="text-2xl font-bold text-white uppercase tracking-tight text-center mb-3">
              {product?.name}
            </Text>
            <View className="flex-row flex-wrap items-center justify-center gap-2">
              <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                SKU: {product?.id}
              </Text>
              <Text className="text-white/50 text-[10px]">•</Text>
              <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                {product?.material || 'Eco-Fiber'}
              </Text>
              <Text className="text-white/50 text-[10px]">•</Text>
              <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                100% Traceable
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 -mt-8">
          <SurfaceCard className="p-5">
            <View className="items-center mb-8">
              <Text className="text-lg font-bold text-brand-dark uppercase tracking-tight mb-2">
                From Seed to Studio
              </Text>
              <Text className="text-sm text-gray text-center leading-5 italic">
                Every Mifania garment tells a story of ethical labor, environmental respect, and artistic passion.
              </Text>
            </View>

            <View className="gap-5">
              {stages.map((stage) => (
                <View key={stage.label} className="flex-row gap-3">
                  <View className="w-10 h-10 rounded-full border border-border-color bg-white items-center justify-center">
                    <Icon name={stage.icon} size={18} color="#52622E" />
                  </View>
                  <View className="flex-1 bg-light-gray rounded-xl p-4 border border-gray-100">
                    <Text className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">
                      {stage.label}
                    </Text>
                    <Text className="text-sm font-bold text-dark-gray mb-2">{stage.title}</Text>
                    <Text className="text-xs text-gray leading-5">{stage.content}</Text>
                  </View>
                </View>
              ))}
            </View>

            {product?.ecoInfo ? (
              <View className="mt-8 pt-6 border-t border-border-color">
                <Text className="text-[10px] font-bold text-brand uppercase tracking-widest mb-2">
                  Impact Summary
                </Text>
                <Text className="text-sm text-dark-gray leading-5">{product.ecoInfo}</Text>
              </View>
            ) : null}
          </SurfaceCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
