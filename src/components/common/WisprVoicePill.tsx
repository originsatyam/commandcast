import React, { useState, useEffect, useRef } from "react";
import { VoiceDictationService } from "../../services/voiceDictationService";
import { sounds } from "../../services/soundEffectsService";

interface WisprVoicePillProps {
  onTranscript: (spokenText: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  label?: string;
  size?: "sm" | "md";
  className?: string;
  title?: string;
  iconOnly?: boolean;
}

export const WisprVoicePill: React.FC<WisprVoicePillProps> = ({
  onTranscript,
  onStart,
  onEnd,
  label = "",
  size = "sm",
  className = "",
  title = "Voice dictation · Click to speak",
  iconOnly = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const serviceRef = useRef<VoiceDictationService | null>(null);

  // Store latest callbacks in refs so dictation instance is persistent and never restarted on re-render
  const onTranscriptRef = useRef(onTranscript);
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onStartRef.current = onStart;
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    serviceRef.current = new VoiceDictationService({
      onTranscript: (text) => {
        onTranscriptRef.current?.(text);
      },
      onStateChange: (listening) => {
        setIsListening(listening);
        if (listening) {
          sounds.playVoiceStart();
          onStartRef.current?.();
        } else {
          sounds.playVoiceStop();
          onEndRef.current?.();
        }
      }
    });

    return () => {
      serviceRef.current?.stop();
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!serviceRef.current) return;
    serviceRef.current.toggle();
  };

  return (
    <div className={`wispr-voice-wrap ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <button
        type="button"
        className={`wispr-pill ${iconOnly ? "icon-only" : ""} ${isListening ? "is-recording" : ""} ${size}`}
        onClick={handleToggle}
        title={isListening ? "Listening... Click to stop dictation" : title}
        aria-pressed={isListening}
        aria-label={isListening ? "Listening continuously. Click to stop." : "Start voice dictation"}
      >
        <span className="wispr-mic-icon">
          <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </span>

        {isListening ? (
          iconOnly ? (
            <span className="wispr-pulse-ring" aria-hidden="true" />
          ) : (
            <span className="wispr-waves" aria-hidden="true">
              <span className="bar b1" />
              <span className="bar b2" />
              <span className="bar b3" />
              <span className="bar b4" />
            </span>
          )
        ) : (
          !iconOnly && label && <span className="wispr-label">{label}</span>
        )}
      </button>
    </div>
  );
};

