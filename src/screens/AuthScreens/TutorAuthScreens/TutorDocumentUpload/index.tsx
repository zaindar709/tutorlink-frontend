import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../../../hooks/ui/useUi';
import { createStyles } from './styles';
import useDocumentUpload from '../../../../hooks/tutor/useDocumentUpload';
import { useTutorOnboarding } from '../../../../hooks/tutor/useTutorOnboarding';
import UploadBox from '../../../../components/Tutor/DocumentUpload/UploadBox';
import UploadGuidelines from '../../../../components/Tutor/DocumentUpload/UploadGuidelines';
import CustomButton from '../../../../components/CustomButton';
import AuthHeader from '../../../../components/Tutor/AuthHeader';
import DocumentPickerField from '../../../../components/Tutor/DocumentPicker';
import GradientSurface from '../../../../components/GradientSurface';

const DocumentUploadScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);
  const { submitDocuments, loading } = useTutorOnboarding();

  const {
    frontImage,
    backImage,
    certificate,
    pickImage,
    pickDocument,
    isButtonDisabled,
  } = useDocumentUpload();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    console.log('[TutorUpload] Submit pressed', {
      hasFront: !!frontImage?.uri,
      hasBack: !!backImage?.uri,
      hasCertificate: !!certificate?.uri,
      routeParams: route.params,
    });

    if (!frontImage?.uri || !backImage?.uri || !certificate?.uri) {
      Alert.alert('Missing documents', 'Please upload all required documents.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: result, error: uploadError } = await submitDocuments(
        {
          cnicFrontUri: frontImage.uri,
          cnicBackUri: backImage.uri,
          cnicFrontType: frontImage.type,
          cnicBackType: backImage.type,
          degreeUri: certificate.uri,
          degreeName: certificate.name,
          degreeType: certificate.type,
        },
        {
          subject: route.params?.tutorSubject,
          grades: route.params?.tutorGrades,
        }
      );

      console.log('[TutorUpload] submitDocuments result', {
        hasResult: !!result,
        result,
        uploadError,
      });

      if (result) {
        navigation.replace('DocumentReviewScreen', {
          status: result.onboardingStatus || 'under_review',
        });
        return;
      }

      Alert.alert(
        uploadError?.includes('401') ||
          uploadError?.includes('Firebase project') ||
          uploadError?.includes('Authentication failed')
          ? 'Firebase project mismatch'
          : 'Upload failed',
        uploadError ||
          'Could not submit documents. Please try again or use JPG/PNG images under 5MB.'
      );
    } catch (error) {
      console.error('[TutorUpload] unexpected submit error', error);
      Alert.alert('Upload failed', 'Unexpected error. Check debugger logs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: resp.dy(4),
      }}
    >
      <View style={[styles.container, { backgroundColor: colors.WHITE_COLOR }]}>
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
          <GradientSurface
            variant="primaryButton"
            style={[styles.progressBarFill, { width: '66%' }]}
          />
        </View>

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
              fileUri={frontImage?.uri}
              onPress={() => pickImage('front')}
            />
            <UploadBox
              label="CNIC Back Photo"
              iconName="camera-outline"
              fileUri={backImage?.uri}
              onPress={() => pickImage('back')}
            />
          </View>
        </View>

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
            disabled={isButtonDisabled || submitting || loading}
            loading={submitting || loading}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default DocumentUploadScreen;
