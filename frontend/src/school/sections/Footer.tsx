import { Mail, Globe, Twitter, Linkedin, Instagram, Youtube, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    companies: {
      title: 'Companies',
      links: [
        { label: 'Hire our Grads', href: '/partner' },
        { label: 'Collaborate with us', href: '/partner' },
      ],
    },
    nanoDiploma: {
      title: 'Nano-Diploma',
      links: [
        { label: 'Javascript for Beginners', href: '/schools/engineering' },
        { label: 'SQL for Beginners', href: '/schools/data' },
        { label: 'UI/UX Foundation', href: '/courses/ui-ux-webflow' },
        { label: 'Fintech Product', href: '/schools/business' },
        { label: 'Data Modeling for Beginners', href: '/schools/data' },
        { label: 'Navigating the Music Business in Africa', href: '/schools/creative' },
      ],
    },
    diploma: {
      title: 'Diploma',
      links: [
        { label: 'Backend Engineering', href: '/schools/engineering' },
        { label: 'Cloud Engineering', href: '/schools/engineering' },
        { label: 'Frontend Engineering', href: '/schools/engineering' },
        { label: 'Cybersecurity', href: '/schools/security' },
        { label: 'Product Design', href: '/schools/product' },
        { label: 'Product Management', href: '/schools/product' },
        { label: 'Product Marketing', href: '/schools/product' },
        { label: 'Data Analysis', href: '/schools/data' },
        { label: 'Data Engineering', href: '/schools/data' },
        { label: 'Data Science', href: '/schools/data' },
      ],
    },
    aboutUs: {
      title: 'About Us',
      links: [
        { label: 'Our Story', href: '/why-gitb' },
        { label: 'Contact Us', href: 'mailto:admissions@gitb.lt' },
        { label: 'Earn Program', href: '/partner' },
      ],
    },
    schools: {
      title: 'Schools',
      links: [
        { label: 'School of Engineering', href: '/schools/engineering' },
        { label: 'School of Product', href: '/schools/product' },
        { label: 'School of Data', href: '/schools/data' },
        { label: 'School of Business', href: '/schools/business' },
        { label: 'School of Creative Economy', href: '/schools/creative' },
        { label: 'School of Security', href: '/schools/security' },
      ],
    },
    resources: {
      title: 'Resources',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'FAQs', href: '/faqs' },
        { label: 'Our Blog', href: '/blog' },
        { label: 'Scholarship', href: '/apply' },
        { label: 'NYSC Program', href: '/apply' },
      ],
    },
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gitb-dark text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img 
                src="/images/gitb-logo.png" 
                alt="GITB Logo" 
                className="h-16 w-auto brightness-0 invert"
              />
            </Link>
            
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Your Gateway to Excellence in Tech, Business, and Language!
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <a 
                href="mailto:admissions@gitb.lt" 
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gitb-lime transition-colors"
              >
                <Mail className="w-4 h-4" />
                admissions@gitb.lt
              </a>
              <a 
                href="https://www.gitb.lt" 
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gitb-lime transition-colors"
              >
                <Globe className="w-4 h-4" />
                https://www.gitb.lt
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gitb-lime hover:text-white transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Companies */}
          <div>
            <h4 className="font-semibold text-white mb-4">{footerLinks.companies.title}</h4>
            <ul className="space-y-3">
              {footerLinks.companies.links.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-gitb-lime transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Schools */}
          <div>
            <h4 className="font-semibold text-white mb-4">{footerLinks.schools.title}</h4>
            <ul className="space-y-3">
              {footerLinks.schools.links.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-gitb-lime transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nano-Diploma */}
          <div>
            <h4 className="font-semibold text-white mb-4">{footerLinks.nanoDiploma.title}</h4>
            <ul className="space-y-3">
              {footerLinks.nanoDiploma.links.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-gitb-lime transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Diploma */}
          <div>
            <h4 className="font-semibold text-white mb-4">{footerLinks.diploma.title}</h4>
            <ul className="space-y-3">
              {footerLinks.diploma.links.slice(0, 6).map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-gitb-lime transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Us & Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">{footerLinks.aboutUs.title}</h4>
            <ul className="space-y-3 mb-8">
              {footerLinks.aboutUs.links.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-gitb-lime transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold text-white mb-4">{footerLinks.resources.title}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.links.slice(0, 4).map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-gitb-lime transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>In Partnership with</span>
                <Github className="w-5 h-5" />
                <span className="font-semibold text-white">GitHub</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <img 
                src="/images/eahea-badge.png" 
                alt="EAHEA Accredited" 
                className="h-12 w-auto"
              />
              <div className="text-sm text-gray-400">
                <p className="font-medium text-white">EAHEA Accredited</p>
                <p>European Union & International</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} GITB. All rights reserved. | Accredited by EAHEA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
