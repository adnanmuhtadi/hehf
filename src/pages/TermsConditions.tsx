// src/pages/TermsConditions.tsx
import PageLayout from "@/layouts/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * New Terms & Conditions Sections (Card-Based)
 */
const termsSections = [
  {
    title: "Options and Schedules of Interest",
    content: `
Provisional dates for the next academic year (September–August) may be submitted as early as March. These dates will be held on a provisional basis until the end of October of that same year.
To secure any dates beyond October, confirmation and a deposit will be required.
    `.trim()
  },
  {
    title: "Advanced Bookings and Confirmation",
    content: `
Advance bookings will only be confirmed once both the agent’s confirmation letter and completed booking form have been received. A deposit must be paid by the deadline stated in your confirmation email. Deposits will be required. Please review your documentation carefully to ensure all payment deadlines are met and to avoid any misunderstandings.
    `.trim()
  },
  {
    title: "Late Notice Bookings (Less Than 6 Weeks Notice)",
    content: `
Late bookings may be accepted where availability permits. An additional discretionary fee may apply to cover administrative and host coordination costs. Full payment will be required prior to confirmation of the booking.
    `.trim()
  },
  {
    title: "Deposit Payments",
    content: `
Deposits for bookings should be paid to the bank account details provided below:

Sort code: 60 10 05
Account number: 84416467
IBAN: GB90NWBK60100584416467
Swift number:  NWBKGB2L

Once payment has been made, please notify us promptly by emailing us at info@hehf.co.uk. A receipt will be issued within 48 hours of the funds being received into our account.
    `.trim()
  },
  {
    title: "Damage and Late Arrival Deposits",
    content: `
A discretionary deposit may be requested to cover minor damages incurred during group visits.
In the event of any such damage, a documented and proportionate deduction will be made. Where no damage occurs, the full deposit will be refunded to the client immediately after the group visit concludes.

A discretionary deposit may be requested to cover additional ‘inconvenience’ payments to hosts where guests arrive at destinations after 9pm.
    `.trim()
  },
  {
    title: "Full and Final Payments",
    content: `
Final payment must be received no later than three weeks prior to the group’s scheduled arrival.
If payment is not received at least two weeks before arrival, the booking will be treated as a late cancellation, and the cancellation policy may be applied at our discretion.
    `.trim()
  },
  {
    title: "Cancellation Policy",
    content: `
We understand that plans can change, and we aim to be as fair and transparent as possible. Please read the following terms carefully:

• Cancellations made more than 30 days prior to the scheduled arrival date will receive a 70% refund of the total amount paid.  
• Cancellations made between 30 and 15 days prior to arrival will receive a 50% refund of the total booking cost.  
• Cancellations made between 15 and 8 days prior to arrival will receive a 25% refund of the total booking cost.  
• No refund will be issued for cancellations made less than 8 days before the intended start date.  

Once a client has arrived, no refunds will be given under any circumstance, including cancellations resulting from illness, death, or emergencies involving the client or their companions.
    `.trim()
  },
  {
    title: "Group Insurance and Individual Travel Insurance",
    content: `
We strongly advise all clients to take out comprehensive travel insurance to cover unforeseen events, including cancellation, illness, or emergency.

Please also note that clients’ personal belongings are not insured by Herts & Essex Host Families. We recommend obtaining suitable personal and travel insurance to cover theft, loss, or damage.
    `.trim()
  }
];

const heroBg =
  "https://images.unsplash.com/photo-1621926187610-946177e44cca?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

/**
 * Terms & Conditions Page – using new content.
 */
const TermsConditions = () => {
  return (
    <PageLayout
      title="Terms & Conditions | Herts & Essex Host Families"
      description="Read the terms and conditions for Herts & Essex Host Families. By booking, you agree to these guidelines ensuring a safe and enjoyable experience."
      className="flex flex-col"
    >
      {/* HERO SECTION */}
      <section className="relative min-h-[420px] flex items-center justify-center bg-gradient-to-br from-primary to-primary-hover overflow-hidden">
        <img
          src={heroBg}
          alt="UK student home"
          className="absolute inset-0 w-full h-full object-cover brightness-70"
          style={{ zIndex: 1 }}
        />
        <div className="absolute inset-0 bg-primary/60" style={{ zIndex: 2 }} />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow">
            Terms & Conditions
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto text-white drop-shadow">
            Please read our terms carefully. By booking with Herts & Essex Host
            Families, you agree to these terms, ensuring a safe and rewarding
            stay for all.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT SECTION */}
      <section className="py-20 bg-background flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {termsSections.map((section, index) =>
                <Card key={index} className="p-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {section.content.split("\n\n").map((para, idx) =>
                      <p
                        key={idx}
                        className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line"
                      >
                        {para}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default TermsConditions;
