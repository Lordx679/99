function CategoryFilter({ selectedCategory, onCategoryChange }: { selectedCategory: string; onCategoryChange: (category: string) => void }) {
  const categories = [
    { id: 'all', label: 'جميع المشاريع', icon: 'fas fa-th-large' },
    { id: 'bots', label: 'البوتات', icon: 'fas fa-robot' },
    { id: 'servers', label: 'الخوادم', icon: 'fas fa-server' },
    { id: 'tools', label: 'الأدوات', icon: 'fas fa-tools' },
    { id: 'templates', label: 'القوالب', icon: 'fas fa-code' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <div
            key={category.id}
            onClick={() => {
              if (category.id !== selectedCategory) {
                onCategoryChange(category.id);
              }
            }}
            className={`cursor-pointer px-6 py-3 font-medium transition-all rounded-lg border ${
              isSelected
                ? 'bg-discord-blurple text-white border-discord-blurple hover:bg-blue-600'
                : 'bg-discord-elevated text-discord-text hover:bg-discord-dark hover:text-white border-discord-dark'
            }`}
          >
            <i className={`${category.icon} ml-2`}></i>
            {category.label}
          </div>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
