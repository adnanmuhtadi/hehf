import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, BookOpen, Calendar, PoundSterling, Bell, CheckCircle, Clock, XCircle } from "lucide-react";

const sections: { id: string; title: string; icon: React.ReactNode; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <BookOpen className="h-4 w-4" />,
    items: [
      {
        q: "What is the Host Dashboard?",
        a: "Your dashboard is where you manage everything as a host: review new booking requests, accept or decline assignments, see upcoming arrivals on your calendar, track your earnings, and update your profile.",
      },
      {
        q: "How do the four tabs work?",
        a: (
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Overview</strong> — quick stats, earnings, and bookings waiting for your response.</li>
            <li><strong>Bookings</strong> — full history of all bookings assigned to you.</li>
            <li><strong>Calendar</strong> — visual view of your confirmed stays.</li>
            <li><strong>Profile</strong> — your personal details, bed capacity, pets, etc.</li>
          </ul>
        ),
      },
      {
        q: "Need a walkthrough?",
        a: "Click the question mark icon (?) in the top header at any time to restart the guided tour.",
      },
    ],
  },
  {
    id: "bookings",
    title: "Bookings & Responses",
    icon: <Calendar className="h-4 w-4" />,
    items: [
      {
        q: "What do the booking statuses mean?",
        a: (
          <div className="space-y-2">
            <div className="flex items-start gap-2"><Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge><span>Waiting for your response — please accept or decline.</span></div>
            <div className="flex items-start gap-2"><Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge><span>You said yes; the admin still needs to confirm and assign students.</span></div>
            <div className="flex items-start gap-2"><Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge><span>Admin has confirmed — students are officially coming to you.</span></div>
            <div className="flex items-start gap-2"><Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Declined</Badge><span>You declined this booking; no action needed.</span></div>
          </div>
        ),
      },
      {
        q: "What's the difference between Accepted and Approved?",
        a: "Accepted means you’ve confirmed availability. Approved means the admin team has reviewed all responses and officially assigned students to your home. You'll get a notification when this happens.",
      },
      {
        q: "Can I change my response after I've accepted or declined?",
        a: "Yes, until the admin approves the booking. Use the reset (↺) button on the booking to revert your response, then choose again.",
      },
      {
        q: "What does 'students assigned' mean?",
        a: "It’s the number of students the admin has placed with you for that booking. This may be fewer than the total students on the booking if they're shared with other hosts.",
      },
    ],
  },
  {
    id: "earnings",
    title: "Earnings",
    icon: <PoundSterling className="h-4 w-4" />,
    items: [
      {
        q: "How are my earnings calculated?",
        a: (
          <div className="space-y-2">
            <p>Earnings are calculated as:</p>
            <code className="block bg-muted p-2 rounded text-sm">(Nightly Rate × Nights × Students Assigned) + Location Bonus</code>
            <p className="text-xs text-muted-foreground">The location bonus only applies in certain areas and is shown per night.</p>
          </div>
        ),
      },
      {
        q: "What is 'Actual Earnings' vs 'Potential Earnings'?",
        a: (
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Actual Earnings</strong> — money from bookings that have been approved and marked as available.</li>
            <li><strong>Potential Earnings</strong> — what you could earn if all your beds were filled at your nightly rate.</li>
          </ul>
        ),
      },
      {
        q: "Can I change my nightly rate?",
        a: "Nightly rates are set centrally by HEHF and cannot be edited by hosts. Please contact us if you have questions about your rate.",
      },
      {
        q: "What about tax?",
        a: "You can earn up to £7,500 tax-free per year under the UK Rent-a-Room Scheme. Get in touch if you need help understanding how it applies to you.",
      },
    ],
  },
  {
    id: "profile",
    title: "Your Profile",
    icon: <BookOpen className="h-4 w-4" />,
    items: [
      {
        q: "What can I edit on my profile?",
        a: "You can update your bed capacity (single and shared beds) and pet information. Email, phone, and rates are managed by HEHF — contact us to update those.",
      },
      {
        q: "Why does bed capacity matter?",
        a: "Your bed capacity determines how many students can be assigned to you and is used to calculate your potential earnings. Keep it accurate.",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: <Bell className="h-4 w-4" />,
    items: [
      {
        q: "Where do notifications appear?",
        a: "Click the bell icon at the top of your dashboard. You'll see new bookings, approvals, and important updates there.",
      },
      {
        q: "Can I clear notifications?",
        a: "Yes — open the bell, then use 'Mark all read' or 'Clear all' to tidy them up.",
      },
    ],
  },
];

const HostHelpCenter = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-1">Help Center</h2>
        <p className="text-sm text-muted-foreground">
          Quick answers to help you understand your dashboard and how hosting works.
        </p>
      </div>

      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-primary">{section.icon}</span>
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <Accordion type="single" collapsible className="w-full">
              {section.items.map((item, idx) => (
                <AccordionItem key={idx} value={`${section.id}-${idx}`}>
                  <AccordionTrigger className="text-sm text-left hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="p-3 sm:p-4 pb-2">
          <CardTitle className="text-base">Still need help?</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Our team is here for you 24/7.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="mailto:info@hehf.co.uk">
              <Mail className="h-4 w-4 mr-2" />
              Email us
            </a>
          </Button>
          <Button asChild size="sm">
            <a
              href="https://wa.me/447826541868?text=Hi%2C%20I%20need%20help%20with%20my%20host%20dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostHelpCenter;