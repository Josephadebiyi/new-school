import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-[1.3fr_0.9fr_0.9fr_1fr] gap-10 mb-16">
          <div>
            <img src="/images/gitb-logo-full.png" alt="Global Institute of Technology and Business" className="h-10 w-auto mb-6 brightness-0 invert" />
            <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
              GITB helps learners build practical skills, portfolio projects, and career momentum across tech, data, design, marketing, and operations.
            </p>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Our mission is to help ambitious learners move from interest to capability through practical, beginner-friendly, and career-minded programs.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Courses</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/courses" className="hover:text-white transition-colors">Cybersecurity</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Data Analytics</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">AI & Automation</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Product Design</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Software Development</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link to="/apply" className="hover:text-white transition-colors">Apply Now</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">LMS</Link></li>
              <li><Link to="/testimonials" className="hover:text-white transition-colors">Testimonials</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>admissions@gitb.lt</li>
              <li>info@gitb.lt</li>
              <li>Vilnius, Lithuania</li>
              <li>Mon - Fri: 9am - 6pm CET</li>
            </ul>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.linkedin.com/company/global-institute-of-tech-and-business/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors text-xs font-bold"
                aria-label="Visit GITB on LinkedIn"
              >
                in
              </a>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white cursor-pointer hover:bg-gray-700 transition-colors text-xs font-bold">X</div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white cursor-pointer hover:bg-gray-700 transition-colors text-xs font-bold">IG</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} GITB — Global Institute of Technology and Business
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <Link to="/apply" className="hover:text-white transition-colors">Apply Now</Link>
              <Link to="/events" className="hover:text-white transition-colors">Events</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              <Link to="/login" className="hover:text-white transition-colors">LMS</Link>
              <span>Privacy Policy</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <img src="/images/eu-flag.png" alt="EU" className="h-5 w-auto rounded-sm" />
            <img src="/images/eahea-badge.png" alt="EAHEA" className="h-8 w-auto opacity-60" />
            <span className="text-sm text-gray-500">Built for ambitious learners across borders</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
