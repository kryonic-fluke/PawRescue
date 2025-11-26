import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonate: (amount: number) => Promise<void>;
  targetName?: string;
  children?: React.ReactNode;
}

export function DonationDialog({ 
  open, 
  onOpenChange, 
  onDonate,
  targetName = 'PawRescue',
  children 
}: DonationDialogProps) {
  const [donationAmount, setDonationAmount] = useState<string>('500');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleDonate = async () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount < 10) {
      setError('Minimum donation amount is ₹10');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      await onDonate(amount);
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process donation';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Donate to {targetName}</DialogTitle>
          <DialogDescription>
            Your contribution will help us continue our mission.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="10"
              step="1"
              value={donationAmount}
              onChange={(e) => {
                setDonationAmount(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter donation amount"
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              Minimum donation amount is ₹10
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDonate}
              disabled={isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Donate ₹${parseInt(donationAmount).toLocaleString()}`
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Example usage in a parent component
export function DonationButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDonate = async (amount: number) => {
    try {
      const response = await fetch('/api/donate/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      
      // Here you would typically redirect to Stripe Checkout
      // or handle the client secret as needed
      console.log('Payment intent created:', clientSecret);
      
      toast({
        title: "Donation Successful!",
        description: "Thank you for your generous donation.",
      });
      
    } catch (err) {
      console.error('Donation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process donation';
      throw new Error(errorMessage);
    }
  };

  return (
    <DonationDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onDonate={handleDonate}
      targetName="PawRescue"
    >
      <Button>Donate Now</Button>
    </DonationDialog>
  );
}