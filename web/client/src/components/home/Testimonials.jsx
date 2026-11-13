import React from 'react';
import { Star, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const Testimonials = () => {
  const stories = [
    {
      name: 'Bilal Rauf',
      role: 'Software Engineer @ FinTech',
      location: 'Karachi, Pakistan',
      item: 'MacBook Pro M3 Max',
      quote:
        'Left my laptop bag in a ride-share during evening rush hour in Clifton. The driver scanned the Findix decal and clicked WhatsApp. I had my bag back in less than 90 minutes!',
      time: 'Recovered in 1.5h',
      rating: 5,
    },
    {
      name: 'Dr. Sarah Farooq',
      role: 'Consultant Physician',
      location: 'Lahore, Pakistan',
      item: 'Gold Keyring & Car Fob',
      quote:
        'I love that my personal phone number stayed completely private until I approved the connection. Findix provides unmatched peace of mind without awkward calls.',
      time: 'Recovered in 3h',
      rating: 5,
    },
    {
      name: 'Kashif Mehmood',
      role: 'Frequent Traveler & Photographer',
      location: 'Islamabad, Pakistan',
      item: 'Sony FX3 Camera Bag',
      quote:
        'The laser-etched titanium keychain is rock-solid. Airport luggage staff at Islamabad airport scanned the tag and notified me via Findix immediately. 10/10.',
      time: 'Recovered in 4h',
      rating: 5,
    },
  ];

  return (
    <section className="space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED RECOVERY STORIES
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Real Stories from Protected Owners
        </h2>
        <p className="text-sm text-slate-600">
          Everyday people across Pakistan who recovered their most critical gear through Findix smart tags.
        </p>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((story, idx) => (
          <Card key={idx} className="p-6 sm:p-7 space-y-5 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              {/* Star Rating & Recovery Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Badge variant="safe" size="xs">{story.time}</Badge>
              </div>

              {/* Quote */}
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "{story.quote}"
              </p>
            </div>

            {/* Author Details */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  {story.name}
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                </h4>
                <span className="text-[11px] text-slate-500 block">{story.role}</span>
                <span className="text-[10px] text-slate-400">{story.location}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Item Saved</span>
                <span className="text-xs font-bold text-cyan-700">{story.item}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

    </section>
  );
};

export default Testimonials;
