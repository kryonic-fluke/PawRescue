import { SignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const { isLoaded } = useAuth();
  const navigate = useNavigate();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
            <p className="text-gray-600 mt-1">Join PawRescue today</p>
          </div>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtons: 'gap-3',
                socialButton: 'hover:bg-gray-50 border border-gray-200',
                socialButtonText: 'text-gray-700',
                dividerLine: 'bg-gray-200',
                dividerText: 'text-gray-500',
                formFieldLabel: 'text-gray-700 font-medium',
                formFieldInput: 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                footerActionLink: 'text-blue-600 hover:text-blue-800',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;