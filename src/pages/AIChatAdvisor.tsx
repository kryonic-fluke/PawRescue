import { useState, useEffect, useRef } from "react";
// Import icons. If your project doesn't have 'lucide-react', change this to match your library
import { Loader2, Sparkles, Send, X } from "lucide-react";

// UI Imports (Standard Shadcn paths)
import { Button } from "@/components/ui/button";

// --- TYPES (Defined locally to prevent errors) ---

// 1. Structure of the Pet object passed from FavoritesPage
export interface AdvisorPet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: string;
  image?: string;
  // Allow other properties loosely
  [key: string]: any; 
}

// 2. Structure of a single chat bubble
interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatAdvisorProps {
  // We accept the list of selected pets here
  selectedPets: AdvisorPet[];
}

// --- COMPONENT START ---

export default function AIChatAdvisor({ selectedPets }: AIChatAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      content: "Hello! I'm your PawPal advisor. Ask me anything about pet adoption!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // If user selects pets while chat is OPEN, announce it
  useEffect(() => {
    if (selectedPets.length > 0 && isOpen) {
       // Only add this announcement if the last message wasn't already this system message
       const lastMsg = messages[messages.length - 1];
       // We use optional chaining safely here
       const petNames = selectedPets.map(p => p.name).join(', ');
       const msgContent = `I see you've selected ${selectedPets.length} pets (${petNames}). I'm ready to compare them for you!`;
       
       if (!lastMsg.content.includes(petNames)) {
           setMessages(prev => [...prev, {
             id: Date.now().toString(),
             sender: 'ai',
             content: msgContent,
             timestamp: new Date()
           }]);
       }
    }
  }, [selectedPets.length, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgText = input.trim();
    setInput(''); 

    // 1. Add User Message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: userMsgText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 2. Call the Backend
      // CHANGE THE PORT HERE IF YOUR SERVER IS RUNNING ON 3001
     const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          selectedPets: selectedPets, 
          history: messages.slice(-5).map(m => ({ 
             sender: m.sender, 
             content: m.content 
          })) 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error('API Request Failed');

      // 3. Add AI Response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        content: "Sorry, I can't reach the server right now. Is the backend running?",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Button Visuals
  const isComparisonMode = selectedPets.length > 0;

  // CLOSED STATE (Floating Button)
  if (!isOpen) {
    return (
      <Button
        // Using standard Shadcn/Tailwind classes
        className={`fixed bottom-6 right-6 h-14 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center gap-3 px-6 
    ${isComparisonMode 
      ? "bg-purple-600 hover:bg-purple-700 animate-pulse ring-4 ring-purple-500/30" 
      : "bg-primary hover:bg-primary/90"}`}
  onClick={() => setIsOpen(true)}
  style={{ animationDuration: '3s' }}
      >
        {/* We use standard CSS classes (h-6 w-6) instead of size={} prop to avoid library conflicts */}
        <Sparkles className={`h-6 w-6 ${isComparisonMode ? 'animate-spin' : ''}`} />
        
        <div className="flex flex-col items-start text-left">
          <span className="font-bold text-base leading-none">
            {isComparisonMode ? "Compare Mode" : "PawPal AI"}
          </span>
          {isComparisonMode && (
             <span className="text-[10px] uppercase font-bold opacity-90 mt-1">
               {selectedPets.length} Selected
             </span>
          )}
        </div>
      </Button>
    );
  }

  // OPEN STATE (Chat Window)
  return (
    <div className="fixed bottom-6 right-6 w-[90vw] max-w-[400px] h-[600px] max-h-[80vh] z-50 flex flex-col shadow-2xl rounded-2xl border bg-background overflow-hidden animate-in slide-in-from-bottom-5">
      
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b 
        ${isComparisonMode ? "bg-purple-100 dark:bg-purple-900/30" : "bg-muted"}`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isComparisonMode ? 'bg-purple-600 text-white' : 'bg-primary text-primary-foreground'}`}>
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">PawPal Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {isComparisonMode ? `Reviewing ${selectedPets.length} pets` : 'Ask me anything'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/10" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                ${message.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-muted/80 text-foreground rounded-tl-none border'
                }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p> 
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-background">
        <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-muted p-1.5 rounded-xl border focus-within:ring-2 focus-within:ring-ring focus-within:border-primary">
          <textarea
            className="flex-1 bg-transparent border-0 focus:ring-0 resize-none min-h-[40px] max-h-[120px] text-sm py-2.5 px-3 focus-visible:outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto'; 
              t.style.height = t.scrollHeight + 'px';
            }}
            rows={1}
          />
          <Button 
            type="submit" 
            size="icon" 
            className={`shrink-0 rounded-lg h-10 w-10 ${isComparisonMode ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}