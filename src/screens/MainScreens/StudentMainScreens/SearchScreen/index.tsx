import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as MapLibreGL from '@maplibre/maplibre-react-native';
import { Icon } from 'react-native-paper';
import TutorNearbyCard from '../../../../components/TutorNearbyCard/TutorNearbyCard';
import BookTutorModal from '../../../../components/BookTutorModal/BookTutorModal';
import useUi from '../../../../hooks/ui/useUi';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import { createStyles } from './styles';
import { useTutorSearch } from '../../../../hooks/api/useTutorSearch';
import { TutorProfile } from '../../../../types/api.types';

const DEFAULT_SEARCH_FILTERS = {
  availability: true,
  studentLat: 31.5204,
  studentLng: 74.3587,
  radiusInKm: 20,
};

const SearchScreen = () => {
  const { colors, resp } = useUi();
  const [search, setSearch] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [bookingTutor, setBookingTutor] = useState<TutorProfile | null>(null);
  const cameraRef = useRef(null);
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const { tutors, loading, search: runSearch } = useTutorSearch(
    DEFAULT_SEARCH_FILTERS
  );

  const handleRefresh = useCallback(() => {
    runSearch({
      ...DEFAULT_SEARCH_FILTERS,
      subject: search.trim() || undefined,
    });
  }, [runSearch, search]);

  const selectedTutor =
    tutors.find(tutor => tutor._id === selectedTutorId) ?? tutors[0];

  const filteredTutors = tutors.filter(tutor => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    const name = tutor.user?.name?.toLowerCase() || '';
    const subjects = (tutor.subjects || []).join(' ').toLowerCase();
    return name.includes(query) || subjects.includes(query);
  });

  const getCoordinate = (tutor: (typeof tutors)[number], index: number) => {
    const coords = tutor.location?.coordinates;
    if (coords?.length === 2) {
      return { latitude: coords[1], longitude: coords[0] };
    }

    return {
      latitude: 31.5204 + index * 0.002,
      longitude: 74.3587 + index * 0.002,
    };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.mapWrapper}>
          <MapLibreGL.Map
            style={styles.map}
            mapStyle="https://demotiles.maplibre.org/style.json"
          >
            <MapLibreGL.Camera
              ref={cameraRef}
              zoom={14}
              center={
                selectedTutor
                  ? [
                      getCoordinate(selectedTutor, 0).longitude,
                      getCoordinate(selectedTutor, 0).latitude,
                    ]
                  : [74.3587, 31.5204]
              }
            />

            {filteredTutors.map((tutor, index) => {
              const coordinate = getCoordinate(tutor, index);

              return (
                <MapLibreGL.ViewAnnotation
                  key={tutor._id}
                  id={tutor._id}
                  lngLat={[coordinate.longitude, coordinate.latitude]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.markerContainer}
                    onPress={() => setSelectedTutorId(tutor._id)}
                  >
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>
                        ⭐ {tutor.rating?.toFixed(1) || '4.0'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.imageWrapper,
                        tutor._id === selectedTutor?._id &&
                          styles.imageWrapperSelected,
                      ]}
                    >
                      <Image
                        source={{
                          uri:
                            tutor.user?.avatarUrl ||
                            'https://randomuser.me/api/portraits/lego/1.jpg',
                        }}
                        style={styles.markerImage}
                      />
                      <View style={styles.onlineDot} />
                    </View>
                  </TouchableOpacity>
                </MapLibreGL.ViewAnnotation>
              );
            })}
          </MapLibreGL.Map>
          <View style={styles.searchOverlay}>
            <CustomInput
              value={search}
              onChangeText={setSearch}
              placeholder="Find tutors near you"
              style={styles.customSearchInput}
              leftIcon={
                <Icon
                  source="magnify"
                  size={20}
                  color={colors.PLACEHOLDER_TEXTCOLOR as string}
                />
              }
              rightIcon={
                <Icon
                  source="tune-variant"
                  size={22}
                  color={colors.BLACK_COLOR as string}
                />
              }
              onRightIconPress={handleRefresh}
            />
          </View>

          <TouchableOpacity style={styles.locationButton} activeOpacity={0.8}>
            <Icon
              source="crosshairs-gps"
              size={22}
              color={colors.PRIMARY_COLOR as string}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>Featured Tutors Nearby</Text>
              <Text style={styles.listCount}>
                {loading
                  ? 'Searching...'
                  : `${filteredTutors.length} tutors available`}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRefresh}
              disabled={loading}
            >
              <Text style={styles.viewAllText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <ScrollView
              style={styles.listContainer}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredTutors.map(tutor => (
                <TutorNearbyCard
                  key={tutor._id}
                  name={tutor.user?.name || 'Tutor'}
                  subject={(tutor.subjects || []).join(', ') || 'General'}
                  distance={
                    tutor.distanceKm
                      ? `${tutor.distanceKm.toFixed(1)} km away`
                      : 'Nearby'
                  }
                  rate={String(tutor.rating || 4)}
                  isSelected={tutor._id === selectedTutor?._id}
                  onPress={() => {
                    setSelectedTutorId(tutor._id);
                    setBookingTutor(tutor);
                  }}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      <BookTutorModal
        visible={!!bookingTutor}
        tutor={bookingTutor}
        onClose={() => setBookingTutor(null)}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
