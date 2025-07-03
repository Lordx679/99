import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  // Fetch real statistics from API
  const { data: stats } = useQuery<{totalProjects: number; totalUsers: number; totalViews: number}>({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-discord-darkest text-white overflow-hidden" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric floating elements */}
        <motion.div 
          className="absolute top-20 right-20 w-32 h-32 border border-discord-accent/30 rounded-lg rotate-12"
          animate={{
            rotate: [12, 25, 12],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/3 left-16 w-24 h-24 bg-discord-accent/20 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-40 right-40 w-16 h-16 border-2 border-discord-blurple/40 rounded-sm rotate-45"
          animate={{
            rotate: [45, 90, 45],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 right-1/2 w-8 h-8 bg-white/10 rounded-full"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
      </div>

      {/* Navigation Header */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-discord-elevated/50 backdrop-blur-xl border-b border-discord-border sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <i className="fas fa-code text-discord-blurple text-2xl ml-3"></i>
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  منصة مشاريع التطوير
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-gradient-to-r from-discord-blurple to-purple-600 hover:from-purple-600 hover:to-discord-blurple text-white border-0 shadow-lg"
                >
                  <i className="fab fa-github ml-2"></i>
                  تسجيل الدخول
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto text-center"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black mb-8 leading-tight"
          >
            اكتشف أفضل
            <motion.span 
              className="block text-discord-blurple mt-2"
            >
              مشاريع التطوير
            </motion.span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            منصة شاملة لعرض ومشاركة المشاريع المبتكرة - من البوتات إلى التطبيقات والأدوات المتقدمة
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => window.location.href = "/api/login"}
                size="lg"
                className="bg-discord-elevated hover:bg-discord-accent text-white px-12 py-6 text-xl font-bold shadow-xl border border-discord-border rounded-2xl"
              >
                <motion.i 
                  className="fas fa-rocket ml-3 text-xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                ></motion.i>
                استكشف المشاريع
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black text-white mb-6">لماذا تختار منصتنا؟</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              منصة مجتمعية متكاملة تجمع المطورين والمبدعين لمشاركة أفضل المشاريع المبتكرة
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "fas fa-code",
                title: "مشاريع متطورة",
                description: "اكتشف مجموعة واسعة من المشاريع المطورة بأحدث التقنيات",
                color: "from-discord-pink via-discord-purple to-discord-blurple",
                delay: 0
              },
              {
                icon: "fas fa-paint-brush",
                title: "تصاميم مبتكرة",
                description: "استلهم من أفضل التصاميم والواجهات العصرية",
                color: "from-discord-cyan via-discord-green to-discord-yellow",
                delay: 0.2
              },
              {
                icon: "fas fa-toolbox",
                title: "أدوات مفيدة",
                description: "استخدم أدوات وقوالب جاهزة لتطوير مشاريعك",
                color: "from-discord-orange via-discord-red to-discord-pink",
                delay: 0.4
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ 
                  duration: 0.8, 
                  delay: feature.delay,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl hover:shadow-2xl h-full">
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <motion.div 
                      className="relative w-24 h-24 mx-auto mb-6"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-20 blur-lg`}></div>
                      <div className={`relative w-full h-full bg-discord-elevated border border-discord-border rounded-2xl flex items-center justify-center shadow-xl`}>
                        <motion.i 
                          className={`${feature.icon} text-discord-blurple text-4xl`}
                          whileHover={{ rotate: 15 }}
                          transition={{ duration: 0.2 }}
                        ></motion.i>
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-black/40 to-black/60 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { 
                number: stats?.totalProjects?.toLocaleString() || "0", 
                label: "مشروع مميز", 
                icon: "fas fa-project-diagram",
                color: "from-discord-pink via-discord-purple to-discord-cyan" 
              },
              { 
                number: stats?.totalUsers?.toLocaleString() || "0", 
                label: "مطور نشط", 
                icon: "fas fa-users",
                color: "from-discord-green via-discord-yellow to-discord-orange" 
              },
              { 
                number: stats?.totalViews?.toLocaleString() || "0", 
                label: "مشاهدة إجمالية", 
                icon: "fas fa-eye",
                color: "from-discord-cyan via-discord-blurple to-discord-pink" 
              },
              { 
                number: "24/7", 
                label: "دعم فني", 
                icon: "fas fa-headset",
                color: "from-discord-red via-discord-orange to-discord-yellow" 
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0, rotateY: -90 }}
                whileInView={{ scale: 1, opacity: 1, rotateY: 0 }}
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <motion.div
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 group-hover:border-white/40 transition-all duration-300"
                  whileHover={{ boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
                >
                  <motion.div 
                    className="relative w-20 h-20 mx-auto mb-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-15 blur-sm`}></div>
                    <div className="relative w-full h-full bg-discord-elevated border border-discord-border rounded-xl flex items-center justify-center shadow-lg">
                      <motion.i 
                        className={`${stat.icon} text-discord-blurple text-3xl`}
                        whileHover={{ rotate: 10 }}
                        transition={{ duration: 0.2 }}
                      ></motion.i>
                    </div>
                  </motion.div>
                  <motion.h3 
                    className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                  >
                    {stat.number}
                  </motion.h3>
                  <p className="text-gray-300 font-medium group-hover:text-white transition-colors">
                    {stat.label}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 py-32 px-4 sm:px-6 lg:px-8"
      >
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: "spring", stiffness: 50 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-5xl md:text-7xl font-black mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.span
              className="bg-gradient-to-r from-discord-cyan via-discord-purple via-discord-pink to-discord-yellow bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: "400% 400%" }}
            >
              ابدأ رحلتك اليوم
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            انضم إلى مجتمع المطورين واكتشف إمكانيات لا محدودة في عالم التطوير والإبداع
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button
                onClick={() => window.location.href = "/api/login"}
                size="lg"
                className="bg-discord-elevated hover:bg-discord-accent text-white px-16 py-8 text-2xl font-black shadow-2xl border border-discord-border rounded-3xl relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.i 
                  className="fab fa-github ml-4 text-2xl"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                />
                <span className="relative z-10">انضم الآن</span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 bg-black/60 backdrop-blur-sm border-t border-white/10"
      >
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.p 
            className="text-gray-400 text-lg"
            whileHover={{ 
              color: "#ffffff",
              scale: 1.05,
              textShadow: "0 0 20px rgba(139, 92, 246, 0.5)"
            }}
            transition={{ duration: 0.3 }}
          >
            © 2025 منصة مشاريع التطوير - جميع الحقوق محفوظة
          </motion.p>
        </motion.div>
      </motion.footer>
    </div>
  );
}
