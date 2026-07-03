"use client";

import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] py-24 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-lg border-t-4 border-[#d4af37]">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            At De Kuchney Villa (“we”, “our”, “us”), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, make a reservation, or use our services.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">1. Information We Collect</h2>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Make a room reservation (name, email address, phone number, check-in/out dates, special requests).</li>
            <li>Contact us via email, phone, or chat widgets (WhatsApp, Telegram).</li>
            <li>Subscribe to our newsletter or promotional communications.</li>
          </ul>
          <p>We may also automatically collect certain technical data (IP address, browser type, pages visited) through cookies and similar tracking technologies to improve our website performance.</p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Process and confirm your room reservations.</li>
            <li>Communicate with you regarding your booking or inquiries.</li>
            <li>Improve our website, services, and guest experience.</li>
            <li>Comply with legal obligations (e.g., record-keeping for tax purposes).</li>
          </ul>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">3. Payment Information</h2>
          <p>
            All payments are processed through secure third-party gateways: <strong>Paystack</strong> and <strong>OPay</strong>. We do not store your credit card, bank account, or other financial details on our servers. Payment data is encrypted and handled directly by our payment partners in compliance with PCI-DSS standards.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">4. Data Sharing & Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your data with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Service providers who assist with our operations (e.g., email delivery, customer support) – they are contractually bound to keep your information confidential.</li>
            <li>Law enforcement or regulatory authorities when required by applicable law.</li>
          </ul>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">5. Data Security</h2>
          <p>
            We implement industry-standard security measures, including encryption (SSL/TLS), firewalls, and restricted access to personal data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">6. Your Rights (GDPR & Nigerian Data Protection)</h2>
          <p>If you are a resident of Nigeria or the European Economic Area, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Object to or restrict certain processing activities.</li>
            <li>Withdraw consent at any time (where processing is based on consent).</li>
          </ul>
          <p>To exercise these rights, please contact us at <a href="mailto:privacy@dekuchneyvilla.com" className="text-[#d4af37] hover:underline">privacy@dekuchneyvilla.com</a>.</p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">7. Cookies</h2>
          <p>
            Our website uses cookies to enhance user experience, analyse site traffic, and remember your preferences. You can control cookie settings through your browser.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">8. Third-Party Links</h2>
          <p>
            Our website may contain links to external sites (e.g., payment gateways, social media). We are not responsible for the privacy practices of those third parties.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">9. Children’s Privacy</h2>
          <p>
            Our services are not directed to individuals under 18. We do not knowingly collect personal information from children.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated “Last updated” date. We encourage you to review this page periodically.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 pt-4">11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <address className="not-italic mt-2">
            De Kuchney Villa<br />
            Zone F01, Abuja, Nigeria<br />
            Email: <a href="mailto:privacy@dekuchneyvilla.com" className="text-[#d4af37] hover:underline">privacy@dekuchneyvilla.com</a><br />
            Phone: +234 (913) 149-0624
          </address>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <Link href="/" className="text-[#d4af37] hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}