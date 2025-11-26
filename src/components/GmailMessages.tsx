import { useEffect, useMemo, useState } from "react";
import { Search, Star, Archive, Trash2, Inbox, Send, Mail, ChevronLeft, Reply, Paperclip, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MessageRow {
  id: string;
  sender_id: string | null;
  recipient_id: string | null;
  subject: string;
  content: string;
  is_read: boolean | null;
  is_starred: boolean | null;
  is_archived: boolean | null;
  is_deleted: boolean | null;
  folder: string | null;
  created_at: string | null;
}

const sidebarItems = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "sent", label: "Sent", icon: Send },
  { id: "starred", label: "Starred", icon: Star },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "trash", label: "Trash", icon: Trash2 },
];

const GmailMessages = () => {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [emails, setEmails] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({ to: "", subject: "", body: "" });

  // Get current user
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Fetch messages for the user
  const fetchMessages = async () => {
    if (!userId) return;
    setLoading(true);
    let query = supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (selectedFolder === "inbox") {
      query = query.eq("recipient_id", userId).eq("folder", "inbox").eq("is_deleted", false);
    } else if (selectedFolder === "sent") {
      query = query.eq("sender_id", userId).eq("folder", "sent").eq("is_deleted", false);
    } else if (selectedFolder === "starred") {
      query = query.eq("is_starred", true).or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
    } else if (selectedFolder === "archive") {
      query = query.eq("is_archived", true).or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
    } else if (selectedFolder === "trash") {
      query = query.eq("is_deleted", true).or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
    }
    const { data, error } = await query;
    if (error) {
      toast({ description: `Failed to load messages: ${error.message}`, variant: "destructive" });
    } else {
      setEmails((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [userId, selectedFolder]);

  // Real-time subscription for live updates - refetch when changes occur
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('messages_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Refetch messages when any change occurs to ensure consistency
          const message = payload.new as MessageRow || payload.old as MessageRow;
          
          // Only refetch if the message involves this user
          if (message.sender_id === userId || message.recipient_id === userId) {
            fetchMessages();
            
            // Show notification for new received messages
            if (payload.eventType === 'INSERT' && message.recipient_id === userId && message.folder === 'inbox') {
              toast({ description: "📬 New message received!" });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, selectedFolder]);

  const filteredEmails = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return emails.filter((email) =>
      (email.subject?.toLowerCase().includes(term) || email.content?.toLowerCase().includes(term))
    );
  }, [emails, searchTerm]);

  const selectedEmailData = selectedEmail ? emails.find(e => e.id === selectedEmail) : null;

  const updateMessage = async (id: string, values: Partial<MessageRow>) => {
    const { error } = await supabase.from("messages").update(values).eq("id", id);
    if (error) {
      toast({ description: error.message, variant: "destructive" });
    } else {
      setEmails(prev => prev.map(m => m.id === id ? { ...m, ...values } as MessageRow : m));
    }
  };

  const handleStar = (id: string) => updateMessage(id, { is_starred: true });
  const handleArchive = (id: string) => updateMessage(id, { is_archived: true, folder: "archive" });
  const handleDelete = (id: string) => updateMessage(id, { is_deleted: true, folder: "trash" });

  const sendEmail = async () => {
    if (!userId) {
      toast({ description: "Please sign in to send email", variant: "destructive" });
      return;
    }
    if (!compose.to || !compose.subject) {
      toast({ description: "To and Subject are required", variant: "destructive" });
      return;
    }

    toast({ description: "Sending email...", duration: 1000 });

    // 1) Insert into 'messages' as sent
    const { data: insertedMessage, error: insertError } = await supabase.from("messages").insert({
      sender_id: userId,
      recipient_id: null,
      subject: compose.subject,
      content: compose.body,
      is_read: true,
      is_starred: false,
      is_archived: false,
      is_deleted: false,
      folder: "sent",
    }).select();
    
    if (insertError) {
      toast({ description: `Failed to save message: ${insertError.message}`, variant: "destructive" });
      return;
    }

    // 2) Try to send real email via edge function
    const { error: fnError } = await supabase.functions.invoke("send-email", {
      body: {
        to: compose.to,
        subject: compose.subject,
        html: `<p>${compose.body?.replace(/\n/g, "<br/>")}</p>`
      }
    });

    if (fnError) {
      // Email function not configured - show helpful message
      toast({ 
        title: "✅ Message Saved in Sent Folder",
        description: "Your message is saved locally. Configure Supabase Edge Function to send actual emails.",
        duration: 4000
      });
    } else {
      toast({ 
        title: "✅ Email Sent Successfully!",
        description: `Your message to ${compose.to} has been delivered.`,
        duration: 3000
      });
    }

    setComposeOpen(false);
    setCompose({ to: "", subject: "", body: "" });
    
    // Switch to sent folder and the new message will appear via refetch
    setSelectedFolder("sent");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">PawMail</h1>
            <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="btn-trust">
                  <Plus className="h-4 w-4 mr-2" /> Compose
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">To</Label>
                    <Input value={compose.to} onChange={(e) => setCompose({ ...compose, to: e.target.value })} placeholder="email@example.com" />
                  </div>
                  <div>
                    <Label className="text-sm">Subject</Label>
                    <Input value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-sm">Message</Label>
                    <textarea className="w-full h-40 rounded-md border bg-background p-2" value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setComposeOpen(false)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button className="btn-trust" onClick={sendEmail}>Send</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Button key={item.id} variant={selectedFolder === item.id ? "default" : "ghost"} className="w-full justify-start" onClick={() => setSelectedFolder(item.id)}>
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className={`${selectedEmail ? 'w-96' : 'flex-1'} bg-background border-r border-border transition-all duration-300`}>
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search emails..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="overflow-y-auto h-full">
            {!loading && filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Mail className="h-12 w-12 mb-4" />
                <p>No emails in {selectedFolder}</p>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div key={email.id} className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${selectedEmail === email.id ? 'bg-accent/20 border-l-4 border-l-primary' : ''}`} onClick={() => setSelectedEmail(email.id)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>@</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">{email.subject || '(no subject)'}</p>
                          <div className="flex items-center space-x-2">
                            {email.is_starred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                            <span className="text-xs text-muted-foreground">{email.created_at ? new Date(email.created_at).toLocaleString() : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{email.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email Content */}
        {selectedEmail && selectedEmailData && (
          <div className="flex-1 bg-background">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleStar(selectedEmailData.id)}>
                    <Star className={`h-4 w-4 ${selectedEmailData.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleArchive(selectedEmailData.id)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedEmailData.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h1 className="text-xl font-bold text-foreground mb-4">{selectedEmailData.subject || '(no subject)'}</h1>

              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line text-foreground">{selectedEmailData.content}</p>
              </div>

              <div className="mt-6 flex gap-2">
                <Button className="btn-trust"><Reply className="h-4 w-4 mr-2" />Reply</Button>
                <Button variant="outline"><Paperclip className="h-4 w-4 mr-2" />Attach</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GmailMessages;