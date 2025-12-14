
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, Loader2, Zap, Radio } from 'lucide-react';

interface VoiceBettingProps {
  onCashOut: () => void;
  onSetBetAmount: (amount: number) => void;
  onTriggerBet: (amount: number) => void;
  isLightMode?: boolean;
}

const VoiceBetting: React.FC<VoiceBettingProps> = ({ onCashOut, onSetBetAmount, onTriggerBet, isLightMode }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  
  // Refs to maintain instance stability across renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);

  // Refs for stable callbacks (Fixes stale closure issue)
  const onCashOutRef = useRef(onCashOut);
  const onSetBetAmountRef = useRef(onSetBetAmount);
  const onTriggerBetRef = useRef(onTriggerBet);

  useEffect(() => {
      onCashOutRef.current = onCashOut;
      onSetBetAmountRef.current = onSetBetAmount;
      onTriggerBetRef.current = onTriggerBet;
  }, [onCashOut, onSetBetAmount, onTriggerBet]);

  const cleanup = () => {
    if (processorRef.current && sourceRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    // Reset refs
    processorRef.current = null;
    sourceRef.current = null;
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    sessionRef.current = null;
    
    setIsActive(false);
    setIsConnecting(false);
    setLastCommand(null);
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  const toggleVoice = async () => {
    if (isActive || isConnecting) {
      cleanup();
      return;
    }

    setIsConnecting(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");

      const ai = new GoogleGenAI({ apiKey });
      
      // Audio Setup
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 16000,
      }});
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      audioContextRef.current = audioContext;
      mediaStreamRef.current = stream;
      sourceRef.current = source;
      processorRef.current = processor;

      // Define tools
      const tools = [
        {
          functionDeclarations: [
            {
              name: 'cashOut',
              description: 'Trigger this function immediately when the user says "Baba Stop", "Stop", "Cash Out", or "Now".',
            },
            {
              name: 'placeBet',
              description: 'Place a bet immediately when the user says "Bet [amount]" or just a number like "100".',
              parameters: {
                type: 'OBJECT',
                properties: {
                  amount: { type: 'NUMBER', description: 'The integer amount to bet.' }
                },
                required: ['amount']
              }
            }
          ]
        }
      ];

      // Start Session
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            setIsConnecting(false);
            setIsActive(true);

            // Start processing audio
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert Float32 to Int16
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
              }
              
              // Base64 Encode
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Data
                  }
                });
              });
            };

            source.connect(processor);
            processor.connect(audioContext.destination);
          },
          onmessage: (msg: LiveServerMessage) => {
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'cashOut') {
                  console.log("Voice Command: Cash Out!");
                  setLastCommand("Baba Stop!");
                  // Use ref to access latest closure
                  onCashOutRef.current();
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: [{
                        id: fc.id,
                        name: fc.name,
                        response: { result: "ok" }
                      }]
                    });
                  });
                } else if (fc.name === 'placeBet') {
                  const amount = Math.round(Number(fc.args.amount));
                  console.log("Voice Command: Place Bet", amount);
                  if (amount > 0) {
                      setLastCommand(`Placed $${amount}`);
                      // Use refs to access latest closure
                      onSetBetAmountRef.current(amount); 
                      onTriggerBetRef.current(amount);   
                  }
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: [{
                        id: fc.id,
                        name: fc.name,
                        response: { result: `Bet placed for ${amount}` }
                      }]
                    });
                  });
                }
              }
            }
          },
          onclose: () => {
            console.log("Gemini Live Closed");
            cleanup();
          },
          onerror: (err) => {
            console.error("Gemini Live Error", err);
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: tools,
          systemInstruction: "You are Baba's betting assistant. When the user says 'Bet [number]' or just a number, IMMEDIATELY call the `placeBet` tool with that amount. When the user says 'Baba Stop', 'Stop', or 'Cash Out', IMMEDIATELY call the `cashOut` tool. Be fast and responsive.",
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Failed to start voice session", err);
      cleanup();
    }
  };

  // Clear command feedback after 2s
  useEffect(() => {
      if (lastCommand) {
          const t = setTimeout(() => setLastCommand(null), 2000);
          return () => clearTimeout(t);
      }
  }, [lastCommand]);

  return (
    <div className="relative group">
        <button
          onClick={toggleVoice}
          className={`relative h-10 px-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden border ${
            isActive 
              ? 'bg-red-600 border-red-500 text-white w-auto shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
              : isConnecting
              ? (isLightMode ? 'bg-gray-200 border-gray-300 text-gray-500' : 'bg-slate-700 border-slate-600 text-slate-400')
              : (isLightMode ? 'bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-500' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-red-500 hover:text-red-400')
          }`}
          title={isActive ? "Stop Voice Betting" : "Start Voice Betting"}
        >
          {/* Background Animation when active */}
          {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 animate-pulse opacity-50"></div>
          )}

          <div className="relative z-10 flex items-center gap-2">
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isActive ? (
                <>
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold whitespace-nowrap">Listening...</span>
                    {/* Ripple Effect */}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                </>
              ) : (
                <>
                    <MicOff className="w-4 h-4" />
                    <span className="hidden group-hover:inline text-xs font-bold whitespace-nowrap">Voice Bet</span>
                </>
              )}
          </div>
        </button>
        
        {/* Command Feedback Tooltip */}
        {lastCommand && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap backdrop-blur-sm animate-in zoom-in slide-in-from-bottom-2">
                {lastCommand}
            </div>
        )}
        
        {/* Hover Hint */}
        {!isActive && !lastCommand && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                Say "Bet 100" then "Baba Stop"
            </div>
        )}
    </div>
  );
};

export default VoiceBetting;
