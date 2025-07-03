import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Project, User } from "@shared/schema";

interface ProjectWithAuthor extends Project {
  author: User;
}

interface ProjectModalProps {
  projectId: number;
  onClose: () => void;
}

const categoryStyles = {
  bots: { bg: 'bg-discord-blurple/20', text: 'text-discord-blurple', label: 'بوت' },
  servers: { bg: 'bg-discord-green/20', text: 'text-discord-green', label: 'خادم' },
  tools: { bg: 'bg-discord-yellow/20', text: 'text-discord-yellow', label: 'أداة' },
  templates: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'قالب' },
};

export default function ProjectModal({ projectId, onClose }: ProjectModalProps) {
  const { data: project, isLoading } = useQuery<ProjectWithAuthor>({
    queryKey: [`/api/projects/${projectId}`],
    retry: false,
  });

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-discord-elevated border-discord-dark" dir="rtl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!project) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-discord-elevated border-discord-dark" dir="rtl">
          <div className="text-center py-12">
            <p className="text-discord-text">المشروع غير موجود</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const categoryStyle = categoryStyles[project.category as keyof typeof categoryStyles] || categoryStyles.bots;
  const defaultImage = "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-discord-elevated border-discord-dark" dir="rtl">
        <DialogHeader className="border-b border-discord-dark pb-6">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold mb-2">
                {project.title}
              </DialogTitle>
              <div className="flex items-center space-x-4 space-x-reverse text-discord-text">
                <Badge className={`${categoryStyle.bg} ${categoryStyle.text} hover:${categoryStyle.bg}`}>
                  {categoryStyle.label}
                </Badge>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-eye"></i>
                  <span>{project.views}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-star"></i>
                  <span>{project.likes}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {/* Project Image */}
          <div className="mb-6">
            <img 
              src={project.imageUrl || defaultImage}
              alt={project.title}
              className="w-full rounded-lg max-h-96 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultImage;
              }}
            />
          </div>
          
          {/* Project Description */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">وصف المشروع</h3>
            <p className="text-discord-text mb-4">
              {project.fullDescription || project.description}
            </p>
          </div>
          
          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">المميزات الرئيسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 space-x-reverse text-discord-text">
                    <i className="fas fa-check text-discord-green"></i>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Installation Steps */}
          {project.installationSteps && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">كيفية التثبيت</h3>
              <div className="bg-discord-dark rounded-lg p-4">
                <pre className="text-discord-text text-sm whitespace-pre-wrap">
                  {project.installationSteps}
                </pre>
              </div>
            </div>
          )}

          {/* Author Info */}
          {project.author && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">المطور</h3>
              <div className="flex items-center space-x-3 space-x-reverse">
                {project.author.profileImageUrl && (
                  <img 
                    src={project.author.profileImageUrl}
                    alt="Developer Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {project.author.firstName && project.author.lastName 
                      ? `${project.author.firstName} ${project.author.lastName}`
                      : project.author.email?.split('@')[0] || 'مطور'}
                  </p>
                  {project.author.email && (
                    <p className="text-sm text-discord-text">{project.author.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <Separator className="my-6 bg-discord-dark" />
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex space-x-2 space-x-reverse">
              {project.githubUrl && (
                <Button
                  onClick={() => window.open(project.githubUrl!, '_blank')}
                  className="bg-discord-blurple hover:bg-blue-600 transition-colors flex-1"
                >
                  <i className="fab fa-github ml-2"></i>
                  عرض الكود المصدري
                </Button>
              )}
              {project.projectFileUrl && (
                <Button
                  onClick={() => window.open(project.projectFileUrl!, '_blank')}
                  className="bg-discord-green hover:bg-green-600 transition-colors flex-1"
                >
                  <i className="fas fa-download ml-2"></i>
                  تحميل المشروع
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2 space-x-reverse">
              {project.additionalImageUrl && (
                <Button
                  onClick={() => window.open(project.additionalImageUrl!, '_blank')}
                  variant="outline"
                  className="bg-discord-dark hover:bg-discord-darker border-discord-dark flex-1"
                >
                  <i className="fas fa-image ml-2"></i>
                  صورة إضافية
                </Button>
              )}
              <Button
                variant="outline"
                className="bg-discord-dark hover:bg-discord-darker border-discord-dark flex-1"
              >
                <i className="fas fa-star ml-2"></i>
                إضافة للمفضلة
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
