import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!data) throw notFound();
    return { post: data };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title} — Araya Veda` },
          { name: "description", content: loaderData.post.excerpt ?? "" },
          { property: "og:title", content: loaderData.post.title },
        ]
      : [],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const { post: initial } = Route.useLoaderData();

  const { data: post } = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      return data ?? initial;
    },
    initialData: initial,
  });

  if (!post) return null;

  return (
    <article className="pt-32 md:pt-40 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/blog" className="text-[10px] uppercase tracking-[0.3em] text-gold mb-6 block">
          ← Journal
        </Link>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-sage/70 mb-4">
          {post.category && <span>{post.category}</span>}
          {post.read_time && <span>· {post.read_time}</span>}
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-light leading-[1.05] mb-8">
          {post.title}
        </h1>
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-2xl mb-10"
          />
        )}
        <div className="prose-content space-y-5 text-ink/75 leading-relaxed">
          {post.content.split(/\n{2,}/).map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
