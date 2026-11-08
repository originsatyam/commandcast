export interface SpeechController {
  isSupported: boolean;
  startListening: (
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) => void;
  stopListening: () => void;
}

export const getSpeechRecognitionController = (): SpeechController => {
  const win = typeof window !== "undefined" ? (window as any) : null;
  const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    return {
      isSupported: false,
      startListening: () => {
        console.warn("SpeechRecognition is not supported in this browser environment.");
      },
      stopListening: () => {}
    };
  }

  let recognitionInstance: any = null;

  return {
    isSupported: true,
    startListening: (onResult, onError, onEnd) => {
      try {
        if (recognitionInstance) {
          try {
            recognitionInstance.stop();
          } catch {
            // ignore previous stop errors
          }
        }

        recognitionInstance = new SpeechRecognitionClass();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const currentTranscript = finalTranscript || interimTranscript;
          onResult(currentTranscript.trim(), Boolean(finalTranscript));
        };

        recognitionInstance.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          let userFriendlyMessage = "Speech error occurred.";
          if (event.error === "not-allowed") {
            userFriendlyMessage = "Microphone access was denied. Please allow microphone permissions or use text input.";
          } else if (event.error === "no-speech") {
            userFriendlyMessage = "No speech detected. Please speak closer to your microphone or try again.";
          } else if (event.error === "network") {
            userFriendlyMessage = "Speech recognition network issue. Use text input as fallback.";
          }
          onError(userFriendlyMessage);
        };

        recognitionInstance.onend = () => {
          onEnd();
        };

        recognitionInstance.start();
      } catch (err: any) {
        onError(err?.message || "Could not initialize speech recognition.");
        onEnd();
      }
    },
    stopListening: () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch {
          // ignore
        }
      }
    }
  };
};
