import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

export interface RoleCardProps {
  title: string;
  subtitle: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  illustration: React.ReactNode;
}

export default function RoleCard({ title, subtitle, description, selected, onPress, illustration }: RoleCardProps) {
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable onPress={handlePress} style={[styles.card, selected ? styles.cardSelected : styles.cardDefault]}>
        {selected && (
          <LinearGradient
            colors={['#eef0ff', '#f5f6ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={[styles.illustrationWrap, selected && styles.illustrationWrapSelected]}>{illustration}</View>

        <View style={styles.textBlock}>
          <Text style={[styles.cardTitle, selected && styles.cardTitleSelected]}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>

        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
    backgroundColor: 'white',
  },
  cardDefault: {
    borderColor: '#e2e8f0',
  },
  cardSelected: {
    borderColor: '#485aff',
    shadowColor: '#485aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  illustrationWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  illustrationWrapSelected: {
    backgroundColor: '#e8eaff',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Manrope-ExtraBold',
    color: '#1e293b',
    marginBottom: 2,
  },
  cardTitleSelected: {
    color: '#485aff',
  },
  cardSubtitle: {
    fontSize: 11,
    fontFamily: 'Manrope-SemiBold',
    color: '#64748b',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    fontFamily: 'Manrope-Regular',
    color: '#94a3b8',
    lineHeight: 15,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: '#485aff',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#485aff',
  },
});
