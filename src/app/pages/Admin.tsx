import { useState, useEffect, type FormEvent } from "react";
import {
  Trash2, Plus, Save, LogIn, Image, Settings, BarChart3, FileText,
  FolderOpen, Shield, Eye, EyeOff, X, Inbox, Download, Upload, Star, MessageSquare,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link2, Highlighter, Heading1, Heading2, Undo2, Redo2
} from "lucide-react";
import { store, DEFAULT_PROJECTS, DEFAULT_BLOG, DEFAULT_STATS, DEFAULT_SETTINGS, DEFAULT_REVIEWS } from "../lib/store";
import type { Project, BlogPost, StatItem, SiteSettings, Lead, Review } from "../lib/store";
import { toast, Toaster } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapUnderline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapLink from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TiptapImage from "@tiptap/extension-image";

const ADMIN_PASS = "a13admin";
type Tab = "projects" | "blog" | "reviews" | "leads" | "stats" | "settings";

/* ---- Rich Text Editor Component ---- */
function RichEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TiptapLink.configure({ openOnClick: false }),
      Highlight,
      TiptapImage,
    ],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-1.5 rounded-lg transition-colors ${active ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`;

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-0.5 p-2 border-b border-gray-200 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}><Bold size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}><Italic size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))}><UnderlineIcon size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))}><Strikethrough size={15} /></button>
        <div className="w-px bg-gray-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))}><Heading1 size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}><Heading2 size={15} /></button>
        <div className="w-px bg-gray-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}><List size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}><ListOrdered size={15} /></button>
        <div className="w-px bg-gray-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btn(editor.isActive({ textAlign: "left" }))}><AlignLeft size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btn(editor.isActive({ textAlign: "center" }))}><AlignCenter size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btn(editor.isActive({ textAlign: "right" }))}><AlignRight size={15} /></button>
        <div className="w-px bg-gray-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={btn(editor.isActive("highlight"))}><Highlighter size={15} /></button>
        <button type="button" onClick={() => {
          const url = prompt("URL ссылки:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} className={btn(editor.isActive("link"))}><Link2 size={15} /></button>
        <div className="w-px bg-gray-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)}><Undo2 size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)}><Redo2 size={15} /></button>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-3 min-h-[160px] focus-within:ring-2 focus-within:ring-blue-700/20 [&_.tiptap]:outline-none" />
    </div>
  );
}

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [tab, setTab] = useState<Tab>("projects");

  const switchTab = (t: Tab) => {
    if (t === "leads") setLeads(store.getLeads());
    setTab(t);
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [blog, setBlog] = useState<BlogPost[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (store.getAuth()) { setAuth(true); loadAll(); }
  }, []);

  function loadAll() {
    setProjects(store.getProjects().map(p => ({ ...p, images: p.images || [], content: p.content || "" })));
    setBlog(store.getBlog().map(b => ({ ...b, images: b.images || [], content: b.content || "" })));
    setLeads(store.getLeads());
    setReviews(store.getReviews());
    setStats(store.getStats());
    setSettings(store.getSettings());
  }

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (pass !== ADMIN_PASS) { toast.error("Неверный пароль"); return; }
    store.setAuth(true);
    setAuth(true);
    loadAll();
    toast.success("Вход выполнен");
  };

  const logout = () => { store.setAuth(false); setAuth(false); setPass(""); };

  const saveProjects = () => { store.setProjects(projects); toast.success("Проекты сохранены"); };
  const saveBlog = () => { store.setBlog(blog); toast.success("Блог сохранён"); };
  const saveStats = () => { store.setStats(stats); toast.success("Показатели сохранены"); };
  const saveSettings = () => { store.setSettings(settings); toast.success("Настройки сохранены"); };
  const saveReviews = () => { store.setReviews(reviews); toast.success("Отзывы сохранены"); };

  const addReview = () => {
    const maxId = reviews.reduce((m, r) => Math.max(m, r.id), 0);
    setReviews([...reviews, { id: maxId + 1, name: "", company: "", text: "", rating: 5 }]);
  };
  const removeReview = (id: number) => setReviews(reviews.filter(r => r.id !== id));
  const updateReview = (id: number, field: keyof Review, value: unknown) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleExport = () => {
    const blob = new Blob([store.exportAll()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `a13_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Копия данных скачана");
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { store.importAll(reader.result as string); loadAll(); toast.success("Данные восстановлены"); }
      catch { toast.error("Ошибка импорта"); }
    };
    reader.readAsText(file);
  };

  const addProject = () => {
    const maxId = projects.reduce((m, p) => Math.max(m, p.id), 0);
    setProjects([...projects, { id: maxId + 1, title: "", year: new Date().getFullYear().toString(), image: "", images: [], description: "", content: "", category: "" }]);
  };
  const removeProject = (id: number) => setProjects(projects.filter(p => p.id !== id));
  const updateProject = (id: number, field: keyof Project, value: unknown) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  /* Main image upload (single, uncropped) */
  const handleMainImageUpload = (projectId: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, image: reader.result as string } : p
      ));
    };
    reader.readAsDataURL(file);
  };

  /* Multi-image upload for gallery */
  const handleMultiImageUpload = (projectId: number, files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setProjects(prev => prev.map(p => {
          if (p.id !== projectId) return p;
          const newImages = [...p.images, reader.result as string];
          return { ...p, images: newImages };
        }));
      };
      reader.readAsDataURL(file);
    });
  };
  const removeImage = (projectId: number, idx: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newImages = p.images.filter((_, i) => i !== idx);
      const newImage = newImages[0] || "";
      return { ...p, images: newImages, image: newImage };
    }));
  };

  const handleBlogMainImageUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setBlog(prev => prev.map(b => b.id === id ? { ...b, image: reader.result as string } : b));
    };
    reader.readAsDataURL(file);
  };

  const handleBlogMultiImageUpload = (blogId: number, files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setBlog(prev => prev.map(b => {
          if (b.id !== blogId) return b;
          return { ...b, images: [...b.images, reader.result as string] };
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeBlogImage = (blogId: number, idx: number) => {
    setBlog(prev => prev.map(b => {
      if (b.id !== blogId) return b;
      return { ...b, images: b.images.filter((_, i) => i !== idx) };
    }));
  };

  const addBlogPost = () => {
    const maxId = blog.reduce((m, b) => Math.max(m, b.id), 0);
    setBlog([...blog, { id: maxId + 1, title: "", date: new Date().toISOString().slice(0, 10), excerpt: "", content: "", image: "", images: [] }]);
  };
  const removeBlogPost = (id: number) => setBlog(blog.filter(b => b.id !== id));
  const updateBlogPost = (id: number, field: keyof BlogPost, value: string | number) => {
    setBlog(blog.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const updateStat = (idx: number, field: keyof StatItem, value: string | number) => {
    setStats(stats.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const inp = "w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-400 transition-all";
  const lbl = "text-gray-400 text-xs block mb-1";

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Toaster position="top-center" richColors />
        <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-sm shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield size={24} className="text-blue-700" />
            <h1 className="text-gray-900 font-bold text-xl">Админ-панель</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input type={showPass ? "text" : "password"} placeholder="Пароль" value={pass} onChange={e => setPass(e.target.value)} className={inp + " pr-10"} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white font-medium px-4 py-3 rounded-full text-sm hover:bg-blue-800 transition-colors">
              <LogIn size={16} /> Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof FolderOpen }[] = [
    { key: "projects", label: "Проекты", icon: FolderOpen },
    { key: "blog", label: "Новости", icon: FileText },
    { key: "reviews", label: "Отзывы", icon: MessageSquare },
    { key: "leads", label: "Заявки", icon: Inbox },
    { key: "stats", label: "Показатели", icon: BarChart3 },
    { key: "settings", label: "Настройки", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-blue-700" />
            <span className="font-semibold text-gray-900 text-sm">Админ-панель</span>
          </div>
          <button onClick={logout} className="text-gray-400 text-sm hover:text-red-500 transition-colors">Выйти</button>
        </div>
      </div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.key ? "border-blue-700 text-blue-700" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* PROJECTS */}
        {tab === "projects" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Проекты ({projects.length})</h2>
              <div className="flex gap-2">
                <button onClick={addProject} className="flex items-center gap-1.5 border border-gray-300 text-gray-500 hover:text-blue-700 hover:border-blue-300 px-3 py-2 rounded-full text-xs transition-colors"><Plus size={14} /> Добавить</button>
                <button onClick={saveProjects} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
              </div>
            </div>
            <div className="space-y-4">
              {projects.map((p, idx) => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-xs">#{idx + 1}</span>
                    <div className="flex gap-2">
                      <button onClick={() => removeProject(p.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <div><label className={lbl}>Название</label><input type="text" value={p.title} onChange={e => updateProject(p.id, "title", e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Год</label><input type="text" value={p.year} onChange={e => updateProject(p.id, "year", e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Категория</label><input type="text" value={p.category || ""} onChange={e => updateProject(p.id, "category", e.target.value)} placeholder="Фасады, Остекление..." className={inp} /></div>
                  </div>
                  <div className="mb-3"><label className={lbl}>Краткое описание</label><input type="text" value={p.description} onChange={e => updateProject(p.id, "description", e.target.value)} className={inp} /></div>

                  {/* === ГЛАВНАЯ: single main photo + short text === */}
                  <div className="mb-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <h4 className="text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">Главная (превью)</h4>
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        {p.image ? (
                          <div className="relative group">
                            <img src={p.image} alt="" className="w-32 h-24 object-contain bg-white rounded-xl border border-gray-200" />
                            <button onClick={() => updateProject(p.id, "image", "")} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                          </div>
                        ) : (
                          <label className="w-32 h-24 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center cursor-pointer text-blue-400 hover:text-blue-700 hover:border-blue-500 transition-colors bg-white">
                            <Image size={20} />
                            <span className="text-[10px] mt-1">1 фото</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleMainImageUpload(p.id, e.target.files[0]); }} />
                          </label>
                        )}
                      </div>
                      <div className="flex-1 text-xs text-gray-500">
                        <p>Это фото отображается на главной странице в слайдере и в карточке проекта в галерее. Фото не будет обрезаться.</p>
                        {p.image && (
                          <label className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">
                            <Image size={12} /> Заменить
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleMainImageUpload(p.id, e.target.files[0]); }} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* === ГАЛЕРЕЯ: multiple photos + rich text === */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h4 className="text-gray-700 text-xs font-semibold uppercase tracking-wider mb-3">Галерея проекта</h4>
                    <label className={lbl}>Фотографии ({p.images.length})</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {p.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative group w-28 h-22 rounded-xl overflow-hidden border border-gray-200 bg-white">
                          <img src={img} alt="" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => removeImage(p.id, imgIdx)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50" title="Удалить">
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <label className="w-28 h-22 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-blue-700 hover:border-blue-300 transition-colors">
                        <Plus size={18} />
                        <span className="text-[10px] mt-0.5">Добавить</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) handleMultiImageUpload(p.id, e.target.files); }} />
                      </label>
                    </div>
                    <p className="text-gray-400 text-[11px] mb-3">Эти фото отображаются на странице проекта. Фотографии не обрезаются.</p>

                    <label className={lbl}>Полное описание проекта</label>
                    <RichEditor content={p.content} onChange={html => updateProject(p.id, "content", html)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* BLOG */}
        {tab === "blog" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Новости ({blog.length})</h2>
              <div className="flex gap-2">
                <button onClick={addBlogPost} className="flex items-center gap-1.5 border border-gray-300 text-gray-500 hover:text-blue-700 hover:border-blue-300 px-3 py-2 rounded-full text-xs transition-colors"><Plus size={14} /> Добавить</button>
                <button onClick={saveBlog} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
              </div>
            </div>
            <div className="space-y-4">
              {blog.map((b, idx) => (
                <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-xs">#{idx + 1}</span>
                    <button onClick={() => removeBlogPost(b.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div><label className={lbl}>Заголовок</label><input type="text" value={b.title} onChange={e => updateBlogPost(b.id, "title", e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Дата</label><input type="date" value={b.date} onChange={e => updateBlogPost(b.id, "date", e.target.value)} className={inp} /></div>
                  </div>
                  <div className="mb-3"><label className={lbl}>Краткое описание</label><input type="text" value={b.excerpt} onChange={e => updateBlogPost(b.id, "excerpt", e.target.value)} className={inp} /></div>

                  {/* === ГЛАВНАЯ: single main photo === */}
                  <div className="mb-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <h4 className="text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">Главная (превью)</h4>
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        {b.image ? (
                          <div className="relative group">
                            <img src={b.image} alt="" className="w-32 h-24 object-contain bg-white rounded-xl border border-gray-200" />
                            <button onClick={() => updateBlogPost(b.id, "image", "")} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                          </div>
                        ) : (
                          <label className="w-32 h-24 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center cursor-pointer text-blue-400 hover:text-blue-700 hover:border-blue-500 transition-colors bg-white">
                            <Image size={20} />
                            <span className="text-[10px] mt-1">1 фото</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleBlogMainImageUpload(b.id, e.target.files[0]); }} />
                          </label>
                        )}
                      </div>
                      <div className="flex-1 text-xs text-gray-500">
                        <p>Это фото отображается в карточке новости на странице новостей. Фото не будет обрезаться.</p>
                        {b.image && (
                          <label className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">
                            <Image size={12} /> Заменить
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleBlogMainImageUpload(b.id, e.target.files[0]); }} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* === ГАЛЕРЕЯ: multiple photos + rich text === */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h4 className="text-gray-700 text-xs font-semibold uppercase tracking-wider mb-3">Галерея и контент</h4>
                    <label className={lbl}>Фотографии ({b.images.length})</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {b.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative group w-28 h-22 rounded-xl overflow-hidden border border-gray-200 bg-white">
                          <img src={img} alt="" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => removeBlogImage(b.id, imgIdx)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50" title="Удалить">
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <label className="w-28 h-22 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-blue-700 hover:border-blue-300 transition-colors">
                        <Plus size={18} />
                        <span className="text-[10px] mt-0.5">Добавить</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) handleBlogMultiImageUpload(b.id, e.target.files); }} />
                      </label>
                    </div>
                    <p className="text-gray-400 text-[11px] mb-3">Эти фото отображаются на странице новости. Фотографии не обрезаются.</p>

                    <label className={lbl}>Полное описание</label>
                    <RichEditor content={b.content} onChange={html => updateBlogPost(b.id, "content", html)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* REVIEWS */}
        {tab === "reviews" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Отзывы клиентов ({reviews.length})</h2>
              <div className="flex gap-2">
                <button onClick={addReview} className="flex items-center gap-1.5 border border-gray-300 text-gray-500 hover:text-blue-700 hover:border-blue-300 px-3 py-2 rounded-full text-xs transition-colors"><Plus size={14} /> Добавить</button>
                <button onClick={saveReviews} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map((r, idx) => (
                <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-xs">#{idx + 1}</span>
                    <button onClick={() => removeReview(r.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <div><label className={lbl}>Имя</label><input type="text" value={r.name} onChange={e => updateReview(r.id, "name", e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Компания</label><input type="text" value={r.company} onChange={e => updateReview(r.id, "company", e.target.value)} className={inp} /></div>
                    <div>
                      <label className={lbl}>Рейтинг</label>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button" onClick={() => updateReview(r.id, "rating", s)} className="p-0.5">
                            <Star size={18} className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mb-3"><label className={lbl}>Текст отзыва</label><textarea value={r.text} onChange={e => updateReview(r.id, "text", e.target.value)} rows={3} className={inp + " resize-none"} /></div>
                  <div><label className={lbl}>Связанный проект (ID, необязательно)</label><input type="number" value={r.projectId || ""} onChange={e => updateReview(r.id, "projectId", parseInt(e.target.value) || undefined)} placeholder="Оставьте пустым" className={inp + " max-w-xs"} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* LEADS */}
        {tab === "leads" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Заявки ({leads.length})</h2>
              {leads.length > 0 && (
                <button onClick={() => { store.setLeads([]); setLeads([]); toast.success("Заявки очищены"); }} className="text-red-400 hover:text-red-600 text-xs transition-colors">Очистить все</button>
              )}
            </div>
            {leads.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <Inbox size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Заявок пока нет</p>
                <p className="text-gray-300 text-xs mt-1">Заявки поступают из калькулятора и других форм</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...leads].reverse().map(lead => (
                  <div key={lead.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-gray-900 font-medium text-sm">{lead.name}</h3>
                        <p className="text-gray-400 text-xs">{new Date(lead.date).toLocaleString("ru-RU")}</p>
                      </div>
                      <span className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded-full">{lead.source}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm mb-3">
                      <div><span className="text-gray-400 text-xs">Телефон:</span> <span className="text-gray-900">{lead.phone}</span></div>
                      {lead.email && <div><span className="text-gray-400 text-xs">Email:</span> <span className="text-gray-900">{lead.email}</span></div>}
                    </div>
                    {lead.calculation && (
                      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 whitespace-pre-line">{lead.calculation}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* STATS */}
        {tab === "stats" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Показатели на главной</h2>
              <button onClick={saveStats} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {stats.map((s, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="text-3xl font-bold text-blue-700 mb-3">{s.value.toLocaleString("ru-RU")}{s.suffix}</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className={lbl}>Значение</label><input type="number" value={s.value} onChange={e => updateStat(idx, "value", parseInt(e.target.value) || 0)} className={inp} /></div>
                    <div><label className={lbl}>Суффикс</label><input type="text" value={s.suffix} onChange={e => updateStat(idx, "suffix", e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Подпись</label><input type="text" value={s.label} onChange={e => updateStat(idx, "label", e.target.value)} className={inp} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* SETTINGS */}
        {tab === "settings" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Настройки сайта</h2>
              <button onClick={saveSettings} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
            </div>
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-4">Контактные данные</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className={lbl}>Телефон</label><input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} className={inp} /></div>
                  <div><label className={lbl}>Email</label><input type="text" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} className={inp} /></div>
                  <div><label className={lbl}>Адрес офиса</label><input type="text" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} className={inp} /></div>
                  <div><label className={lbl}>Адрес производства</label><input type="text" value={settings.production} onChange={e => setSettings({ ...settings, production: e.target.value })} className={inp} /></div>
                  <div><label className={lbl}>Режим работы</label><input type="text" value={settings.workHours} onChange={e => setSettings({ ...settings, workHours: e.target.value })} className={inp} /></div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-4">Мессенджеры</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className={lbl}>Telegram</label><input type="text" value={settings.telegram} onChange={e => setSettings({ ...settings, telegram: e.target.value })} placeholder="https://t.me/username" className={inp} /></div>
                  <div><label className={lbl}>WhatsApp</label><input type="text" value={settings.whatsapp} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="https://wa.me/79991234567" className={inp} /></div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-4">Telegram Bot (уведомления о заявках)</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className={lbl}>Bot Token</label><input type="text" value={settings.telegramBotToken} onChange={e => setSettings({ ...settings, telegramBotToken: e.target.value })} placeholder="123456:ABC-DEF..." className={inp} /></div>
                  <div><label className={lbl}>Chat ID</label><input type="text" value={settings.telegramChatId} onChange={e => setSettings({ ...settings, telegramChatId: e.target.value })} placeholder="-100123456789" className={inp} /></div>
                </div>
                <p className="text-gray-400 text-xs mt-2">Создайте бота через @BotFather, добавьте в чат и укажите Chat ID</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-4">Аналитика</h3>
                <div><label className={lbl}>ID Яндекс.Метрики</label><input type="text" value={settings.yandexMetrikaId} onChange={e => setSettings({ ...settings, yandexMetrikaId: e.target.value })} placeholder="12345678" className={inp + " max-w-xs"} /></div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-4">CRM интеграция</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className={lbl}>Webhook URL (отправка заявок)</label><input type="text" value={settings.crmWebhookUrl || ""} onChange={e => setSettings({ ...settings, crmWebhookUrl: e.target.value })} placeholder="https://your-crm.com/api/webhook" className={inp} /></div>
                  <div><label className={lbl}>EmailJS Service ID</label><input type="text" value={settings.emailServiceId || ""} onChange={e => setSettings({ ...settings, emailServiceId: e.target.value })} placeholder="service_xxxxx" className={inp} /></div>
                </div>
                <p className="text-gray-400 text-xs mt-2">Webhook: заявки отправляются POST-запросом в формате JSON. EmailJS: для автоматического подтверждения на email клиента.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-4">Резервное копирование данных</h3>
                <p className="text-gray-400 text-xs mb-4">Все данные хранятся в localStorage браузера. Рекомендуется периодически сохранять резервную копию.</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleExport} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-full text-xs hover:bg-green-700 transition-colors"><Download size={14} /> Скачать копию</button>
                  <label className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-full text-xs hover:bg-orange-600 transition-colors cursor-pointer">
                    <Upload size={14} /> Восстановить из копии
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-center text-gray-300 text-xs py-6">Данные хранятся в localStorage — не забывайте делать резервные копии</p>
    </div>
  );
}
