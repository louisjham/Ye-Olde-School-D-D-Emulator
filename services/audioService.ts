
class AudioService {
  private ctx: AudioContext | null = null;
  private themeIntervalId: ReturnType<typeof setInterval> | null = null;
  private themeTimeouts: ReturnType<typeof setTimeout>[] = [];

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  beep(freq: number = 440, duration: number = 0.1, type: OscillatorType = 'square', gainValue: number = 0.05) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playDiceRoll() {
    this.beep(200, 0.05, 'square', 0.03);
    setTimeout(() => this.beep(300, 0.05, 'square', 0.03), 40);
    setTimeout(() => this.beep(400, 0.05, 'square', 0.03), 80);
    setTimeout(() => this.beep(500, 0.1, 'square', 0.05), 120);
  }

  playCombatStab() {
    this.beep(150, 0.1, 'sawtooth', 0.1);
    this.beep(120, 0.1, 'sawtooth', 0.1);
    this.beep(100, 0.2, 'sawtooth', 0.1);
  }

  playFlee() {
    this.beep(800, 0.05, 'sine', 0.05);
    setTimeout(() => this.beep(600, 0.05, 'sine', 0.05), 50);
    setTimeout(() => this.beep(400, 0.2, 'sine', 0.05), 100);
  }

  playDeath() {
    this.beep(100, 1.0, 'sine', 0.2);
    this.beep(80, 1.0, 'sine', 0.2);
    this.beep(60, 1.5, 'sine', 0.2);
  }

  playTyping() {
    this.beep(1200 + Math.random() * 400, 0.01, 'square', 0.01);
  }

  /**
   * Gold Box CRPG title theme — an E-minor arpeggio fanfare that loops.
   * Must be called after a user gesture to respect browser autoplay policy.
   */
  playTheme() {
    this.stopTheme(); // Clear any previous loop

    // Notes: E4, G4, B4, E5 (ascending), then D5, B4, G4, E4 (descending)
    // Each phrase is ~2400ms with a 600ms pause before loop
    const PHRASE_DURATION = 3000; // ms between loop restarts

    const NOTES: { freq: number; delay: number; dur: number; gain: number }[] = [
      // Ascending fanfare
      { freq: 330,  delay: 0,    dur: 0.18, gain: 0.06 }, // E4
      { freq: 392,  delay: 180,  dur: 0.18, gain: 0.06 }, // G4
      { freq: 494,  delay: 360,  dur: 0.18, gain: 0.06 }, // B4
      { freq: 659,  delay: 540,  dur: 0.45, gain: 0.07 }, // E5 (held)
      // Descending resolution
      { freq: 587,  delay: 980,  dur: 0.18, gain: 0.05 }, // D5
      { freq: 494,  delay: 1160, dur: 0.18, gain: 0.05 }, // B4
      { freq: 392,  delay: 1340, dur: 0.18, gain: 0.05 }, // G4
      { freq: 330,  delay: 1520, dur: 0.55, gain: 0.06 }, // E4 (held)
      // Brief echo flourish
      { freq: 494,  delay: 2100, dur: 0.12, gain: 0.04 }, // B4
      { freq: 659,  delay: 2250, dur: 0.12, gain: 0.04 }, // E5
      { freq: 494,  delay: 2400, dur: 0.12, gain: 0.04 }, // B4
    ];

    const playPhrase = () => {
      this.init();
      NOTES.forEach(note => {
        const t = setTimeout(() => {
          this.beep(note.freq, note.dur, 'square', note.gain);
        }, note.delay);
        this.themeTimeouts.push(t);
      });
    };

    playPhrase(); // Play immediately
    this.themeIntervalId = setInterval(playPhrase, PHRASE_DURATION);
  }

  stopTheme() {
    if (this.themeIntervalId !== null) {
      clearInterval(this.themeIntervalId);
      this.themeIntervalId = null;
    }
    this.themeTimeouts.forEach(t => clearTimeout(t));
    this.themeTimeouts = [];
  }
}

export const audioService = new AudioService();
