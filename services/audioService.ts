
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
    this.beep(200, 0.05, 'square');
    setTimeout(() => this.beep(300, 0.05, 'square'), 40);
    setTimeout(() => this.beep(400, 0.05, 'square'), 80);
    setTimeout(() => this.beep(500, 0.1, 'square'), 120);
  }

  playCombatStab() {
    this.beep(150, 0.1, 'sawtooth', 0.1);
    this.beep(160, 0.1, 'sawtooth', 0.1);
  }

  playFlee() {
    this.beep(800, 0.1, 'sine');
    setTimeout(() => this.beep(600, 0.2, 'sine'), 100);
  }

  playDeath() {
    this.beep(100, 0.8, 'sine', 0.2);
    this.beep(90, 0.8, 'sine', 0.2);
  }
}

export const audioService = new AudioService();
