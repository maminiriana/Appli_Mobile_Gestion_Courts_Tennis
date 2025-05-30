import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { MapPin, DoorClosed, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const FEATURE_TRANSLATIONS = {
  'lighting': 'Éclairage',
  'benches': 'Bancs',
  'newNet': 'Filet neuf'
};

interface CourtItemProps {
  court: {
    id: string;
    name: string;
    description?: string;
    surface: string;
    indoor: boolean;
    image_url?: string;
    features?: string[];
  };
}

export default function CourtItem({ court }: CourtItemProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/court/${court.id}`);
  };

  const translateFeature = (featureId: string) => {
    return FEATURE_TRANSLATIONS[featureId as keyof typeof FEATURE_TRANSLATIONS] || featureId;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <Image 
        source={{ 
          uri: court.image_url || 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg'
        }} 
        style={styles.image} 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{court.name}</Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MapPin size={16} color={theme.colors.gray[600]} />
            <Text style={styles.detailText}>{court.surface}</Text>
          </View>
          <View style={styles.detailItem}>
            <DoorClosed size={16} color={theme.colors.gray[600]} />
            <Text style={styles.detailText}>
              {court.indoor ? 'Intérieur' : 'Extérieur'}
            </Text>
          </View>
        </View>
        {court.features && Array.isArray(court.features) && court.features.length > 0 && (
          <View style={styles.features}>
            {court.features.slice(0, 2).map((featureId, index) => (
              <View key={index} style={styles.feature}>
                <CheckCircle size={14} color={theme.colors.primary} />
                <Text style={styles.featureText}>
                  {translateFeature(featureId)}
                </Text>
              </View>
            ))}
            {court.features.length > 2 && (
              <Text style={styles.moreFeatures}>
                +{court.features.length - 2}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: theme.spacing.md,
  },
  name: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  details: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  detailText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.xs,
  },
  features: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[700],
    marginLeft: 4,
  },
  moreFeatures: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[500],
  },
});