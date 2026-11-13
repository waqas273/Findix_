import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-14 space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-mono font-semibold border border-cyan-200 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" /> SUPPORT & INQUIRIES
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
          Get in Touch with Findix
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Have questions about our Laser-Printed Keychains, Weatherproof Stickers, or bulk enterprise orders? Our team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contact Channels & Trust Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6 sm:p-7 bg-white border-slate-200 shadow-md space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Direct Contact Details</h3>
              <p className="text-xs text-slate-500">Reach our recovery operations desk directly.</p>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:findix.qr@gmail.com"
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50/60 border border-slate-200 hover:border-cyan-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                    Email Support
                  </span>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                    findix.qr@gmail.com
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Average response under 2 hours</span>
                </div>
              </a>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                    Coverage & Headquarters
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Pakistan Nationwide Delivery
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Islamabad · Rawalpindi · Lahore · Karachi
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                    Support Working Hours
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Monday – Saturday (9:00 AM – 8:00 PM PKT)
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">24/7 Automated QR Tag Relay</span>
                </div>
              </div>
            </div>

            {/* Finder Tip Note */}
            <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-900">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>Found Someone's Lost Item?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You don't need an account or support ticket. Simply open your phone camera and scan the QR code printed on the physical tag to contact the owner directly.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Inquiry Message Form (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-md space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Send Us a Message</h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the form below and our customer support team will get back to you shortly.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-4 rounded-2xl bg-slate-50 border border-slate-200 animate-scale-up">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. We have received your inquiry and will reply to <strong>{formData.email}</strong> within a few hours.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="mt-2"
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    name="name"
                    placeholder="Waqas Awan"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input
                  label="Subject"
                  name="subject"
                  placeholder="e.g. Bulk order for corporate team or tracking help"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Write your message or inquiry here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 text-slate-900 placeholder-slate-400 text-sm rounded-xl p-3.5 transition-all outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full font-bold shadow-md"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  <span>Submit Message</span>
                </Button>
              </form>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
};

export default ContactPage;

