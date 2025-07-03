import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import type { Project, User } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  onViewDetails: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const categoryStyles = {
  bots: { bg: 'bg-discord-blurple/20', text: 'text-discord-blurple', label: 'بوت' },
  servers: { bg: 'bg-discord-green/20', text: 'text-discord-green', label: 'خادم' },
  tools: { bg: 'bg-discord-yellow/20', text: 'text-discord-yellow', label: 'أداة' },
  templates: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'قالب' },
  designers: { bg: 'bg-pink-500/20', text: 'text-pink-400', label: 'مصمم' },
};

export default function ProjectCard({ project, onViewDetails, onEdit, onDelete }: ProjectCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Check if current user is admin - using user data from useAuth
  const isAdmin = user && user.id === "190771533";

  const categoryStyle = categoryStyles[project.category as keyof typeof categoryStyles] || categoryStyles.bots;

  // Check if project is liked
  const { data: likeStatus } = useQuery<{liked: boolean}>({
    queryKey: [`/api/projects/${project.id}/liked`],
    enabled: !!user,
    retry: false,
  });

  useEffect(() => {
    if (likeStatus?.liked !== undefined) {
      setIsLiked(likeStatus.liked);
    }
  }, [likeStatus]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/projects/${project.id}/like`);
    },
    onSuccess: (data: any) => {
      setIsLiked(data.liked);
      toast({
        title: data.liked ? "تم الإعجاب" : "تم إلغاء الإعجاب",
        description: data.liked ? "تم إضافة المشروع للمفضلة" : "تم إزالة المشروع من المفضلة",
      });
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإعجاب",
        variant: "destructive",
      });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/projects/${project.id}`);
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف المشروع بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      if (onDelete) onDelete();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: "فشل في حذف المشروع",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    deleteMutation.mutate();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const defaultImage = "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400";

  return (
    <>
      <div className="bg-discord-elevated rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group">
        <img 
          src={project.imageUrl || defaultImage}
          alt={project.title}
          className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`${categoryStyle.bg} ${categoryStyle.text} px-3 py-1 rounded-full text-sm font-medium`}>
              {categoryStyle.label}
            </span>
            <div className="flex items-center space-x-2 space-x-reverse text-discord-text">
              <span>{project.views}</span>
              <i className="fas fa-eye"></i>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-2 group-hover:text-discord-blurple transition-colors">
            {project.title}
          </h3>
          
          <p className="text-discord-text mb-4 line-clamp-3">
            {project.description}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-sm text-discord-text">
                مطور
              </span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <button 
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`transition-colors ${
                  isLiked 
                    ? 'text-discord-yellow' 
                    : 'text-discord-text hover:text-discord-yellow'
                }`}
              >
                <i className={`fas fa-star ${likeMutation.isPending ? 'animate-pulse' : ''}`}></i>
              </button>
              <span className="text-sm text-discord-text">{project.likes}</span>
            </div>
          </div>
          
          <div className="flex space-x-3 space-x-reverse">
            <Button
              onClick={onViewDetails}
              className="flex-1 bg-discord-blurple hover:bg-blue-600 transition-colors"
            >
              عرض التفاصيل
            </Button>
            
            {/* Admin buttons */}
            {isAdmin && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="bg-discord-dark hover:bg-discord-darker border-discord-dark text-discord-yellow hover:text-yellow-400"
              >
                <i className="fas fa-edit"></i>
              </Button>
            )}
            
            {isAdmin && onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-discord-dark hover:bg-discord-darker border-discord-dark text-discord-red hover:text-red-400"
              >
                <i className={`fas fa-trash ${deleteMutation.isPending ? 'animate-pulse' : ''}`}></i>
              </Button>
            )}
            
            {project.githubUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.githubUrl!, '_blank');
                }}
                className="bg-discord-dark hover:bg-discord-darker border-discord-dark"
              >
                <i className="fab fa-github"></i>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-discord-elevated rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash text-2xl text-red-400"></i>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">حذف المشروع</h3>
              
              <p className="text-discord-text mb-2">
                هل أنت متأكد من حذف المشروع
              </p>
              <p className="text-white font-semibold mb-4">
                "{project.title}"؟
              </p>
              
              <p className="text-sm text-discord-text mb-6">
                لا يمكن التراجع عن هذا الإجراء
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-discord-dark hover:bg-discord-darker border-discord-dark text-discord-text hover:text-white"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteMutation.isPending ? (
                    <i className="fas fa-spinner animate-spin ml-2"></i>
                  ) : (
                    <i className="fas fa-trash ml-2"></i>
                  )}
                  حذف
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
