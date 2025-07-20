import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const wallpapers = [
  'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg',
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
  'https://images.pexels.com/photos/1034243/pexels-photo-1034243.jpeg',
  'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
  'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg',
  'https://images.pexels.com/photos/693857/pexels-photo-693857.jpeg',

  // Stunning landscapes
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // Mountain lake
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f', // Sunset fields
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', // Foggy forest
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07', // Flower field
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716', // Waterfall mist

  // Urban & architecture
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df', // City skyline
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625', // Modern building
  'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21', // Neon lights
  'https://images.unsplash.com/photo-1470004914212-05527e49370b', // Deserted road
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef', // Country road

  // Abstract & artistic
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa', // Digital earth
  'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5', // Colorful powder
  'https://images.unsplash.com/photo-1454789548928-9efd52dc4031', // Blue liquid
  'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00', // Paint splash
  'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2', // Light trails

  // Nature close-ups
  'https://images.unsplash.com/photo-1458966480378-d16c1b9f21e4', // Dew on leaf
  'https://images.unsplash.com/photo-1429087969512-1e85aab2683d', // Water droplets
  'https://images.unsplash.com/photo-1455659817273-f96807779a8a', // Autumn leaves
  'https://images.unsplash.com/photo-1444464666168-49d633b86797', // Butterfly wing
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716', // Water surface

  // Space & cosmos
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564', // Galaxy
  'https://images.unsplash.com/photo-1454789548928-9efd52dc4031', // Nebula
  'https://images.unsplash.com/photo-1462332420958-a05d1e002413', // Star trail
  'https://images.unsplash.com/photo-1454789548928-9efd52dc4031', // Milky Way
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564'  // Earth from space
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentWallpaper, setCurrentWallpaper] = useState(wallpapers[0]);
  const [nextWallpaper, setNextWallpaper] = useState(wallpapers[1]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const currentIndex = useRef(0);

  const changeWallpaper = () => {
    // Start fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // After fade out, change the wallpaper
      currentIndex.current = (currentIndex.current + 1) % wallpapers.length;
      setCurrentWallpaper(wallpapers[currentIndex.current]);
      setNextWallpaper(wallpapers[(currentIndex.current + 1) % wallpapers.length]);
      
      // Then fade back in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    });
  };

  // Change wallpaper every 5 seconds
  useEffect(() => {
    const interval = setInterval(changeWallpaper, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Current Wallpaper */}
      <Animated.View style={[styles.backgroundContainer, { opacity: fadeAnim }]}>
        <ImageBackground 
          source={{ uri: currentWallpaper }} 
          style={styles.background}
          resizeMode="cover"
        />
      </Animated.View>
      
      {/* Next Wallpaper (hidden, preloading) */}
      <View style={styles.hidden}>
        <ImageBackground 
          source={{ uri: nextWallpaper }} 
          style={styles.background}
          resizeMode="cover"
        />
      </View>

      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={[styles.gradient, { paddingBottom: insets.bottom }]}
      >
        <View style={[styles.contentContainer, { paddingBottom: insets.bottom + 60 }]}>
          <View style={styles.content}>
            <Text style={styles.title}>Vixel</Text>
            <Text style={styles.subtitle}>Every pixel tells a story</Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/home')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>Start Exploring</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  hidden: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    paddingHorizontal: 30,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: 'white',
    marginBottom: 12,
    letterSpacing: -2,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 50,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '300',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  button: {
    borderRadius: 28,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    maxWidth: 300,
  },
  buttonGradient: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
