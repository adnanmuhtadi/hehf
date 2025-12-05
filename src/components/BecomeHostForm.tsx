import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState = {
  name: "",
  email: "",
  telephone: "",
  address: "",
  street: "",
  city: "",
  county: "",
  postcode: "",
  propertyType: "",
  numberOfRooms: "",
  contactMethod: "",
  comments: "",
  captcha: ""
};

const formFields = [
  { name: "name", type: "text", placeholder: "Full Name *", required: true },
  { name: "email", type: "email", placeholder: "Email *", required: true },
  { name: "telephone", type: "tel", placeholder: "Telephone Number", required: false },
  { name: "city", type: "text", placeholder: "City *", required: true },
  { name: "county", type: "text", placeholder: "County *", required: true },
  { name: "postcode", type: "text", placeholder: "Postcode *", required: true },
];

const propertyTypes = [
  "Detached House",
  "Semi-Detached House",
  "Terraced House",
  "Bungalow",
  "Flat/Apartment",
  "Other"
];

const roomOptions = ["1", "2", "3", "4", "5+"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }
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
    <motion.form
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto mt-14"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <motion.h2 
        variants={itemVariants}
        className="text-3xl md:text-4xl font-bold text-center mb-2 text-primary"
      >
        <span className="text-blue-600">Ready To</span> Become a Host?
      </motion.h2>
      <motion.p 
        variants={itemVariants}
        className="text-center mb-8 text-muted-foreground"
      >
        Please complete the form below to get started.
      </motion.p>
      <motion.div variants={containerVariants} className="space-y-4">
        {formFields.map((field) => (
          <motion.input
            key={field.name}
            variants={itemVariants}
            type={field.type}
            name={field.name}
            required={field.required}
            placeholder={field.placeholder}
            className="w-full border rounded p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={form[field.name as keyof typeof form]}
            onChange={handleChange}
          />
        ))}
        
        {/* Property Type Select */}
        <motion.div variants={itemVariants}>
          <Select
            value={form.propertyType}
            onValueChange={(value) => setForm({ ...form, propertyType: value })}
          >
            <SelectTrigger className="w-full border rounded p-3 h-auto focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <SelectValue placeholder="Type of Property *" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Number of Rooms Select */}
        <motion.div variants={itemVariants}>
          <Select
            value={form.numberOfRooms}
            onValueChange={(value) => setForm({ ...form, numberOfRooms: value })}
          >
            <SelectTrigger className="w-full border rounded p-3 h-auto focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <SelectValue placeholder="Number of Rooms Available *" />
            </SelectTrigger>
            <SelectContent>
              {roomOptions.map((num) => (
                <SelectItem key={num} value={num}>
                  {num} {num === "1" ? "Room" : "Rooms"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Preferred Contact Method */}
        <motion.input
          variants={itemVariants}
          type="text"
          name="contactMethod"
          required
          placeholder="Preferred Method of Contact: (Phone/Email) *"
          className="w-full border rounded p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          value={form.contactMethod}
          onChange={handleChange}
        />

        <motion.textarea
          variants={itemVariants}
          name="comments"
          required
          placeholder="Comments *"
          className="w-full border rounded p-3 min-h-[80px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          value={form.comments}
          onChange={handleChange}
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full mt-8 bg-blue-600 text-white text-lg rounded-full hover:bg-blue-700"
        >
          {submitting ? "Submitting..." : "SUBMIT"}
        </Button>
      </motion.div>
      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-green-600 mt-5 text-center font-semibold"
        >
          Thank you! We'll be in touch soon.
        </motion.div>
      )}
    </motion.form>
  );
};

export default BecomeHostForm;