import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

gsap.registerPlugin(ScrollTrigger);

interface ContactSectionProps {
  className?: string;
}

export default function ContactSection({ className = '' }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Card animation
      gsap.fromTo(
        cardRef.current,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Form fields stagger
      const fields = cardRef.current?.querySelectorAll('.form-field');
      if (fields) {
        fields.forEach((field, index) => {
          gsap.fromTo(
            field,
            { y: 10, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              delay: 0.2 + index * 0.08,
              scrollTrigger: {
                trigger: cardRef.current,
                start: 'top 75%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={`relative py-20 lg:py-28 ${className}`}
      style={{ backgroundColor: '#0B111A' }}
    >
      {/* Background Image */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full">
        <img
          src="/contact_loader_wide.jpg"
          alt="Contact background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0B111A]/78" />
      </div>

      <div className="relative z-10 px-6 lg:px-12">
        {/* Contact Card */}
        <div
          ref={cardRef}
          className="max-w-[640px] mx-auto"
          style={{ opacity: 0 }}
        >
          <div className="card-dark p-8 lg:p-10">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-4">
                    Ready to test in your environment?
                  </h2>
                  <p className="text-base text-[#A7B1C1]">
                    Tell us your vehicle platform, site conditions, and accuracy
                    requirements. We'll propose a pilot plan and evaluation
                    schedule.
                  </p>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 pb-8 border-b border-white/10">
                  <a
                    href="mailto:pilot@terranav.example"
                    className="flex items-center gap-2 text-sm text-[#A7B1C1] hover:text-[#2DB3C2] transition-colors"
                  >
                    <Mail size={16} className="text-[#2DB3C2]" />
                    pilot@terranav.example
                  </a>
                  <span className="hidden sm:block text-white/20">|</span>
                  <div className="flex items-center gap-2 text-sm text-[#A7B1C1]">
                    <MapPin size={16} className="text-[#2DB3C2]" />
                    Denver, CO • Remote pre-sales worldwide
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="form-field space-y-2" style={{ opacity: 0 }}>
                      <Label htmlFor="name" className="text-sm text-[#A7B1C1]">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        className="bg-[#0B111A] border-white/10 text-white placeholder:text-white/30 focus:border-[#2DB3C2] focus:ring-[#2DB3C2]/20"
                      />
                    </div>
                    <div className="form-field space-y-2" style={{ opacity: 0 }}>
                      <Label htmlFor="email" className="text-sm text-[#A7B1C1]">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="bg-[#0B111A] border-white/10 text-white placeholder:text-white/30 focus:border-[#2DB3C2] focus:ring-[#2DB3C2]/20"
                      />
                    </div>
                  </div>

                  <div className="form-field space-y-2" style={{ opacity: 0 }}>
                    <Label htmlFor="company" className="text-sm text-[#A7B1C1]">
                      Company
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                      className="bg-[#0B111A] border-white/10 text-white placeholder:text-white/30 focus:border-[#2DB3C2] focus:ring-[#2DB3C2]/20"
                    />
                  </div>

                  <div className="form-field space-y-2" style={{ opacity: 0 }}>
                    <Label htmlFor="message" className="text-sm text-[#A7B1C1]">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your vehicle platform, site conditions, and accuracy requirements..."
                      rows={4}
                      required
                      className="bg-[#0B111A] border-white/10 text-white placeholder:text-white/30 focus:border-[#2DB3C2] focus:ring-[#2DB3C2]/20 resize-none"
                    />
                  </div>

                  <div className="form-field pt-2" style={{ opacity: 0 }}>
                    <Button
                      type="submit"
                      className="w-full bg-[#2DB3C2] hover:bg-[#25a0ad] text-[#0B111A] font-medium py-3 h-auto"
                    >
                      <Send size={16} className="mr-2" />
                      Send Inquiry
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#2DB3C2]/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} className="text-[#2DB3C2]" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Thank you!
                </h3>
                <p className="text-[#A7B1C1]">
                  We've received your inquiry and will get back to you within 24
                  hours with a pilot proposal.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-semibold text-white">TerraNav</div>
            <div className="text-sm text-[#A7B1C1]">
              © {new Date().getFullYear()} TerraNav Systems. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-[#A7B1C1] hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-[#A7B1C1] hover:text-white transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
