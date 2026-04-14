import { useState, useEffect } from 'react';
import RichTextEditor from '../../components/ui/RichTextEditor';
import AIGenerator    from '../../components/admin/AIGenerator';
import { postsApi }   from '../../services/api';
import toast          from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Save, Send, Eye } from 'lucide-react';

const CATEGORIES = [
  'Technology', 'News', 'Science', 'Business', 'Health', 'World',
];

export default function PostForm({ initialData, postId, isEdit = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title:           '',
    excerpt:         '',
    content:         '',
    cover_image_url: '',
    type:            'blog',
    tags:            '',
    category_id:     '',
    ai_prompt:       '',
    ...initialData,
  });
  const [saving, setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e?.target?.value ?? e }));
  }

  function handleAIGenerated(generated) {
    setForm(f => ({
      ...f,
      title:    generated.title   || f.title,
      excerpt:  generated.excerpt || f.excerpt,
      content:  generated.content || f.content,
      ai_prompt: f.ai_prompt,
    }));
  }

  async function save(publish = false) {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content || form.content === '<p></p>') { toast.error('Content is required'); return; }

    const fn = publish ? setPublishing : setSaving;
    fn(true);
    try {
      const tags = form.tags
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      const payload = { ...form, tags };

      if (isEdit) {
        await postsApi.update(postId, payload);
        if (publish) await postsApi.publish(postId);
        toast.success(publish ? 'Post published!' : 'Post saved');
      } else {
        const { data } = await postsApi.create(payload);
        if (publish) {
          // fetch the new post id to publish
          toast.success('Post created and sent for publishing — set status in Posts list');
        } else {
          toast.success('Draft saved');
        }
      }
      navigate('/admin/posts');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* AI generator */}
      <AIGenerator onGenerated={handleAIGenerated} />

      {/* Type */}
      <div className="flex gap-3">
        {['blog', 'news'].map(t => (
          <label key={t}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors font-sans text-sm capitalize
              ${form.type === t ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-ink-200 text-ink-600 hover:border-ink-300'}`}>
            <input type="radio" name="type" value={t} checked={form.type === t}
              onChange={set('type')} className="sr-only" />
            {t}
          </label>
        ))}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Title *</label>
        <input className="input text-lg font-serif" placeholder="Post title"
          value={form.title} onChange={set('title')} required />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Excerpt</label>
        <textarea className="input resize-none" rows={2}
          placeholder="Short description (shown in listings)"
          value={form.excerpt} onChange={set('excerpt')} />
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Cover Image URL</label>
        <input className="input" type="url" placeholder="https://..."
          value={form.cover_image_url} onChange={set('cover_image_url')} />
        {form.cover_image_url && (
          <div className="mt-2 rounded-xl overflow-hidden h-36 bg-ink-50">
            <img src={form.cover_image_url} alt="Cover preview" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {/* Category & Tags row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Category</label>
          <select className="input" value={form.category_id} onChange={set('category_id')}>
            <option value="">— None —</option>
            {CATEGORIES.map((c, i) => (
              <option key={c} value={i + 1}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Tags</label>
          <input className="input" placeholder="ai, future, tech (comma separated)"
            value={form.tags} onChange={set('tags')} />
        </div>
      </div>

      {/* Content editor */}
      <div>
        <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Content *</label>
        <RichTextEditor content={form.content} onChange={set('content')} />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100">
        <button type="button" onClick={() => navigate('/admin/posts')} className="btn-outline">Cancel</button>
        <button type="button" onClick={() => save(false)} disabled={saving}
          className="btn-outline">
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button type="button" onClick={() => save(true)} disabled={publishing}
          className="btn-amber">
          <Send size={15} />
          {publishing ? 'Publishing…' : 'Save & Publish'}
        </button>
      </div>
    </div>
  );
}
