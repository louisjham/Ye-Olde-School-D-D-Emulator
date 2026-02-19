
class AudioService {
  private ctx: AudioContext | null = null;

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
    const now = this.ctx?.currentTime || 0;
    this.beep(100, 1.0, 'sine', 0.2);
    this.beep(80, 1.0, 'sine', 0.2);
    this.beep(60, 1.5, 'sine', 0.2);
  }

  playTyping() {
    // Very quiet high-pitched click for terminal output
    this.beep(1200 + Math.random() * 400, 0.01, 'square', 0.01);
  }
}

export const audioService = new AudioService();
