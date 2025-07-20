import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, Dimensions, Modal, ScrollView, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_KEY } from '@env';

const { width, height } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GAP = 8;
const IMAGE_SIZE = (width - (GAP * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories] = useState(['Nature', 'Animals', 'Cities', 'Cars', 'Space', 'Art', 'Food', 'Travel', 'Fashion', 'Architecture']);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    order: 'popular',
    orientation: 'all',
    color: 'all'
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);

  const orderOptions = [
    { key: 'popular', label: 'Popular' },
    { key: 'latest', label: 'Latest' }
  ];

  const orientationOptions = [
    { key: 'all', label: 'All' },
    { key: 'landscape', label: 'Landscape' },
    { key: 'portrait', label: 'Portrait' },
    { key: 'square', label: 'Square' }
  ];

  const colorOptions = [
    { key: 'all', label: 'All Colors', color: 'transparent', borderColor: '#666' },
    { key: 'red', label: 'Red', color: '#ff0000' },
    { key: 'orange', label: 'Orange', color: '#ffa500' },
    { key: 'yellow', label: 'Yellow', color: '#ffff00' },
    { key: 'green', label: 'Green', color: '#00ff00' },
    { key: 'turquoise', label: 'Turquoise', color: '#40e0d0' },
    { key: 'blue', label: 'Blue', color: '#0000ff' },
    { key: 'violet', label: 'Violet', color: '#8a2be2' },
    { key: 'pink', label: 'Pink', color: '#ffc0cb' },
    { key: 'brown', label: 'Brown', color: '#a52a2a' },
    { key: 'black', label: 'Black', color: '#000000' },
    { key: 'gray', label: 'Gray', color: '#808080' },
    { key: 'white', label: 'White', color: '#ffffff' }
  ];

  const buildApiUrl = (isNewSearch = false) => {
    const currentPage = isNewSearch ? 1 : page;
    let url = '';
    
    if (searchQuery.trim() || selectedCategory) {
      const query = searchQuery.trim() || selectedCategory;
      url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&page=${currentPage}`;
    } else {
      url = filters.order === 'latest' 
        ? `https://api.pexels.com/v1/curated?per_page=20&page=${currentPage}`
        : `https://api.pexels.com/v1/curated?per_page=20&page=${currentPage}`;
    }

    if (filters.orientation !== 'all') {
      url += `&orientation=${filters.orientation}`;
    }
    if (filters.color !== 'all') {
      url += `&color=${filters.color}`;
    }

    return url;
  };

  const fetchPhotos = async (isNewSearch = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl(isNewSearch), {
        headers: {
          Authorization: API_KEY,
        },
      });
      const data = await response.json();
      
      if (isNewSearch) {
        setPhotos(data.photos || []);
        setPage(2);
      } else {
        setPhotos(prev => [...prev, ...(data.photos || [])]);
        setPage(prev => prev + 1);
      }
      
      setHasMore((data.photos || []).length === 20);
    } catch (error) {
      console.error('Error fetching photos:', error);
      Alert.alert('Error', 'Failed to load photos. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPhotos(true);
    scrollToTop();
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const searchPhotos = async () => {
    setSelectedCategory(null);
    setPage(1);
    fetchPhotos(true);
    scrollToTop();
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setPage(1);
    fetchPhotos(true);
    scrollToTop();
  };

  const downloadImage = async (uri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images to your gallery.');
        return;
      }

      const fileUri = FileSystem.documentDirectory + `wallpaper_${Date.now()}.jpg`;
      const { uri: downloadedUri } = await FileSystem.downloadAsync(uri, fileUri);
      
      await MediaLibrary.saveToLibraryAsync(downloadedUri);
      Alert.alert('Success', 'Wallpaper saved to your gallery!');
    } catch (error) {
      console.error('Error downloading image:', error);
      Alert.alert('Error', 'Failed to save wallpaper. Please try again.');
    }
  };

  const shareImage = async (uri) => {
    try {
      const fileUri = FileSystem.documentDirectory + `wallpaper_share_${Date.now()}.jpg`;
      await FileSystem.downloadAsync(uri, fileUri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share wallpaper. Please try again.');
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    setPage(1);
    fetchPhotos(true);
    scrollToTop();
  };

  const resetFilters = () => {
    setFilters({
      order: 'popular',
      orientation: 'all',
      color: 'all'
    });
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setPage(1);
    fetchPhotos(true);
    scrollToTop();
  };

  const clearFilter = (filterType) => {
    const newFilters = { ...filters };
    newFilters[filterType] = filterType === 'order' ? 'popular' : 'all';
    setFilters(newFilters);
    setPage(1);
    fetchPhotos(true);
    scrollToTop();
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchPhotos(false);
    }
  };

  const getActiveFilters = () => {
    const activeFilters = [];
    
    if (selectedCategory) {
      activeFilters.push({
        type: 'category',
        label: selectedCategory,
        onClear: clearCategory
      });
    }
    
    if (filters.order !== 'popular') {
      activeFilters.push({
        type: 'order',
        label: orderOptions.find(o => o.key === filters.order)?.label,
        onClear: () => clearFilter('order')
      });
    }
    
    if (filters.orientation !== 'all') {
      activeFilters.push({
        type: 'orientation',
        label: orientationOptions.find(o => o.key === filters.orientation)?.label,
        onClear: () => clearFilter('orientation')
      });
    }
    
    if (filters.color !== 'all') {
      activeFilters.push({
        type: 'color',
        label: colorOptions.find(c => c.key === filters.color)?.label,
        color: colorOptions.find(c => c.key === filters.color)?.color,
        onClear: () => clearFilter('color')
      });
    }
    
    return activeFilters;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => setSelectedPhoto(item)}
      style={styles.imageContainer}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.src.medium }} 
        style={styles.image}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)']}
        style={styles.imageOverlay}
      />
    </TouchableOpacity>
  );

  const renderFilterOption = (options, selectedValue, onSelect, title) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
        {options.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterOption,
              selectedValue === option.key && styles.filterOptionSelected
            ]}
            onPress={() => onSelect(option.key)}
          >
            <Text style={[
              styles.filterOptionText,
              selectedValue === option.key && styles.filterOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderColorOptions = (options, selectedValue, onSelect, title) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.colorGrid}>
        {options.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.colorOption,
              { backgroundColor: option.color },
              option.key === 'all' && { borderWidth: 2, borderColor: option.borderColor },
              option.color === '#ffffff' && { borderWidth: 1, borderColor: '#666' },
              selectedValue === option.key && styles.colorOptionSelected
            ]}
            onPress={() => onSelect(option.key)}
          >
            {selectedValue === option.key && (
              <Ionicons 
                name="checkmark" 
                size={16} 
                color={option.color === '#ffffff' || option.color === '#ffff00' ? '#000' : '#fff'} 
              />
            )}
            {option.key === 'all' && (
              <Text style={styles.allColorText}>All</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const activeFilters = getActiveFilters();

  if (selectedPhoto) {
    return (
      <View style={styles.fullscreenContainer}>
        <Image 
          source={{ uri: selectedPhoto.src.original }} 
          style={styles.fullscreenImage}
          resizeMode="contain"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.actionsContainer}
        >
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => downloadImage(selectedPhoto.src.original)}
              activeOpacity={0.8}
            >
              <Ionicons name="download" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => shareImage(selectedPhoto.src.original)}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setSelectedPhoto(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Vixel</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowFilters(true)} activeOpacity={0.8}>
            <Ionicons name="options" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search wallpapers..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchPhotos}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={searchPhotos}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesSection}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonSelected
              ]}
              onPress={() => selectCategory(item)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextSelected
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
        />
      </View>

      {activeFilters.length > 0 && (
        <View style={styles.activeFiltersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersContainer}>
            {activeFilters.map((filter, index) => (
              <View key={`${filter.type}-${index}`} style={styles.activeFilterTag}>
                {filter.type === 'color' && filter.color && (
                  <View style={[styles.activeFilterColor, { backgroundColor: filter.color }]} />
                )}
                <Text style={styles.activeFilterText}>{filter.label}</Text>
                <TouchableOpacity onPress={filter.onClear} style={styles.activeFilterClear}>
                  <Ionicons name="close" size={14} color="#999" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={photos}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ gap: GAP }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#667eea"
          />
        }
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading more wallpapers...</Text>
            </View>
          ) : !hasMore && photos.length > 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>No more wallpapers to load</Text>
            </View>
          ) : photos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No wallpapers yet</Text>
              <Text style={styles.emptySubtitle}>Search for wallpapers or select a category to get started</Text>
            </View>
          ) : null
        }
      />

      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {renderFilterOption(
              orderOptions,
              filters.order,
              (value) => setFilters(prev => ({ ...prev, order: value })),
              'Order By'
            )}
            
            {renderFilterOption(
              orientationOptions,
              filters.orientation,
              (value) => setFilters(prev => ({ ...prev, orientation: value })),
              'Orientation'
            )}
            
            {renderColorOptions(
              colorOptions,
              filters.color,
              (value) => setFilters(prev => ({ ...prev, color: value })),
              'Colors'
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingRight: 50,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchButton: {
    position: 'absolute',
    right: 28,
    backgroundColor: '#667eea',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesSection: {
    height: 50,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  categoryButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#333',
    height: 40,
    justifyContent: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: 'white',
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#0a0a0a',
    fontWeight: '600',
  },
  activeFiltersSection: {
    height: 44,
    marginBottom: 4,
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    height: 32,
    gap: 6,
  },
  activeFilterColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#666',
  },
  activeFilterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterClear: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  list: {
    padding: GAP,
    paddingBottom: 80,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE * 1.4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: GAP,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  fullscreenImage: {
    flex: 1,
    width: '100%',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 60,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 28,
  },
  filterTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
    marginBottom: 14,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterOptionSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterOptionText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  allColorText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    borderRadius: 12,
  },
  applyButtonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});