import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[72px]">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-gitb-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-16 h-16 text-gitb-lime" />
          </div>
          <h1 className="text-8xl font-bold text-gitb-dark mb-2">404</h1>
          <p className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</p>
          <p className="text-gray-600">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <p className="text-sm text-gray-500 mb-4">You might want to check:</p>
          <div className="space-y-2">
            <Link 
              to="/schools" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gitb-50 transition-colors text-gray-700"
            >
              Our Programs
            </Link>
            <Link 
              to="/apply" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gitb-50 transition-colors text-gray-700"
            >
              Apply Now
            </Link>
            <Link 
              to="/resources" 
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gitb-50 transition-colors text-gray-700"
            >
              Resources & FAQs
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Link to="/">
            <Button className="bg-gitb-lime hover:bg-gitb-lime-hover text-white flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
