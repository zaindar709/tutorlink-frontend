import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../../hooks/ui/useUi';
import { createStyles} from './styles';
import useDocumentUpload from '../../../../hooks/tutor/useDocumentUpload';
import UploadBox from '../../../../components/Tutor/DocumentUpload/UploadBox';
import UploadGuidelines from '../../../../components/Tutor/DocumentUpload/UploadGuidelines';
import CustomButton from '../../../../components/CustomButton';
import AuthHeader from '../../../../components/Tutor/AuthHeader';
import DocumentPickerField from '../../../../components/Tutor/DocumentPicker';

const DocumentUploadScreen = ({ navigation }: any) => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);

  const {
    frontImage,
    backImage,
    certificate,
    pickImage,
    pickDocument,
    isButtonDisabled,
  } = useDocumentUpload();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: resp.dy(4),
      }}
    >
      <View style={[styles.container, { backgroundColor: colors.WHITE_COLOR }]}>
        {/* HEADER */}
        <AuthHeader
          title="Document Upload"
          subtitle="Secure & confidential verification"
          topIcon={
            <View style={styles.headerSection}>
              <Icon
                name="file-document-outline"
                size={34}
                color={colors.WHITE_COLOR}
              />
            </View>
          }
          titleStyle={{
            fontSize: 24,
            textAlign: 'center',
          }}
          subtitleStyle={{
            textAlign: 'center',
            fontSize: 14,
            marginTop: -5,
          }}
          contentContainerStyle={{
            alignItems: 'center',
            marginTop: 12,
          }}
          containerStyle={{
            minHeight: 300,
          }}
          showBrand={false}
        />

        <View style={styles.stepContainer}>
          <Text style={[styles.stepText, { color: colors.BLACK }]}>
            Step 2 of 3
          </Text>

          <Text style={[styles.stepLabel, { color: colors.GRAY31 }]}>
            Document Upload
          </Text>
        </View>
        <View
          style={[styles.progressBarBackground, { backgroundColor: '#E2E2E2' }]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: colors.PRIMARY_COLOR,
                width: '66%',
              },
            ]}
          />
        </View>

        {/* CNIC SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.BLACK }]}>
            CNIC / National ID
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.GRAY31 }]}>
            Upload both sides of your ID card
          </Text>
          <View style={styles.uploadBox}>
            <UploadBox
              label="CNIC Front Photo"
              iconName="camera-outline"
              fileUri={frontImage}
              onPress={() => pickImage('front')}
            />
            <UploadBox
              label="CNIC Back Photo"
              iconName="camera-outline"
              fileUri={backImage}
              onPress={() => pickImage('back')}
            />
          </View>
        </View>

        {/* CERTIFICATE SECTION */}
        <DocumentPickerField
          title="Educational Certificate"
          value={certificate}
          colors={colors}
          onPress={pickDocument}
        />
        <UploadGuidelines />
        <View style={{ marginTop: resp.dy(2), marginBottom: resp.dy(26) }}>
          <CustomButton
            title="Submit for Verification"
            textStyle={{ fontSize: resp.df(16) }}
            disabled={isButtonDisabled}
            onPress={() => navigation.navigate('DocumentReviewScreen')}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default DocumentUploadScreen;


