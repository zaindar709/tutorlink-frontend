import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import * as MapLibreGL from '@maplibre/maplibre-react-native';
import { Icon } from 'react-native-paper';
import TutorNearbyCard from '../../../../components/TutorNearbyCard/TutorNearbyCard';
import useUi from '../../../../hooks/ui/useUi';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import { createStyles } from './styles';

const tutorLocations = [
  {
    id: '1',
    name: 'Dr. Sarah Ahmed',
    subject: 'Mathematics',
    rating: '4.9',
    distance: '0.8 km away',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    coordinate: {
      latitude: 31.5204,
      longitude: 74.3587,
    },
  },
  {
    id: '2',
    name: 'Mr. Adam Blake',
    subject: 'Physics',
    rating: '4.6',
    distance: '1.1 km away',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    coordinate: {
      latitude: 31.5224,
      longitude: 74.361,
    },
  },
  {
    id: '3',
    name: 'Ms. Aisha Khan',
    subject: 'English',
    rating: '4.8',
    distance: '0.4 km away',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    coordinate: {
      latitude: 31.519,
      longitude: 74.355,
    },
  },
  {
    id: '4',
    name: 'Prof. James Lee',
    subject: 'Chemistry',
    rating: '4.7',
    distance: '1.4 km away',
    image: 'https://randomuser.me/api/portraits/men/71.jpg',
    coordinate: {
      latitude: 31.5175,
      longitude: 74.364,
    },
  },
];

const SearchScreen = () => {
  const { colors, resp } = useUi();

  const [search, setSearch] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState('1');

  const cameraRef = useRef(null);

  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  const selectedTutor =
    tutorLocations.find(tutor => tutor.id === selectedTutorId) ??
    tutorLocations[0];

  // const handleSelectTutor = (id: string) => {
  //   const tutor = tutorLocations.find(item => item.id === id);

  //   if (!tutor) return;

  //   setSelectedTutorId(id);

  //   cameraRef.current?.setCamera({
  //     centerCoordinate: [tutor.coordinate.longitude, tutor.coordinate.latitude],
  //     zoomLevel: 15,
  //     animationDuration: 1200,
  //   });
  // };

  const filteredTutors = tutorLocations.filter(
    tutor =>
      tutor.name.toLowerCase().includes(search.toLowerCase()) ||
      tutor.subject.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* MAP */}
        <View style={styles.mapWrapper}>
          <MapLibreGL.Map
            style={styles.map}
            mapStyle="https://demotiles.maplibre.org/style.json"
          >
            <MapLibreGL.Camera
              ref={cameraRef}
              zoom={14}
              center={[
                selectedTutor.coordinate.longitude,
                selectedTutor.coordinate.latitude,
              ]}
            />

            {tutorLocations.map(tutor => (
              <MapLibreGL.ViewAnnotation
                key={tutor.id}
                id={tutor.id}
                lngLat={[tutor.coordinate.longitude, tutor.coordinate.latitude]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.markerContainer}
                >
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {tutor.rating}</Text>
                  </View>
                  <View
                    style={[
                      styles.imageWrapper,
                      tutor.id === selectedTutorId &&
                        styles.imageWrapperSelected,
                    ]}
                  >
                    <Image
                      source={{ uri: tutor.image }}
                      style={styles.markerImage}
                    />

                    <View style={styles.onlineDot} />
                  </View>
                </TouchableOpacity>
              </MapLibreGL.ViewAnnotation>
            ))}
          </MapLibreGL.Map>
          <View style={styles.searchOverlay}>
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
                onRightIconPress={() => {
                  console.log('Filter clicked');
                }}
              />
            </View>
          </View>

          {/* LOCATION BUTTON */}
          <TouchableOpacity style={styles.locationButton} activeOpacity={0.8}>
            <Icon
              source="crosshairs-gps"
              size={22}
              color={colors.PRIMARY_COLOR as string}
            />
          </TouchableOpacity>
        </View>

        {/* BOTTOM CARD */}
        <View style={styles.bottomSheet}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>Featured Tutors Nearby</Text>

              <Text style={styles.listCount}>
                {filteredTutors.length} tutors available
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredTutors.map(tutor => (
              <TutorNearbyCard
                key={tutor.id}
                name={tutor.name}
                subject={tutor.subject}
                distance={tutor.distance}
                rate={tutor.rating}
                isSelected={tutor.id === selectedTutorId}
                onPress={() => {}}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
