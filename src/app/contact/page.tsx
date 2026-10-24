import { LandingHeader } from '@/app/landing/landing-header';
import { LandingFooter } from '@/app/landing/landing-footer';
import { ContactForm } from './contact-form';

export const metadata = {
  title: 'Contact ArriveLink - Partner With Us',
  description: 'Get in touch with the ArriveLink team. Whether you want to list your transport company or have a question, we are here to help.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-bg">
      <LandingHeader />
      <main className="flex-1 pt-24 pb-20 px-5">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-emerald text-sm uppercase tracking-widest font-semibold font-body mb-4">Get In Touch</p>
            <h1 className="font-display text-4xl sm:text-5xl text-forest dark:text-white mb-5 leading-tight">
              Let&apos;s work together.
            </h1>
            <p className="text-forest/55 dark:text-white/50 font-body text-lg max-w-xl mx-auto">
              Want to list your transport company on ArriveLink? Have a question? Send us a message and we will get back to you within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Contact info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  label: 'Email us',
                  value: 'support@arrivelink.app',
                  href: 'mailto:support@arrivelink.app',
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  label: 'Response time',
                  value: 'Within 24 hours',
                  href: null,
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  label: 'Based in',
                  value: 'Nigeria',
                  href: null,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-forest/40 dark:text-white/40 font-body uppercase tracking-widest mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-medium text-forest dark:text-white font-body hover:text-emerald transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-sm font-medium text-forest dark:text-white font-body">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Operator callout */}
              <div className="mt-8 p-5 rounded-2xl bg-forest/5 dark:bg-white/5 border border-forest/10 dark:border-white/10">
                <p className="text-xs font-semibold text-emerald font-body uppercase tracking-widest mb-2">For Operators</p>
                <p className="text-sm text-forest/70 dark:text-white/60 font-body leading-relaxed">
                  Fill out the form to start the process of listing your transport company. We review all applications and typically onboard within 48 hours.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
