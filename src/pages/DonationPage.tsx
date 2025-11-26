import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function DonationPage() {
  const navigate = useNavigate();

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle donation
    navigate("/thank-you");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Make a Donation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDonate} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Donation Amount</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button type="button" variant="outline" className="h-12">
                    $10
                  </Button>
                  <Button type="button" variant="outline" className="h-12">
                    $25
                  </Button>
                  <Button type="button" variant="outline" className="h-12">
                    $50
                  </Button>
                  <Button type="button" variant="outline" className="h-12">
                    $100
                  </Button>
                </div>
                <div className="pt-2">
                  <Input placeholder="Custom amount" type="number" min="1" step="0.01" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="credit" name="payment" className="h-4 w-4" defaultChecked />
                    <Label htmlFor="credit">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="paypal" name="payment" className="h-4 w-4" />
                    <Label htmlFor="paypal">PayPal</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input placeholder="123" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit">Donate Now</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}