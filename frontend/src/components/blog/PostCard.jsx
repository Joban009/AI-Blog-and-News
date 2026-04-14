import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Eye, MessageCircle, Sparkles } from 'lucide-react';

export default function PostCard({ post, featured = false }) {
  const date = post.published_at
    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
    : 'Draft';

  if (featured) {
    return (
      <Link to={`/posts/${post.slug}`} className="group block card hover:shadow-lg transition-shadow duration-300">
        {post.cover_image_url && (
          <div className="aspect-[16/7] overflow-hidden">
            <img src={post.cover_image_url} alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`badge ${post.type === 'news' ? 'badge-amber' : 'badge-gray'}`}>
              {post.type}
            </span>
            {post.category && <span className="text-xs text-ink-500 font-sans">{post.category}</span>}
            {post.is_ai_generated && (
              <span className="badge badge-green"><Sparkles size={10} className="mr-0.5" />AI</span>
            )}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink-900 mb-3 group-hover:text-amber-700 transition-colors leading-snug">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-ink-600 font-sans text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-ink-400 font-sans">
            <span>{post.author}</span>
            <span>·</span>
            <span>{date}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Eye size={12} />{post.views ?? 0}</span>
            <span className="flex items-center gap-1"><MessageCircle size={12} />{post.comment_count ?? 0}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/posts/${post.slug}`} className="group flex gap-4 py-5 border-b border-ink-100 last:border-0 hover:bg-ink-50 rounded-xl px-2 transition-colors">
      {post.cover_image_url && (
        <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
          <img src={post.cover_image_url} alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge ${post.type === 'news' ? 'badge-amber' : 'badge-gray'}`}>{post.type}</span>
          {post.is_ai_generated && <Sparkles size={11} className="text-green-600" />}
        </div>
        <h3 className="font-serif font-semibold text-ink-900 leading-snug mb-1 group-hover:text-amber-700 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-ink-400 font-sans">
          <span>{post.author}</span>
          <span>·</span>
          <span>{date}</span>
          <span className="flex items-center gap-1"><Eye size={11} />{post.views ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}
