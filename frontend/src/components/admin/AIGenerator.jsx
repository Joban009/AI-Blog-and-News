import { useState } from 'react';
import { aiApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Sparkles, Wand2, Loader2, ChevronDown } from 'lucide-react';

export default function AIGenerator({ onGenerated }) {
  const [prompt, setPrompt]   = useState('');
  const [type, setType]       = useState('blog');
  const [tone, setTone]       = useState('professional');
  const [length, setLength]   = useState('medium');
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

  async function generate() {
    if (!prompt.trim()) { toast.error('Enter a topic or prompt'); return; }
    setLoading(true);
    try {
      const { data } = await aiApi.generate({ prompt, type, tone, length });
      onGenerated(data.generated);
      toast.success('Content generated! Review and edit before publishing.');
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100 transition-colors">
        <div className="flex items-center gap-2 text-amber-700 font-sans font-medium text-sm">
          <Sparkles size={16} />
          Generate with Gemini AI
        </div>
        <ChevronDown size={16} className={`text-amber-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-amber-200 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-sans font-medium text-amber-800 mb-1.5">
              Topic / Prompt *
            </label>
            <textarea
              className="input text-sm resize-none"
              rows={3}
              placeholder="e.g. The future of renewable energy in developing countries"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-sans font-medium text-amber-800 mb-1.5">Type</label>
              <select className="input text-sm" value={type} onChange={e => setType(e.target.value)}>
                <option value="blog">Blog</option>
                <option value="news">News</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans font-medium text-amber-800 mb-1.5">Tone</label>
              <select className="input text-sm" value={tone} onChange={e => setTone(e.target.value)}>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="journalistic">Journalistic</option>
                <option value="academic">Academic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans font-medium text-amber-800 mb-1.5">Length</label>
              <select className="input text-sm" value={length} onChange={e => setLength(e.target.value)}>
                <option value="short">Short (~300w)</option>
                <option value="medium">Medium (~600w)</option>
                <option value="long">Long (~1200w)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="btn-amber w-full justify-center">
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
              : <><Wand2 size={15} /> Generate Content</>}
          </button>

          <p className="text-xs text-amber-700 font-sans opacity-80">
            AI-generated content will fill the Title, Excerpt, and Content fields. Review carefully before publishing.
          </p>
        </div>
      )}
    </div>
  );
}
