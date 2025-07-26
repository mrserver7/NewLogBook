import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useThemeContext } from "@/components/ThemeProvider";

export default function Landing() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/assets/logo.png" 
                alt="CaseCurator Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              CaseCurator
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md"
            >
              {theme === "dark" ? (
                <i className="fas fa-sun text-yellow-500"></i>
              ) : (
                <i className="fas fa-moon text-gray-600"></i>
              )}
            </button>
            
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            The Future of
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent block">
              Anesthesiology Logging
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Streamline your case documentation with our comprehensive digital logbook. 
            Track procedures, manage patient data, and generate professional reports with ease.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={() => window.location.href = "/api/login"}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <i className="fas fa-user-md mr-2"></i>
              Get Started
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-blue-200 dark:border-gray-600 text-blue-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 px-8 py-4 rounded-xl font-semibold transition-all"
            >
              <i className="fas fa-play mr-2"></i>
              Watch Demo
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-procedures text-blue-600 dark:text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Comprehensive Logging
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Document every detail of your cases with our intuitive interface. Track procedures, patients, and outcomes effortlessly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-chart-line text-teal-600 dark:text-teal-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Gain insights into your practice with detailed analytics and visualizations of your case data.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-file-export text-orange-600 dark:text-orange-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Professional Reports
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Generate professional PDF reports and export data in multiple formats for credentialing and billing.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Trusted by Healthcare Professionals
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-2">
                  1,000+
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Active Users</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-2">
                  50,000+
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Cases Logged</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Uptime</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">Support</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 text-center">
        <div className="text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 CaseCurator. All rights reserved.</p>
          <p className="mt-2">Secure • Private • Professional</p>
        </div>
      </footer>
    </div>
  );
}
