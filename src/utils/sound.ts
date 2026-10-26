/**
 * Clean Web Audio API synthesis for timer completion.
 * Does not depend on external MP3 files that could fail to load or be blocked.
 */

export function playTimerCompletionSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Play a gentle two-tone chime chord (D5 587.33 Hz, A5 880.00 Hz, F#5 739.99 Hz)
    const tones = [587.33, 739.99, 880.00];
    const now = ctx.currentTime;

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      // Volume envelope with soft attack and warm decay
      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.25);
    });

    // Close context after playback completes
    setTimeout(() => {
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    }, 2000);
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
}
