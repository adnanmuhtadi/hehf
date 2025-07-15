const testimonials = [
    {
      quote: "Hosting with Herts and Essex Host Families has brought so much joy to our lives!",
      name: "Sarah & John, Watford"
    },
    {
      quote: "The support from the team made everything easy, and we've loved every minute.",
      name: "The Patel Family, Cheshunt"
    }
  ];
  
  const Testimonials = () => (
    <section className="bg-secondary py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">What Our Hosts Say</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {testimonials.map((t, i) => (
            <blockquote
              key={i}
              className="bg-white rounded-2xl shadow-md p-7 text-lg flex-1 flex flex-col justify-between"
            >
              <span className="italic mb-4">“{t.quote}”</span>
              <span className="block mt-3 font-semibold text-primary">{t.name}</span>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
  
  export default Testimonials;
  