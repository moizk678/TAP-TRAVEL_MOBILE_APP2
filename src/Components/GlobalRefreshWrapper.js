import React, { useState, useContext, useCallback } from 'react';
import { ScrollView, RefreshControl, View, StyleSheet, Animated } from 'react-native';
import { AuthContext } from '../context/AuthContext';

/**
 * An enhanced wrapper component that adds stylish pull-to-refresh functionality to any screen
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be wrapped
 * @param {Function} props.onRefresh - Optional custom refresh function
 * @param {Boolean} props.scrollEnabled - Whether scrolling is enabled (default: true)
 * @param {Object} props.contentContainerStyle - Additional styles for content container
 * @param {Boolean} props.showsVerticalScrollIndicator - Whether to show scroll indicator (default: false)
 * @param {Boolean} props.enablePulseEffect - Whether to show pulse effect during refresh (default: true)
 */
const GlobalRefreshWrapper = ({ 
  children, 
  onRefresh: customOnRefresh,
  scrollEnabled = true,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  enablePulseEffect = true
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUserData } = useContext(AuthContext) || {}; // Safely access context
  
  // Animation value for pulse effect
  const pulseAnim = new Animated.Value(1);
  
  // Start pulse animation when refreshing
  const startPulseAnimation = () => {
    if (enablePulseEffect) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };
  
  // Stop pulse animation
  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    startPulseAnimation();
    
    try {
      // Use custom refresh function if provided, otherwise use default
      if (customOnRefresh) {
        await customOnRefresh();
      } else {
        // Default refresh behavior - refresh user data if available
        if (refreshUserData) {
          await refreshUserData();
        }
        // Add other global refresh logic here
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
      stopPulseAnimation();
    }
  }, [customOnRefresh, refreshUserData]);

  // Primary color for the app
  const PRIMARY_COLOR = '#292966';
  // Secondary colors for gradient-like effect in the refresh indicator
  const SECONDARY_COLORS = ['#3c3c8c', '#232354', '#292966', '#353587'];

  return (
    <Animated.View style={[
      styles.animatedContainer,
      refreshing && enablePulseEffect && { transform: [{ scale: pulseAnim }] }
    ]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          contentContainerStyle,
          !scrollEnabled && styles.flexGrow
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={SECONDARY_COLORS} // Multiple colors for a more dynamic effect
            tintColor={PRIMARY_COLOR}
            progressBackgroundColor="#f8f8ff" // Light background for contrast
            progressViewOffset={10} // Add some spacing
            title="Refreshing..." // Add a title on iOS
            titleColor={PRIMARY_COLOR}
          />
        }
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        bounces={true} // Enhanced bounce effect
        overScrollMode="always" // Always show overscroll effect on Android
        style={styles.scrollView}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
  flexGrow: {
    flex: 1,
  }
});

export default GlobalRefreshWrapper;