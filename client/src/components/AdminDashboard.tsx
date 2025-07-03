import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertProjectSchema, type InsertProject, type Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardProps {
  stats?: {
    totalProjects: number;
    totalUsers: number;
    totalViews: number;
  };
  onProjectAdded: () => void;
  editingProject?: Project;
}

export default function AdminDashboard({ stats, onProjectAdded, editingProject }: AdminDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: editingProject ? {
      title: editingProject.title,
      description: editingProject.description,
      fullDescription: editingProject.fullDescription || "",
      category: editingProject.category,
      githubUrl: editingProject.githubUrl || "",
      imageUrl: editingProject.imageUrl || "",
      features: editingProject.features || [],
      installationSteps: editingProject.installationSteps || "",
      authorId: editingProject.authorId,
      isPublished: editingProject.isPublished,
    } : {
      title: "",
      description: "",
      fullDescription: "",
      category: "",
      githubUrl: "",
      imageUrl: "",
      features: [],
      installationSteps: "",
      authorId: "", // Will be set on server
      isPublished: true,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      if (editingProject) {
        await apiRequest("PUT", `/api/projects/${editingProject.id}`, data);
      } else {
        await apiRequest("POST", "/api/projects", data);
      }
    },
    onSuccess: () => {
      toast({
        title: editingProject ? "تم تحديث المشروع" : "تم إنشاء المشروع",
        description: editingProject ? "تم تحديث المشروع بنجاح" : "تم نشر المشروع بنجاح",
      });
      form.reset();
      onProjectAdded();
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
        description: "فشل في إنشاء المشروع",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProject) => {
    // Process features as array
    const features = data.features?.filter(f => f.trim() !== '') || [];
    const submitData = {
      ...data,
      features,
    };

    createProjectMutation.mutate(submitData);
  };

  const [featuresInput, setFeaturesInput] = useState("");

  const addFeature = () => {
    if (featuresInput.trim()) {
      const currentFeatures = form.getValues("features") || [];
      form.setValue("features", [...currentFeatures, featuresInput.trim()]);
      setFeaturesInput("");
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features") || [];
    form.setValue("features", currentFeatures.filter((_, i) => i !== index));
  };

  return (
    <section className="py-16 bg-discord-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">لوحة تحكم المشرف</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Stats */}
          <div className="lg:col-span-1">
            <Card className="bg-discord-elevated border-discord-dark">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-discord-text">إجمالي المشاريع</span>
                  <span className="font-semibold text-discord-blurple">
                    {stats?.totalProjects || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-discord-text">إجمالي المستخدمين</span>
                  <span className="font-semibold text-discord-green">
                    {stats?.totalUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-discord-text">إجمالي المشاهدات</span>
                  <span className="font-semibold text-discord-yellow">
                    {stats?.totalViews || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Upload Form */}
          <div className="lg:col-span-2">
            <Card className="bg-discord-elevated border-discord-dark">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">إضافة مشروع جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المشروع</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="اسم المشروع"
                                className="bg-discord-dark text-white placeholder-discord-text border-discord-dark"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>فئة المشروع</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full px-3 py-2 bg-discord-dark text-white border border-discord-dark rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-discord-blurple"
                              >
                                <option value="">اختر فئة المشروع</option>
                                <option value="bots">🤖 بوت</option>
                                <option value="servers">🖥️ خادم</option>
                                <option value="tools">🔧 أداة</option>
                                <option value="templates">📋 قالب</option>
                                <option value="designers">🎨 مصمم</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف مختصر</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="وصف مختصر للمشروع"
                              rows={3}
                              className="bg-discord-dark text-white placeholder-discord-text border-discord-dark resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fullDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف مفصل</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="وصف مفصل للمشروع"
                              rows={4}
                              className="bg-discord-dark text-white placeholder-discord-text border-discord-dark resize-none"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="githubUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط GitHub</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://github.com/user/repo"
                                className="bg-discord-dark text-white placeholder-discord-text border-discord-dark"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط الصورة</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/image.jpg"
                                className="bg-discord-dark text-white placeholder-discord-text border-discord-dark"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* File Upload Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="projectFileUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ملف المشروع المضغوط</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept=".zip,.rar,.7z,.tar.gz"
                                  className="bg-discord-dark text-white border-discord-dark file:bg-discord-blurple file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        
                                        const response = await fetch('/api/upload', {
                                          method: 'POST',
                                          body: formData,
                                          credentials: 'include'
                                        });
                                        
                                        if (response.ok) {
                                          const result = await response.json();
                                          field.onChange(result.url);
                                        } else {
                                          console.error('Upload failed');
                                        }
                                      } catch (error) {
                                        console.error('Upload error:', error);
                                      }
                                    }
                                  }}
                                />
                                <Input
                                  placeholder="أو أدخل رابط الملف المضغوط"
                                  className="bg-discord-dark text-white placeholder-discord-text border-discord-dark"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="additionalImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>صورة إضافية</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.gif,.webp"
                                  className="bg-discord-dark text-white border-discord-dark file:bg-discord-blurple file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        
                                        const response = await fetch('/api/upload', {
                                          method: 'POST',
                                          body: formData,
                                          credentials: 'include'
                                        });
                                        
                                        if (response.ok) {
                                          const result = await response.json();
                                          field.onChange(result.url);
                                        } else {
                                          console.error('Upload failed');
                                        }
                                      } catch (error) {
                                        console.error('Upload error:', error);
                                      }
                                    }
                                  }}
                                />
                                <Input
                                  placeholder="أو أدخل رابط الصورة الإضافية"
                                  className="bg-discord-dark text-white placeholder-discord-text border-discord-dark"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Features Section */}
                    <div>
                      <FormLabel>المميزات</FormLabel>
                      <div className="flex space-x-2 space-x-reverse mt-1">
                        <Input
                          placeholder="أضف ميزة جديدة"
                          value={featuresInput}
                          onChange={(e) => setFeaturesInput(e.target.value)}
                          className="bg-discord-dark text-white placeholder-discord-text border-discord-dark"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addFeature();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addFeature}
                          variant="outline"
                          className="bg-discord-dark hover:bg-discord-darker border-discord-dark"
                        >
                          إضافة
                        </Button>
                      </div>
                      <div className="mt-2 space-y-1">
                        {(form.watch("features") || []).map((feature, index) => (
                          <div key={index} className="flex items-center justify-between bg-discord-dark p-2 rounded">
                            <span className="text-sm">{feature}</span>
                            <Button
                              type="button"
                              onClick={() => removeFeature(index)}
                              variant="ghost"
                              size="sm"
                              className="text-discord-red hover:text-red-400"
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="installationSteps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>خطوات التثبيت</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="git clone https://github.com/user/repo.git&#10;cd repo&#10;npm install&#10;npm start"
                              rows={4}
                              className="bg-discord-dark text-white placeholder-discord-text border-discord-dark resize-none font-mono text-sm"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={createProjectMutation.isPending}
                        className="bg-discord-blurple hover:bg-blue-600 transition-colors"
                      >
                        {createProjectMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            جاري النشر...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus ml-2"></i>
                            نشر المشروع
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
