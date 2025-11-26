// src/components/EmailForm.tsx
'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, Paperclip, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

type RecipientType = 'ngo' | 'shelter' | 'hospital' | 'other';

export function EmailForm() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    to: '',
    recipientType: 'ngo' as RecipientType,
    subject: '',
    text: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default email when component mounts
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      to: getDefaultEmail('ngo')
    }));
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => 
        ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
      );
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('to', formData.to);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('text', formData.text);
      
      attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      const response = await fetch('/api/email/send', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Accept': 'application/json'
        }
      });

      // First get the response as text
      const responseText = await response.text();
      let result;

      try {
        // Try to parse as JSON
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse JSON:', {
          status: response.status,
          statusText: response.statusText,
          responseText
        });
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(result?.error || result?.message || 'Failed to send email');
      }

      setSuccess('Email sent successfully! We will get back to you soon.');
      setFormData(prev => ({ 
        ...prev, 
        subject: '', 
        text: '',
        to: getDefaultEmail(prev.recipientType)
      }));
      setAttachments([]);

    } catch (err) {
      console.error('Error sending email:', err);
      setError(err instanceof Error ? err.message : 'Failed to send email. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    const recipientType = value as RecipientType;
    setFormData(prev => ({ 
      ...prev, 
      recipientType,
      to: getDefaultEmail(recipientType)
    }));
  };

  const getDefaultEmail = (type: RecipientType): string => {
    switch (type) {
      case 'ngo': return 'ngos@pawrescue.org';
      case 'shelter': return 'shelters@pawrescue.org';
      case 'hospital': return 'hospitals@pawrescue.org';
      default: return '';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Contact Us</CardTitle>
          <p className="text-sm text-muted-foreground">
            Send us a message and we'll get back to you as soon as possible.
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientType">Recipient Type</Label>
                <Select 
                  value={formData.recipientType} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ngo">NGO</SelectItem>
                    <SelectItem value="shelter">Animal Shelter</SelectItem>
                    <SelectItem value="hospital">Animal Hospital</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">Recipient Email</Label>
                <Input
                  id="to"
                  name="to"
                  type="email"
                  required
                  value={formData.to}
                  onChange={handleChange}
                  placeholder="recipient@example.com"
                  disabled={formData.recipientType !== 'other'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help you?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Your Message</Label>
              <Textarea
                id="text"
                name="text"
                required
                rows={6}
                value={formData.text}
                onChange={handleChange}
                placeholder="Please provide details about your inquiry..."
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:bg-gray-800/50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, PNG up to 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-2 rounded ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeAttachment(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-start space-y-4">
            <div className="flex w-full justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    to: getDefaultEmail(prev.recipientType),
                    subject: '',
                    text: ''
                  }));
                  setAttachments([]);
                  setError(null);
                  setSuccess(null);
                }}
                disabled={isSending}
              >
                Clear
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSending}
                className="min-w-[120px]"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="w-full p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="w-full p-3 text-sm text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-md flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}