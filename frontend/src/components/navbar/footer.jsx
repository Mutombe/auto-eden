import React from 'react';
import { 
  Car, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ShoppingCart,
  DollarSign,
  Info,
  Shield,
  User,
  FileText,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'Buy Cars', href: '/marketplace', icon: ShoppingCart },
      { name: 'Sell Your Car', href: '/sell', icon: DollarSign },
      { name: 'Instant Valuation', href: '/valuation', icon: FileText },
      { name: 'Car History Reports', href: '/reports', icon: Info },
    ],
    company: [
      { name: 'About Us', href: '/about', icon: Info },
      { name: 'Our Team', href: '/team', icon: User },
      { name: 'Careers', href: '/careers', icon: ArrowRight },
      { name: 'Press & Media', href: '/press', icon: FileText },
    ],
    support: [
      { name: 'Help Center', href: '/help', icon: HelpCircle },
      { name: 'Contact Us', href: '/contact', icon: Mail },
      { name: 'FAQs', href: '/faq', icon: HelpCircle },
      { name: 'Live Chat', href: '/chat', icon: Phone },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy', icon: Shield },
      { name: 'Terms of Service', href: '/terms', icon: FileText },
      { name: 'Cookie Policy', href: '/cookies', icon: Info },
      { name: 'Data Protection', href: '/data-protection', icon: Shield },
    ]
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook, color: 'hover:text-blue-600' },
    { name: 'Twitter', href: '#', icon: Twitter, color: 'hover:text-blue-400' },
    { name: 'Instagram', href: '#', icon: Instagram, color: 'hover:text-pink-600' },
    { name: 'LinkedIn', href: '#', icon: Linkedin, color: 'hover:text-blue-700' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12">
                <img
                  src="/logo.png"
                  alt="Auto Eden Logo"
                  className="w-full h-full rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Auto Eden</h3>
                <p className="text-gray-400 text-sm">Your Trusted Car Partner</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Auto Eden is your premier destination for buying and selling quality vehicles. 
              We connect buyers and sellers with transparent pricing, instant valuations, 
              and exceptional service.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-red-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-red-500" />
                <span>support@autoeden.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>123 Auto Street, Car City, CC 12345</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 transition-colors ${social.color}`}
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors group"
                    >
                      <IconComponent className="w-4 h-4 group-hover:text-red-400" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors group"
                    >
                      <IconComponent className="w-4 h-4 group-hover:text-red-400" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
            <ul className="space-y-3 mb-8">
              {footerLinks.support.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors group"
                    >
                      <IconComponent className="w-4 h-4 group-hover:text-red-400" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <h4 className="text-lg font-semibold mb-6 text-white">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors group"
                    >
                      <IconComponent className="w-4 h-4 group-hover:text-red-400" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-white mb-2">
                Stay Updated with Auto Eden
              </h4>
              <p className="text-gray-400">
                Get the latest car deals, market insights, and exclusive offers delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full md:w-auto max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-r-lg transition-colors flex items-center">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              <p>&copy; {currentYear} Auto Eden. All rights reserved.</p>
              <p className="mt-1">Made with ❤️ for car enthusiasts everywhere</p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure & Trusted</span>
              </span>
              <span className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-red-500" />
                <span>Licensed Dealer</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}