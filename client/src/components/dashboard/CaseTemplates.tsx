import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CaseTemplates() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/case-templates"],
  });

  if (isLoading) {
    return (
      <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Case Templates</h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-light-elevated dark:bg-dark-elevated rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTemplateIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "cardiac":
        return "fas fa-heart";
      case "neuro":
      case "neurosurgery":
        return "fas fa-brain";
      case "orthopedic":
        return "fas fa-bone";
      case "general":
        return "fas fa-file-medical";
      default:
        return "fas fa-file-medical";
    }
  };

  const getGradient = (index: number) => {
    const gradients = [
      "from-blue-600 to-teal-500",
      "from-teal-500 to-orange-500",
      "from-orange-500 to-blue-600",
      "from-purple-500 to-pink-500",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Case Templates</h3>
          <Link href="/settings">
            <a className="text-blue-600 hover:text-teal-500 transition-colors text-sm font-medium">
              Manage
            </a>
          </Link>
        </div>
        
        {!templates || templates.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-medical text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">No templates created yet</p>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-200 dark:border-gray-600 text-blue-600 dark:text-gray-300"
            >
              Create Template
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.slice(0, 4).map((template: any, index: number) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 bg-light-elevated dark:bg-dark-elevated rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${getGradient(index)} rounded-lg flex items-center justify-center`}>
                    <i className={`${getTemplateIcon(template.category)} text-white text-xs`}></i>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {template.name}
                    </span>
                    {template.category && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {template.category}
                      </p>
                    )}
                  </div>
                </div>
                <i className="fas fa-arrow-right text-gray-400 text-sm"></i>
              </div>
            ))}
            
            {templates.length > 4 && (
              <div className="text-center pt-2">
                <Link href="/settings">
                  <a className="text-sm text-blue-600 hover:text-teal-500 transition-colors">
                    View all {templates.length} templates
                  </a>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
