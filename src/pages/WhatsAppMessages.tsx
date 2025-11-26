import { useState, useEffect, useRef } from "react";
import { Send, Phone, Search, MoreVertical, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Message {
  id: number;
  senderId: number | null;
  receiverId: number | null;
  message: string;
  senderPhone: string | null;
  receiverPhone: string | null;
  timestamp: string;
  read: boolean;
  messageType: string;
}

interface Conversation {
  otherUserId: number | null;
  otherUser: any;
  otherPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageType: string;
  unreadCount: number;
}

// Format phone number to Indian format
const formatIndianPhone = (phone: string | null) => {
  if (!phone) return '';
  // Remove any existing country code and formatting
  const cleaned = phone.replace(/\D/g, '');
  // If it's a 10-digit number, add +91
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
  // If it already has country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
  }
  return phone;
};

const WhatsAppMessages = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserPhone, setCurrentUserPhone] = useState<string>("+91 98765 43210"); // Default user phone
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp-messages-new?limit=100');
      if (response.ok) {
        const data = await response.json();
        
        // Group messages into conversations
        const convMap = new Map<string, Conversation>();
        
        data.forEach((msg: Message) => {
          const otherPhone = msg.senderPhone === currentUserPhone ? msg.receiverPhone : msg.senderPhone;
          const key = otherPhone || 'unknown';
          
          if (!convMap.has(key)) {
            convMap.set(key, {
              otherUserId: msg.senderId === null ? msg.receiverId : msg.senderId,
              otherUser: null,
              otherPhone: otherPhone || '',
              lastMessage: msg.message,
              lastMessageTime: msg.timestamp,
              lastMessageType: msg.messageType,
              unreadCount: !msg.read && msg.receiverPhone === currentUserPhone ? 1 : 0,
            });
          } else {
            const existing = convMap.get(key)!;
            if (new Date(msg.timestamp) > new Date(existing.lastMessageTime)) {
              existing.lastMessage = msg.message;
              existing.lastMessageTime = msg.timestamp;
            }
            if (!msg.read && msg.receiverPhone === currentUserPhone) {
              existing.unreadCount++;
            }
          }
        });
        
        setConversations(Array.from(convMap.values()));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Don't show error toast on load
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (otherPhone: string) => {
    try {
      const response = await fetch('/api/whatsapp-messages-new?limit=100');
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter((msg: Message) => 
          (msg.senderPhone === currentUserPhone && msg.receiverPhone === otherPhone) ||
          (msg.senderPhone === otherPhone && msg.receiverPhone === currentUserPhone)
        );
        setMessages(filtered || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat !== null) {
      const conv = conversations.find((c, idx) => idx === selectedChat);
      if (conv) {
        fetchMessages(conv.otherPhone);
      }
    }
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || selectedChat === null) return;

    const conv = conversations[selectedChat];
    if (!conv) return;

    try {
      const response = await fetch('/api/whatsapp-messages-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: currentUserPhone,
          receiverPhone: conv.otherPhone,
          message: newMessage.trim(),
          messageType: 'text',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage("");
      await fetchMessages(conv.otherPhone);
      await fetchConversations();
      toast.success("Message sent!");
    } catch (error) {
      toast.error(`Error sending message: ${(error as Error).message}`);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    formatIndianPhone(conv.otherPhone).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar - Chat List */}
      <div className={`${selectedChat !== null ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col border-r`}>
        {/* Header */}
        <div className="p-4 bg-primary text-primary-foreground">
          <h1 className="text-xl font-semibold">WhatsApp Messages</h1>
          <p className="text-sm opacity-90">{formatIndianPhone(currentUserPhone)}</p>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p>No chats yet</p>
              <p className="text-sm mt-2">Messages will appear here</p>
            </div>
          ) : (
            filteredConversations.map((conv, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedChat(idx)}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedChat === idx ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {formatIndianPhone(conv.otherPhone).slice(-2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">
                        {formatIndianPhone(conv.otherPhone) || 'Unknown'}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedChat !== null ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center gap-3 bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSelectedChat(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {formatIndianPhone(conversations[selectedChat]?.otherPhone).slice(-2) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold">
                {formatIndianPhone(conversations[selectedChat]?.otherPhone) || 'Unknown'}
              </h2>
              <p className="text-xs text-muted-foreground">Tap for contact info</p>
            </div>
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-muted/10">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.senderPhone === currentUserPhone;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isSent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-xs ${isSent ? 'opacity-70' : 'text-muted-foreground'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isSent && (
                            msg.read ? (
                              <CheckCheck className="h-4 w-4 opacity-70" />
                            ) : (
                              <Check className="h-4 w-4 opacity-70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Phone className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a chat to start messaging</p>
            <p className="text-sm mt-2">Choose from your existing conversations</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppMessages;