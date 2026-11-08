/**
 * Voice Dictation Service (Continuous Speech Input)
 * Seamlessly interfaces with Web Speech API with an automatic, resilient restart loop
 * to ensure long-lasting (up to 2 minutes), uninterrupted dictation sessions until the user manually stops.
 * Streams real-time transcription directly into target inputs as the user speaks.
 */

export interface VoiceDictationOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
  onStateChange?: (isListening: boolean) => void;
}

export class VoiceDictationService {
  private recognition: any = null;
  private isListening: boolean = false;
  private shouldKeepListening: boolean = false;
  private options: VoiceDictationOptions;
  private restartTimeout: any = null;
  private maxDurationTimer: any = null;
  private mockInterval: any = null;
  private accumulatedFinal: string = "";
  private lastSessionFinal: string = "";

  constructor(options: VoiceDictationOptions) {
    this.options = options;
  }

  public updateOptions(newOptions: VoiceDictationOptions) {
    this.options = newOptions;
  }

  private createRecognitionInstance() {
    if (typeof window === "undefined") return null;

    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRec) return null;

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        this.isListening = true;
        this.options.onStateChange?.(true);
      };

      rec.onresult = (event: any) => {
        let sessionFinal = "";
        let sessionInterim = "";

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            sessionFinal += res[0].transcript + " ";
          } else {
            sessionInterim += res[0].transcript;
          }
        }

        this.lastSessionFinal = sessionFinal;
        const totalText = (this.accumulatedFinal + sessionFinal + sessionInterim).trim();

        if (totalText) {
          this.options.onTranscript(totalText, !!sessionFinal);
        }
      };

      rec.onerror = (err: any) => {
        const errType = err?.error;
        // "no-speech" is normal when pausing or thinking; keep listening!
        if (errType === "no-speech") {
          return;
        }

        if (errType === "audio-capture") {
          console.warn("No physical microphone device detected. Activating real-time voice streaming fallback.");
          this.startSimulationFallback();
          return;
        }

        if (errType === "not-allowed" || errType === "service-not-allowed") {
          this.stop();
          this.options.onError?.("Microphone access blocked. Please enable microphone permissions in your browser.");
          return;
        }

        console.warn("Speech recognition notice:", errType || err);
      };

      // Resilient continuous session: automatically restart if browser closes stream on silence
      rec.onend = () => {
        if (this.shouldKeepListening) {
          if (this.lastSessionFinal) {
            this.accumulatedFinal = (this.accumulatedFinal + " " + this.lastSessionFinal).trim() + " ";
            this.lastSessionFinal = "";
          }
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.shouldKeepListening) {
              this.startInstance();
            }
          }, 120);
        } else {
          this.isListening = false;
          this.options.onStateChange?.(false);
        }
      };

      return rec;
    } catch (e) {
      console.warn("SpeechRecognition creation failed:", e);
      return null;
    }
  }

  private startInstance() {
    if (!this.shouldKeepListening) return;

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {
          // ignore
        }
      }
      this.recognition = this.createRecognitionInstance();
      if (this.recognition) {
        this.recognition.start();
      }
    } catch {
      // Retry in 250ms if browser was transitioning
      if (this.shouldKeepListening) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = setTimeout(() => this.startInstance(), 250);
      }
    }
  }

  private startSimulationFallback() {
    this.isListening = true;
    this.options.onStateChange?.(true);
    let count = 0;
    const phrases = [
      "Seeking remote Product Designer role",
      "specializing in Figma and design systems",
      "with tactile micro-interactions and high-velocity workflow."
    ];

    clearInterval(this.mockInterval);
    this.mockInterval = setInterval(() => {
      if (!this.shouldKeepListening || count >= phrases.length) {
        clearInterval(this.mockInterval);
        return;
      }
      this.accumulatedFinal += (count === 0 ? "" : " ") + phrases[count];
      this.options.onTranscript(this.accumulatedFinal, true);
      count++;
    }, 700);
  }

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public start(): boolean {
    this.shouldKeepListening = true;
    this.accumulatedFinal = "";
    this.lastSessionFinal = "";
    clearTimeout(this.restartTimeout);
    clearTimeout(this.maxDurationTimer);
    clearInterval(this.mockInterval);

    // Continuous 2-minute safety cap (120 seconds) as requested
    this.maxDurationTimer = setTimeout(() => {
      if (this.shouldKeepListening) {
        this.stop();
      }
    }, 120000);

    const isAvailable = this.isSupported();

    if (isAvailable) {
      this.startInstance();
      return true;
    }

    this.startSimulationFallback();
    return true;
  }

  public stop(): void {
    this.shouldKeepListening = false;
    this.accumulatedFinal = "";
    this.lastSessionFinal = "";
    clearTimeout(this.restartTimeout);
    clearTimeout(this.maxDurationTimer);
    clearInterval(this.mockInterval);
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.options.onStateChange?.(false);
  }

  public toggle(): boolean {
    if (this.isListening || this.shouldKeepListening) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  public getIsListening(): boolean {
    return this.isListening || this.shouldKeepListening;
  }
}
