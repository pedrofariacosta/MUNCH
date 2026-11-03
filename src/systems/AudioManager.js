// MUNCH — Sistema Central de Áudio, Usabilidade e Acessibilidade

(function () {
  const SETTINGS_KEY = 'munch_audio_settings';

  const DEFAULT_SETTINGS = {
    musicVolume: 10,
    sfxVolume: 10,
    isMuted: false
  };

  class AudioManager {
    constructor() {
      this.ctx = null;
      this.masterGainNode = null;
      this.musicGainNode = null;
      this.sfxGainNode = null;
      this.menuAudio = null;
      this.hasBgmStarted = false;
      this.isPageHidden = false;
      this.toastTimeout = null;

      // Carrega preferências salvas
      this.settings = this.loadSettings();

      // Configura ouvintes globais
      this.initGlobalListeners();
    }

    loadSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        let settings = raw ? JSON.parse(raw) : null;
        if (!settings) {
          const legMusic = localStorage.getItem('munch_audio_music');
          const legSfx = localStorage.getItem('munch_audio_sfx');
          const legMute = localStorage.getItem('munch_audio_muted');
          settings = {
            musicVolume: legMusic !== null ? parseInt(legMusic) : DEFAULT_SETTINGS.musicVolume,
            sfxVolume: legSfx !== null ? parseInt(legSfx) : DEFAULT_SETTINGS.sfxVolume,
            isMuted: legMute === 'true'
          };
        }
        if (settings && (settings.musicVolume === 25 || settings.musicVolume === 80)) {
          settings.musicVolume = DEFAULT_SETTINGS.musicVolume;
        }
        if (settings && (settings.sfxVolume === 100 || settings.sfxVolume === 80)) {
          settings.sfxVolume = DEFAULT_SETTINGS.sfxVolume;
        }
        return Object.assign({}, DEFAULT_SETTINGS, settings);
      } catch (e) {
        return Object.assign({}, DEFAULT_SETTINGS);
      }
    }

    saveSettings() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
        localStorage.setItem('munch_audio_music', this.settings.musicVolume.toString());
        localStorage.setItem('munch_audio_sfx', this.settings.sfxVolume.toString());
        localStorage.setItem('munch_audio_muted', this.settings.isMuted ? 'true' : 'false');
      } catch (e) { }
    }

    getAudioContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGainNode = this.ctx.createGain();
          this.musicGainNode = this.ctx.createGain();
          this.sfxGainNode = this.ctx.createGain();

          this.musicGainNode.connect(this.masterGainNode);
          this.sfxGainNode.connect(this.masterGainNode);
          this.masterGainNode.connect(this.ctx.destination);

          this.applyGains();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => { });
      }
      return this.ctx;
    }

    applyGains() {
      if (!this.masterGainNode || !this.ctx) return;
      const now = this.ctx.currentTime;
      const effectiveMaster = (this.settings.isMuted || this.isPageHidden) ? 0 : 1;

      this.masterGainNode.gain.cancelScheduledValues(now);
      this.masterGainNode.gain.setValueAtTime(effectiveMaster, now);

      if (this.musicGainNode) {
        this.musicGainNode.gain.cancelScheduledValues(now);
        this.musicGainNode.gain.setValueAtTime(this.settings.musicVolume / 100, now);
      }

      if (this.sfxGainNode) {
        this.sfxGainNode.gain.cancelScheduledValues(now);
        this.sfxGainNode.gain.setValueAtTime(this.settings.sfxVolume / 100, now);
      }
    }

    isMenuPage() {
      if (typeof window === 'undefined' || typeof document === 'undefined') return false;
      const path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
      const href = (window.location && window.location.href) ? window.location.href.toLowerCase() : '';
      return !!(
        document.getElementById('menuBtnPlay') ||
        document.getElementById('modalPlay') ||
        path.includes('menu') ||
        href.includes('menu.html')
      );
    }

    initMenuMusic() {
      if (!this.isMenuPage()) return;
      if (this.menuAudio) return;
      try {
        this.menuAudio = new Audio('assets/audio/menu-theme.wav');
        this.menuAudio.loop = true;
        this.menuAudio.preload = 'auto';

        // Trata ausência graciosa do arquivo de áudio sem estourar erros no console
        this.menuAudio.addEventListener('error', () => {
          // Arquivo ausente ou erro de decodificação ignorado silenciosamente
        });

        this.updateBGMVolume();

        // Se o usuário já interagiu nesta sessão (ex: clique no index.html)
        if (sessionStorage.getItem('munch_user_interacted') === 'true') {
          this.attemptPlayMenuMusic();
        }
      } catch (e) { }
    }

    attemptPlayMenuMusic() {
      if (!this.isMenuPage() || !this.menuAudio || this.hasBgmStarted) return;
      this.updateBGMVolume();
      try {
        const playPromise = this.menuAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.hasBgmStarted = true;
            })
            .catch(() => {
              // Bloqueio temporário de autoplay tratado graciosamente
            });
        }
      } catch (e) { }
    }

    stopMenuMusic() {
      if (this.menuAudio) {
        try {
          this.menuAudio.pause();
          this.menuAudio.currentTime = 0;
          this.hasBgmStarted = false;
        } catch (e) { }
      }
    }

    updateBGMVolume() {
      if (!this.menuAudio) return;
      const effectiveVol = (this.settings.isMuted || this.isPageHidden) ? 0 : (this.settings.musicVolume / 100);
      this.menuAudio.volume = Math.max(0, Math.min(1, effectiveVol));
    }

    setMasterMute(muted, showToast = true) {
      this.settings.isMuted = !!muted;
      this.saveSettings();
      this.applyGains();
      this.updateBGMVolume();
      this.updateUI();

      if (showToast) {
        this.showMuteToast(this.settings.isMuted);
      }
    }

    toggleMute() {
      this.setMasterMute(!this.settings.isMuted, true);
    }

    setMusicVolume(vol) {
      this.settings.musicVolume = Math.max(0, Math.min(100, parseInt(vol) || 0));
      this.saveSettings();
      this.applyGains();
      this.updateBGMVolume();
    }

    setSfxVolume(vol) {
      this.settings.sfxVolume = Math.max(0, Math.min(100, parseInt(vol) || 0));
      this.saveSettings();
      this.applyGains();
    }

    getEffectiveSFXVolume() {
      if (this.settings.isMuted || this.isPageHidden) return 0;
      return (this.settings.sfxVolume / 100);
    }

    getEffectiveMusicVolume() {
      if (this.settings.isMuted || this.isPageHidden) return 0;
      return (this.settings.musicVolume / 100);
    }

    // Pré-visualização Sonora do SFX (blip retrô / pastilha)
    playSFXPreview() {
      if (this.settings.isMuted || this.isPageHidden) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const sfxVol = this.settings.sfxVolume / 100;
      if (sfxVol <= 0) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25 * sfxVol, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGainNode || ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.14);
    }

    initGlobalListeners() {
      // 1. Desbloqueio de Autoplay na primeira interação
      const unlock = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => { });
        }
        if (this.isMenuPage()) {
          try {
            sessionStorage.setItem('munch_user_interacted', 'true');
          } catch (e) { }
          this.attemptPlayMenuMusic();
        }
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('click', unlock, { passive: true });

      // 2. Tecla de Atalho Global 'M'
      window.addEventListener('keydown', (e) => {
        if (e.key === 'm' || e.key === 'M') {
          const tag = document.activeElement ? document.activeElement.tagName : '';
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (document.activeElement && document.activeElement.isContentEditable)) {
            return;
          }
          e.preventDefault();
          this.toggleMute();
        }
      });

      // 3. Auto-Mute em Segundo Plano (Page Visibility API)
      document.addEventListener('visibilitychange', () => {
        this.isPageHidden = document.hidden;
        this.updateBGMVolume();
        if (this.ctx && this.masterGainNode) {
          const now = this.ctx.currentTime;
          if (document.hidden) {
            this.masterGainNode.gain.cancelScheduledValues(now);
            this.masterGainNode.gain.setValueAtTime(0, now);
          } else {
            if (!this.settings.isMuted) {
              this.masterGainNode.gain.cancelScheduledValues(now);
              this.masterGainNode.gain.setValueAtTime(1, now);
            }
          }
        }
      });

      // 4. Inicializa o botão na interface e música do menu assim que o DOM carregar
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.bindUI());
      } else {
        this.bindUI();
      }
    }

    bindUI() {
      const btnMute = document.getElementById('btnGlobalMute');
      if (btnMute) {
        btnMute.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleMute();
        });
      }
      this.updateUI();

      if (this.isMenuPage()) {
        this.initMenuMusic();
      }
    }

    updateUI() {
      const btnMute = document.getElementById('btnGlobalMute');
      if (btnMute) {
        const iconEl = btnMute.querySelector('.mute-icon') || btnMute;
        if (this.settings.isMuted) {
          btnMute.classList.add('is-muted');
          iconEl.innerText = '🔇';
          btnMute.title = 'Áudio Silenciado [Pressione M para ativar]';
        } else {
          btnMute.classList.remove('is-muted');
          iconEl.innerText = '🔊';
          btnMute.title = 'Silenciar Áudio [Pressione M]';
        }
      }

      const chkMute = document.getElementById('chkMasterMute');
      if (chkMute) {
        chkMute.checked = this.settings.isMuted;
      }

      const rowMusic = document.getElementById('rowMusicVol');
      const rowSfx = document.getElementById('rowSfxVol');
      if (rowMusic && rowSfx) {
        if (this.settings.isMuted) {
          rowMusic.classList.add('audio-disabled');
          rowSfx.classList.add('audio-disabled');
        } else {
          rowMusic.classList.remove('audio-disabled');
          rowSfx.classList.remove('audio-disabled');
        }
      }
    }

    showMuteToast(isMuted) {
      let toast = document.getElementById('munchAudioToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'munchAudioToast';
        document.body.appendChild(toast);
      }

      toast.className = `audio-toast ${isMuted ? 'muted' : 'active'}`;
      toast.innerText = isMuted ? '[ 🔇 ÁUDIO MUTADO ]' : '[ 🔊 ÁUDIO ATIVADO ]';
      toast.style.display = 'block';
      toast.style.opacity = '1';

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          toast.style.display = 'none';
          toast.style.transition = '';
          toast.style.transform = '';
        }, 300);
      }, 1500);
    }
  }

  window.AudioManager = new AudioManager();
})();

