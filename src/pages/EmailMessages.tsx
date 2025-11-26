import GmailMessages from "@/components/GmailMessages";
import SplineEmbed from "@/components/SplineEmbed";
import { Card } from "@/components/ui/card";

const EmailMessages = () => {
  return (
    <div className="relative">
      {/* 3D Background Element */}
      <div className="fixed top-20 right-4 w-64 h-64 opacity-30 pointer-events-none z-0 hidden lg:block">
        <SplineEmbed 
          url="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
          title="Email Helper 3D"
          height={256}
        />
      </div>
      <GmailMessages />
    </div>
  );
};

export default EmailMessages;