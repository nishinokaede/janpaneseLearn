import { useCallback, useEffect, useState } from 'react';

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [hasJapaneseVoice, setHasJapaneseVoice] = useState(true);

  const checkVoices = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    const found = voices.some((v) => v.lang.startsWith('ja'));
    setHasJapaneseVoice(found);
  }, []);

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      checkVoices();
    };
    // 延迟检测：某些浏览器 getVoices 同步返回
    setTimeout(checkVoices, 200);
  }, [checkVoices]);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith('ja'));
    if (jaVoice) utterance.voice = jaVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, hasJapaneseVoice };
}
