import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProjectModal from "@/components/ProjectModal";
import { Button } from "@/components/ui/button";

export default function ProjectDetail() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const projectId = parseInt(params?.id || "0");

  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "غير مصرح",
        description: "يتم تسجيل الدخول مرة أخرى...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple mx-auto mb-4"></div>
          <p className="text-discord-text">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (!projectId) {
    return (
      <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">مشروع غير صحيح</h2>
          <p className="text-discord-text mb-4">رقم المشروع غير صحيح</p>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-discord-blurple hover:bg-blue-600"
          >
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-discord-darkest">
      {/* Navigation Header */}
      <nav className="bg-discord-darker border-b border-discord-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="ghost"
                onClick={() => window.location.href = "/"}
                className="text-discord-text hover:text-white"
              >
                <i className="fas fa-arrow-right ml-2"></i>
                العودة
              </Button>
              <div className="flex items-center">
                <i className="fab fa-discord text-discord-blurple text-2xl ml-3"></i>
                <span className="text-xl font-bold">مشاريع ديسكورد</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Project Detail Modal (Full Screen) */}
      <ProjectModal
        projectId={projectId}
        onClose={() => window.location.href = "/"}
      />
    </div>
  );
}
