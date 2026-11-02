import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

interface StarRatingProps {
  rating: number; // 1 a 5
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = React.memo(
  ({
    rating,
    maxStars = 5,
    size = 28,
    interactive = false,
    onRatingChange,
    showValue = false,
  }) => {
    const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

    const handlePress = (selectedStar: number) => {
      if (interactive && onRatingChange) {
        onRatingChange(selectedStar);
      }
    };

    return (
      <View
        style={styles.container}
        accessible={true}
        accessibilityRole={interactive ? 'adjustable' : 'text'}
        accessibilityLabel={`Avaliação: ${rating} de ${maxStars} estrelas`}
      >
        <View style={styles.starsRow}>
          {stars.map((starIndex) => {
            const isFilled = starIndex <= Math.round(rating);

            if (interactive) {
              return (
                <TouchableOpacity
                  key={starIndex}
                  onPress={() => handlePress(starIndex)}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Dar nota ${starIndex} de ${maxStars}`}
                  accessibilityState={{ selected: isFilled }}
                  style={styles.starTouchArea}
                >
                  <Ionicons
                    name={isFilled ? 'star' : 'star-outline'}
                    size={size}
                    color={isFilled ? colors.star : colors.starEmpty}
                  />
                </TouchableOpacity>
              );
            }

            return (
              <Ionicons
                key={starIndex}
                name={isFilled ? 'star' : 'star-outline'}
                size={size}
                color={isFilled ? colors.star : colors.starEmpty}
                style={styles.starIcon}
              />
            );
          })}
        </View>

        {showValue && (
          <Text
            style={[styles.valueText, { fontSize: Math.max(12, size * 0.5) }]}
            allowFontScaling={true}
          >
            {rating > 0 ? `${rating.toFixed(0)}/${maxStars}` : 'Sem nota'}
          </Text>
        )}
      </View>
    );
  }
);

StarRating.displayName = 'StarRating';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starTouchArea: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  starIcon: {
    marginRight: 4,
  },
  valueText: {
    color: colors.star,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});
