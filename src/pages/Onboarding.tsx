import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';

export default function Onboarding() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnboarding = async () => {
      try {
        // Add any onboarding logic here if needed
        // For example, create user profile in your database
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Onboarding error:', error);
        // If there's an error, sign out and redirect to sign-in
        await signOut();
        navigate('/sign-in');
      }
    };

    handleOnboarding();
  }, [navigate, signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to PawRescue, {user?.firstName}!</h1>
        <p className="text-gray-600">Setting up your account...</p>
      </div>
    </div>
  );
}