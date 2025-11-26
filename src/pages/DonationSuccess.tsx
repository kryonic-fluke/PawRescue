import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const targetId = searchParams.get('target_id');

  useEffect(() => {
    if (sessionId) {
      // You can log the successful donation here
      console.log('Donation successful. Session ID:', sessionId);
      
      // Optionally, you can verify the payment with your backend
      const verifyPayment = async () => {
        try {
          await fetch('/api/verify-donation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, targetId }),
          });
        } catch (err) {
          console.error('Error verifying payment:', err);
        }
      };
      
      verifyPayment();
    }
  }, [sessionId, targetId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md text-center">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Thank you for your donation!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your contribution will make a difference. A receipt has been sent to your email.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/')} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}