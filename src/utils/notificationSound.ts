// Notification sound utility using Web Audio API with robust fallback support

let audioContext: AudioContext | null = null;
let audioInitialized = false;
let audioInitializing = false;

// Get or create AudioContext
const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('[NotificationSound] AudioContext created, state:', audioContext.state);
    }
    return audioContext;
  } catch (error) {
    console.error('[NotificationSound] Failed to create AudioContext:', error);
    return null;
  }
};

// Ensure AudioContext is ready (async with proper resume)
const ensureAudioReady = async (): Promise<AudioContext | null> => {
  const ctx = getAudioContext();
  if (!ctx) return null;

  if (ctx.state === 'suspended') {
    try {
      console.log('[NotificationSound] Resuming suspended AudioContext...');
      await ctx.resume();
      console.log('[NotificationSound] AudioContext resumed, new state:', ctx.state);
      audioInitialized = true;
    } catch (e) {
      console.warn('[NotificationSound] Failed to resume AudioContext:', e);
      return null;
    }
  } else if (ctx.state === 'running') {
    audioInitialized = true;
  }

  return ctx;
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
  | 'favorite'
  | 'achievement'
  | 'badge_unlocked';

export type VibrationPattern = 'short' | 'medium' | 'long' | 'urgent' | 'success';

/**
 * Trigger device vibration if supported
 */
export const triggerVibration = (pattern: VibrationPattern = 'short') => {
  if (!('vibrate' in navigator)) {
    console.log('[NotificationSound] Vibration API not supported');
    return;
  }

  // Check user preferences
  const vibrationEnabled = localStorage.getItem('notification_vibration_enabled') !== 'false';
  if (!vibrationEnabled) {
    console.log('[NotificationSound] Vibration disabled by user preference');
    return;
  }

  try {
    let vibrationMs: number | number[];
    switch (pattern) {
      case 'short':
        vibrationMs = 100;
        break;
      case 'medium':
        vibrationMs = 300;
        break;
      case 'long':
        vibrationMs = 500;
        break;
      case 'urgent':
        vibrationMs = [100, 50, 100, 50, 100];
        break;
      case 'success':
        vibrationMs = [150, 100, 200];
        break;
      default:
        vibrationMs = 100;
    }
    
    const result = navigator.vibrate(vibrationMs);
    console.log('[NotificationSound] Vibration triggered:', pattern, 'result:', result);
  } catch (error) {
    console.error('[NotificationSound] Error triggering vibration:', error);
  }
};

/**
 * Fallback sound using HTML5 Audio element
 * Uses a reliable base64 encoded beep sound
 */
const playFallbackSound = async (): Promise<boolean> => {
  console.log('[NotificationSound] Playing fallback audio...');
  
  try {
    // Create a simple but audible beep using oscillator-generated WAV
    const audio = new Audio();
    audio.volume = 0.5;
    
    // Generate a simple beep WAV data
    const sampleRate = 8000;
    const duration = 0.2;
    const frequency = 800;
    const samples = sampleRate * duration;
    
    // WAV header + data
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(view, 8, 'WAVE');
    
    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    
    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate sine wave
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const amplitude = Math.sin(2 * Math.PI * frequency * t) * 32767 * 0.5;
      // Apply fade out
      const envelope = 1 - (i / samples);
      view.setInt16(44 + i * 2, amplitude * envelope, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    audio.src = URL.createObjectURL(blob);
    
    await audio.play();
    console.log('[NotificationSound] Fallback audio played successfully');
    return true;
  } catch (error) {
    console.warn('[NotificationSound] Fallback audio failed:', error);
    return false;
  }
};

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Play a notification sound using Web Audio API (async version)
 */
export const playNotificationSound = async (type: NotificationSoundType = 'default'): Promise<void> => {
  // Check user preferences
  const soundEnabled = localStorage.getItem('notification_sound_enabled') !== 'false';
  if (!soundEnabled) {
    console.log('[NotificationSound] Sound disabled by user preference');
    return;
  }

  console.log('[NotificationSound] Playing sound type:', type);

  try {
    // Ensure AudioContext is ready
    const ctx = await ensureAudioReady();
    
    if (!ctx || ctx.state !== 'running') {
      console.warn('[NotificationSound] AudioContext not ready, using fallback');
      await playFallbackSound();
      return;
    }

    // Play the appropriate sound
    switch (type) {
      case 'express':
        playUrgentSound(ctx);
        break;
      case 'contact':
        playChimeSound(ctx);
        break;
      case 'message':
        playSoftPing(ctx);
        break;
      case 'zone_alert':
        playZoneAlertSound(ctx);
        break;
      case 'booking_confirmed':
        playBookingConfirmedSound(ctx);
        break;
      case 'booking_reminder':
        playReminderSound(ctx);
        break;
      case 'new_review':
        playReviewFanfare(ctx);
        break;
      case 'payment':
        playPaymentSound(ctx);
        break;
      case 'urgent':
        playUrgentPulses(ctx);
        break;
      case 'new_professional':
        playNewProfessionalFanfare(ctx);
        break;
      case 'favorite':
        playFavoriteSound(ctx);
        break;
      case 'achievement':
        playAchievementSound(ctx);
        break;
      case 'badge_unlocked':
        playBadgeUnlockedSound(ctx);
        break;
      default:
        playDefaultSound(ctx);
    }
  } catch (error) {
    console.error('[NotificationSound] Error playing sound, trying fallback:', error);
    await playFallbackSound();
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
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
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
  oscillator.frequency.setValueAtTime(523, ctx.currentTime);
  oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.35);
};

// Soft ping for messages
const playSoftPing = (ctx: AudioContext) => {
  const { oscillator, gainNode } = createToneNodes(ctx);
  oscillator.frequency.setValueAtTime(600, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.25);
};

// Zone alert - 3 ascending tones
const playZoneAlertSound = (ctx: AudioContext) => {
  const frequencies = [440, 554, 659];
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
  const { oscillator: osc1, gainNode: gain1 } = createToneNodes(ctx);
  osc1.frequency.setValueAtTime(523, ctx.currentTime);
  gain1.gain.setValueAtTime(0.25, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.2);
  
  const { oscillator: osc2, gainNode: gain2 } = createToneNodes(ctx);
  osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
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
    oscillator.frequency.setValueAtTime(587, startTime);
    oscillator.frequency.setValueAtTime(523, startTime + 0.1);
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  }
};

// Review fanfare - 4 ascending celebration notes
const playReviewFanfare = (ctx: AudioContext) => {
  const notes = [392, 440, 523, 659];
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
  const { oscillator: osc1, gainNode: gain1 } = createToneNodes(ctx);
  osc1.frequency.setValueAtTime(1200, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
  gain1.gain.setValueAtTime(0.15, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.1);
  
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
  oscillator.frequency.setValueAtTime(440, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
};

// New professional fanfare - celebratory 5-note ascending melody
const playNewProfessionalFanfare = (ctx: AudioContext) => {
  const notes = [523, 587, 659, 784, 880];
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
  
  const { oscillator: finalOsc, gainNode: finalGain } = createToneNodes(ctx);
  const finalStart = ctx.currentTime + (notes.length * duration);
  finalOsc.frequency.setValueAtTime(1047, finalStart);
  finalGain.gain.setValueAtTime(0.2, finalStart);
  finalGain.gain.exponentialRampToValueAtTime(0.01, finalStart + 0.4);
  finalOsc.start(finalStart);
  finalOsc.stop(finalStart + 0.4);
};

// Added to favorites - warm heartbeat-like double pop
const playFavoriteSound = (ctx: AudioContext) => {
  const { oscillator: osc1, gainNode: gain1 } = createToneNodes(ctx);
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(200, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
  gain1.gain.setValueAtTime(0.25, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.15);
  
  const { oscillator: osc2, gainNode: gain2 } = createToneNodes(ctx);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(350, ctx.currentTime + 0.12);
  osc2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.22);
  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  osc2.start(ctx.currentTime + 0.12);
  osc2.stop(ctx.currentTime + 0.35);
  
  const { oscillator: osc3, gainNode: gain3 } = createToneNodes(ctx);
  osc3.frequency.setValueAtTime(880, ctx.currentTime + 0.25);
  gain3.gain.setValueAtTime(0, ctx.currentTime);
  gain3.gain.setValueAtTime(0.15, ctx.currentTime + 0.25);
  gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
  osc3.start(ctx.currentTime + 0.25);
  osc3.stop(ctx.currentTime + 0.45);
};

// Achievement unlocked - triumphant ascending fanfare
const playAchievementSound = (ctx: AudioContext) => {
  const notes = [392, 494, 587, 784];
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
  
  const finalStart = ctx.currentTime + (notes.length * duration);
  
  const { oscillator: finalOsc1, gainNode: finalGain1 } = createToneNodes(ctx);
  finalOsc1.frequency.setValueAtTime(784, finalStart);
  finalGain1.gain.setValueAtTime(0.2, finalStart);
  finalGain1.gain.exponentialRampToValueAtTime(0.01, finalStart + 0.5);
  finalOsc1.start(finalStart);
  finalOsc1.stop(finalStart + 0.5);
  
  const { oscillator: finalOsc2, gainNode: finalGain2 } = createToneNodes(ctx);
  finalOsc2.frequency.setValueAtTime(988, finalStart);
  finalGain2.gain.setValueAtTime(0.15, finalStart);
  finalGain2.gain.exponentialRampToValueAtTime(0.01, finalStart + 0.5);
  finalOsc2.start(finalStart);
  finalOsc2.stop(finalStart + 0.5);
};

// Badge unlocked - celebratory jingle with sparkle effect
const playBadgeUnlockedSound = (ctx: AudioContext) => {
  const notes = [523, 659, 784, 1047];
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
  
  const sparkleStart = ctx.currentTime + (notes.length * duration);
  for (let i = 0; i < 3; i++) {
    const { oscillator: sparkle, gainNode: sparkleGain } = createToneNodes(ctx);
    const sTime = sparkleStart + (i * 0.06);
    sparkle.frequency.setValueAtTime(1319 + (i * 200), sTime);
    sparkleGain.gain.setValueAtTime(0.12, sTime);
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, sTime + 0.12);
    sparkle.start(sTime);
    sparkle.stop(sTime + 0.12);
  }
  
  const { oscillator: finalOsc, gainNode: finalGain } = createToneNodes(ctx);
  const finalStart = sparkleStart + 0.2;
  finalOsc.frequency.setValueAtTime(1047, finalStart);
  finalGain.gain.setValueAtTime(0.25, finalStart);
  finalGain.gain.exponentialRampToValueAtTime(0.01, finalStart + 0.4);
  finalOsc.start(finalStart);
  finalOsc.stop(finalStart + 0.4);
};

// Debounce tracking for anti-duplicate sounds
let lastSoundTime = 0;
let lastSoundType: NotificationSoundType | null = null;
const DEBOUNCE_MS = 500;

/**
 * Play sound with vibration combined (async, with debounce)
 */
export const playNotificationWithVibration = async (
  soundType: NotificationSoundType = 'default',
  vibrationPattern: VibrationPattern = 'short'
): Promise<void> => {
  const now = Date.now();
  
  // Debounce: prevent duplicate sounds within 500ms
  if (lastSoundType === soundType && now - lastSoundTime < DEBOUNCE_MS) {
    console.log('[NotificationSound] Debounced duplicate sound:', soundType);
    return;
  }
  
  lastSoundTime = now;
  lastSoundType = soundType;
  
  console.log('[NotificationSound] playNotificationWithVibration:', { soundType, vibrationPattern });
  
  // Play sound (async)
  await playNotificationSound(soundType);
  
  // Trigger vibration
  triggerVibration(vibrationPattern);
};

/**
 * Pre-initialize audio context on user interaction
 * Call this on first user click to enable sounds
 */
export const initializeAudioContext = async (): Promise<boolean> => {
  if (audioInitialized) {
    console.log('[NotificationSound] Audio already initialized');
    return true;
  }
  
  if (audioInitializing) {
    console.log('[NotificationSound] Audio initialization in progress');
    return false;
  }
  
  audioInitializing = true;
  
  try {
    const ctx = await ensureAudioReady();
    if (ctx && ctx.state === 'running') {
      audioInitialized = true;
      console.log('[NotificationSound] Audio initialized successfully');
      audioInitializing = false;
      return true;
    }
  } catch (error) {
    console.error('[NotificationSound] Error initializing audio context:', error);
  }
  
  audioInitializing = false;
  return false;
};

/**
 * Check if audio is initialized and ready
 */
export const isAudioReady = (): boolean => audioInitialized;

/**
 * Get current AudioContext state for debugging
 */
export const getAudioState = () => ({
  initialized: audioInitialized,
  contextState: audioContext?.state || 'no-context',
  supported: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined'
});
