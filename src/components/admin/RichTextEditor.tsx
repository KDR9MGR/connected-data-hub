import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";

export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "underline text-sage" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg my-4" } }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4" } },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const Btn = ({ on, active, children }: { on: () => void; active?: boolean; children: React.ReactNode }) => (
    <button type="button" onClick={on} className={`px-2.5 py-1 text-xs rounded ${active ? "bg-sage text-cream" : "bg-cream border border-sage/20 text-ink/70 hover:border-sage"}`}>{children}</button>
  );

  function addLink() {
    const url = prompt("URL", editor!.getAttributes("link").href ?? "https://");
    if (url === null) return;
    if (url === "") return editor!.chain().focus().unsetLink().run();
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }
  function addImage() {
    const url = prompt("Image URL");
    if (url) editor!.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="border border-sage/20 rounded-2xl bg-cream overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-sage/10 bg-stone/50">
        <Btn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>B</Btn>
        <Btn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>I</Btn>
        <Btn on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>S</Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</Btn>
        <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>• List</Btn>
        <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>1. List</Btn>
        <Btn on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>❝</Btn>
        <Btn on={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>{"</>"}</Btn>
        <Btn on={addLink} active={editor.isActive("link")}>Link</Btn>
        <Btn on={addImage}>Image</Btn>
        <Btn on={() => editor.chain().focus().undo().run()}>↶</Btn>
        <Btn on={() => editor.chain().focus().redo().run()}>↷</Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}