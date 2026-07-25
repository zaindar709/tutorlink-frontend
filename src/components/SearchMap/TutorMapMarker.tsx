import React, { memo } from 'react';
import { View, Text, Image } from 'react-native';
import * as MapLibreGL from '@maplibre/maplibre-react-native';
import { TutorProfile } from '../../types/api.types';

const DEFAULT_AVATAR =
  'https://randomuser.me/api/portraits/lego/1.jpg';

export const getTutorCoordinate = (tutor: TutorProfile) => {
  const coords = tutor.location?.coordinates;
  if (coords?.length === 2) {
    return { latitude: coords[1], longitude: coords[0] };
  }

  const hash = tutor._id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    latitude: 31.5204 + (hash % 20) * 0.001,
    longitude: 74.3587 + ((hash >> 4) % 20) * 0.001,
  };
};

type TutorMapMarkerProps = {
  tutor: TutorProfile;
  isSelected: boolean;
  onSelect: (tutorId: string) => void;
  styles: {
    markerContainer: object;
    ratingBadge: object;
    ratingStar: object;
    ratingText: object;
    imageWrapper: object;
    imageWrapperSelected: object;
    markerImage: object;
    onlineDot: object;
  };
};

const TutorMapMarker = ({
  tutor,
  isSelected,
  onSelect,
  styles,
}: TutorMapMarkerProps) => {
  const coordinate = getTutorCoordinate(tutor);
  const rating = tutor.rating ?? 4;

  return (
    <MapLibreGL.Marker
      id={tutor._id}
      lngLat={[coordinate.longitude, coordinate.latitude]}
      anchor="bottom"
      onPress={() => onSelect(tutor._id)}
    >
      <View style={styles.markerContainer} collapsable={false}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
        <View
          style={[
            styles.imageWrapper,
            isSelected && styles.imageWrapperSelected,
          ]}
        >
          <Image
            source={{ uri: tutor.user?.avatarUrl || DEFAULT_AVATAR }}
            style={styles.markerImage}
          />
          <View style={styles.onlineDot} />
        </View>
      </View>
    </MapLibreGL.Marker>
  );
};

export default memo(TutorMapMarker);
