import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ProjectCard from "@/components/ProjectCard";
import SearchBar from "@/components/SearchBar";
import AdminDashboard from "@/components/AdminDashboard";
import ProjectModal from "@/components/ProjectModal";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, User } from "@shared/schema";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);



  // Redirect to home if not authenticated
  useEffect(() => {
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

  const { data: projects = [], isLoading: projectsLoading, refetch } = useQuery<Project[]>({
    queryKey: ["/api/projects", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const url = `/api/projects${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: stats } = useQuery<{totalProjects: number; totalUsers: number; totalViews: number}>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && (user as User)?.isAdmin,
    retry: false,
  });

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-discord-darkest flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Minimalist Geometric Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-20 w-16 h-16 border border-discord-accent/20 rounded-sm rotate-45"
            animate={{
              rotate: [45, 60, 45],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-32 right-32 w-8 h-8 bg-discord-accent/10 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <motion.div 
          className="text-center relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <motion.div 
            className="relative mx-auto mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-20 h-20 border-4 border-transparent border-t-discord-blurple border-r-purple-500 rounded-full"></div>
            <motion.div 
              className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-pink-500 border-l-discord-green rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold text-discord-blurple mb-4"
          >
            جاري التحميل...
          </motion.h2>
          
          <motion.p 
            className="text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            إعداد منصة المشاريع
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-discord-darkest via-discord-dark to-discord-elevated text-white overflow-hidden" 
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-discord-blurple/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 -left-40 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 40, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Navigation Header */}
      <motion.nav 
        className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.i 
                  className="fas fa-code text-discord-blurple text-2xl ml-3"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  منصة مشاريع التطوير
                </span>
              </motion.div>
              
              <div className="hidden md:flex space-x-6 space-x-reverse">
                {[
                  { text: "الرئيسية", action: () => setShowAdminDashboard(false) },
                  { text: "المشاريع", href: "#projects" },
                  { text: "الفئات", href: "#categories" }
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={item.action}
                    className="text-gray-400 hover:text-white transition-colors relative group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {item.text}
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-discord-blurple to-purple-500 group-hover:w-full transition-all duration-300"
                      layoutId="navbar-indicator"
                    />
                  </motion.button>
                ))}
                
                {(user as User)?.isAdmin && (
                  <motion.button
                    onClick={() => setShowAdminDashboard(true)}
                    className="text-gray-400 hover:text-white transition-colors relative group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-bold">
                      لوحة التحكم
                    </span>
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300"
                    />
                  </motion.button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <SearchBar onSearch={setSearchQuery} />
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3 space-x-reverse"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {(user as User)?.profileImageUrl && (
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <motion.img 
                      src={(user as User).profileImageUrl!} 
                      alt="User Avatar" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-discord-blurple/50"
                      whileHover={{ borderColor: "rgba(139, 92, 246, 1)" }}
                    />
                    <motion.div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-discord-green rounded-full border-2 border-discord-darker"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                )}
                <motion.span 
                  className="text-sm font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  {(user as User)?.firstName || (user as User)?.email?.split('@')[0] || 'مستخدم'}
                </motion.span>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = "/api/logout"}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <motion.i 
                      className="fas fa-sign-out-alt"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {showAdminDashboard && (user as User)?.isAdmin ? (
        <AdminDashboard stats={stats} onProjectAdded={() => refetch()} />
      ) : (
        <>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-discord-blurple/20 to-discord-dark/50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                اكتشف أفضل مشاريع
                <span className="text-discord-blurple"> ديسكورد</span>
              </h1>
              <p className="text-xl text-discord-text mb-8 max-w-3xl mx-auto">
                منصة شاملة لعرض ومشاركة مشاريع ديسكورد المبتكرة - من البوتات إلى الخوادم والأدوات المتقدمة
              </p>
              
              {/* Stats */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-discord-dark/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-discord-blurple mb-2">
                    {stats?.totalProjects || 0}
                  </div>
                  <div className="text-discord-text">مشروع منشور</div>
                </div>
                <div className="bg-discord-dark/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-discord-green mb-2">
                    {stats?.totalUsers || 0}
                  </div>
                  <div className="text-discord-text">مطور نشط</div>
                </div>
                <div className="bg-discord-dark/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-discord-yellow mb-2">
                    {stats?.totalViews || 0}
                  </div>
                  <div className="text-discord-text">مشاهدة</div>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Filter */}
          <section id="categories" className="py-12 bg-discord-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-8">فئات المشاريع</h2>
              {/* Category buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  { id: 'all', label: 'جميع المشاريع', icon: 'fas fa-th-large' },
                  { id: 'bots', label: 'البوتات', icon: 'fas fa-robot' },
                  { id: 'servers', label: 'الخوادم', icon: 'fas fa-server' },
                  { id: 'tools', label: 'الأدوات', icon: 'fas fa-tools' },
                  { id: 'templates', label: 'القوالب', icon: 'fas fa-code' },
                  { id: 'designers', label: 'المصممين', icon: 'fas fa-paint-brush' },
                ].map((category) => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-6 py-3 font-medium transition-all rounded-lg border ${
                        isSelected
                          ? 'bg-discord-blurple text-white border-discord-blurple hover:bg-blue-600'
                          : 'bg-discord-elevated text-discord-text hover:bg-discord-dark hover:text-white border-discord-dark'
                      }`}
                    >
                      <i className={`${category.icon} ml-2`}></i>
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Projects Gallery */}
          <section id="projects" className="py-16 bg-discord-darkest">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-bold">المشاريع المميزة</h2>
              </div>

              {projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-discord-elevated rounded-xl p-6 animate-pulse">
                      <div className="h-48 bg-discord-dark rounded-lg mb-4"></div>
                      <div className="h-4 bg-discord-dark rounded mb-2"></div>
                      <div className="h-3 bg-discord-dark rounded mb-4"></div>
                      <div className="h-8 bg-discord-dark rounded"></div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-2xl font-bold mb-2">لا توجد مشاريع</h3>
                  <p className="text-discord-text">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'لم يتم العثور على مشاريع تطابق البحث أو الفئة المحددة'
                      : 'لا توجد مشاريع منشورة حالياً'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project: Project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onViewDetails={() => setSelectedProject(project.id)}
                      onEdit={() => setEditingProject(project)}
                      onDelete={() => {
                        // Refresh projects list after deletion
                        setTimeout(() => {
                          window.location.reload();
                        }, 1000);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectModal
          projectId={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Project Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-discord-elevated rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">تحديث المشروع</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProject(null)}
                  className="bg-discord-dark border-discord-dark"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
              <AdminDashboard
                stats={{ totalProjects: 0, totalUsers: 0, totalViews: 0 }}
                onProjectAdded={() => {
                  setEditingProject(null);
                  window.location.reload();
                }}
                editingProject={editingProject}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
