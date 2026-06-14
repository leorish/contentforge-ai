/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface DictationButtonProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export default function DictationButton({
  onTranscript,
  placeholder = "Click to dictate text...",
  className = ""
}: DictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API Support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startListening = () => {
    setErrorMsg(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg("Permission denied. Enable microphone access.");
        } else {
          setErrorMsg(`Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to start speech services.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Web Speech API not supported in this browser"
        className={`p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-600 cursor-not-allowed ${className}`}
      >
        <MicOff className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? "Stop listening" : placeholder}
        className={`p-2.5 rounded-lg border transition-all duration-300 relative flex items-center justify-center cursor-pointer ${
          isListening
            ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse'
            : 'bg-zinc-900/60 border-zinc-800 hover:border-indigo-500 text-zinc-400 hover:text-white'
        } ${className}`}
      >
        {isListening ? (
          <>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <Mic className="w-4 h-4 text-rose-400" />
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {errorMsg && (
        <div className="absolute right-0 top-12 z-50 w-64 p-2 bg-zinc-950 border border-red-900/50 rounded-lg shadow-xl text-[10px] text-red-400 flex items-start gap-1.5 animate-fade-in font-mono">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p>{errorMsg}</p>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-[9px] underline text-zinc-400 hover:text-white mt-1 cursor-pointer block"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
