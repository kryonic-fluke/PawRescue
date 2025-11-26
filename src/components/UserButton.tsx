import { UserButton } from '@clerk/clerk-react';

export default function UserButtonComponent() {
  return (
    <div className="flex items-center">
      <UserButton 
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: 'h-10 w-10',
          },
        }}
      />
    </div>
  );
}