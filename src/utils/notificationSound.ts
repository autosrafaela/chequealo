// Notification sound utility using Web Audio API

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export type NotificationSoundType = 
  | 'contact' 
  | 'express' 
  | 'message' 
  | 'default'
  | 'zone_alert'
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'new_review'
  | 'payment'
  | 'urgent'
  | 'new_professional'
  | 'favorite'           // When someone adds you to favorites ❤️
  | 'achievement'        // Profile complete, milestones 🎯
  | 'badge_unlocked';    // Badge unlocked 🏆

export type VibrationPattern = 'short' | 'medium' | 'long' | 'urgent' | 'success';

/**
 * Trigger device vibration if supported
 * @param pattern - Type of vibration pattern
 */
export const triggerVibration = (pattern: VibrationPattern = 'short') => {
  if (!('vibrate' in navigator)) {
    console.log('Vibration API not supported');
    return;
  }

  try {
    switch (pattern) {
      case 'short':
        navigator.vibrate(100);
        break;
      case 'medium':
        navigator.vibrate(300);
        break;
      case 'long':
        navigator.vibrate(500);
        break;
      case 'urgent':
        // Urgent: 3 quick pulses
        navigator.vibrate([100, 50, 100, 50, 100]);
        break;
      case 'success':
        // Success: 2 pulses
        navigator.vibrate([150, 100, 200]);
        break;
      default:
        navigator.vibrate(100);
    }
  } catch (error) {
    console.error('Error triggering vibration:', error);
  }
};

/**
 * Play a notification sound using Web Audio API
 * @param type - Type of notification sound
 */
export const playNotificationSound = (type: NotificationSoundType = 'default') => {
  // Check user preferences
  const soundEnabled = localStorage.getItem('notification_sound_enabled') !== 'false';
  if (!soundEnabled) {
    console.log('[NotificationSound] Sound disabled by user preference');
    return;
  }

  console.log('[NotificationSound] Playing sound type:', type);

  try {
    const ctx = getAudioContext();
    
    // Resume audio context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    switch (type) {
      case 'express':
        // Urgent sound: higher pitch, faster pattern - 3 urgent beeps
        playUrgentSound(ctx);
        break;
        
      case 'contact':
        // Pleasant chime: two-tone notification
        playChimeSound(ctx);
        break;
        
      case 'message':
        // Soft ping
        playSoftPing(ctx);
        break;

      case 'zone_alert':
        // Zone alert: 3 ascending tones - professional is nearby!
        playZoneAlertSound(ctx);
        break;

      case 'booking_confirmed':
        // Booking confirmed: happy double chime
        playBookingConfirmedSound(ctx);
        break;

      case 'booking_reminder':
        // Reminder: gentle alarm pattern
        playReminderSound(ctx);
        break;

      case 'new_review':
        // New review: fanfare - 4 ascending notes
        playReviewFanfare(ctx);
        break;

      case 'payment':
        // Payment: cha-ching cash register effect
        playPaymentSound(ctx);
        break;

      case 'urgent':
        // Urgent: 3 rapid high-pitched pulses
        playUrgentPulses(ctx);
        break;

      case 'new_professional':
        // New professional: celebratory fanfare - 5 ascending notes
        playNewProfessionalFanfare(ctx);
        break;

      case 'favorite':
        // Added to favorites: warm heartbeat-like pop sound ❤️
        playFavoriteSound(ctx);
        break;

      case 'achievement':
        // Achievement unlocked: triumphant fanfare 🎯
        playAchievementSound(ctx);
        break;

      case 'badge_unlocked':
        // Badge unlocked: celebratory jingle 🏆
        playBadgeUnlockedSound(ctx);
        break;
        
      default:
        // Default notification sound
        playDefaultSound(ctx);
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Helper function to create and connect oscillator with gain
const createToneNodes = (ctx: AudioContext) => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  return { oscillator, gainNode };
};

// Express/Urgent sound - high pitched, attention-grabbing
const playUrgentSound = (ctx: AudioContext) => {
  const { oscillator, gainNode } = createToneNodes(ctx);
  oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
  oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.4);
};

// Pleasant two-tone chime for contacts
const playChimeSound = (ctx: AudioContext) => {
  const { oscillator, gainNode } = createToneNodes(ctx);
  oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
  oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.15); // E5
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.35);
};

// Soft ping for messages
const playSoftPing = (ctx: AudioContext) => {
  const { oscillator, gainNode } = createToneNodes(ctx);
  oscillator.frequency.setValueAtTime(600, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
};

// Zone alert - 3 ascending tones (professional nearby!)
const playZoneAlertSound = (ctx: AudioContext) => {
  const frequencies = [440, 554, 659]; // A4, C#5, E5 - ascending triad
  const duration = 0.15;
  
  frequencies.forEach((freq, index) => {
    const { oscillator, gainNode } = createToneNodes(ctx);
    const startTime = ctx.currentTime + (index * duration);
    
    oscillator.frequency.setValueAtTime(freq, startTime);
    gainNode.gain.setValueAtTime(0.25, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  });
};

// Booking confirmed - happy double chime
const playBookingConfirmedSound = (ctx: AudioContext) => {
  // First chime
  const { oscillator: osc1, gainNode: gain1 } = createToneNodes(ctx);
  osc1.frequency.setValueAtTime(523, ctx.currentTime); // C5
  gain1.gain.setValueAtTime(0.25, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.2);
  
  // Second higher chime
  const { oscillator: osc2, gainNode: gain2 } = createToneNodes(ctx);
  osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.15); // E5
  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc2.start(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.4);
};

// Reminder - gentle alarm pattern
const playReminderSound = (ctx: AudioContext) => {
  for (let i = 0; i < 2; i++) {
    const { oscillator, gainNode } = createToneNodes(ctx);
    const startTime = ctx.currentTime + (i * 0.3);
    
    oscillator.frequency.setValueAtTime(587, startTime); // D5
    oscillator.frequency.setValueAtTime(523, startTime + 0.1); // C5
    
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  }
};

// Review fanfare - 4 ascending celebration notes
const playReviewFanfare = (ctx: AudioContext) => {
  const notes = [392, 440, 523, 659]; // G4, A4, C5, E5
  const duration = 0.12;
  
  notes.forEach((freq, index) => {
    const { oscillator, gainNode } = createToneNodes(ctx);
    const startTime = ctx.currentTime + (index * duration);
    
    oscillator.frequency.setValueAtTime(freq, startTime);
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 1.5);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration * 1.5);
  });
};

// Payment sound - cha-ching cash register effect
const playPaymentSound = (ctx: AudioContext) => {
  // First part: coin drop (high frequency quick)
  const { oscillator: osc1, gainNode: gain1 } = createToneNodes(ctx);
  osc1.frequency.setValueAtTime(1200, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
  gain1.gain.setValueAtTime(0.15, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.1);
  
  // Second part: register bell (sustained)
  const { oscillator: osc2, gainNode: gain2 } = createToneNodes(ctx);
  osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc2.start(ctx.currentTime + 0.08);
  osc2.stop(ctx.currentTime + 0.4);
};

// Urgent pulses - 3 rapid high-pitched alerts
const playUrgentPulses = (ctx: AudioContext) => {
  for (let i = 0; i < 3; i++) {
    const { oscillator, gainNode } = createToneNodes(ctx);
    const startTime = ctx.currentTime + (i * 0.12);
    
    oscillator.frequency.setValueAtTime(1000, startTime);
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.1);
  }
};

// Default notification sound
const playDefaultSound = (ctx: AudioContext) => {
  const { oscillator, gainNode } = createToneNodes(ctx);
  oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.25);
};

// New professional fanfare - celebratory 5-note ascending melody
const playNewProfessionalFanfare = (ctx: AudioContext) => {
  const notes = [523, 587, 659, 784, 880]; // C5, D5, E5, G5, A5 - major pentatonic celebration
  const duration = 0.1;
  
  notes.forEach((freq, index) => {
    const { oscillator, gainNode } = createToneNodes(ctx);
    const startTime = ctx.currentTime + (index * duration);
    
    oscillator.frequency.setValueAtTime(freq, startTime);
    gainNode.gain.setValueAtTime(0.25, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 2);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration * 2);
  });
  
  // Add a final sustained note for celebration effect
  const { oscillator: finalOsc, gainNode: finalGain } = createToneNodes(ctx);
  const finalStart = ctx.currentTime + (notes.length * duration);
  finalOsc.frequency.setValueAtTime(1047, finalStart); // C6 - octave higher
  finalGain.gain.setValueAtTime(0.2, finalStart);
  finalGain.gain.exponentialRampToValueAtTime(0.01, finalStart + 0.4);
  finalOsc.start(finalStart);
  finalOsc.stop(finalStart + 0.4);
};

// Added to favorites - warm heartbeat-like double pop ❤️
const playFavoriteSound = (ctx: AudioContext) => {
  // First "heartbeat" - low thump
  const { oscillator: osc1, gainNode: gain1 } = createToneNodes(ctx);
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(200, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
  gain1.gain.setValueAtTime(0.25, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.15);
  
  // Second "heartbeat" - higher, warmer tone
  const { oscillator: osc2, gainNode: gain2 } = createToneNodes(ctx);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(350, ctx.currentTime + 0.12);
  osc2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.22);
  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  osc2.start(ctx.currentTime + 0.12);
  osc2.stop(ctx.currentTime + 0.35);
  
  // Sweet high sparkle at the end
  const { oscillator: osc3, gainNode: gain3 } = createToneNodes(ctx);
  osc3.frequency.setValueAtTime(880, ctx.currentTime + 0.25);
  gain3.gain.setValueAtTime(0, ctx.currentTime);
  gain3.gain.setValueAtTime(0.15, ctx.currentTime + 0.25);
  gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
  osc3.start(ctx.currentTime + 0.25);
  osc3.stop(ctx.currentTime + 0.45);
};

// Achievement unlocked - triumphant ascending fanfare 🎯
const playAchievementSound = (ctx: AudioContext) => {
  const notes = [392, 494, 587, 784]; // G4, B4, D5, G5 - triumphant G major arpeggio
  const duration = 0.12;
  
  notes.forEach((freq, index) => {
    const { oscillator, gainNode } = createToneNodes(ctx);
    const startTime = ctx.currentTime + (index * duration);
    
    oscillator.frequency.setValueAtTime(freq, startTime);
    gainNode.gain.setValueAtTime(0.25, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 2.5);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration * 2.5);
  });
  
  // Final sustained chord (two notes for richness)
  const finalStart = ctx.currentTime + (notes.length * duration);
  
  const { oscillator: finalOsc1, gainNode: finalGain1 } = createToneNodes(ctx);
  finalOsc1.frequency.setValueAtTime(784, finalStart); // G5
  finalGain1.gain.setValueAtTime(0.2, finalStart);
  finalGain1.gain.exponentialRampToValueAtTime(0.01, finalStart + 0.5);
  finalOsc1.start(finalStart);
  finalOsc1.stop(finalStart + 0.5);
  
  const { oscillator: finalOsc2, gainNode: finalGain2 } = createToneNodes(ctx);
  finalOsc2.frequency.setValueAtTime(988, finalStart); // B5
  finalGain2.gain.setValueAtTime(0.15, finalStart);
  finalGain2.gain.exponentialRampToValueAtTime(0.01, finalStart + 0.5);
  finalOsc2.start(finalStart);
  finalOsc2.stop(finalStart + 0.5);
};

// Badge unlocked - celebratory jingle with sparkle effect 🏆
const playBadgeUnlockedSound = (ctx: AudioContext) => {
  // Quick ascending arpeggio
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6 - bright C major
  const duration = 0.08;
  
  notes.forEach((freq, index) => {
    const { oscillator, gainNode } = createToneNodes(ctx);
    const startTime = ctx.currentTime + (index * duration);
    
    oscillator.frequency.setValueAtTime(freq, startTime);
    gainNode.gain.setValueAtTime(0.22, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 2);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration * 2);
  });
  
  // Sparkle effect - high frequency shimmer
  const sparkleStart = ctx.currentTime + (notes.length * duration);
  for (let i = 0; i < 3; i++) {
    const { oscillator: sparkle, gainNode: sparkleGain } = createToneNodes(ctx);
    const sTime = sparkleStart + (i * 0.06);
    sparkle.frequency.setValueAtTime(1319 + (i * 200), sTime); // E6, F#6, G#6
    sparkleGain.gain.setValueAtTime(0.12, sTime);
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, sTime + 0.12);
    sparkle.start(sTime);
    sparkle.stop(sTime + 0.12);
  }
  
  // Final triumphant note
  const { oscillator: finalOsc, gainNode: finalGain } = createToneNodes(ctx);
  const finalStart = sparkleStart + 0.2;
  finalOsc.frequency.setValueAtTime(1047, finalStart); // C6
  finalGain.gain.setValueAtTime(0.25, finalStart);
  finalGain.gain.exponentialRampToValueAtTime(0.01, finalStart + 0.4);
  finalOsc.start(finalStart);
  finalOsc.stop(finalStart + 0.4);
};

/**
 * Play sound with vibration combined
 */
export const playNotificationWithVibration = (
  soundType: NotificationSoundType = 'default',
  vibrationPattern: VibrationPattern = 'short'
) => {
  console.log('[NotificationSound] playNotificationWithVibration called:', { soundType, vibrationPattern });
  
  playNotificationSound(soundType);
  
  // Check vibration preferences
  const vibrationEnabled = localStorage.getItem('notification_vibration_enabled') !== 'false';
  if (vibrationEnabled) {
    console.log('[NotificationSound] Triggering vibration:', vibrationPattern);
    triggerVibration(vibrationPattern);
  } else {
    console.log('[NotificationSound] Vibration disabled by user preference');
  }
};

/**
 * Pre-initialize audio context on user interaction
 * Call this on first user click to enable sounds
 */
export const initializeAudioContext = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (error) {
    console.error('Error initializing audio context:', error);
  }
};
