import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-blue-50 to-blue-100 border-t border-blue-200 text-gray-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Product */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Problems</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Interview Prep</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600 transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-blue-200 pt-8 text-center text-sm text-gray-500">
          <p>
            Built with ❤️ by the CodeCollab Team.
          </p>
          <p className="mt-2">© 2025 CodeCollab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
