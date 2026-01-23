import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, RotateCcw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  onComplete: (disableTour: boolean) => void;
  isVisible: boolean;
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="overview-tab"]',
    title: 'Welcome to Your Dashboard! 👋',
    content: 'This is your host dashboard where you can manage bookings, view your calendar, and update your profile. Let\'s take a quick tour!',
    position: 'bottom',
  },
  {
    target: '[data-tour="quick-stats"]',
    title: 'Quick Stats',
    content: 'Here you can see your pending bookings, upcoming arrivals, and total students hosted at a glance.',
    position: 'bottom',
  },
  {
    target: '[data-tour="earnings-widget"]',
    title: 'Earnings Overview',
    content: 'Track your actual earnings from confirmed bookings and potential earnings based on your capacity and rates.',
    position: 'left',
  },
  {
    target: '[data-tour="available-bookings"]',
    title: 'Available Bookings',
    content: 'Review booking requests here. Mark yourself as "Available" or "Unavailable" for each assignment. Conflicting dates are automatically flagged.',
    position: 'top',
  },
  {
    target: '[data-tour="bookings-tab"]',
    title: 'My Bookings Tab',
    content: 'View all your bookings in one place - past, current, and upcoming. Filter and manage your hosting schedule.',
    position: 'bottom',
  },
  {
    target: '[data-tour="calendar-tab"]',
    title: 'Calendar View',
    content: 'See your bookings in a calendar format to easily visualize your hosting schedule.',
    position: 'bottom',
  },
  {
    target: '[data-tour="profile-tab"]',
    title: 'Profile Settings',
    content: 'Update your personal information, bed capacity, preferred locations, and other settings here.',
    position: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    content: 'Stay updated with new booking assignments and important messages through your notifications.',
    position: 'bottom',
  },
];

const OnboardingTour = ({ onComplete, isVisible }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target);

      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 8;

        setHighlightStyle({
          top: rect.top - padding + window.scrollY,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });

        // Calculate tooltip position based on step position preference
        const tooltipOffset = 16;
        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'top':
            top = rect.top + window.scrollY - tooltipOffset;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + window.scrollY + tooltipOffset;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.left - tooltipOffset;
            break;
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.right + tooltipOffset;
            break;
          default:
            top = rect.bottom + window.scrollY + tooltipOffset;
            left = rect.left + rect.width / 2;
        }

        setTooltipStyle({
          top,
          left,
          transform: step.position === 'top' || step.position === 'bottom' 
            ? 'translateX(-50%)' 
            : step.position === 'left' 
              ? 'translateX(-100%) translateY(-50%)'
              : 'translateY(-50%)',
        });

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = (disableTour: boolean) => {
    setCurrentStep(0);
    onComplete(disableTour);
  };

  const isLastStep = currentStep === tourSteps.length - 1;
  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100]" />

      {/* Highlight box */}
      <div
        className="fixed z-[101] border-2 border-primary rounded-lg pointer-events-none transition-all duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
        style={highlightStyle}
      />

      {/* Tooltip */}
      <Card
        className="fixed z-[102] w-80 max-w-[90vw] shadow-xl animate-in fade-in-0 zoom-in-95"
        style={tooltipStyle}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-2 -mt-1"
              onClick={() => handleFinish(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{step.content}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mb-4">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          {isLastStep ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center mb-3">
                You've completed the tour! 🎉
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setCurrentStep(0)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Replay
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleFinish(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Got it!
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <span className="text-xs text-muted-foreground self-center">
                {currentStep + 1} / {tourSteps.length}
              </span>
              <Button size="sm" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default OnboardingTour;
