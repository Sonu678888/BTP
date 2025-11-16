import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import API_CONFIG from './config';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollRef = useRef(null);

  // Animation functions
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Initialize animations on component mount
  useEffect(() => {
    animateIn();
  }, []);

  // Request permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to select images!'
      );
      return false;
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take photos!'
      );
      return false;
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setPredictions(null);
        setError(null);
        animateIn();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error(error);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setPredictions(null);
        setError(null);
        animateIn();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error(error);
    }
  };

  // Upload and predict
  const uploadAndPredict = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select or capture an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setPredictions(null);

    try {
      // Get file info
      const fileUri = image;
      const fileExtension = fileUri.split('.').pop() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      // Create form data for React Native
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: mimeType,
        name: `photo.${fileExtension}`,
      });

      // Make API call
      // Note: Don't set Content-Type header - React Native will set it automatically for FormData
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PREDICT_ENDPOINT}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPredictions(data);
        setError(null);
      } else {
        setError(data.error || 'Prediction failed. Please try again.');
        setPredictions(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to connect to server. Please check your connection and config.js');
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  // Reset everything
  const reset = () => {
    setImage(null);
    setPredictions(null);
    setError(null);
    setLoading(false);

    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Text style={styles.instituteName}>Indian Institute of Technology BHU (Varanasi)</Text>
          <Text style={styles.title}>🔬 Skin Cancer Detector</Text>
          <Text style={styles.subtitle}>AI-Powered Skin Lesion Analysis</Text>
          <View style={styles.headerDecoration} />
        </Animated.View>

        {/* Image Display */}
        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={reset}>
              <Text style={styles.removeButtonText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        {!image && (
          <Animated.View 
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.button, styles.cameraButton]} 
              onPress={takePhoto}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4facfe', '#0f6d41e0']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>📷 Take Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.galleryButton]} 
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ed4314c8', '#fed6e3']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Predict Button */}
        {image && !predictions && !loading && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }}
          >
            <TouchableOpacity 
              style={[styles.button, styles.predictButton]} 
              onPress={uploadAndPredict}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#11998e', '#38ef7d']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>🔍 Analyze Image</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Animated.View 
            style={[
              styles.loadingContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.loadingCircle}>
              <ActivityIndicator size="large" color="#667eea" />
            </View>
            <Text style={styles.loadingText}>🧠 Analyzing image...</Text>
            <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
          </Animated.View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Results */}
        {predictions && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>🔬 Analysis Results</Text>

            {/* Main Prediction */}
            <View style={styles.mainPrediction}>
              <Text style={styles.predictionLabel}>Predicted Class:</Text>
              <Text style={styles.predictionClass}>{predictions.predicted_class}</Text>
              <Text style={styles.confidenceText}>
                Confidence: {predictions.confidence}%
              </Text>
            </View>

            {/* All Predictions */}
            <Text style={styles.allPredictionsTitle}>Detailed Analysis:</Text>
            {predictions.all_predictions.map((pred, index) => (
              <View key={index} style={styles.predictionItem}>
                <View style={styles.predictionRow}>
                  <Text style={styles.predictionClassName}>{pred.class}</Text>
                  <Text style={styles.predictionPercent}>{pred.probability}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${pred.probability}%`,
                        backgroundColor: pred.class.toLowerCase().includes('malignant') || 
                                       pred.class.toLowerCase().includes('cancer') ? 
                                       '#F44336' : '#4CAF50',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}

            {/* Reset Button */}
            <TouchableOpacity 
              style={[styles.button, styles.resetButton]} 
              onPress={reset}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2196F3', '#21CBF3']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>📷 Analyze Another Image</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Footer */}
        {!image && !predictions && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              📱 Capture or select a skin lesion image to get an AI-powered analysis.
            </Text>
            <Text style={styles.infoText}>
              ⚠️ This app is for informational purposes only. Consult a healthcare professional for medical advice.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 90,
    marginTop: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerDecoration: {
    width: 60,
    height: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 2,
    marginTop: 15,
  },
  instituteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    marginBottom: 15,
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  removeButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 25,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    backgroundColor: '#4A90E2',
  },
  galleryButton: {
    backgroundColor: '#7B68EE',
  },
  predictButton: {
    backgroundColor: '#4CAF50',
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: '#2196F3',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingCircle: {
    padding: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 50,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    lineHeight: 20,
  },
  resultsContainer: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: 25,
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  cancerStatusContainer: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cancerStatusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  cancerStatusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  probabilityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mainPrediction: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  predictionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  predictionClass: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
  },
  allPredictionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  predictionItem: {
    marginBottom: 15,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  predictionClassName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  predictionPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  infoContainer: {
    marginTop: 20,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#1976D2',
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
    marginBottom: 4,
  },
});

