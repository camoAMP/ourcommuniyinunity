"use client";

import React, { createContext, useEffect, useRef, useState } from "react";
import {
  Layout,
  Brain,
  Upload,
  Mic,
  X,
  ChevronLeft,
  ChevronRight,
  Cloud,
  AlertTriangle,
  Cpu,
  Check,
  Settings,
  Shield,
  Wifi,
  EyeOff,
  GraduationCap,
  BookOpen,
  Lightbulb,
  Coins,
  Battery,
  Play,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  WifiOff,
  Target,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

type AIContextValue = {
  activePage: string;
  setActivePage: (value: string) => void;
  gradeLevel: string;
  handleGradeLevelChange: (value: string) => void;
  activeModel: string;
  setActiveModel: (value: string) => void;
  connectionStatus: string;
  energyPoints: number;
  watchAdForEnergy: () => void;
  offlineModelStatus: string;
};

const AIContext = createContext<AIContextValue | null>(null);

const StudyBuddyApp = () => {
  const [activePage, setActivePage] = useState("talkback");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [gradeLevel, setGradeLevel] = useState("7-9");
  const [connectionStatus, setConnectionStatus] = useState("online");
  const [activeModel, setActiveModel] = useState("online");
  const [energyPoints, setEnergyPoints] = useState(5);
  const [visualizationsUsed, setVisualizationsUsed] = useState(0);
  const [dailyLimit] = useState(5);
  const [offlineModelStatus, setOfflineModelStatus] = useState("not-loaded");
  const [modelProgress, setModelProgress] = useState(0);
  const [showAdBanner, setShowAdBanner] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<unknown>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [conversation, setConversation] = useState<Array<any>>([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechOutputSupported, setSpeechOutputSupported] = useState(true);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [mobileConnectionStatus, setMobileConnectionStatus] = useState("disconnected");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const modelWorkerRef = useRef<Worker | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Theme management
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.style.backgroundColor = "var(--background)";
  }, [theme]);

  // Network status detection
  useEffect(() => {
    const updateConnectionStatus = () => {
      setConnectionStatus(navigator.onLine ? "online" : "offline");

      if (!navigator.onLine) {
        setActiveModel("offline");
        setConversation((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "You're offline! Switching to local AI model. Some features may be limited, but I can still help with core learning concepts.",
            name: "System",
          },
        ]);
      }
    };

    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);

    updateConnectionStatus();

    return () => {
      window.removeEventListener("online", updateConnectionStatus);
      window.removeEventListener("offline", updateConnectionStatus);
    };
  }, []);

  // Offline model loading
  useEffect(() => {
    if (activeModel === "offline" && offlineModelStatus === "not-loaded") {
      loadOfflineModel();
    }
  }, [activeModel, offlineModelStatus]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const secure =
      typeof window.isSecureContext === "boolean" ? window.isSecureContext : true;
    setIsSecureContext(secure);
    const supportsSpeech =
      secure && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
    setSpeechSupported(supportsSpeech);
    setSpeechOutputSupported("speechSynthesis" in window);

    if (supportsSpeech) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onstart = () => setIsListening(true);
      recognitionInstance.onend = () => setIsListening(false);

      recognitionInstance.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setTranscript(currentTranscript);

        if (event.results[0].isFinal) {
          handleUserMessage(currentTranscript);
          setTranscript("");
        }
      };

      recognitionInstance.onerror = (error: any) => {
        console.error("Speech recognition error:", error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);

      return () => {
        recognitionInstance.stop();
      };
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!speechOutputSupported && autoSpeak) {
      setAutoSpeak(false);
    }
  }, [speechOutputSupported, autoSpeak]);

  // Energy points management
  useEffect(() => {
    const resetDailyLimit = () => {
      if (visualizationsUsed >= dailyLimit) {
        setEnergyPoints(0);
      }
    };

    resetDailyLimit();

    // Reset daily at midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    const resetTimer = setTimeout(() => {
      setVisualizationsUsed(0);
      setEnergyPoints(dailyLimit);
    }, timeUntilMidnight);

    return () => clearTimeout(resetTimer);
  }, [visualizationsUsed, dailyLimit]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Mock mobile connection
  useEffect(() => {
    const simulateMobileConnection = () => {
      const statuses = ["connected", "disconnected", "pairing"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setMobileConnectionStatus(randomStatus);
    };

    const interval = setInterval(simulateMobileConnection, 5000);
    simulateMobileConnection();

    return () => clearInterval(interval);
  }, []);

  // Load offline model using Web Worker
  const loadOfflineModel = async () => {
    setOfflineModelStatus("loading");

    try {
      if (typeof Worker === "undefined" || typeof URL === "undefined") {
        throw new Error("Web Worker not supported");
      }
      if (!modelWorkerRef.current) {
        modelWorkerRef.current = new Worker(
          URL.createObjectURL(
            new Blob([
              `
          self.addEventListener('message', async (e) => {
            if (e.data.action === 'loadModel') {
              for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 300));
                self.postMessage({
                  status: 'loading',
                  progress: i,
                  message: i < 50 ? 'Downloading model weights...' : 'Optimizing for your device...'
                });
              }

              self.postMessage({
                status: 'loaded',
                modelInfo: {
                  name: 'Llama-3.2-1B-Instruct',
                  size: '1.5GB',
                  capabilities: ['math', 'science', 'biology', 'general-knowledge'],
                  gradeLevels: ['7-9', '10-12']
                }
              });
            }
          });
        `,
            ])
          )
        );

        modelWorkerRef.current.onmessage = (e: MessageEvent) => {
          const data = e.data as any;
          if (data.status === "loading") {
            setModelProgress(data.progress);
          } else if (data.status === "loaded") {
            setOfflineModelStatus("loaded");
            setConversation((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `Offline model loaded successfully! I can now help you with ${data.modelInfo.capabilities.join(", ")} topics for grades ${data.modelInfo.gradeLevels.join(
                  " and "
                )}. No internet required!`,
                name: "StudyBuddy",
              },
            ]);
          }
        };
      }

      modelWorkerRef.current.postMessage({ action: "loadModel" });
    } catch (error) {
      console.error("Error loading offline model:", error);
      setOfflineModelStatus("error");
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Offline mode isn't supported in this browser, so I'll keep using the online model.",
          name: "System",
        },
      ]);
      setActiveModel("online");
    }
  };

  // Handle grade level change with scaffolding
  const handleGradeLevelChange = (newLevel: string) => {
    setGradeLevel(newLevel);

    const gradeMessages: Record<string, string> = {
      "7-9":
        "I'll explain concepts using simple analogies and everyday examples, perfect for middle school learners.",
      "10-12":
        "I'll provide more detailed explanations with diagrams and practical applications, ideal for high school students.",
      "university-prep":
        "I'll bridge high school concepts to university-level thinking with deeper analysis and connections to real research.",
    };

    setConversation((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Grade level set to ${newLevel}. ${gradeMessages[newLevel]}`,
        name: "StudyBuddy",
      },
    ]);
  };

  // Handle user message with scaffolding
  const handleUserMessage = async (message: string) => {
    if (!message.trim()) return;

    setConversation((prev) => [...prev, { role: "user", content: message }]);

    setConversation((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "...",
        isThinking: true,
      },
    ]);

    try {
      if (
        message.toLowerCase().includes("visualize") ||
        message.toLowerCase().includes("diagram") ||
        message.toLowerCase().includes("show me")
      ) {
        if (energyPoints <= 0 && activeModel === "online") {
          setConversation((prev) => prev.filter((msg) => !msg.isThinking));
          setConversation((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `You've used your ${dailyLimit} free visualizations for today! Watch a quick ad to unlock 5 more visual explanations, or wait until tomorrow for your daily reset.`,
              name: "StudyBuddy",
              requiresAdReward: true,
            },
          ]);
          return;
        } else if (activeModel === "offline") {
        } else {
          setEnergyPoints((prev) => Math.max(0, prev - 1));
          setVisualizationsUsed((prev) => prev + 1);
        }
      }

      if (activeModel === "offline" && offlineModelStatus === "loaded") {
        await handleOfflineModelMessage(message);
      } else {
        await handleOnlineModelMessage(message);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setConversation((prev) => prev.filter((msg) => !msg.isThinking));
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again or check your connection.",
          error: true,
        },
      ]);
    }
  };

  // Offline model message handling
  const handleOfflineModelMessage = async (message: string) => {
    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    setConversation((prev) => prev.filter((msg) => !msg.isThinking));

    let response = "";
    const lowerMsg = message.toLowerCase();

    if (gradeLevel === "7-9") {
      if (lowerMsg.includes("math") || lowerMsg.includes("algebra")) {
        response = "Math is like solving puzzles! For example, if you have 3 apples and I give you 2 more, how many do you have? That's addition! Algebra is just using letters like 'x' to represent numbers we don't know yet. Would you like me to show you a simple example with pictures?";
      } else if (lowerMsg.includes("science") || lowerMsg.includes("biology")) {
        response = "Science is all about asking 'why?' and 'how?'. Think of your body like a super cool machine - your heart is the pump, your lungs are the air filters, and your brain is the computer! What part of science interests you most?";
      } else {
        response = "I'm here to help make learning fun! Since you're in middle school, I'll explain things using everyday examples and pictures. What would you like to learn about today? We can do math, science, or even language arts!";
      }
    } else if (gradeLevel === "10-12") {
      if (lowerMsg.includes("calculus") || lowerMsg.includes("derivative")) {
        response = "Calculus helps us understand how things change. Imagine driving a car - your speedometer shows how fast you're going (that's like a derivative), and your odometer shows how far you've traveled (that's like an integral). This connects to physics concepts like motion and acceleration. Would you like me to draw a graph to show this?";
      } else if (lowerMsg.includes("dna") || lowerMsg.includes("genetics")) {
        response = "DNA is like a twisted ladder (double helix) that contains your genetic instructions. Each rung is made of base pairs (A-T, C-G), and the sequence determines your traits. This connects to real-world applications like genetic testing and biotechnology. Shall I show you a diagram of how DNA replication works?";
      } else {
        response = "High school level learning builds on what you already know and prepares you for college. I can explain concepts with diagrams, real-world examples, and practice problems. What topic would you like to explore today?";
      }
    } else {
      response = "University-level concepts build on high school foundations. I can connect topics to current research, real-world applications, and deeper theoretical frameworks. Since you're preparing for college, I'll focus on both understanding and critical thinking skills. What subject area interests you most?";
    }

    setConversation((prev) => [
      ...prev,
      {
        role: "assistant",
        content: response,
        name: "StudyBuddy (Offline)",
        offline: true,
        gradeLevel: gradeLevel,
      },
    ]);

    if (autoSpeak) {
      speakText(response);
    }

    setIsProcessing(false);
  };

  const buildHistoryPayload = (items: Array<any>) =>
    items
      .filter(
        (item) =>
          (item.role === "user" || item.role === "assistant") &&
          !item.isThinking &&
          item.name !== "System"
      )
      .map((item) => ({
        role: item.role,
        content: typeof item.content === "string" ? item.content : String(item.content ?? ""),
      }))
      .filter((item) => item.content.trim().length > 0)
      .slice(-8);

  // Online model message handling
  const handleOnlineModelMessage = async (message: string) => {
    setIsProcessing(true);

    try {
      const history = buildHistoryPayload([
        ...conversation,
        { role: "user", content: message },
      ]);
      const controller =
        typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeout = controller
        ? setTimeout(() => controller.abort(), 20000)
        : null;
      const response = await fetch("/api/studybuddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          gradeLevel,
          history,
        }),
        signal: controller?.signal,
      });
      if (timeout) clearTimeout(timeout);

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "StudyBuddy request failed.");
      }

      const text = typeof data?.text === "string" ? data.text.trim() : "";
      if (!text) {
        throw new Error("No response text returned.");
      }

      setConversation((prev) => {
        const withoutThinking = prev.filter((msg) => !msg.isThinking);
        return [
          ...withoutThinking,
          {
            role: "assistant",
            content: text,
            name: "StudyBuddy",
            online: true,
            gradeLevel: gradeLevel,
          },
        ];
      });

      if (autoSpeak) {
        speakText(text);
      }
    } catch (error: any) {
      console.error("StudyBuddy API error:", error);
      setConversation((prev) => {
        const withoutThinking = prev.filter((msg) => !msg.isThinking);
        const errorMessage =
          error?.name === "AbortError"
            ? "The AI request took too long. Please try again."
            : "I'm having trouble reaching the AI service right now. Please try again in a moment.";
        return [
          ...withoutThinking,
          {
            role: "assistant",
            content: errorMessage,
            error: true,
          },
        ];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-speech function
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.voice =
        window.speechSynthesis
          .getVoices()
          .find(
            (voice) =>
              voice.name.includes("Female") ||
              voice.name.includes("Samantha") ||
              voice.name.includes("Karen")
          ) || null;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start/stop listening
  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Watch ad to earn energy points
  const watchAdForEnergy = () => {
    setEnergyPoints(dailyLimit);
    setVisualizationsUsed(0);

    setConversation((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Great! You watched an ad and earned ${dailyLimit} more visual explanations for today. Now you can ask for diagrams, animations, and visual aids as much as you'd like! What would you like to visualize next?`,
        name: "StudyBuddy",
        energyReward: true,
      },
    ]);
  };

  // Sidebar navigation items
  const navItems = [
    { id: "dashboard", icon: Layout, label: "Dashboard" },
    { id: "talkback", icon: Mic, label: "Live Tutor" },
    { id: "localmodel", icon: Cpu, label: "Offline Mode" },
    { id: "upload", icon: Upload, label: "Upload Content" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  // Grade levels for scaffolding
  const gradeLevels = [
    {
      id: "7-9",
      name: "Grades 7-9",
      description: "Middle School: Simple analogies and concrete examples",
      icon: BookOpen,
    },
    {
      id: "10-12",
      name: "Grades 10-12",
      description: "High School: Diagrams and real-world applications",
      icon: GraduationCap,
    },
    {
      id: "university-prep",
      name: "University Prep",
      description: "College readiness: Deep analysis and research connections",
      icon: Target,
    },
  ];

  return (
    <AIContext.Provider
      value={{
        activePage,
        setActivePage,
        gradeLevel,
        handleGradeLevelChange,
        activeModel,
        setActiveModel,
        connectionStatus,
        energyPoints,
        watchAdForEnergy,
        offlineModelStatus,
      }}
    >
      <div
        className={`flex min-h-screen bg-background text-foreground transition-colors duration-200 ${
          theme === "light" ? "bg-background text-foreground" : ""
        }`}
      >
        {/* Sidebar */}
        <motion.aside
          initial={{ width: isSidebarOpen ? 240 : 72 }}
          animate={{ width: isSidebarOpen ? 240 : 72 }}
          className={`flex h-full flex-col border-r border-border bg-card ${
            theme === "light" ? "border-border bg-background" : ""
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              className="flex items-center space-x-2"
            >
              <GraduationCap className="text-primary" size={24} />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent">
                StudyBuddy AI
              </span>
            </motion.div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {isSidebarOpen ? (
                <ChevronLeft size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
          </div>

          <nav className="mt-6 flex-1 space-y-1 px-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex w-full items-center rounded-lg p-3 transition-colors ${
                  activePage === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted/70"
                }`}
              >
                <item.icon size={20} />
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isSidebarOpen ? 1 : 0 }}
                  className="ml-3 font-medium"
                >
                  {item.label}
                </motion.span>
              </button>
            ))}
          </nav>

          <div className="border-t border-border bg-background/30 p-4">
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary">
                  <span className="text-sm font-bold text-foreground">S</span>
                </div>
                <div>
                  <p className="text-sm font-medium">StudyBuddy AI</p>
                  <p className="text-xs font-medium text-primary">
                    Free Forever Tutor
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Grade Level:</span>
                  <span className="font-medium text-primary">
                    {gradeLevel.toUpperCase()}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={`h-1.5 rounded-full ${
                      gradeLevel === "7-9"
                        ? "bg-green-500"
                        : gradeLevel === "10-12"
                        ? "bg-primary"
                        : "bg-purple-500"
                    }`}
                    style={{
                      width:
                        gradeLevel === "7-9"
                          ? "33%"
                          : gradeLevel === "10-12"
                          ? "66%"
                          : "100%",
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">AI Mode:</span>
                  <span
                    className={`font-medium ${
                      activeModel === "offline"
                        ? "text-green-400"
                        : "text-primary"
                    }`}
                  >
                    {activeModel === "offline" ? "OFFLINE" : "ONLINE"}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={`h-1.5 rounded-full ${
                      activeModel === "offline"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : "bg-gradient-to-r from-primary to-secondary"
                    }`}
                    style={{ width: activeModel === "offline" ? "100%" : "75%" }}
                  ></div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header
            className={`flex items-center justify-between border-b border-border bg-card/80 p-4 backdrop-blur-sm ${
              theme === "light" ? "border-border bg-background/80" : ""
            }`}
          >
            <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-2xl font-bold text-transparent">
              {activePage === "talkback"
                ? "Live Tutor Session"
                : activePage === "localmodel"
                ? "Offline AI Model"
                : activePage === "settings"
                ? "Settings & Preferences"
                : activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h1>
            <div className="flex items-center space-x-4">
              {/* Grade Level Selector */}
              <div className="group relative">
                <button className="flex items-center space-x-2 text-primary transition-colors hover:text-primary">
                  <GraduationCap size={20} />
                  <span className="hidden sm:inline">Grade {gradeLevel}</span>
                </button>
                <div className="invisible absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100 z-50">
                  <div className="mb-1 border-b border-border p-2 text-xs text-muted-foreground">
                    Select your grade level for personalized explanations
                  </div>
                  {gradeLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleGradeLevelChange(level.id)}
                      className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors ${
                        gradeLevel === level.id
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted/70"
                      }`}
                    >
                      <level.icon
                        className={`h-5 w-5 ${
                          gradeLevel === level.id
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{level.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {level.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Points Display */}
              <div className="group relative">
                <button
                  onClick={() => energyPoints === 0 && watchAdForEnergy()}
                  className={`flex items-center space-x-1 rounded-full px-3 py-1 text-sm font-medium ${
                    energyPoints > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                  }`}
                >
                  <Battery
                    className={`h-4 w-4 ${
                      energyPoints > 0 ? "text-primary" : "text-red-400"
                    }`}
                  />
                  <span>
                    {energyPoints}/{dailyLimit} visuals
                  </span>
                </button>
                {energyPoints === 0 && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg border border-red-500/30 bg-card p-3 text-sm text-red-300 shadow-lg z-50">
                    <p className="font-medium">Visualizations Used Up!</p>
                    <p className="mt-1">
                      Watch a short ad to unlock 5 more visual explanations today.
                    </p>
                    <button
                      onClick={watchAdForEnergy}
                      className="mt-2 flex w-full items-center justify-center space-x-1 rounded-lg bg-red-500/20 px-3 py-1 text-sm font-medium text-red-300 hover:bg-red-500/30"
                    >
                      <Play size={14} />
                      <span>Watch Ad for 5 More</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Connection Status */}
              <div className="relative">
                {connectionStatus === "online" ? (
                  <Wifi className="h-5 w-5 text-green-400" />
                ) : (
                  <WifiOff className="h-5 w-5 animate-pulse text-red-400" />
                )}
                {connectionStatus === "offline" && (
                  <div className="absolute -top-8 right-0 whitespace-nowrap rounded bg-red-500/90 px-2 py-1 text-xs text-white shadow-lg">
                    Offline Mode Active
                  </div>
                )}
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-gradient-to-r from-primary to-secondary text-sm font-bold">
                S
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            {/* Dashboard Page */}
            {activePage === "dashboard" && (
              <div className="space-y-6">
                <div className="mb-6 flex items-center space-x-3">
                  <Brain className="text-primary" size={32} />
                  <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-bold text-transparent">
                    Welcome to StudyBuddy AI
                  </h1>
                </div>

                <div className="rounded-xl border border-border bg-card/80 p-6">
                  <div className="py-12 text-center">
                    <div className="inline-block rounded-2xl border border-primary/30 bg-card/80 p-6">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Brain className="text-primary" size={32} />
                      </div>
                      <h2 className="mb-3 text-2xl font-bold text-primary">
                        Start Your Learning Journey
                      </h2>
                      <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                        Click "Live Tutor" in the sidebar to start learning with your
                        AI tutor. Choose your grade level and ask anything about math,
                        science, or biology!
                      </p>
                      <button
                        onClick={() => setActivePage("talkback")}
                        className="rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 font-medium text-white transition-all hover:from-primary hover:to-secondary"
                      >
                        Start Learning Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Talkback/Live Tutor Page */}
            {activePage === "talkback" && (
              <div className="mx-auto max-w-4xl">
                <div className="rounded-xl border border-border bg-card/80 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="flex items-center text-2xl font-bold">
                      <Mic className="mr-2 text-primary" size={28} />
                      <span className="text-primary">StudyBuddy</span> Live Tutor
                    </h2>
                    <div className="flex items-center space-x-3">
                      <div className="group relative">
                        <button
                          className={`rounded-full p-2 ${
                            activeModel === "offline"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {activeModel === "offline" ? (
                            <WifiOff size={20} />
                          ) : (
                            <Cloud size={20} />
                          )}
                        </button>
                        <div className="invisible absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100 z-50">
                          <div className="p-2 text-xs text-muted-foreground">
                            Currently using: {activeModel.toUpperCase()} MODE
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        disabled={!speechOutputSupported}
                        className={`flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          autoSpeak
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        } ${!speechOutputSupported ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        <span className="ml-1">Auto-speak</span>
                      </button>
                    </div>
                  </div>

                  {/* Grade Level Display */}
                  <div className="mb-4 rounded-xl border border-primary/30 bg-muted/60 p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <GraduationCap className="text-primary" size={18} />
                      <span className="font-medium text-primary">
                        Grade Level:
                      </span>
                      <select
                        value={gradeLevel}
                        onChange={(e) => handleGradeLevelChange(e.target.value)}
                        className="rounded-lg border border-primary/30 bg-muted px-2 py-1 text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {gradeLevels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {gradeLevel === "7-9" &&
                        "Using simple analogies and concrete examples for middle school learners"}
                      {gradeLevel === "10-12" &&
                        "Providing diagrams and real-world applications for high school students"}
                      {gradeLevel === "university-prep" &&
                        "Connecting concepts to university-level thinking and research"}
                    </p>
                  </div>

                  <div className="mb-6 rounded-xl border border-primary/30 bg-muted/60 p-4">
                    <h3 className="mb-2 flex items-center font-medium text-primary">
                      <Lightbulb className="mr-2" size={18} /> Quick Learning
                      Prompts:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Explain photosynthesis simply",
                        "Visualize gravity with a diagram",
                        "Quiz me on cell organelles",
                        "Show real-life example of algebra",
                        "Break down this calculus problem",
                        "Connect this to university physics",
                      ].map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleUserMessage(prompt)}
                          className="rounded-lg border border-primary/30 bg-muted px-3 py-1 text-sm text-primary transition-colors hover:bg-primary/10"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(!isSecureContext ||
                    !speechSupported ||
                    !speechOutputSupported) && (
                    <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="mt-0.5 text-amber-200" />
                        <div>
                          <p className="font-medium">Browser compatibility notice</p>
                          <div className="mt-1 space-y-1 text-sm text-amber-100/90">
                            {!isSecureContext && (
                              <p>Voice features require a secure (HTTPS) connection.</p>
                            )}
                            {!speechSupported && (
                              <p>Voice input isn’t supported in this browser. Use text input instead.</p>
                            )}
                            {!speechOutputSupported && (
                              <p>Text-to-speech isn’t available, so auto-speak is disabled.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6 h-[60vh] overflow-y-auto rounded-xl border border-border bg-card p-5">
                    {conversation.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                        <Brain className="mb-4 h-16 w-16 text-primary/50" />
                        <p className="mb-2 text-xl font-bold text-primary">
                          Start Learning with StudyBuddy AI
                        </p>
                        <p className="max-w-md text-center text-muted-foreground">
                          Ask anything about math, science, or biology! I'll explain
                          concepts at your grade level with visuals and real-life
                          examples.
                        </p>
                        <div className="mt-6 grid max-w-md grid-cols-2 gap-3">
                          {[
                            "Math",
                            "Science",
                            "Biology",
                            "Physics",
                          ].map((subject, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                handleUserMessage(
                                  `Help me learn ${subject.toLowerCase()} for grade ${gradeLevel}`
                                )
                              }
                              className="rounded-lg border border-primary/30 bg-muted/70 p-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      conversation.map((message, index) => (
                        <div
                          key={index}
                          className={`mb-4 flex ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-4 ${
                              message.role === "user"
                                ? "rounded-tr-none bg-gradient-to-r from-primary to-secondary text-white"
                                : message.offline
                                ? "rounded-tl-none border border-green-500/30 bg-muted/70"
                                : "rounded-tl-none border border-primary/30 bg-muted/70"
                            }`}
                          >
                            {message.role === "user" ? (
                              <div>
                                <p className="mb-1 flex items-center font-medium">
                                  <User className="mr-2 h-4 w-4" />
                                  You
                                </p>
                                <p>{message.content}</p>
                              </div>
                            ) : (
                              <div>
                                <div className="mb-1 flex items-center">
                                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                    <span className="text-xs font-bold text-foreground">
                                      {message.name?.charAt(0) || "S"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium text-primary">
                                      {message.name || "StudyBuddy"}
                                    </p>
                                    {message.offline && (
                                      <span className="rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs text-green-300">
                                        OFFLINE
                                      </span>
                                    )}
                                    {message.gradeLevel && (
                                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                        Grade {message.gradeLevel}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p
                                  className={
                                    message.isThinking
                                      ? "italic text-muted-foreground"
                                      : ""
                                  }
                                >
                                  {message.isThinking
                                    ? "Thinking..."
                                    : message.content}
                                </p>

                                {message.requiresAdReward && energyPoints === 0 && (
                                  <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                                    <div className="flex items-start space-x-2">
                                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                                      <div>
                                        <p className="text-sm font-medium text-red-300">
                                          Visualizations Limit Reached
                                        </p>
                                        <p className="mt-1 text-xs text-red-300">
                                          Watch a short ad to unlock 5 more visual
                                          explanations today, or wait until tomorrow
                                          for your daily reset.
                                        </p>
                                        <button
                                          onClick={watchAdForEnergy}
                                          className="mt-2 flex items-center space-x-1 rounded-lg bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-500/30"
                                        >
                                          <Play size={12} />
                                          <span>Watch Ad for 5 More Visuals</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {message.energyReward && (
                                  <div className="mt-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                                    <div className="flex items-start space-x-2">
                                      <Coins className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                                      <div>
                                        <p className="text-sm font-medium text-green-300">
                                          Energy Restored!
                                        </p>
                                        <p className="mt-1 text-xs text-green-300">
                                          You now have {dailyLimit} visual explanations
                                          available for today. Ask for diagrams,
                                          animations, and visual aids whenever you need
                                          them!
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {message.error && (
                                  <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
                                    <AlertTriangle className="mr-1 inline h-3 w-3" />
                                    Error processing your request. Please try again.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {isListening && (
                      <div className="mb-4 flex justify-start">
                        <div className="rounded-2xl rounded-tl-none border border-primary/30 bg-muted/70 p-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                            <span className="text-primary">
                              StudyBuddy is listening...
                            </span>
                          </div>
                          <p className="mt-1 text-foreground/80">
                            {transcript || "Start speaking..."}
                          </p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={toggleListening}
                      disabled={!speechSupported}
                      className={`rounded-full p-3 transition-all ${
                        isListening
                          ? "border border-primary bg-primary/10 text-primary"
                          : "border border-border bg-muted text-foreground/80 hover:bg-muted"
                      }`}
                    >
                      <Mic size={24} />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={`Ask StudyBuddy about ${
                        gradeLevel === "7-9"
                          ? "middle school"
                          : gradeLevel === "10-12"
                          ? "high school"
                          : "university prep"
                      } topics...`}
                      className="flex-1 rounded-lg border border-border bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = e.currentTarget.value;
                          if (value) {
                            handleUserMessage(value);
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (inputRef.current?.value) {
                          handleUserMessage(inputRef.current.value);
                          inputRef.current.value = "";
                        }
                      }}
                      className="rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 font-medium text-white transition-all hover:from-primary hover:to-secondary"
                    >
                      Send
                    </button>
                  </div>

                  <div className="mt-4 rounded-lg border border-primary/30 bg-muted/60 p-3 text-center">
                    <p className="text-sm text-primary">
                      <span className="font-medium">Learning Tip:</span> Type
                      "visualize [topic]" for diagrams, "real-life example" for
                      practical applications, or "break down" for step-by-step
                      explanations!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Offline Model Page */}
            {activePage === "localmodel" && (
              <div className="mx-auto max-w-4xl">
                <div className="rounded-xl border border-border bg-card/80 p-6">
                  <div className="mb-6 flex items-center space-x-3">
                    <Cpu className="text-green-400" size={32} />
                    <h2 className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-3xl font-bold text-transparent">
                      Offline AI Model
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div className="rounded-lg border border-green-500/30 bg-muted/60 p-4">
                        <h3 className="mb-2 font-medium text-green-300">
                          Offline Mode Benefits
                        </h3>
                        <ul className="space-y-2 text-foreground/80">
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-400">✓</span>
                            <span>No internet connection required</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-400">✓</span>
                            <span>Maximum privacy - no data leaves your device</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-400">✓</span>
                            <span>Works anywhere - school, home, or on the bus</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-400">✓</span>
                            <span>Free forever - no API costs or subscriptions</span>
                          </li>
                        </ul>
                      </div>

                      <div className="rounded-lg border border-primary/30 bg-muted/60 p-4">
                        <h3 className="mb-2 font-medium text-primary">
                          Model Capabilities
                        </h3>
                        <ul className="space-y-2 text-foreground/80">
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-primary">•</span>
                            <span>Math explanations with step-by-step solutions</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-primary">•</span>
                            <span>Science concepts with real-world analogies</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-primary">•</span>
                            <span>Biology topics from cells to ecosystems</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-primary">•</span>
                            <span>Grade-appropriate explanations for 7-12</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div
                        className={`rounded-xl border-2 p-6 text-center ${
                          offlineModelStatus === "loaded"
                            ? "border-green-500 bg-green-500/10"
                            : offlineModelStatus === "loading"
                            ? "border-amber-500 bg-amber-500/10"
                            : offlineModelStatus === "error"
                            ? "border-red-500/60 bg-red-500/10"
                            : "border-border bg-muted/60"
                        }`}
                      >
                        <div className="mb-4 flex justify-center">
                          {offlineModelStatus === "loaded" && (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                              <Check className="text-green-400" size={32} />
                            </div>
                          )}
                          {offlineModelStatus === "loading" && (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <Settings className="text-amber-400" size={32} />
                              </motion.div>
                            </div>
                          )}
                          {offlineModelStatus === "error" && (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                              <AlertTriangle className="text-red-300" size={32} />
                            </div>
                          )}
                          {offlineModelStatus === "not-loaded" && (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                              <Cpu className="text-muted-foreground" size={32} />
                            </div>
                          )}
                        </div>

                        <h3 className="mb-2 text-xl font-bold">
                          {offlineModelStatus === "loaded" && "Model Ready"}
                          {offlineModelStatus === "loading" && "Loading Model..."}
                          {offlineModelStatus === "error" &&
                            "Offline Mode Unavailable"}
                          {offlineModelStatus === "not-loaded" &&
                            "Load Offline Model"}
                        </h3>

                        <p className="mb-4 text-muted-foreground">
                          {offlineModelStatus === "loaded" &&
                            "Your local AI model is ready to use! No internet needed."}
                          {offlineModelStatus === "loading" &&
                            `Loading model... ${modelProgress}% complete`}
                          {offlineModelStatus === "error" &&
                            "This browser doesn't support the offline worker. Use the online mode for now."}
                          {offlineModelStatus === "not-loaded" &&
                            "Download and load the offline model to use StudyBuddy without internet."}
                        </p>

                        {offlineModelStatus === "not-loaded" && (
                          <button
                            onClick={() => {
                              setOfflineModelStatus("loading");
                              loadOfflineModel();
                            }}
                            className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-medium text-white transition-all hover:from-green-600 hover:to-emerald-700"
                          >
                            Load Offline Model
                          </button>
                        )}

                        {offlineModelStatus === "loading" && (
                          <div className="mt-4 h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                              style={{ width: `${modelProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-purple-500/30 bg-muted/60 p-4">
                        <h3 className="mb-2 font-medium text-purple-300">
                          Technical Details
                        </h3>
                        <ul className="space-y-2 text-sm text-foreground/80">
                          <li>
                            <span className="font-medium text-purple-400">
                              Model:
                            </span>{" "}
                            Llama-3.2-1B-Instruct (Quantized)
                          </li>
                          <li>
                            <span className="font-medium text-purple-400">
                              Size:
                            </span>{" "}
                            Approximately 1.5GB
                          </li>
                          <li>
                            <span className="font-medium text-purple-400">
                              Storage:
                            </span>{" "}
                            Stored locally on your device
                          </li>
                          <li>
                            <span className="font-medium text-purple-400">
                              Requirements:
                            </span>{" "}
                            4GB RAM minimum, modern browser
                          </li>
                          <li>
                            <span className="font-medium text-purple-400">
                              Privacy:
                            </span>{" "}
                            100% offline - no data collection
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Page */}
            {activePage === "upload" && (
              <div className="mx-auto max-w-4xl py-16 text-center">
                <div className="inline-block rounded-2xl border border-primary/30 bg-card/80 p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="text-primary" size={32} />
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-primary">
                    Upload Learning Materials
                  </h2>
                  <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                    Upload PDFs, documents, images, or videos for StudyBuddy to
                    analyze. Your content is processed locally for maximum privacy.
                  </p>
                  <button className="rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 font-medium text-white transition-all hover:from-primary hover:to-secondary">
                    Start Uploading
                  </button>
                </div>
              </div>
            )}

            {/* Settings Page */}
            {activePage === "settings" && (
              <div className="mx-auto max-w-2xl">
                <div className="rounded-xl border border-border bg-card/80 p-6">
                  <div className="mb-6 flex items-center space-x-3">
                    <Settings className="text-primary" size={32} />
                    <h2 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-bold text-transparent">
                      Settings & Preferences
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-lg border border-primary/30 bg-muted/60 p-4">
                      <h3 className="mb-3 font-medium text-primary">
                        Appearance
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/80">Theme</span>
                          <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="rounded-lg border border-border bg-muted px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="dark">Dark Theme</option>
                            <option value="light">Light Theme</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/80">Auto-speak responses</span>
                          <label
                            className={`relative inline-flex items-center ${
                              !speechOutputSupported
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              value=""
                              className="peer sr-only"
                              checked={autoSpeak}
                              onChange={(e) => setAutoSpeak(e.target.checked)}
                              disabled={!speechOutputSupported}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-green-500/30 bg-muted/60 p-4">
                      <h3 className="mb-3 font-medium text-green-300">
                        Learning Preferences
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/80">Default Grade Level</span>
                          <select
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(e.target.value)}
                            className="rounded-lg border border-border bg-muted px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {gradeLevels.map((level) => (
                              <option key={level.id} value={level.id}>
                                {level.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/80">Preferred AI Mode</span>
                          <select
                            value={activeModel}
                            onChange={(e) => setActiveModel(e.target.value)}
                            className="rounded-lg border border-border bg-muted px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="online">
                              Online Mode (Full Features)
                            </option>
                            <option value="offline">
                              Offline Mode (Privacy Focused)
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-purple-500/30 bg-muted/60 p-4">
                      <h3 className="mb-3 font-medium text-purple-300">
                        Privacy & Data
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Shield className="mr-2 mt-1 text-purple-400" size={18} />
                          <div>
                            <p className="font-medium text-foreground/80">
                              Local Data Storage
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Your conversation history and uploaded files are stored
                              locally on your device and never sent to external
                              servers.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <EyeOff className="mr-2 mt-1 text-purple-400" size={18} />
                          <div>
                            <p className="font-medium text-foreground/80">
                              Offline Mode Privacy
                            </p>
                            <p className="text-sm text-muted-foreground">
                              In offline mode, 100% of your data stays on your device
                              - no internet connection required.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="w-full rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 font-medium text-white transition-all hover:from-primary hover:to-secondary">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Ad Banner */}
            {showAdBanner &&
              activeModel === "online" &&
              connectionStatus === "online" &&
              activePage === "talkback" && (
                <div className="mt-6 rounded-lg border border-dashed border-border bg-card/80 p-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Coins className="text-yellow-400" size={18} />
                    <span className="text-sm text-muted-foreground">
                      Support free education - Ads help keep StudyBuddy AI free for
                      everyone
                    </span>
                    <button
                      onClick={() => setShowAdBanner(false)}
                      className="text-muted-foreground hover:text-foreground/80"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
          </main>
        </div>
      </div>
    </AIContext.Provider>
  );
};

export default StudyBuddyApp;
