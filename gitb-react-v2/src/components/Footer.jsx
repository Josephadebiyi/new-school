import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <img src="/images/gitb-logo-full.png" alt="GITB" className="h-10 w-auto mb-6 brightness-0 invert" />
            <p className="text-gray-400 text-sm max-w-xs mb-6">
              Global Institute of Technology and Business — shaping careers in tech, security, finance, and language.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white cursor-pointer hover:bg-gray-700 transition-colors text-xs font-bold">in</div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white cursor-pointer hover:bg-gray-700 transition-colors text-xs font-bold">X</div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white cursor-pointer hover:bg-gray-700 transition-colors text-xs font-bold">YT</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Programs</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Cybersecurity</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">KYC & Compliance</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">UI/UX Design</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Languages</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Admissions</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/apply" className="hover:text-white transition-colors">Apply Now</Link></li>
              <li><Link to="/admissions" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About GITB</Link></li>
              <li><Link to="/accelerators" className="hover:text-white transition-colors">Accelerators</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img src="/images/eu-flag.png" alt="EU" className="h-5 w-auto rounded-sm" />
            <span className="text-sm text-gray-500">Recognised across the European Union</span>
          </div>
          <div className="flex items-center space-x-4">
            <img src="/images/eahea-badge.png" alt="EAHEA" className="h-8 w-auto opacity-60" />
          </div>
        </div>

        <div className="mt-8 flex items-center space-x-2 text-[#D4F542]">
          <span className="text-xl">▲</span>
          <span className="font-medium">We are hiring</span>
        </div>

        <div className="mt-8 flex justify-between items-end">
          <img src="/images/gitb-logo.png" alt="GITB" className="h-12 w-auto brightness-0 invert opacity-20" />
          <span className="text-xs text-gray-600">© {new Date().getFullYear()} GITB — Global Institute of Technology and Business. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
