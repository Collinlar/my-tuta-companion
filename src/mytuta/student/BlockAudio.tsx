import { explanationTranscript } from "../data/audioText";
import { useEffect, useRef, useState } from "react";

export default function BlockAudio({ text, onPlaying }: { text: string; onPlaying: (playing: boolean) => void }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const ownsSpeech = useRef(false);
  const notify = useRef(onPlaying);
  notify.current = onPlaying;
  useEffect(() => () => { if (ownsSpeech.current) { window.speechSynthesis?.cancel(); notify.current(false); } }, []);
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return null;
  return <div style={{ margin: "12px 0" }}>
    <button type="button" aria-pressed={playing} onClick={() => {
      if (playing) { window.speechSynthesis.cancel(); ownsSpeech.current = false; setPlaying(false); notify.current(false); return; }
      const transcript = explanationTranscript(text);
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.lang = "en-GH";
      const finish = () => { ownsSpeech.current = false; setPlaying(false); notify.current(false); };
      utterance.onend = finish;
      utterance.onerror = () => { finish(); setError(true); };
      window.speechSynthesis.cancel(); ownsSpeech.current = true; setPlaying(true); setError(false); notify.current(true);
      window.speechSynthesis.speak(utterance);
    }}>{playing ? "Stop audio" : "Listen to this explanation"}</button>
    {error && <span role="status"> Audio is unavailable. The written explanation remains available above.</span>}
  </div>;
}
