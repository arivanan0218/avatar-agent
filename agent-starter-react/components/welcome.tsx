import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: () => void;
}

export const Welcome = ({
  disabled,
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeProps) => {
  return (
    <div
      ref={ref}
      inert={disabled}
      className="fixed inset-0 z-10 mx-auto flex h-svh flex-col items-center justify-center text-center bg-white dark:bg-black"
    >
      {/* Rise AI Logo */}
      <div className="mb-8">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center overflow-hidden">
          <Image 
            src="/rise_icon.png" 
            alt="Rise AI Logo" 
            width={64}
            height={64}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-sm mx-auto px-6">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Rise AI Support
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Get help from our AI assistant
        </p>

        <Button 
          variant="primary" 
          size="lg" 
          onClick={onStartCall} 
          className="w-full h-12 text-lg font-medium bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl"
        >
          {startButtonText}
        </Button>
      </div>
    </div>
  );
};
