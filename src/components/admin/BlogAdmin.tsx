import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RichTextEditor } from "./RichTextEditor";
import { MediaField } from "./MediaPicker";

type Post = {
  id: string;
  author_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  read_time: string | null;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function BlogAdmin({ userId, isEditor }: { userId: string; isEditor: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("updated_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function blank(): Post {
    return { id: "", author_id: userId, slug: "", title: "", excerpt: "", content: "", cover_image_url: "", category: "", read_time: "", status: "draft", published_at: null, updated_at: "" };
  }

  async function save(p: Post) {
    const payload = {
      author_id: p.author_id || userId,
      slug: p.slug || slugify(p.title),
      title: p.title,
      excerpt: p.excerpt || null,
      content: p.content,
      cover_image_url: p.cover_image_url || null,
      category: p.category || null,
      read_time: p.read_time || null,
      status: p.status,
      published_at: p.status === "published" ? (p.published_at || new Date().toISOString()) : null,
    };
    if (p.id) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", p.id);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) return alert(error.message);
    }
    setEditing(null);
    load();
  }

  async function del(id: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return alert(error.message);
    load();
  }

  if (editing) return <PostEditor post={editing} onCancel={() => setEditing(null)} onSave={save} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-ink/60">{loading ? "Loading…" : `${posts.length} post${posts.length === 1 ? "" : "s"}`}</p>
        <button onClick={() => setEditing(blank())} className="bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.18em] hover:bg-ink">+ New post</button>
      </div>
      <div className="grid gap-3">
        {posts.map((p) => (
          <div key={p.id} className="bg-stone rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-sage/20 text-sage" : "bg-ink/10 text-ink/60"}`}>{p.status}</span>
                {p.category && <span className="text-[10px] uppercase tracking-[0.2em] text-ink/50">{p.category}</span>}
              </div>
              <div className="font-serif text-lg truncate">{p.title || "(untitled)"}</div>
              <div className="text-xs text-ink/50 truncate">/{p.slug}</div>
            </div>
            <div className="flex gap-3">
              {(isEditor || p.author_id === userId) && (
                <>
                  <button onClick={() => setEditing(p)} className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5">Edit</button>
                  <button onClick={() => del(p.id)} className="text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5">Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
        {!loading && posts.length === 0 && (
          <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">No posts yet — write your first one.</div>
        )}
      </div>
    </div>
  );
}

function PostEditor({ post, onCancel, onSave }: { post: Post; onCancel: () => void; onSave: (p: Post) => void }) {
  const [p, setP] = useState<Post>(post);
  const up = <K extends keyof Post>(k: K, v: Post[K]) => setP((x) => ({ ...x, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(p); }} className="bg-stone rounded-3xl p-8 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-serif text-2xl">{p.id ? "Edit post" : "New post"}</h3>
        <button type="button" onClick={onCancel} className="text-[11px] uppercase tracking-[0.22em] text-ink/50">Cancel</button>
      </div>
      <F label="Title"><input required value={p.title} onChange={(e) => up("title", e.target.value)} className={inp} /></F>
      <div className="grid md:grid-cols-2 gap-5">
        <F label="Slug (optional)"><input value={p.slug} onChange={(e) => up("slug", e.target.value)} placeholder="auto-from-title" className={inp} /></F>
        <F label="Category"><input value={p.category ?? ""} onChange={(e) => up("category", e.target.value)} className={inp} /></F>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <F label="Read time"><input value={p.read_time ?? ""} onChange={(e) => up("read_time", e.target.value)} placeholder="5 min read" className={inp} /></F>
        <div />
      </div>
      <F label="Excerpt"><textarea rows={2} value={p.excerpt ?? ""} onChange={(e) => up("excerpt", e.target.value)} className={`${inp} resize-none`} /></F>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">Content</label>
        <RichTextEditor value={p.content} onChange={(html) => up("content", html)} />
      </div>
      <MediaField label="Cover image" value={p.cover_image_url ?? ""} onChange={(v) => up("cover_image_url", v)} />
      <F label="Status">
        <div className="flex gap-2">
          {(["draft", "published"] as const).map((s) => (
            <button key={s} type="button" onClick={() => up("status", s)}
              className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] ${p.status === s ? "bg-sage text-cream" : "bg-cream border border-sage/20 text-ink/60"}`}>{s}</button>
          ))}
        </div>
      </F>
      <button type="submit" className="bg-sage text-cream px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] hover:bg-ink">Save</button>
    </form>
  );
}

const inp = "w-full bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage";
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">{label}</label>{children}</div>;
}