import { useState, useEffect, useRef } from "react";
import { Search, Phone, Video, MoreVertical, Send, Smile, Paperclip, ArrowLeft, Check, CheckCheck, Bell, UserPlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  online: boolean;
  type: string;
  address?: string;
  email?: string;
}

interface Message {
  id: number;
  senderPhone: string;
  receiverPhone: string;
  senderName?: string;
  receiverName?: string;
  messageText: string;
  timestamp: Date;
  read: boolean;
  messageType: string;
}

const Messages = () => {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const { sendNotification, sending } = useNotifications();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [customContacts, setCustomContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    type: "WhatsApp"
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showWhatsAppInfo, setShowWhatsAppInfo] = useState(true);

  // Use session user ID as identifier, fallback to email
  const userPhone = session?.user?.email || "guest@pawrescue.org";

  // Load custom contacts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("custom_whatsapp_contacts");
    if (saved) {
      try {
        setCustomContacts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse custom contacts:", e);
      }
    }
  }, []);

  // Save custom contacts to localStorage whenever they change
  useEffect(() => {
    if (customContacts.length > 0) {
      localStorage.setItem("custom_whatsapp_contacts", JSON.stringify(customContacts));
    }
  }, [customContacts]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [session, isPending, navigate]);

  // Fetch contacts (NGOs and Shelters)
  useEffect(() => {
    const fetchContacts = async () => {
      if (!session?.user) return;

      try {
        const token = localStorage.getItem("bearer_token");
        const headers: HeadersInit = {
          "Authorization": `Bearer ${token}`
        };

        const [ngosRes, sheltersRes] = await Promise.all([
          fetch("/api/ngos", { headers }),
          fetch("/api/animal-shelters", { headers })
        ]);

        if (!ngosRes.ok || !sheltersRes.ok) {
          throw new Error("Failed to fetch contacts");
        }

        const ngos = await ngosRes.json();
        const shelters = await sheltersRes.json();

        const allContacts: Contact[] = [
          ...ngos.map((ngo: any) => ({
            id: `ngo-${ngo.id}`,
            name: ngo.name,
            phone: ngo.phone,
            email: ngo.email,
            address: ngo.address,
            lastMessage: ngo.servicesOffered?.substring(0, 50) || "Available for animal rescue",
            lastMessageTime: new Date(),
            unread: 0,
            online: true,
            type: "NGO"
          })),
          ...shelters.map((shelter: any) => ({
            id: `shelter-${shelter.id}`,
            name: shelter.name,
            phone: shelter.phone,
            email: shelter.email,
            address: shelter.address,
            lastMessage: `Capacity: ${shelter.currentAnimals}/${shelter.capacity} animals`,
            lastMessageTime: new Date(),
            unread: 0,
            online: true,
            type: "Shelter"
          }))
        ];

        setContacts(allContacts);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        toast.error("Failed to load contacts");
      }
    };

    fetchContacts();
  }, [session]);

  // Fetch messages for selected contact
  const fetchMessages = async () => {
    if (!selectedContact || !session?.user) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const chatRoomId = `${userPhone}-${selectedContact.phone}`;
      const res = await fetch(`/api/whatsapp-messages?chatRoomId=${chatRoomId}`, {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.error("Failed to fetch messages:", await res.text());
        return;
      }

      const data = await res.json();
      const formattedMessages = data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up polling for new messages every 3 seconds
    if (selectedContact && session?.user) {
      pollIntervalRef.current = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedContact, session]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAddContact = () => {
    // Validate inputs
    if (!newContact.name.trim()) {
      toast.error("Please enter a contact name");
      return;
    }
    if (!newContact.phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    // Validate phone number format (international format)
    const phoneRegex = /^[+]?[\d\s\-()]+$/;
    if (!phoneRegex.test(newContact.phone)) {
      toast.error("Please enter a valid phone number with country code");
      return;
    }

    // Check for duplicate phone numbers
    const allContacts = [...contacts, ...customContacts];
    if (allContacts.some(c => c.phone === newContact.phone)) {
      toast.error("This phone number already exists in your contacts");
      return;
    }

    // Create new contact
    const contact: Contact = {
      id: `custom-${Date.now()}`,
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email,
      address: "",
      lastMessage: "Click to start chatting via WhatsApp",
      lastMessageTime: new Date(),
      unread: 0,
      online: false,
      type: "WhatsApp"
    };

    setCustomContacts([...customContacts, contact]);
    setNewContact({ name: "", phone: "", email: "", type: "WhatsApp" });
    setAddContactOpen(false);
    toast.success(`✅ ${contact.name} added! You can now message them via WhatsApp.`);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedContact || !session?.user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const chatRoomId = `${userPhone}-${selectedContact.phone}`;
      
      const res = await fetch("/api/whatsapp-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          senderPhone: userPhone,
          receiverPhone: selectedContact.phone,
          senderName: session.user.name || "PawRescue User",
          receiverName: selectedContact.name,
          messageText: messageInput,
          chatRoomId,
          messageType: "text",
          userId: session.user.id
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to send message: ${errorText}`);
      }

      const newMessage = await res.json();
      setMessages([...messages, { ...newMessage, timestamp: new Date(newMessage.timestamp) }]);
      setMessageInput("");
      
      // Send instant notifications via email and SMS
      if (selectedContact.email || selectedContact.phone) {
        await sendNotification({
          email: selectedContact.email,
          phoneNumber: selectedContact.phone,
          subject: `New message from ${session.user.name || "PawRescue User"} on PawRescue`,
          message: `You have received a new message from ${session.user.name || "PawRescue User"} (${userPhone}):\n\n"${messageInput}"\n\nReply directly through PawRescue messaging platform.\n\nOrganization: ${selectedContact.name}\nType: ${selectedContact.type}\n\nThank you for your dedication to animal welfare!`,
          notificationType: "message"
        });
      }
      
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Combine all contacts
  const allContacts = [...contacts, ...customContacts];

  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!session?.user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="h-screen flex bg-[#f0f2f5] dark:bg-[#111b21] overflow-hidden">
      {/* Contacts Sidebar */}
      <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[400px] bg-white dark:bg-[#202c33] border-r border-gray-200 dark:border-gray-700`}>
        {/* Header */}
        <div className="p-4 bg-[#ededed] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Messages</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {allContacts.length} contact{allContacts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                  <UserPlus className="h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Add WhatsApp Contact
                  </DialogTitle>
                  <DialogDescription>
                    Add anyone with a phone number to chat via WhatsApp. They'll appear in your contacts list.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>How it works</AlertTitle>
                    <AlertDescription className="text-xs">
                      Enter their phone number with country code (e.g., +91 for India, +1 for US). 
                      You'll be able to chat with them directly via WhatsApp.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Contact Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Animal Shelter Manager"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="bg-white dark:bg-gray-800"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number with Country Code *</Label>
                    <Input
                      id="phone"
                      placeholder="e.g., +91 98765 43210"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="bg-white dark:bg-gray-800 font-mono"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Include country code: +91 (India), +1 (US), +44 (UK), etc.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      className="bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddContactOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddContact} className="bg-primary hover:bg-primary/90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-[#2a3942] border-gray-300 dark:border-gray-600"
            />
          </div>

          {/* WhatsApp Info Alert */}
          {showWhatsAppInfo && customContacts.length === 0 && (
            <Alert className="mt-3">
              <Info className="h-4 w-4" />
              <AlertTitle className="text-sm">Add WhatsApp Contacts</AlertTitle>
              <AlertDescription className="text-xs">
                Click "Add Contact" above to add anyone with a phone number. You can chat with them directly via WhatsApp!
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-6 text-xs"
                onClick={() => setShowWhatsAppInfo(false)}
              >
                Got it
              </Button>
            </Alert>
          )}
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Phone className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">No contacts yet</p>
              <p className="text-sm mb-4">Add WhatsApp contacts to get started</p>
              <Button
                variant="outline"
                onClick={() => setAddContactOpen(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Your First Contact
              </Button>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-[#2a3942] cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-gray-100 dark:bg-[#2a3942]' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`text-primary-foreground ${
                      contact.type === 'WhatsApp' ? 'bg-green-600' : 
                      contact.type === 'NGO' ? 'bg-blue-600' : 'bg-orange-600'
                    }`}>
                      {contact.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#202c33]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {contact.name}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ml-2 ${
                        contact.type === 'WhatsApp' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-100' :
                        contact.type === 'NGO' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-100' :
                        'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-100'
                      }`}
                    >
                      {contact.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {contact.address || contact.email || "WhatsApp Contact"}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {contact.phone}
                  </span>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-[#ededed] dark:bg-[#202c33] p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSelectedContact(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`text-primary-foreground ${
                selectedContact.type === 'WhatsApp' ? 'bg-green-600' : 
                selectedContact.type === 'NGO' ? 'bg-blue-600' : 'bg-orange-600'
              }`}>
                {selectedContact.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                {selectedContact.name}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate font-mono">
                {selectedContact.phone} • {selectedContact.type}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  window.open(`tel:${selectedContact.phone}`, '_blank');
                  toast.success("Opening phone dialer...");
                }}
                title="Call this number"
              >
                <Phone className="h-5 w-5 text-green-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/${selectedContact.phone.replace(/[^0-9]/g, '')}`;
                  window.open(whatsappUrl, '_blank');
                  toast.success("Opening WhatsApp...");
                }}
                title="Open WhatsApp chat"
                className="hover:bg-green-100 dark:hover:bg-green-900"
              >
                <Video className="h-5 w-5 text-green-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-[#efeae2] dark:bg-[#0b141a]" style={{
            backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMjBoNDBNMjAgMHY0MCIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjAuMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')"
          }}>
            <div className="space-y-3 max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                  <Phone className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-600" />
                  <p className="font-medium mb-2">Start chatting with {selectedContact.name}</p>
                  <p className="text-sm mb-1">{selectedContact.address || selectedContact.email}</p>
                  <p className="text-sm font-mono mb-4">{selectedContact.phone}</p>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      const whatsappUrl = `https://wa.me/${selectedContact.phone.replace(/[^0-9]/g, '')}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Open in WhatsApp
                  </Button>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.senderPhone === userPhone;
                  return (
                    <div
                      key={message.id || index}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] md:max-w-md rounded-lg p-3 shadow-sm ${
                          isOwn
                            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-white'
                            : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-white'
                        }`}
                      >
                        {!isOwn && message.senderName && (
                          <p className="text-xs font-semibold text-primary mb-1">
                            {message.senderName}
                          </p>
                        )}
                        <p className="text-sm break-words whitespace-pre-wrap">{message.messageText}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">
                            {formatTime(message.timestamp)}
                          </span>
                          {isOwn && (
                            message.read ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : (
                              <Check className="h-3 w-3 text-gray-500" />
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

          {/* Message Input */}
          <div className="bg-[#ededed] dark:bg-[#202c33] p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Smile className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
                className="flex-1 rounded-full bg-white dark:bg-[#2a3942] border-gray-300 dark:border-gray-600"
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || loading}
                className="rounded-full bg-primary hover:bg-primary/90"
                size="icon"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-[#f0f2f5] dark:bg-[#222e35]">
          <div className="text-center text-gray-500 dark:text-gray-400 max-w-md px-4">
            <Phone className="h-32 w-32 mx-auto mb-6 opacity-20 text-green-600" />
            <h2 className="text-2xl font-semibold mb-2">PawRescue Messages</h2>
            <p className="mb-4">Select a contact to start messaging</p>
            <div className="text-sm space-y-2 mb-6">
              <p>✅ Connect with NGOs & animal shelters</p>
              <p>✅ Add custom WhatsApp contacts</p>
              <p>✅ Message anyone with a phone number</p>
              <p>✅ Get instant notifications</p>
            </div>
            <Button
              onClick={() => setAddContactOpen(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="h-4 w-4" />
              Add WhatsApp Contact
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;