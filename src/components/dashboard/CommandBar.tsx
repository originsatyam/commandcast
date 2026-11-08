import React, { useState } from "react";
import { Mic, MicOff, Search, ArrowRight, AlertCircle, CheckCircle2, CornerDownLeft, Sparkles } from "lucide-react";
import type { WorkflowDefinition } from "../../types";
import { matchCommand, type MatchResult } from "../../utils/commandMatcher";

interface CommandBarProps {
  speechSupported: boolean;
  isListening: boolean;
  onStartVoice: () => void;
  onStopVoice: () => void;
  onCommandMatched: (workflow: WorkflowDefinition, triggeredBy: "voice" | "text" | "click") => void;
  voiceTranscript?: string;
  voiceError?: string;
  workflows: WorkflowDefinition[];
}

export const CommandBar: React.FC<CommandBarProps> = ({
  speechSupported,
  isListening,
  onStartVoice,
  onStopVoice,
  onCommandMatched,
  voiceTranscript = "",
  voiceError,
  workflows
}) => {
  const [inputText, setInputText] = useState("");
  const [prevVoice, setPrevVoice] = useState(voiceTranscript);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  if (voiceTranscript !== prevVoice) {
    setPrevVoice(voiceTranscript);
    setInputText(voiceTranscript);
    if (voiceTranscript) {
      setMatchResult(matchCommand(voiceTranscript, workflows));
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (val.trim()) {
      const res = matchCommand(val, workflows);
      setMatchResult(res);
    } else {
      setMatchResult(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const res = matchCommand(inputText, workflows);
    setMatchResult(res);

    if (res.type === "exact" || res.type === "alias") {
      if (res.workflow) {
        onCommandMatched(res.workflow, isListening ? "voice" : "text");
      }
    }
  };

  const handleChipClick = (phrase: string) => {
    setInputText(phrase);
    const res = matchCommand(phrase, workflows);
    setMatchResult(res);
    if (res.workflow) {
      onCommandMatched(res.workflow, "click");
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: "20px 24px",
      background: "#ffffff",
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--shadow-card)",
      borderRadius: "var(--radius-xl)",
      marginBottom: 24
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        flexWrap: "wrap",
        gap: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "var(--primary)"
          }}>
            Command Pipeline
          </span>
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
            Speak or type a registered command to preview and execute
          </span>
        </div>

        <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
          Deterministic • Zero hallucination • Verified steps
        </div>
      </div>

      <form onSubmit={handleFormSubmit} style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {/* Voice Trigger Button (Apple Dictation / Siri style) */}
        <button
          type="button"
          onClick={isListening ? onStopVoice : onStartVoice}
          disabled={!speechSupported}
          className="btn"
          style={{
            height: 46,
            padding: "0 18px",
            borderRadius: "var(--radius-lg)",
            background: isListening
              ? "#e11d48"
              : speechSupported
              ? "var(--accent-black)"
              : "var(--bg-secondary)",
            color: speechSupported ? "#ffffff" : "var(--text-faint)",
            boxShadow: isListening ? "0 0 16px rgba(225, 29, 72, 0.4)" : "none",
            animation: isListening ? "voiceSiriPulse 1.8s infinite" : "none",
            border: isListening ? "1px solid #fda4af" : "1px solid rgba(0, 0, 0, 0.08)"
          }}
          title={speechSupported ? (isListening ? "Listening... click to stop" : "Click to speak command") : "Speech recognition unsupported"}
        >
          {isListening ? (
            <>
              <div style={{ display: "flex", gap: 3, alignItems: "center", height: 16 }}>
                <span style={{ width: 3, background: "#fff", borderRadius: 2, animation: "voiceWave 0.8s infinite 0.1s" }} />
                <span style={{ width: 3, background: "#fff", borderRadius: 2, animation: "voiceWave 0.8s infinite 0.3s" }} />
                <span style={{ width: 3, background: "#fff", borderRadius: 2, animation: "voiceWave 0.8s infinite 0.2s" }} />
              </div>
              <span style={{ fontWeight: 600 }}>Listening...</span>
            </>
          ) : (
            <>
              {speechSupported ? <Mic size={17} /> : <MicOff size={17} />}
              <span style={{ fontWeight: 500 }}>{speechSupported ? "Voice" : "No Mic"}</span>
            </>
          )}
        </button>

        {/* Text Input Field */}
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={17}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-faint)",
              pointerEvents: "none"
            }}
          />
          <input
            type="text"
            className="input-field"
            value={inputText}
            onChange={handleInputChange}
            placeholder={isListening ? "Listening..." : "Type command, e.g. 'Save this internship' or 'Prepare my application'..."}
            style={{
              height: 46,
              paddingLeft: 42,
              paddingRight: 90,
              fontSize: 14,
              background: "#ffffff",
              border: isListening
                ? "1px solid #e11d48"
                : matchResult?.type === "exact"
                ? "1px solid var(--status-success)"
                : "1px solid rgba(0, 0, 0, 0.12)"
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="btn btn-primary"
            style={{
              position: "absolute",
              right: 5,
              top: 5,
              bottom: 5,
              padding: "0 14px",
              borderRadius: "var(--radius-md)",
              fontSize: 12.5
            }}
          >
            <span>Run</span>
            <CornerDownLeft size={13} />
          </button>
        </div>
      </form>

      {/* Voice Error notice */}
      {voiceError && (
        <div style={{
          marginTop: 10,
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          background: "var(--status-failed-bg)",
          border: "1px solid var(--status-failed-border)",
          color: "var(--status-failed)",
          fontSize: 12.5,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <AlertCircle size={15} />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Match Result Feedback banner */}
      {matchResult && inputText.trim() && (
        <div style={{
          marginTop: 12,
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          background:
            matchResult.type === "exact" || matchResult.type === "alias"
              ? "var(--status-success-bg)"
              : matchResult.type === "ambiguous"
              ? "var(--status-waiting-bg)"
              : "var(--status-failed-bg)",
          border: `1px solid ${
            matchResult.type === "exact" || matchResult.type === "alias"
              ? "var(--status-success-border)"
              : matchResult.type === "ambiguous"
              ? "var(--status-waiting-border)"
              : "var(--status-failed-border)"
          }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            {matchResult.type === "exact" || matchResult.type === "alias" ? (
              <CheckCircle2 size={16} color="var(--status-success)" />
            ) : matchResult.type === "ambiguous" ? (
              <AlertCircle size={16} color="var(--status-waiting)" />
            ) : (
              <AlertCircle size={16} color="var(--status-failed)" />
            )}
            <span style={{
              color:
                matchResult.type === "exact" || matchResult.type === "alias"
                  ? "var(--status-success)"
                  : matchResult.type === "ambiguous"
                  ? "var(--status-waiting)"
                  : "var(--status-failed)",
              fontWeight: 500
            }}>
              {matchResult.explanation}
            </span>
          </div>

          {/* Quick confirmation action button if matched */}
          {matchResult.workflow && (
            <button
              onClick={() => onCommandMatched(matchResult.workflow!, "text")}
              className="btn btn-blue"
              style={{
                padding: "4px 12px",
                fontSize: 12,
                height: 30
              }}
            >
              <span>Preview & Confirm</span>
              <ArrowRight size={13} />
            </button>
          )}

          {/* Ambiguous selection buttons */}
          {matchResult.ambiguousMatches && (
            <div style={{ display: "flex", gap: 6 }}>
              {matchResult.ambiguousMatches.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => onCommandMatched(wf, "click")}
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: 11.5 }}
                >
                  Select: {wf.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggested phrases chips (Apple capsule pills) */}
      <div style={{
        marginTop: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap"
      }}>
        <span style={{ fontSize: 12, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
          <Sparkles size={12} color="var(--primary)" /> Registered triggers:
        </span>
        {workflows.flatMap((w) => w.triggerPhrases.slice(0, 1)).map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => handleChipClick(phrase)}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-full)",
              padding: "4px 12px",
              color: "var(--text-main)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all var(--duration-fast) var(--ease-apple)",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.2)";
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
          >
            <span>“{phrase}”</span>
          </button>
        ))}
      </div>
    </div>
  );
};
