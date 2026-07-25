import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import * as MapLibreGL from '@maplibre/maplibre-react-native';
import { Icon } from 'react-native-paper';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import TutorNearbyCard from '../../../../components/TutorNearbyCard/TutorNearbyCard';
import BookTutorModal from '../../../../components/BookTutorModal/BookTutorModal';
import SearchBottomSheet from '../../../../components/SearchBottomSheet/SearchBottomSheet';
import TutorMapMarker, {
  getTutorCoordinate,
} from '../../../../components/SearchMap/TutorMapMarker';
import useUi from '../../../../hooks/ui/useUi';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import { createStyles } from './styles';
import { useTutorSearch } from '../../../../hooks/api/useTutorSearch';
import { TutorProfile } from '../../../../types/api.types';

const LAHORE = { lat: 31.5204, lng: 74.3587 };

/** Same filters as Home screen — proven to return tutors. */
const DEFAULT_SEARCH_FILTERS = {
  availability: true,
  minRating: 4,
};

const VIEW_ALL_FILTERS = {
  availability: true,
};

const getMapViewport = (tutorList: TutorProfile[]) => {
  if (tutorList.length === 0) {
    return { center: [LAHORE.lng, LAHORE.lat] as [number, number], zoom: 13 };
  }

  if (tutorList.length === 1) {
    const coord = getTutorCoordinate(tutorList[0]);
    return {
      center: [coord.longitude, coord.latitude] as [number, number],
      zoom: 14,
    };
  }

  const coords = tutorList.map(tutor => getTutorCoordinate(tutor));
  const lats = coords.map(item => item.latitude);
  const lngs = coords.map(item => item.longitude);
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const latDelta = Math.max(...lats) - Math.min(...lats);
  const lngDelta = Math.max(...lngs) - Math.min(...lngs);
  const spread = Math.max(latDelta, lngDelta, 0.008);
  const zoom = Math.max(10, Math.min(14, 14 - Math.log2(spread * 120)));

  return {
    center: [centerLng, centerLat] as [number, number],
    zoom,
  };
};

const SearchScreen = () => {
  const { colors, resp } = useUi();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const cameraRef = useRef<MapLibreGL.CameraRef>(null);
  const searchInputRef = useRef<TextInput>(null);
  const [search, setSearch] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [bookingTutor, setBookingTutor] = useState<TutorProfile | null>(null);
  const [expandedSheet, setExpandedSheet] = useState(false);
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);
  const { tutors, loading, error, search: runSearch } = useTutorSearch(
    DEFAULT_SEARCH_FILTERS,
    { autoLoad: false }
  );

  const handleViewAll = useCallback(() => {
    setExpandedSheet(true);
    setSelectedTutorId(null);
    runSearch(VIEW_ALL_FILTERS);
  }, [runSearch]);

  useFocusEffect(
    useCallback(() => {
      runSearch(DEFAULT_SEARCH_FILTERS);

      if (route.params?.focusSearch) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 350);
        navigation.setParams({ focusSearch: undefined });
        return () => clearTimeout(timer);
      }
    }, [navigation, route.params?.focusSearch, runSearch])
  );

  useEffect(() => {
    if (route.params?.viewAll) {
      handleViewAll();
    }
  }, [route.params?.viewAll, handleViewAll]);

  const filteredTutors = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return tutors;

    return tutors.filter(tutor => {
      const name = tutor.user?.name?.toLowerCase() || '';
      const subjects = (tutor.subjects || []).join(' ').toLowerCase();
      return name.includes(query) || subjects.includes(query);
    });
  }, [search, tutors]);

  const selectedTutor =
    filteredTutors.find(tutor => tutor._id === selectedTutorId) ??
    filteredTutors[0];

  const mapViewport = useMemo(() => {
    if (selectedTutorId && selectedTutor) {
      const coord = getTutorCoordinate(selectedTutor);
      return {
        center: [coord.longitude, coord.latitude] as [number, number],
        zoom: 15,
      };
    }

    return getMapViewport(filteredTutors);
  }, [filteredTutors, selectedTutor, selectedTutorId]);

  useEffect(() => {
    cameraRef.current?.setStop({
      centerCoordinate: mapViewport.center,
      zoomLevel: mapViewport.zoom,
      duration: 600,
    });
  }, [mapViewport.center, mapViewport.zoom]);

  const handleSearchSubmit = useCallback(() => {
    runSearch({
      ...DEFAULT_SEARCH_FILTERS,
      subject: search.trim() || undefined,
    });
  }, [runSearch, search]);

  const handleMarkerSelect = useCallback((tutorId: string) => {
    setSelectedTutorId(tutorId);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.mapWrapper}>
          <MapLibreGL.Map
            style={styles.map}
            mapStyle="https://demotiles.maplibre.org/style.json"
          >
            <MapLibreGL.Camera
              ref={cameraRef}
              initialViewState={{
                centerCoordinate: [LAHORE.lng, LAHORE.lat],
                zoomLevel: 13,
              }}
            />

            {filteredTutors.map(tutor => (
              <TutorMapMarker
                key={tutor._id}
                tutor={tutor}
                isSelected={tutor._id === selectedTutor?._id}
                onSelect={handleMarkerSelect}
                styles={styles}
              />
            ))}
          </MapLibreGL.Map>

          <View style={styles.searchOverlay}>
            <CustomInput
              ref={searchInputRef}
              value={search}
              onChangeText={setSearch}
              placeholder="Find tutors near you"
              style={styles.customSearchInput}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
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
              onRightIconPress={handleSearchSubmit}
            />
          </View>

          <TouchableOpacity
            style={styles.locationButton}
            activeOpacity={0.8}
            onPress={handleViewAll}
          >
            <Icon
              source="crosshairs-gps"
              size={22}
              color={colors.PRIMARY_COLOR as string}
            />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <SearchBottomSheet
          expanded={expandedSheet}
          onExpandedChange={setExpandedSheet}
          title={expandedSheet ? 'All Tutors' : 'Featured Tutors Nearby'}
          countLabel={
            loading
              ? 'Searching...'
              : `${filteredTutors.length} tutors available`
          }
          loading={loading}
          onViewAll={handleViewAll}
          isEmpty={!loading && filteredTutors.length === 0}
          colors={colors}
          resp={resp}
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
              rating={tutor.rating ?? 4}
              avatarUrl={tutor.user?.avatarUrl}
              isSelected={tutor._id === selectedTutor?._id}
              onPress={() => {
                setSelectedTutorId(tutor._id);
                setBookingTutor(tutor);
              }}
            />
          ))}
        </SearchBottomSheet>
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
