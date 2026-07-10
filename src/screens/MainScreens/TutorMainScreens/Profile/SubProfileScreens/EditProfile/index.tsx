import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

import CustomInput from '../../../../../../components/CustomInput/CustomInput';
import CustomButton from '../../../../../../components/CustomButton';
import useUi from '../../../../../../hooks/ui/useUi';
import Images from '../../../../../../assets/images';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../../../../components/Tutor/CustomHeader';

const MAX_BIO = 500;
let styles: any;

const FieldLabel = ({ icon, label, colors }: any) => (
  <View style={styles.labelRow}>
    <MaterialCommunityIcons
      name={icon}
      size={18}
      color={colors.PRIMARY_COLOR}
      style={{ marginRight: 6 }}
    />
    <Text style={[styles.labelText, { color: colors.BLACK_COLOR }]}>
      {label}
    </Text>
  </View>
);

const EditProfileScreen = ({ navigation }: any) => {
  const { colors } = useUi();
  styles = createStyles(colors);
  const [fullName, setFullName] = useState('Prof. Ali Ahmed');
  const [email, setEmail] = useState('ali.ahmed@tutorlink.com');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [experience, setExperience] = useState('8 years');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState(
    'Experienced educator specializing in Mathematics and Physics for O & A Level students.',
  );

  const onSave = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Validation', 'Please provide name and email');
      return;
    }

    Alert.alert('Success', 'Profile updated successfully');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomHeader
          navigation={navigation}
          title="Edit Profile"
          showSaveButton
          onSave={onSave}
        />
        <View style={styles.inner}>
          {/* PROFILE IMAGE */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarContainer}>
              <Image source={Images.OneOnOne} style={styles.avatar} />

              <TouchableOpacity style={styles.cameraBtn}>
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <FieldLabel
              icon="account-outline"
              label="Full Name"
              colors={colors}
            />
            <CustomInput value={fullName} onChangeText={setFullName} />

            <FieldLabel
              icon="email-outline"
              label="Email Address"
              colors={colors}
            />
            <CustomInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <FieldLabel
              icon="phone-outline"
              label="Phone Number"
              colors={colors}
            />
            <CustomInput value={phone} onChangeText={setPhone} />

            <FieldLabel
              icon="briefcase-outline"
              label="Experience"
              colors={colors}
            />
            <CustomInput value={experience} onChangeText={setExperience} />

            <FieldLabel
              icon="map-marker-outline"
              label="Address"
              colors={colors}
            />
            <CustomInput value={address} onChangeText={setAddress} />

            {/* BIO */}
            <FieldLabel
              icon="file-document-edit-outline"
              label="Professional Bio"
              colors={colors}
            />

            <TextInput
              value={bio}
              onChangeText={t => setBio(t.slice(0, MAX_BIO))}
              placeholder="Write a short professional bio"
              placeholderTextColor="#999"
              multiline
              style={[
                styles.textarea,
                {
                  borderColor: '#e6e6e6',
                  color: colors.BLACK_COLOR,
                  backgroundColor: colors.WHITE_COLOR,
                },
              ]}
            />

            <Text style={styles.charCount}>
              {bio.length}/{MAX_BIO}
            </Text>

            <CustomButton title="Save Changes" onPress={onSave} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },

    inner: {
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 40,
    },

    avatarWrap: {
      alignItems: 'center',
      marginBottom: 20,
    },

    avatarContainer: {
      position: 'relative',
    },

    avatar: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: colors.PRIMARY_COLOR,
    },

    cameraBtn: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.PRIMARY_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },

    form: {
      marginTop: 10,
    },

    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      marginTop: 10,
    },

    labelText: {
      fontSize: 14,
      fontWeight: '600',
    },

    textarea: {
      minHeight: 110,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      textAlignVertical: 'top',
      marginBottom: 6,
    },

    charCount: {
      alignSelf: 'flex-end',
      fontSize: 12,
      color: '#666',
      marginBottom: 14,
    },
  });
