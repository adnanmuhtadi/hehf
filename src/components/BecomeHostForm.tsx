import { useState } from "react";
import { Button } from "@/components/ui/button";

const initialState = {
  name: "",
  email: "",
  telephone: "",
  address: "",
  street: "",
  city: "",
  county: "",
  postcode: "",
  contactMethod: "",
  comments: "",
  captcha: ""
};

const BecomeHostForm = () => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // TODO: Implement actual submission logic here (API, EmailJS, etc)
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setForm(initialState);
    }, 1300);
  };

  return (
    <form
      className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto mt-14"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-primary">
        <span className="text-blue-600">Ready To</span> Become a Host?
      </h2>
      <p className="text-center mb-8 text-muted-foreground">
        Please complete the form below to get started.
      </p>
      <div className="space-y-4">
        <input
          type="text"
          name="name"
          required
          placeholder="Full Name *"
          className="w-full border rounded p-3"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Email *"
          className="w-full border rounded p-3"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="tel"
          name="telephone"
          placeholder="Telephone Number"
          className="w-full border rounded p-3"
          value={form.telephone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="city"
          required
          placeholder="City *"
          className="w-full border rounded p-3"
          value={form.city}
          onChange={handleChange}
        />
        <input
          type="text"
          name="county"
          required
          placeholder="County *"
          className="w-full border rounded p-3"
          value={form.county}
          onChange={handleChange}
        />
        <input
          type="text"
          name="postcode"
          required
          placeholder="Postcode *"
          className="w-full border rounded p-3"
          value={form.postcode}
          onChange={handleChange}
        />
        <input
          type="text"
          name="contactMethod"
          required
          placeholder="Preferred Method of Contact: (Phone/Email) *"
          className="w-full border rounded p-3"
          value={form.contactMethod}
          onChange={handleChange}
        />
        <textarea
          name="comments"
          required
          placeholder="Comments *"
          className="w-full border rounded p-3 min-h-[80px]"
          value={form.comments}
          onChange={handleChange}
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full mt-8 bg-blue-600 text-white text-lg rounded-full hover:bg-blue-700"
      >
        {submitting ? "Submitting..." : "SUBMIT"}
      </Button>
      {submitted &&
        <div className="text-green-600 mt-5 text-center font-semibold">
          Thank you! We'll be in touch soon.
        </div>}
    </form>
  );
};

export default BecomeHostForm;
