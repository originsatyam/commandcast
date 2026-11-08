import React, { useState, useMemo, useRef } from "react";
import type { StudentProfile, OpportunityListing } from "../../types/campus";
import { parseResumeFile } from "../../services/resumeParserService";
import {
  countWords,
  enforceWordLimit,
  overwriteProfileFromPrompt,
  MAX_PROMPT_WORDS
} from "../../services/promptMatcherService";
import { WisprVoicePill } from "../common/WisprVoicePill";
import { sounds } from "../../services/soundEffectsService";

interface ProfileMatcherSettingsProps {
  profile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
  opportunities: OpportunityListing[];
}

export const ProfileMatcherSettings: React.FC<ProfileMatcherSettingsProps> = ({
  profile,
  onSaveProfile,
  opportunities
}) => {
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [promptText, setPromptText] = useState(profile.customPrompt || "");
  const [promptStatusMsg, setPromptStatusMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const basePromptTextRef = useRef("");

  const wordCount = useMemo(() => countWords(promptText), [promptText]);
  const wordsRemaining = MAX_PROMPT_WORDS - wordCount;
  const isApproachingLimit = wordCount >= 1800;
  const isLimitReached = wordCount >= MAX_PROMPT_WORDS;

  // Time Complexity: Compute matched count with memoization
  const matchCount = useMemo(() => {
    const roleKeyword = (formData.targetRole || "").toLowerCase();
    const userSkills = formData.skills.map((s) => s.toLowerCase());

    return opportunities.filter((opp) => {
      const titleMatch = roleKeyword ? opp.title.toLowerCase().includes(roleKeyword.split(" ")[0]) : true;
      const skillMatch = opp.skills.some((sk) => userSkills.includes(sk.toLowerCase()));
      const locMatch = formData.preferredLocation === "Remote" ? opp.workplaceType === "Remote" : true;
      return titleMatch || skillMatch || locMatch;
    }).length;
  }, [opportunities, formData.targetRole, formData.skills, formData.preferredLocation]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const { text, exceeded } = enforceWordLimit(val, MAX_PROMPT_WORDS);
    setPromptText(text);
    if (exceeded) {
      sounds.playTap();
    }
  };

  const handleVoiceStart = () => {
    setIsVoiceListening(true);
    basePromptTextRef.current = promptText.trim();
  };

  const handleVoiceEnd = () => {
    setIsVoiceListening(false);
  };

  const handleVoicePromptTranscript = (spokenText: string) => {
    const base = basePromptTextRef.current;
    const combined = base ? `${base} ${spokenText}` : spokenText;
    const { text } = enforceWordLimit(combined, MAX_PROMPT_WORDS);
    setPromptText(text);
  };

  const handleApplyPrompt = () => {
    sounds.playSuccess();
    let updated: StudentProfile = {
      ...formData,
      customPrompt: promptText
    };

    if (promptText.trim()) {
      updated = overwriteProfileFromPrompt(updated, promptText);
      setFormData(updated);
    }

    onSaveProfile(updated);
    setPromptStatusMsg("✓ Prompt applied to radar match engine!");
    setTimeout(() => setPromptStatusMsg(null), 3200);
  };

  const handleClearPrompt = () => {
    sounds.playTap();
    setPromptText("");
    const updated = {
      ...formData,
      customPrompt: ""
    };
    setFormData(updated);
    onSaveProfile(updated);
    setPromptStatusMsg("Prompt cleared.");
    setTimeout(() => setPromptStatusMsg(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2400);
  };

  // Intelligent domain-aware resume parsing
  const processResumeFile = async (file: File) => {
    setIsParsing(true);
    try {
      const parsed = await parseResumeFile(file);
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      const updated: StudentProfile = {
        ...formData,
        name: parsed.name || formData.name,
        targetRole: parsed.roleTitle || formData.targetRole || "Product Designer",
        preferredLocation: parsed.preferredLocation || formData.preferredLocation || "Remote",
        skills: parsed.skills && parsed.skills.length > 0 ? parsed.skills : formData.skills,
        college: parsed.college || formData.college,
        degree: parsed.degree || formData.degree,
        branch: parsed.branch || formData.branch,
        yearOfStudy: parsed.yearOfStudy || formData.yearOfStudy,
        graduationBatch: parsed.graduationBatch || formData.graduationBatch,
        resumeFileName: file.name,
        resumeFileSize: sizeStr,
        resumeUploadedDate: "Just now",
        resumeParsed: true
      };

      setFormData(updated);
      onSaveProfile(updated);
      setIsParsing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error("Resume parsing error:", err);
      setIsParsing(false);
    }
  };

  const handleSimulateResume = (fileName: string, sampleRole: "design" | "engineering") => {
    const mockFileContent = sampleRole === "design"
      ? "Satyam Manik Product Designer Portfolio Figma Design Systems Interaction Prototyping UI UX"
      : "Aarav Sharma Software Engineer Python PyTorch React TypeScript Machine Learning";
    const blob = new Blob([mockFileContent], { type: "application/pdf" });
    const file = new File([blob], fileName, { type: "application/pdf" });
    processResumeFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processResumeFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processResumeFile(file);
    }
  };

  const handleRemoveResume = () => {
    const updated: StudentProfile = {
      ...formData,
      resumeFileName: undefined,
      resumeFileSize: undefined,
      resumeUploadedDate: undefined,
      resumeParsed: false
    };
    setFormData(updated);
    onSaveProfile(updated);
  };

  const roleSuggestions = [
    "Product Designer",
    "UI/UX Designer",
    "Design Systems Intern",
    "Interaction Designer",
    "Software Engineer",
    "Frontend Developer"
  ];

  const locations = ["Remote", "Bengaluru", "Hyderabad", "Pune", "Delhi NCR", "Mumbai"];

  return (
    <div style={{ display: "grid", gap: "var(--s-6)", maxWidth: 780 }}>
      {/* Header */}
      <div>
        <p className="t-label">Essential Search Preferences</p>
        <h2 className="t-h1">Candidate Profile & Target Role</h2>
        <p className="t-lead" style={{ marginTop: 4 }}>
          Upload your resume to automatically extract your skills and target role, or fine-tune your essential search preferences below.
        </p>
      </div>

      {/* Match Insight Card */}
      <div className="stage" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--s-4)" }}>
        <div>
          <span className="t-label" style={{ color: "var(--ink-3)" }}>Autonomous Match Engine</span>
          <p className="t-h2" style={{ marginTop: 2 }}>
            <b>{matchCount}</b> of {opportunities.length} open opportunities match {formData.targetRole || "Product Designer"}
          </p>
          <span className="t-small dim">
            Verified listings matching your target role and skills display the violet "Fits you" indicator.
          </span>
        </div>
        <span className="badge ok">
          ✓ ATS Profile Active
        </span>
      </div>

      {/* Personalized AI & Crawler Match Prompt (Clean, Modern Composer) */}
      <div className="stage" style={{ display: "grid", gap: 16 }}>
        <div>
          <h3 className="t-h3" style={{ margin: 0 }}>
            Personalized Opportunity Discovery Prompt
          </h3>
          <p className="dim" style={{ fontSize: "0.875rem", marginTop: 4 }}>
            Describe your target role, tools, preferred locations, and stipend constraints. Scrapers and radar matcher prioritize opportunities accordingly.
          </p>
        </div>

        {/* Integrated Composer Box with internal Voice Button & Word Counter */}
        <div className="prompt-composer-card">
          <textarea
            className="prompt-composer-textarea"
            rows={4}
            value={promptText}
            onChange={handlePromptChange}
            placeholder="e.g. Seeking remote Product Design internships with an obsession for Figma, component design systems, and micro-interactions. Must offer high-velocity mentorship and at least ₹75,000/month stipend..."
            aria-label="Personalized Opportunity Discovery Prompt"
          />

          {/* Internal Toolbar inside the Input Box */}
          <div className="prompt-composer-foot">
            <div className="prompt-counter-wrap">
              <span
                className={`prompt-counter ${isLimitReached ? "is-limit" : isApproachingLimit ? "is-warn" : ""}`}
                title={`${wordsRemaining.toLocaleString()} words remaining`}
              >
                {wordCount.toLocaleString()} / {MAX_PROMPT_WORDS.toLocaleString()} words
              </span>
              {isVoiceListening && (
                <span className="voice-live-badge">
                  <span className="live-dot" />
                  <span>Listening...</span>
                </span>
              )}
              {promptStatusMsg && (
                <span className="badge ok sm" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>
                  {promptStatusMsg}
                </span>
              )}
              {promptText && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleClearPrompt}
                  style={{ fontSize: "0.75rem", padding: "0 6px", height: 22 }}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="prompt-composer-actions">
              <WisprVoicePill
                onTranscript={handleVoicePromptTranscript}
                onStart={handleVoiceStart}
                onEnd={handleVoiceEnd}
                iconOnly
                title="Speak your personalized opportunity prompt"
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleApplyPrompt}
                style={{ padding: "0 14px", height: 32 }}
              >
                Apply Prompt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Upload Section */}
      <div className="stage" style={{ display: "grid", gap: 16 }}>
        <div>
          <span className="t-label">Resume-Powered Discovery</span>
          <h3 className="t-h3" style={{ marginTop: 2 }}>
            {formData.resumeFileName ? "Active Resume" : "Upload Resume for Instant Autofill"}
          </h3>
          <p className="t-small dim">
            {formData.resumeFileName
              ? "Your uploaded resume automatically provides your target role, design tools, and skills to the radar."
              : "Skip manual entry. Upload your CV to extract your skills, target job title, and location automatically."}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {isParsing ? (
          <div className="resume-dropzone" style={{ cursor: "default" }}>
            <div className="drop-icon" style={{ animation: "scanSpin 1.2s infinite linear" }}>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 600 }}>Analyzing resume structure & skills...</p>
              <span className="t-small dim">Matching against verified design & tech internships</span>
            </div>
            <div className="parsing-progress" style={{ maxWidth: 320 }}>
              <div className="parsing-progress-bar" />
            </div>
          </div>
        ) : formData.resumeFileName ? (
          <div className="resume-card">
            <div className="resume-head">
              <div className="resume-file-info">
                <div className="resume-file-icon">
                  <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <b style={{ fontSize: "0.9375rem" }}>{formData.resumeFileName}</b>
                    <span className="badge violet sm">{formData.targetRole || "Product Designer"}</span>
                  </div>
                  <p className="t-small dim">{formData.resumeFileSize || "248 KB"} &middot; Uploaded {formData.resumeUploadedDate || "recently"}</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge ok">
                  ✓ Resume Active
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className="icon-btn sm"
                  onClick={handleRemoveResume}
                  title="Remove resume"
                  aria-label="Remove resume"
                >
                  <svg className="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <span className="t-label">Extracted Skills & Domains from Resume:</span>
              <div className="resume-skills-row" style={{ marginTop: 6 }}>
                {(formData.skills.length > 0 ? formData.skills : ["Figma", "Design Systems", "UI/UX Design"]).map((sk) => (
                  <span key={sk} className="tag">{sk}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`resume-dropzone ${isDragOver ? "is-dragover" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="drop-icon">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 600 }}>Click to browse or drop your resume (PDF/DOCX)</p>
              <span className="t-small dim">We'll automatically extract your target role and skills to auto-match opportunities.</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateResume("Satyam_Manik_Product_Designer_CV.pdf", "design");
                }}
              >
                Sample: Satyam Manik (Product Designer CV.pdf)
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateResume("Aarav_Sharma_Engineering_CV.pdf", "engineering");
                }}
              >
                Sample: Aarav Sharma (Software Engineer CV.pdf)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Streamlined Essential Search Preferences Form (image-2.png & changes 5.md fix) */}
      <form onSubmit={handleSubmit} className="stage" style={{ display: "grid", gap: "var(--s-5)" }}>
        <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "var(--s-3)" }}>
          <h3 className="t-h3" style={{ margin: 0 }}>
            {formData.resumeFileName ? "Optional Preference Adjustments" : "Essential Search Preferences"}
          </h3>
          <p className="dim" style={{ fontSize: "0.875rem", marginTop: 4 }}>
            {formData.resumeFileName
              ? "Your resume has already configured your profile. You can tweak your candidate name, target role, or location below if desired."
              : "Specify what kind of job you are seeking and your location preference."}
          </p>
        </div>

        {/* Candidate Full Name */}
        <div className="field">
          <label htmlFor="name" style={{ fontWeight: 600, color: "var(--ink-2)" }}>Full Name</label>
          <input
            id="name"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Satyam Manik"
            required
          />
        </div>

        {/* Type of Job Being Sought (Target Role) */}
        <div className="field">
          <label htmlFor="targetRole" style={{ fontWeight: 600, color: "var(--ink-2)" }}>
            Type of Job Being Sought (Target Role)
          </label>
          <input
            id="targetRole"
            className="input"
            value={formData.targetRole || ""}
            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
            placeholder="e.g. Product Designer, UI/UX Designer, Design Systems"
            required
          />
          {/* Quick suggestions pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {roleSuggestions.map((role) => (
              <button
                key={role}
                type="button"
                className={`pill sm pill-interactive ${(formData.targetRole || "").toLowerCase() === role.toLowerCase() ? "active" : ""}`}
                onClick={() => setFormData({ ...formData, targetRole: role })}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Location Selection */}
        <div className="field">
          <label style={{ fontWeight: 600, color: "var(--ink-2)" }}>Preferred Workplace Location</label>
          <div className="pill-select-group" role="radiogroup" aria-label="Preferred Location">
            {locations.map((loc) => (
              <button
                key={loc}
                type="button"
                className={`pill-select-btn ${formData.preferredLocation === loc ? "active" : ""}`}
                onClick={() => setFormData({ ...formData, preferredLocation: loc })}
                role="radio"
                aria-checked={formData.preferredLocation === loc}
              >
                {formData.preferredLocation === loc && <span>✓</span>}
                <span>{loc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--s-3)", marginTop: "var(--s-2)", paddingTop: "var(--s-3)", borderTop: "1px solid var(--line)" }}>
          <button type="submit" className="btn btn-primary">
            Save Preferences & Update Radar
          </button>
          {savedSuccess && (
            <span className="badge ok">✓ Preferences saved</span>
          )}
        </div>
      </form>
    </div>
  );
};
