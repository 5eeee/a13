import { useState, useEffect, useMemo, useRef, type FormEvent, type ChangeEvent } from "react";
import {
  Trash2, Plus, Save, LogIn, Image, Settings, BarChart3, FileText,
  FolderOpen, Shield, Eye, EyeOff, X, Inbox, Star, MessageSquare, Building2, Wrench,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link2, Highlighter, Heading1, Heading2, Undo2, Redo2,
  ChevronDown, Scissors, BookOpen, KeyRound, Info, ExternalLink,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { store, hydrateStore, DEFAULT_PROJECTS, DEFAULT_BLOG, DEFAULT_STATS, DEFAULT_SETTINGS, DEFAULT_REVIEWS, DEFAULT_PARTNERS, DEFAULT_ABOUT_PAGE } from "../lib/store";
import type { Project, BlogPost, StatItem, SiteSettings, Lead, Review, Partner, AboutPageData, AboutStructured } from "../lib/store";
import { mergeAboutStructured, setIn } from "../lib/aboutStructured";
import { AboutPageSections, type AboutBlockId } from "../components/AboutPageSections";
import { sortedProjects, renumberSortOrders } from "../lib/projectMedia";
import { SITE_SERVICE_DEFS } from "../lib/servicePage";
import type { ServiceExamplesMap } from "../lib/serviceExamples";
import { ImageCropModal } from "../components/ImageCropModal";
import { AdminHelp } from "../components/AdminHelp";
import { PhoneInput } from "../components/PhoneInput";
import { SortableAdminRow } from "../components/SortableAdminRow";
import { AdminExpandPanel } from "../components/AdminExpandPanel";
import { projectSelectLabel } from "../lib/adminLabels";
import { useScrollLock } from "../lib/useScrollLock";
import { toast, Toaster } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapUnderline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapLink from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TiptapImage from "@tiptap/extension-image";

const ADMIN_PASS = "a13admin";
const ADMIN_ONBOARDING_KEY = "a13_admin_welcome_dismissed";
type Tab = "projects" | "services" | "blog" | "reviews" | "leads" | "stats" | "partners" | "about" | "settings" | "help";

/* ---- Rich Text Editor Component ---- */
function RichEditor({
  content,
  onChange,
  minHeight = "min-h-[160px]",
}: {
  content: string;
  onChange: (html: string) => void;
  minHeight?: string;
}) {
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

  useEffect(() => {
    if (!editor) return;
    if (content === editor.getHTML()) return;
    try {
      editor.commands.setContent(content, false);
    } catch {
      /* ignore */
    }
  }, [content, editor]);

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
      <EditorContent
        editor={editor}
        className={`prose prose-sm max-w-none p-3 ${minHeight} focus-within:ring-2 focus-within:ring-blue-700/20 [&_.tiptap]:outline-none`}
      />
    </div>
  );
}

type LoginStep = "password" | "totp";

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("password");
  const [totpLoginCode, setTotpLoginCode] = useState("");
  const [totpEnroll, setTotpEnroll] = useState<null | { secret: string; keyuri: string }>(null);
  const [totpEnrollCode, setTotpEnrollCode] = useState("");

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
  const [partners, setPartners] = useState<Partner[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [cropModal, setCropModal] = useState<null | { src: string; projectId: number; target: "main" | "gallery"; galleryIndex?: number }>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const [expandedBlogId, setExpandedBlogId] = useState<number | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);
  const [expandedPartnerId, setExpandedPartnerId] = useState<number | null>(null);
  const [serviceExamples, setServiceExamples] = useState<ServiceExamplesMap>({});
  const [aboutPage, setAboutPage] = useState<AboutPageData>(DEFAULT_ABOUT_PAGE);
  const [aboutEditorNonce, setAboutEditorNonce] = useState(0);
  const [aboutBlock, setAboutBlock] = useState<AboutBlockId | null>(null);

  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [showWelcome, setShowWelcome] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  useScrollLock(showWelcome);

  useEffect(() => {
    if (store.getAuth()) { setAuth(true); loadAll(); }
  }, []);

  useEffect(() => {
    if (!auth) return;
    try {
      if (!localStorage.getItem(ADMIN_ONBOARDING_KEY)) setShowWelcome(true);
    } catch {
      /* private mode */
    }
  }, [auth]);

  useEffect(() => {
    mainScrollRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [tab]);

  function loadAll() {
    setProjects(store.getProjects().map(p => ({
      ...p,
      images: p.images || [],
      content: p.content || "",
      sortOrder: p.sortOrder ?? p.id * 10,
    })));
    setBlog(store.getBlog().map(b => ({ ...b, images: b.images || [], content: b.content || "", published: b.published !== false })));
    setLeads(store.getLeads());
    setReviews(store.getReviews());
    setPartners(store.getPartners());
    setStats(store.getStats());
    setSettings(store.getSettings());
    setServiceExamples(store.getServiceExamples());
    setAboutPage({ ...DEFAULT_ABOUT_PAGE, ...store.getAboutPage() });
    setAboutEditorNonce((n) => n + 1);
    setAboutBlock(null);
  }

  const finishLogin = () => {
    store.setAuth(true);
    setAuth(true);
    setLoginStep("password");
    setTotpLoginCode("");
    setPass("");
    loadAll();
    toast.success("Вход выполнен");
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (pass !== ADMIN_PASS) {
      toast.error("Неверный пароль");
      return;
    }
    void (async () => {
      try {
        await hydrateStore();
      } catch {
        /* */
      }
      if (store.getSettings().totpEnabled) {
        setLoginStep("totp");
        return;
      }
      finishLogin();
    })();
  };

  const handleTotpLogin = (e: FormEvent) => {
    e.preventDefault();
    const digits = totpLoginCode.replace(/\D/g, "").slice(0, 6);
    if (digits.length !== 6) {
      toast.error("Введите 6 цифр");
      return;
    }
    void (async () => {
      const ok = await store.verifyAdminTotp(digits);
      if (!ok) {
        toast.error("Неверный код");
        return;
      }
      finishLogin();
    })();
  };

  const logout = () => {
    store.setAuth(false);
    setAuth(false);
    setPass("");
    setLoginStep("password");
    setTotpLoginCode("");
  };

  const saveProjects = async () => {
    try { await store.setProjects(projects); toast.success("Проекты сохранены в БД"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Ошибка сохранения"); }
  };
  const saveBlog = async () => {
    try { await store.setBlog(blog); toast.success("Блог сохранён в БД"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Ошибка сохранения"); }
  };
  const saveStats = async () => {
    try { await store.setStats(stats); toast.success("Показатели сохранены в БД"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Ошибка сохранения"); }
  };
  const saveSettings = async () => {
    try { await store.setSettings(settings); toast.success("Настройки сохранены в БД"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Ошибка сохранения"); }
  };
  const saveReviews = async () => {
    try { await store.setReviews(reviews); toast.success("Отзывы сохранены в БД"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Ошибка сохранения"); }
  };
  const savePartners = async () => {
    try { await store.setPartners(partners); toast.success("Партнёры сохранены в БД"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Ошибка сохранения"); }
  };
  const saveServiceExamplesDoc = async () => {
    try { await store.setServiceExamples(serviceExamples); toast.success("Примеры к услугам сохранены в БД"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Ошибка сохранения"); }
  };
  const saveAboutPage = async () => {
    try {
      await store.setAboutPage(aboutPage);
      toast.success("Страница «О компании» сохранена в БД");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  };
  const addAboutProductionImage = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Нужен файл изображения");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setAboutPage((p) => ({ ...p, productionImages: [...p.productionImages, url] }));
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };
  const removeAboutProductionImage = (index: number) => {
    setAboutPage((p) => ({ ...p, productionImages: p.productionImages.filter((_, i) => i !== index) }));
  };
  const openAboutOnSite = () => {
    const u = new URL("about", window.location.origin + (import.meta.env.BASE_URL || "/"));
    window.open(u.href, "_blank", "noopener,noreferrer");
  };

  const patchAboutStructured = (path: (string | number)[], value: unknown) => {
    setAboutPage((p) => {
      const base = mergeAboutStructured(p.structured);
      return { ...p, structured: setIn(base, path, value) as AboutStructured };
    });
  };

  const addPartner = () => {
    const maxId = partners.reduce((m, p) => Math.max(m, p.id), 0);
    const id = maxId + 1;
    setPartners([{ id, name: "", published: true }, ...partners]);
    setExpandedPartnerId(id);
  };
  const removePartner = (id: number) => {
    setPartners(partners.filter(p => p.id !== id));
    setExpandedPartnerId((e) => (e === id ? null : e));
  };
  const patchPartner = (id: number, patch: Partial<Partner>) =>
    setPartners(
      partners.map((p) => {
        if (p.id !== id) return p;
        const next: Partner = { ...p, ...patch };
        if (patch.url !== undefined && !String(patch.url).trim()) delete next.url;
        return next;
      })
    );
  const resetPartners = () => { setPartners(DEFAULT_PARTNERS); setExpandedPartnerId(null); toast.success("Партнёры сброшены к значениям по умолчанию"); };

  const addReview = () => {
    const maxId = reviews.reduce((m, r) => Math.max(m, r.id), 0);
    const id = maxId + 1;
    setReviews([{ id, name: "", company: "", text: "", rating: 5 }, ...reviews]);
    setExpandedReviewId(id);
  };
  const removeReview = (id: number) => {
    setReviews(reviews.filter(r => r.id !== id));
    setExpandedReviewId((e) => (e === id ? null : e));
  };
  const updateReview = (id: number, field: keyof Review, value: unknown) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const orderedProjects = useMemo(() => sortedProjects(projects), [projects]);
  const projectsOnSite = useMemo(() => orderedProjects.filter((p) => p.published !== false), [orderedProjects]);

  const onProjectDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setProjects((prev) => {
      const s = sortedProjects(prev);
      const oi = s.findIndex((p) => p.id === Number(active.id));
      const ni = s.findIndex((p) => p.id === Number(over.id));
      if (oi < 0 || ni < 0) return prev;
      return renumberSortOrders(arrayMove(s, oi, ni));
    });
  };
  const onBlogDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBlog((prev) => {
      const oi = prev.findIndex((b) => b.id === Number(active.id));
      const ni = prev.findIndex((b) => b.id === Number(over.id));
      if (oi < 0 || ni < 0) return prev;
      return arrayMove(prev, oi, ni);
    });
  };
  const onReviewDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setReviews((prev) => {
      const oi = prev.findIndex((r) => r.id === Number(active.id));
      const ni = prev.findIndex((r) => r.id === Number(over.id));
      if (oi < 0 || ni < 0) return prev;
      return arrayMove(prev, oi, ni);
    });
  };
  const onPartnerDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setPartners((prev) => {
      const oi = prev.findIndex((p) => p.id === Number(active.id));
      const ni = prev.findIndex((p) => p.id === Number(over.id));
      if (oi < 0 || ni < 0) return prev;
      return arrayMove(prev, oi, ni);
    });
  };
  const onServiceLineDragEnd = (serviceId: string) => (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setServiceExamples((prev) => {
      const cur = prev[serviceId] ?? [];
      const oi = cur.indexOf(Number(active.id));
      const ni = cur.indexOf(Number(over.id));
      if (oi < 0 || ni < 0) return prev;
      return { ...prev, [serviceId]: arrayMove(cur, oi, ni) };
    });
  };

  const addProject = () => {
    const maxId = projects.reduce((m, p) => Math.max(m, p.id), 0);
    const id = maxId + 1;
    const minOrder = projects.reduce((m, p) => Math.min(m, p.sortOrder ?? p.id * 10), Number.POSITIVE_INFINITY);
    const newOrder = !Number.isFinite(minOrder) || projects.length === 0 ? 0 : minOrder - 10;
    setProjects([
      {
        id,
        sortOrder: newOrder,
        title: "",
        year: new Date().getFullYear().toString(),
        image: "",
        images: [],
        description: "",
        content: "",
        category: "",
        showInHero: undefined,
        published: true,
      },
      ...projects,
    ]);
    setExpandedProjectId(id);
  };
  const removeProject = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
    setExpandedProjectId((e) => (e === id ? null : e));
  };
  const updateProject = (id: number, field: keyof Project, value: unknown) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const applyCroppedImage = (dataUrl: string) => {
    if (!cropModal) return;
    const { projectId, target, galleryIndex } = cropModal;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        if (target === "main") return { ...p, image: dataUrl };
        const imgs = [...(p.images || [])];
        if (galleryIndex !== undefined && galleryIndex >= 0 && galleryIndex < imgs.length) imgs[galleryIndex] = dataUrl;
        return { ...p, images: imgs };
      })
    );
    setCropModal(null);
    toast.success("Изображение обновлено - нажмите «Сохранить» для записи в сайт");
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
      const removed = p.images[idx];
      const newImages = p.images.filter((_, i) => i !== idx);
      let newMain = p.image;
      if (removed === p.image) newMain = newImages[0] || "";
      return { ...p, images: newImages, image: newMain };
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
    const id = maxId + 1;
    setBlog([{ id, title: "", date: new Date().toISOString().slice(0, 10), excerpt: "", content: "", image: "", images: [], published: true }, ...blog]);
    setExpandedBlogId(id);
  };
  const removeBlogPost = (id: number) => {
    setBlog(blog.filter(b => b.id !== id));
    setExpandedBlogId((e) => (e === id ? null : e));
  };
  const updateBlogPost = (id: number, field: keyof BlogPost, value: string | number | boolean) => {
    setBlog(blog.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const updateStat = (idx: number, field: keyof StatItem, value: string | number) => {
    setStats(stats.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const inp = "w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-400 transition-all";
  const lbl = "text-gray-400 text-xs block mb-1";

  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(30,64,175,0.12),transparent)]">
        <Toaster position="top-center" richColors />
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 w-full max-w-sm shadow-lg shadow-slate-200/60">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-inner">
              <Shield size={22} className="text-white" />
            </div>
            <h1 className="text-slate-900 font-bold text-xl tracking-tight">Админ-панель</h1>
          </div>
          {loginStep === "password" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Пароль" value={pass} onChange={e => setPass(e.target.value)} className={inp + " pr-10"} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPass ? "Скрыть" : "Показать"}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-medium px-4 py-3 rounded-full text-sm hover:bg-slate-800 transition-colors">
                <LogIn size={16} /> Войти
              </button>
            </form>
          )}
          {loginStep === "totp" && (
            <form onSubmit={handleTotpLogin} className="space-y-4">
              <p className="text-sm text-slate-600 text-center">Код из приложения (Google Authenticator, Яндекс Ключ и др.)</p>
              <div className="flex justify-center">
                <KeyRound className="text-slate-400" size={32} />
              </div>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d*"
                maxLength={6}
                placeholder="000000"
                value={totpLoginCode}
                onChange={e => setTotpLoginCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={inp + " text-center text-2xl font-mono tracking-[0.4em] placeholder:text-slate-300 placeholder:tracking-[0.4em] placeholder:text-lg"}
                autoFocus
              />
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-medium px-4 py-3 rounded-full text-sm hover:bg-slate-800 transition-colors">
                Подтвердить
              </button>
              <button
                type="button"
                onClick={() => { setLoginStep("password"); setTotpLoginCode(""); }}
                className="w-full text-sm text-slate-500 hover:text-slate-800"
              >
                Назад к паролю
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof FolderOpen }[] = [
    { key: "projects", label: "Проекты", icon: FolderOpen },
    { key: "services", label: "Услуги", icon: Wrench },
    { key: "blog", label: "Новости", icon: FileText },
    { key: "reviews", label: "Отзывы", icon: MessageSquare },
    { key: "leads", label: "Заявки", icon: Inbox },
    { key: "stats", label: "Показатели", icon: BarChart3 },
    { key: "partners", label: "Партнёры", icon: Building2 },
    { key: "about", label: "О компании", icon: Info },
    { key: "settings", label: "Настройки", icon: Settings },
    { key: "help", label: "Справка", icon: BookOpen },
  ];

  const currentTabLabel = tabs.find((t) => t.key === tab)?.label ?? tab;
  const canQuickSave = tab !== "leads" && tab !== "help";

  const dismissWelcome = (openHelp: boolean) => {
    try {
      localStorage.setItem(ADMIN_ONBOARDING_KEY, "1");
    } catch {
      /* private mode */
    }
    setShowWelcome(false);
    if (openHelp) switchTab("help");
  };

  const saveCurrentTab = () => {
    void (async () => {
      try {
        switch (tab) {
          case "projects": await saveProjects(); return;
          case "services": await saveServiceExamplesDoc(); return;
          case "blog": await saveBlog(); return;
          case "reviews": await saveReviews(); return;
          case "leads": toast.info("Заявки только для просмотра"); return;
          case "stats": await saveStats(); return;
          case "partners": await savePartners(); return;
          case "about": await saveAboutPage(); return;
          case "settings": await saveSettings(); return;
          case "help": toast.info("Справка не требует сохранения"); return;
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Ошибка сохранения");
      }
    })();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/95 bg-[radial-gradient(ellipse_90%_50%_at_100%_0%,rgba(30,64,175,0.08),transparent)]">
      <Toaster position="top-center" richColors />
      {showWelcome && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-welcome-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h3 id="admin-welcome-title" className="text-lg font-semibold text-gray-900">
              Первый раз в админке?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Откройте короткую справку: разделы, «Сохранить», порядок карточек и нижняя панель. Это займёт пару минут.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => dismissWelcome(false)}
                className="rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Позже
              </button>
              <button
                type="button"
                onClick={() => dismissWelcome(true)}
                className="rounded-full bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
              >
                Открыть справку
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 shadow-sm shadow-slate-200/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm tracking-tight truncate">Админ-панель</span>
        </div>
        <button type="button" onClick={logout} className="text-slate-500 text-sm hover:text-red-600 transition-colors shrink-0">Выйти</button>
      </header>

      <div className="flex w-full min-h-0 flex-1 justify-center">
        <div className="relative flex w-full max-w-[1800px] min-h-0 flex-1 items-stretch">
          <aside
            className="fixed left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-56 flex-col gap-0.5 overflow-y-auto border-r border-slate-200/80 bg-white py-3 pl-2.5 pr-2 shadow-sm shadow-slate-200/40 md:flex"
            aria-label="Разделы"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => switchTab(t.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-blue-50 text-blue-800 shadow-sm ring-1 ring-blue-100/80"
                    : "text-gray-600 hover:bg-slate-50 hover:text-gray-900"
                }`}
              >
                <t.icon size={18} className="shrink-0 opacity-90" />
                <span className="leading-tight">{t.label}</span>
              </button>
            ))}
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col md:pl-56">
            <nav className="sticky top-14 z-30 flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 bg-white px-2 py-2.5 md:hidden" aria-label="Разделы">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => switchTab(t.key)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    tab === t.key ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div ref={mainScrollRef} className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
            <div
              className={`mx-auto w-full px-4 py-6 sm:px-6 pb-28 sm:pb-32 ${
                tab === "about" ? "max-w-7xl" : "max-w-4xl"
              }`}
            >
        {/* PROJECTS */}
        {tab === "projects" && (
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onProjectDragEnd}>
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Проекты ({projects.length})</h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={addProject} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-300 px-3 py-2 rounded-full text-xs transition-colors"><Plus size={14} /> Добавить</button>
                <button type="button" onClick={saveProjects} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors shadow-sm"><Save size={14} /> Сохранить на сайт</button>
              </div>
            </div>
            <div className="space-y-3">
              <SortableContext items={orderedProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {orderedProjects.map((p, idx) => {
                const open = expandedProjectId === p.id;
                const onSite = p.published !== false;
                return (
                <SortableAdminRow id={p.id} key={p.id}>
                {(handle) => (
                <div className={`rounded-2xl border bg-white transition-shadow ${open ? "border-blue-200 shadow-md ring-1 ring-blue-100/80" : "border-gray-200 hover:border-gray-300"}`}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedProjectId(open ? null : p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedProjectId(open ? null : p.id);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-2 sm:gap-3 p-3 sm:p-4 text-left"
                  >
                    {handle}
                    <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                    <div className="h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] text-gray-400 px-0.5 text-center leading-tight">нет фото</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{p.title || "Без названия"}</div>
                      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-2">
                        <span>{p.year || "-"}</span>
                        <span className="text-gray-300">·</span>
                        <span>порядок {idx + 1}</span>
                        {p.category?.trim() ? (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="truncate max-w-[10rem] sm:max-w-xs">{p.category}</span>
                          </>
                        ) : null}
                        {!onSite && <span className="text-amber-700 font-medium">· скрыт</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="hidden lg:inline text-[10px] uppercase tracking-wide text-gray-400">На сайте</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={onSite}
                        title={onSite ? "На сайте" : "Скрыт"}
                        onClick={() => updateProject(p.id, "published", !onSite)}
                        className={`relative h-7 w-12 rounded-full transition-colors ${onSite ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${onSite ? "translate-x-5" : ""}`} />
                      </button>
                      <button type="button" title="Удалить проект" onClick={() => removeProject(p.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </div>

                  <AdminExpandPanel open={open}>
                  <div className="border-t border-gray-100 px-3 sm:px-5 pb-5 pt-1 space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3 mb-1">
                    <div><label className={lbl}>Название</label><input type="text" value={p.title} onChange={e => updateProject(p.id, "title", e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Год</label><input type="text" value={p.year} onChange={e => updateProject(p.id, "year", e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Категория</label><input type="text" value={p.category || ""} onChange={e => updateProject(p.id, "category", e.target.value)} placeholder="Фасады, Остекление..." className={inp} /></div>
                  </div>
                  <div><label className={lbl}>Краткое описание</label><input type="text" value={p.description} onChange={e => updateProject(p.id, "description", e.target.value)} className={inp} /></div>

                  <div>
                    <label className={lbl}>Слайдер на главной</label>
                    <select
                      value={p.showInHero === true ? "yes" : p.showInHero === false ? "no" : "auto"}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateProject(p.id, "showInHero", v === "auto" ? undefined : v === "yes" ? true : false);
                      }}
                      className={inp}
                    >
                      <option value="auto">Только если есть фото</option>
                      <option value="yes">Всегда (с заглушкой)</option>
                      <option value="no">Не показывать</option>
                    </select>
                    <p className="text-gray-400 text-[11px] mt-1">Порядок карточек на сайте - перетаскиванием строки за ручку слева (внутренний номер обновляется сам).</p>
                  </div>

                  {/* === ГЛАВНАЯ: single main photo + short text === */}
                  <div className="mb-1 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <h4 className="text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">Обложка (главная + карточка)</h4>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="shrink-0">
                        {p.image ? (
                          <div className="relative group">
                            <img src={p.image} alt="" className="w-32 h-24 object-contain bg-white rounded-xl border border-gray-200" />
                            <button type="button" onClick={() => updateProject(p.id, "image", "")} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                          </div>
                        ) : (
                          <div className="w-32 h-24 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-blue-400 bg-white text-center px-1">
                            <span className="text-[10px] leading-tight">Нет фото - на сайте будет нейтральная заглушка</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2 text-xs text-gray-500">
                        <p>Можно оставить без файла: проект опубликуется с минималистичной заглушкой. Для слайдера см. настройку выше.</p>
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 cursor-pointer hover:bg-blue-50 transition-colors">
                            <Image size={12} /> Загрузить
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleMainImageUpload(p.id, e.target.files[0]); }} />
                          </label>
                          {p.image && (
                            <button
                              type="button"
                              onClick={() => setCropModal({ src: p.image, projectId: p.id, target: "main" })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                            >
                              <Scissors size={12} /> Обрезать
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const def = p.image?.startsWith("http") ? p.image : "";
                              const u = window.prompt("Вставьте прямую ссылку на изображение (https://…)", def);
                              if (u?.trim()) updateProject(p.id, "image", u.trim());
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                          >
                            URL
                          </button>
                          {p.image && (
                            <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 cursor-pointer hover:border-blue-300">
                              Заменить файлом
                              <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleMainImageUpload(p.id, e.target.files[0]); }} />
                            </label>
                          )}
                        </div>
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
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button type="button" onClick={() => setCropModal({ src: img, projectId: p.id, target: "gallery", galleryIndex: imgIdx })} className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50" title="Обрезать">
                              <Scissors size={13} />
                            </button>
                            <button type="button" onClick={() => removeImage(p.id, imgIdx)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50" title="Удалить">
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
                  </AdminExpandPanel>
                </div>
                )}
                </SortableAdminRow>
                );
              })}
            </SortableContext>
            </div>
          </div>
          </DndContext>
        )}
        {tab === "services" && (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Услуги: примеры работ</h2>
              <button type="button" onClick={() => { void saveServiceExamplesDoc(); }} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
            </div>
            <p className="text-sm text-gray-500 mb-6">Те же направления, что на странице «Услуги» сайта. Укажите проекты-образцы для каждой карточки. Показ на сайте - только у опубликованных проектов, до 6 ссылок. Пустой список: автоподбор по «Категория» (как раньше) или, для проектирования, без примеров.</p>
            <div className="space-y-5">
              {SITE_SERVICE_DEFS.map((def) => {
                const ids = serviceExamples[def.id] ?? [];
                return (
                  <div key={def.id} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{def.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {def.categories.length > 0
                            ? `Если не выбрать проекты - на сайте подставятся по категориям: ${def.categories.join(", ")}.`
                            : "Без списка категорий - примеры только из списка ниже (или пусто)."}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-gray-500 hover:text-amber-700 self-start"
                        onClick={() => setServiceExamples((m) => {
                          const n = { ...m };
                          delete n[def.id];
                          return n;
                        })}
                      >
                        Сбросить к автоподбору
                      </button>
                    </div>
                    <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onServiceLineDragEnd(def.id)}>
                      <div className="space-y-2 mb-3">
                        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                          {ids.map((pid) => {
                            const p = projects.find((x) => x.id === pid);
                            return (
                              <SortableAdminRow key={pid} id={pid}>
                                {(handle) => (
                                  <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-2 py-1.5">
                                    {handle}
                                    <span className="min-w-0 flex-1 text-sm text-gray-800 truncate">
                                      {p ? projectSelectLabel(p) : "Проект не найден"}
                                    </span>
                                    {p && p.published === false && <span className="text-[10px] text-amber-600 shrink-0">скрыт</span>}
                                    <button
                                      type="button"
                                      className="p-1 text-red-300 hover:text-red-600"
                                      onClick={() =>
                                        setServiceExamples((m) => ({
                                          ...m,
                                          [def.id]: (m[def.id] ?? []).filter((x) => x !== pid),
                                        }))
                                      }
                                      title="Убрать"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                              </SortableAdminRow>
                            );
                          })}
                        </SortableContext>
                      </div>
                    </DndContext>
                    <div>
                      <label className={lbl}>Добавить проект (опубликованные)</label>
                      <select
                        className={inp + " text-sm"}
                        value=""
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!v) return;
                          const id = parseInt(v, 10);
                          setServiceExamples((m) => {
                            const cur = m[def.id] ?? [];
                            if (cur.includes(id)) return m;
                            return { ...m, [def.id]: [...cur, id] };
                          });
                          e.currentTarget.value = "";
                        }}
                      >
                        <option value="">Выберите проект…</option>
                        {projectsOnSite
                          .filter((p) => !ids.includes(p.id))
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {projectSelectLabel(p)}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* BLOG */}
        {tab === "blog" && (
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onBlogDragEnd}>
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Новости ({blog.length})</h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={addBlogPost} className="flex items-center gap-1.5 border border-gray-300 text-gray-500 hover:text-blue-700 hover:border-blue-300 px-3 py-2 rounded-full text-xs transition-colors"><Plus size={14} /> Добавить</button>
                <button type="button" onClick={saveBlog} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
              </div>
            </div>
            <div className="space-y-3">
              <SortableContext items={blog.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {blog.map((b, idx) => {
                const open = expandedBlogId === b.id;
                const onSite = b.published !== false;
                return (
                <SortableAdminRow id={b.id} key={b.id}>
                {(handle) => (
                <div className={`rounded-2xl border bg-white transition-shadow ${open ? "border-blue-200 shadow-md ring-1 ring-blue-100/80" : "border-gray-200 hover:border-gray-300"}`}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedBlogId(open ? null : b.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedBlogId(open ? null : b.id);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-2 sm:gap-3 p-3 sm:p-4 text-left"
                  >
                    {handle}
                    <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                    <div className="h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
                      {b.image ? (
                        <img src={b.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] text-gray-400 px-0.5 text-center leading-tight">нет фото</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{b.title || "Без заголовка"}</div>
                      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-2">
                        <span>{b.date || "-"}</span>
                        <span className="text-gray-300">·</span>
                        <span>порядок {idx + 1}</span>
                        {!onSite && <span className="text-amber-700 font-medium">· скрыт</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="hidden lg:inline text-[10px] uppercase tracking-wide text-gray-400">На сайте</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={onSite}
                        title={onSite ? "На сайте" : "Скрыт"}
                        onClick={() => updateBlogPost(b.id, "published", !onSite)}
                        className={`relative h-7 w-12 rounded-full transition-colors ${onSite ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${onSite ? "translate-x-5" : ""}`} />
                      </button>
                      <button type="button" title="Удалить запись" onClick={() => removeBlogPost(b.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </div>

                  <AdminExpandPanel open={open}>
                  <div className="border-t border-gray-100 px-3 sm:px-5 pb-5 pt-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className={lbl}>Заголовок</label><input type="text" value={b.title} onChange={e => updateBlogPost(b.id, "title", e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Дата</label><input type="date" value={b.date} onChange={e => updateBlogPost(b.id, "date", e.target.value)} className={inp} /></div>
                  </div>
                  <div><label className={lbl}>Краткое описание</label><input type="text" value={b.excerpt} onChange={e => updateBlogPost(b.id, "excerpt", e.target.value)} className={inp} /></div>

                  <div className="mb-1 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <h4 className="text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">Главная (превью)</h4>
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        {b.image ? (
                          <div className="relative group">
                            <img src={b.image} alt="" className="w-32 h-24 object-contain bg-white rounded-xl border border-gray-200" />
                            <button type="button" onClick={() => updateBlogPost(b.id, "image", "")} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
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

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h4 className="text-gray-700 text-xs font-semibold uppercase tracking-wider mb-3">Галерея и контент</h4>
                    <label className={lbl}>Фотографии ({b.images.length})</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {b.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative group w-28 h-22 rounded-xl overflow-hidden border border-gray-200 bg-white">
                          <img src={img} alt="" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => removeBlogImage(b.id, imgIdx)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50" title="Удалить">
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
                  </AdminExpandPanel>
                </div>
                )}
                </SortableAdminRow>
                );
              })}
            </SortableContext>
            </div>
          </div>
          </DndContext>
        )}
        {/* REVIEWS */}
        {tab === "reviews" && (
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onReviewDragEnd}>
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Отзывы клиентов ({reviews.length})</h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={addReview} className="flex items-center gap-1.5 border border-gray-300 text-gray-500 hover:text-blue-700 hover:border-blue-300 px-3 py-2 rounded-full text-xs transition-colors"><Plus size={14} /> Добавить</button>
                <button type="button" onClick={saveReviews} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
              </div>
            </div>
            <div className="space-y-3">
              <SortableContext items={reviews.map(r => r.id)} strategy={verticalListSortingStrategy}>
              {reviews.map((r, idx) => {
                const open = expandedReviewId === r.id;
                return (
                <SortableAdminRow id={r.id} key={r.id}>
                {(handle) => (
                <div className={`rounded-2xl border bg-white transition-shadow ${open ? "border-blue-200 shadow-md ring-1 ring-blue-100/80" : "border-gray-200 hover:border-gray-300"}`}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedReviewId(open ? null : r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedReviewId(open ? null : r.id);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-2 sm:gap-3 p-3 sm:p-4 text-left"
                  >
                    {handle}
                    <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                    <div className="h-12 w-16 sm:h-14 sm:w-20 shrink-0 flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg bg-amber-50 border border-amber-100/80">
                      <Star size={20} className="text-amber-500 fill-amber-400" />
                      <span className="text-[10px] font-medium text-amber-900/80 leading-none">{r.rating}/5</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{r.name || "Без имени"}</div>
                      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-2">
                        <span className="truncate max-w-[12rem] sm:max-w-none">{r.company || "-"}</span>
                        <span className="text-gray-300">·</span>
                        <span>порядок {idx + 1}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                      <button type="button" title="Удалить отзыв" onClick={() => removeReview(r.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </div>

                  <AdminExpandPanel open={open}>
                  <div className="border-t border-gray-100 px-3 sm:px-5 pb-5 pt-4 space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3">
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
                  <div><label className={lbl}>Текст отзыва</label><textarea value={r.text} onChange={e => updateReview(r.id, "text", e.target.value)} rows={3} className={inp + " resize-none"} /></div>
                  <div>
                    <label className={lbl}>Связанный проект</label>
                    <select
                      className={inp}
                      value={r.projectId != null ? String(r.projectId) : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateReview(r.id, "projectId", v ? parseInt(v, 10) : undefined);
                      }}
                    >
                      <option value="">- не выбран</option>
                      {orderedProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {projectSelectLabel(p)}
                        </option>
                      ))}
                    </select>
                  </div>
                  </div>
                  </AdminExpandPanel>
                </div>
                )}
                </SortableAdminRow>
                );
              })}
            </SortableContext>
            </div>
          </div>
          </DndContext>
        )}
        {/* LEADS */}
        {tab === "leads" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Заявки ({leads.length})</h2>
              {leads.length > 0 && (
                <button type="button" onClick={() => { void (async () => { try { await store.setLeads([]); setLeads([]); toast.success("Заявки очищены"); } catch (e) { toast.error(e instanceof Error ? e.message : "Ошибка"); } })(); }} className="text-red-400 hover:text-red-600 text-xs transition-colors">Очистить все</button>
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
                      {lead.region && <div><span className="text-gray-400 text-xs">Регион:</span> <span className="text-gray-900">{lead.region}</span></div>}
                      {lead.floors && <div><span className="text-gray-400 text-xs">Этажность:</span> <span className="text-gray-900">{lead.floors}</span></div>}
                    </div>
                    {lead.message && (
                      <div className="text-sm text-gray-600 mb-2 whitespace-pre-line">{lead.message}</div>
                    )}
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Показатели на главной</h2>
              <button onClick={saveStats} className="flex shrink-0 items-center justify-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-stretch">
              {stats.map((s, idx) => (
                <div
                  key={idx}
                  className="flex flex-col bg-white border border-gray-200 rounded-2xl p-5 min-h-[11rem] shadow-sm"
                >
                  <div
                    className="mb-4 min-h-[2.5rem] flex items-end justify-center border-b border-gray-100 pb-3"
                    aria-hidden
                  >
                    <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-blue-700 text-center leading-none">
                      {s.value.toLocaleString("ru-RU")}
                    </span>
                  </div>
                  <div className="mt-auto space-y-3 w-full">
                    <div>
                      <label className={lbl}>Значение</label>
                      <input
                        type="number"
                        value={s.value}
                        onChange={e => updateStat(idx, "value", parseInt(e.target.value, 10) || 0)}
                        className={inp + " text-center tabular-nums"}
                      />
                    </div>
                    <div>
                      <label className={lbl}>Подпись (как на сайте)</label>
                      <input type="text" value={s.label} onChange={e => updateStat(idx, "label", e.target.value)} className={inp} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* PARTNERS */}
        {tab === "partners" && (
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onPartnerDragEnd}>
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Партнёры ({partners.length})</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={resetPartners} className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Сбросить</button>
                <button type="button" onClick={addPartner} className="flex items-center gap-1.5 border border-gray-300 text-gray-500 hover:text-blue-700 hover:border-blue-300 px-3 py-2 rounded-full text-xs transition-colors"><Plus size={14} /> Добавить</button>
                <button type="button" onClick={savePartners} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800 transition-colors"><Save size={14} /> Сохранить</button>
              </div>
            </div>
            {partners.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Партнёров нет</p>
                <p className="text-gray-300 text-xs mt-1">Добавьте компании-партнёры для отображения на главной</p>
              </div>
            ) : (
            <div className="space-y-3">
              <SortableContext items={partners.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {partners.map((p, idx) => {
                const open = expandedPartnerId === p.id;
                const onSite = p.published !== false;
                return (
                <SortableAdminRow id={p.id} key={p.id}>
                {(handle) => (
                <div className={`rounded-2xl border bg-white transition-shadow ${open ? "border-blue-200 shadow-md ring-1 ring-blue-100/80" : "border-gray-200 hover:border-gray-300"}`}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedPartnerId(open ? null : p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedPartnerId(open ? null : p.id);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-2 sm:gap-3 p-3 sm:p-4 text-left"
                  >
                    {handle}
                    <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                    <div className="h-12 w-16 sm:h-14 sm:w-20 shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-slate-100 border border-slate-200/80">
                      <Building2 size={24} className="text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">{p.name || "Без названия"}</div>
                      <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-2">
                        <span>порядок {idx + 1}</span>
                        {!onSite && <span className="text-amber-700 font-medium">· скрыт</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="hidden lg:inline text-[10px] uppercase tracking-wide text-gray-400">На сайте</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={onSite}
                        title={onSite ? "На сайте" : "Скрыт"}
                        onClick={() => patchPartner(p.id, { published: !onSite })}
                        className={`relative h-7 w-12 rounded-full transition-colors ${onSite ? "bg-emerald-500" : "bg-gray-300"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${onSite ? "translate-x-5" : ""}`} />
                      </button>
                      <button type="button" title="Удалить партнёра" onClick={() => removePartner(p.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </div>

                  <AdminExpandPanel open={open}>
                  <div className="border-t border-gray-100 px-3 sm:px-5 pb-5 pt-4">
                    <div className="space-y-3">
                      <div>
                        <label className={lbl}>Название компании</label>
                        <input type="text" value={p.name} onChange={e => patchPartner(p.id, { name: e.target.value })} placeholder="Название компании" className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Сайт (в бегущей строке на главной, необязательно)</label>
                        <input
                          type="url"
                          inputMode="url"
                          value={p.url ?? ""}
                          onChange={e => patchPartner(p.id, { url: e.target.value })}
                          placeholder="https://example.com"
                          className={inp}
                        />
                        <p className="text-gray-400 text-[11px] mt-1">Если пусто - карточка в ленте не кликабельна</p>
                      </div>
                    </div>
                  </div>
                  </AdminExpandPanel>
                </div>
                )}
                </SortableAdminRow>
                );
              })}
            </SortableContext>
            </div>
            )}
          </div>
          </DndContext>
        )}
        {tab === "about" && (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">О компании</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAboutBlock(null)}
                  className="hidden sm:inline-flex items-center gap-1.5 border border-gray-200 text-gray-500 px-3 py-2 rounded-full text-xs hover:border-blue-300"
                >
                  Снять выделение блока
                </button>
                {aboutPage.bodyHtml.trim() ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Очистить кастомный HTML и вернуть визуальное редактирование секций?")) return;
                      setAboutPage((p) => ({ ...p, bodyHtml: "" }));
                      setAboutEditorNonce((n) => n + 1);
                      toast.info("HTML очищен — нажмите «Сохранить»");
                    }}
                    className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-2 rounded-full text-xs hover:border-amber-400"
                  >
                    К визуальному редактору
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAboutPage((p) => ({ ...p, bodyHtml: "<p>Вставьте HTML. Чтобы снова править секции, нажмите «К визуальному редактору».</p>" }));
                      setAboutEditorNonce((n) => n + 1);
                    }}
                    className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-2 rounded-full text-xs"
                  >
                    Режим HTML
                  </button>
                )}
                <button
                  type="button"
                  onClick={openAboutOnSite}
                  className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-300 px-3 py-2 rounded-full text-xs"
                >
                  <ExternalLink size={14} /> Открыть страницу
                </button>
                <button type="button" onClick={saveAboutPage} className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-800">
                  <Save size={14} /> Сохранить
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Ниже — та же страница, что на сайте. Кликните по секции (рамка), правьте текст на месте. Клик по серой полоске вокруг снимает выбор. Цифры сверху — из «Показатели».
            </p>
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-4">Герой (над цифрами)</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Подзаголовок (uppercase)</label>
                    <input
                      type="text"
                      value={aboutPage.heroKicker}
                      onChange={(e) => setAboutPage((p) => ({ ...p, heroKicker: e.target.value }))}
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Заголовок H1</label>
                    <input
                      type="text"
                      value={aboutPage.heroTitle}
                      onChange={(e) => setAboutPage((p) => ({ ...p, heroTitle: e.target.value }))}
                      className={inp}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-3">Фото производства (справа в блоке «Производство»)</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {aboutPage.productionImages.map((url, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAboutProductionImage(i)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs cursor-pointer hover:border-blue-400 hover:text-blue-600">
                    + фото
                    <input type="file" accept="image/*" className="hidden" onChange={addAboutProductionImage} />
                  </label>
                </div>
                <p className="text-gray-400 text-[11px]">Data URL, как в проектах; много крупных фото раздувают JSON.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-3">Синий блок внизу</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Заголовок</label>
                    <input
                      type="text"
                      value={aboutPage.ctaTitle}
                      onChange={(e) => setAboutPage((p) => ({ ...p, ctaTitle: e.target.value }))}
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Подзаголовок (пусто = адрес из настроек)</label>
                    <input
                      type="text"
                      value={aboutPage.ctaSubtitle}
                      onChange={(e) => setAboutPage((p) => ({ ...p, ctaSubtitle: e.target.value }))}
                      className={inp}
                    />
                  </div>
                </div>
              </div>
            </div>

            {aboutPage.bodyHtml.trim() ? (
              <div className="mt-8 border border-amber-200/80 bg-amber-50/50 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-2">Активен режим кастомного HTML — секции ниже на сайте скрыты</h3>
                <RichEditor
                  key={aboutEditorNonce}
                  content={aboutPage.bodyHtml}
                  onChange={(html) => setAboutPage((p) => ({ ...p, bodyHtml: html }))}
                  minHeight="min-h-[240px]"
                />
              </div>
            ) : (
              <div
                className="mt-8 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3 sm:p-4"
                onClick={() => setAboutBlock(null)}
                role="presentation"
              >
                <p className="text-xs text-slate-500 mb-2">Клик вне рамок секций снимает выбор.</p>
                <div className="border border-slate-200/80 bg-white overflow-hidden rounded-xl shadow-sm">
                  <AboutPageSections
                    mode="edit"
                    structured={mergeAboutStructured(aboutPage.structured)}
                    productionImages={aboutPage.productionImages}
                    edit={{
                      selectedBlock: aboutBlock,
                      onSelectBlock: (id) => setAboutBlock(id),
                      onPatch: patchAboutStructured,
                    }}
                  />
                </div>
              </div>
            )}
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
                  <div className="space-y-3 min-w-0">
                    <div>
                      <label className={lbl}>Телефон (на сайте и в ссылке tel:)</label>
                      <PhoneInput
                        value={settings.phone}
                        onChange={(v) => setSettings({ ...settings, phone: v })}
                        className={inp}
                      />
                      <p className="text-gray-400 text-[11px] mt-1">Формат: +7 и скобки подставляются при вводе</p>
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Email</label>
                    <input type="text" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} className={inp} />
                  </div>
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
                <h3 className="text-gray-900 font-semibold text-sm mb-4">Уведомления о заявках (сервер)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Telegram-бот и SMTP не хранятся в браузере. Задайте на машине с API (файл <code className="text-xs bg-gray-100 px-1 rounded">server/.env</code>):
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-2">
                  <li><code className="text-xs">TELEGRAM_BOT_TOKEN</code>, <code className="text-xs">TELEGRAM_CHAT_ID</code> - чат с заявками</li>
                  <li><code className="text-xs">SMTP_HOST</code>, <code className="text-xs">SMTP_PORT</code>, <code className="text-xs">SMTP_USER</code>, <code className="text-xs">SMTP_PASS</code> - письмо в офис (опционально <code className="text-xs">SMTP_FROM</code>)</li>
                  <li><code className="text-xs">LEAD_TO_EMAIL</code> - куда слать (если пусто - берётся email из настроек выше)</li>
                </ul>
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">Старые токены в JSON в БД не отдаются в публичный API; дублируйте в .env на сервере.</p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <h3 className="text-slate-900 font-semibold text-sm mb-1">Двухфакторная аутентификация (2FA)</h3>
                <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                  Код Google Authenticator / Яндекс Ключ. Вход в админку: пароль, затем 6-знаков. Настройка и проверка кода - через API; без сервера 2FA не заработает.
                </p>
                {settings.totpEnabled && !totpEnroll ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-emerald-800 font-medium">2FA включена</span>
                    <button
                      type="button"
                      onClick={() => {
                        void (async () => {
                          try {
                            await store.setSettings({ ...settings, totpEnabled: false, totpSecret: "" });
                            setSettings(store.getSettings());
                            loadAll();
                            toast.success("2FA отключена");
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : "Ошибка");
                          }
                        })();
                      }}
                      className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 hover:bg-amber-100"
                    >
                      Отключить 2FA
                    </button>
                  </div>
                ) : !totpEnroll ? (
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        const p = await store.adminTotpProvision();
                        if (!p) {
                          toast.error("Сервер не ответил. Проверьте API и VITE_ADMIN_API_KEY.");
                          return;
                        }
                        setTotpEnroll(p);
                        setTotpEnrollCode("");
                      })();
                    }}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Включить 2FA
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">Добавьте запись в приложении, затем введите текущий 6-знаков и нажмите «Активировать» (после - «Сохранить» в настройках не обязателен - мы сохраним в БД сразу).</p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpEnroll.keyuri)}`}
                        alt="QR 2FA"
                        width={180}
                        height={180}
                        className="shrink-0 rounded-xl border border-slate-200 bg-white"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 mb-1">Секрет (вручную, если нет сканера):</p>
                        <code className="block break-all rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-800">{totpEnroll.secret}</code>
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Код из приложения (6 цифр)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={totpEnrollCode}
                        onChange={e => setTotpEnrollCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className={inp + " font-mono text-lg tracking-widest"}
                        placeholder="000000"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void (async () => {
                            if (!totpEnroll) return;
                            const ok = await store.adminTotpVerifyPair(totpEnroll.secret, totpEnrollCode);
                            if (!ok) {
                              toast.error("Код неверен. Подождите новый 30 с или проверьте часы в телефоне.");
                              return;
                            }
                            try {
                              await store.setSettings({ ...settings, totpEnabled: true, totpSecret: totpEnroll.secret });
                              setSettings(store.getSettings());
                              setTotpEnroll(null);
                              setTotpEnrollCode("");
                              loadAll();
                              toast.success("2FA включена и сохранена");
                            } catch (e) {
                              toast.error(e instanceof Error ? e.message : "Ошибка сохранения");
                            }
                          })();
                        }}
                        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
                      >
                        Активировать 2FA
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTotpEnroll(null); setTotpEnrollCode(""); }}
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-gray-900 font-semibold text-sm mb-4">Аналитика</h3>
                <div><label className={lbl}>ID Яндекс.Метрики</label><input type="text" value={settings.yandexMetrikaId} onChange={e => setSettings({ ...settings, yandexMetrikaId: e.target.value })} placeholder="12345678" className={inp + " max-w-xs"} /></div>
              </div>
            </div>
          </div>
        )}
        {tab === "help" && <AdminHelp />}
      </div>
            </div>
      </div>
      </div>
      </div>
      {cropModal && (
        <ImageCropModal imageSrc={cropModal.src} onClose={() => setCropModal(null)} onCropped={applyCroppedImage} />
      )}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 py-3 pl-3 pr-4 shadow-[0_-6px_24px_rgba(15,23,42,0.06)] backdrop-blur-md md:left-56"
        role="region"
        aria-label="Быстрое сохранение"
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-1 sm:px-2">
          <span className="min-w-0 truncate text-xs text-gray-500 sm:text-sm">
            Сейчас: <span className="font-medium text-gray-800">{currentTabLabel}</span>
          </span>
          <button
            type="button"
            onClick={saveCurrentTab}
            disabled={!canQuickSave}
            className={`inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all sm:min-w-[12rem] sm:justify-center ${
              canQuickSave
                ? "bg-blue-700 text-white hover:bg-blue-800 active:scale-[0.98]"
                : "cursor-not-allowed bg-gray-200 text-gray-500"
            }`}
          >
            <Save size={16} className="shrink-0" />
            {canQuickSave ? "Сохранить в БД" : "Сохранение не требуется"}
          </button>
        </div>
      </div>
      <p className="text-center text-slate-400 text-xs py-4 pb-8 md:pl-56">Контент в PostgreSQL; вход в админку - только в этом браузере (флаг + 2FA при включении)</p>
    </div>
  );
}
