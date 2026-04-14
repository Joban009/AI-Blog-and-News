import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminApi } from '../../services/api';
import PostForm from '../../components/admin/PostForm';
import pool from '../../services/api';

export default function AdminEditPost() {
  const { id }          = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch post by id from admin posts list
    import('../../services/api').then(({ adminApi }) => {
      adminApi.listPosts({}).then(({ data }) => {
        const found = data.posts.find(p => String(p.id) === String(id));
        if (found) {
          // We need full post content; fetch via public API by slug
          import('../../services/api').then(({ postsApi }) => {
            postsApi.get(found.slug).then(({ data: pd }) => {
              const p = pd.post;
              setPost({
                ...p,
                tags: p.tags?.map(t => t.name).join(', ') || '',
              });
              setLoading(false);
            });
          });
        } else {
          setLoading(false);
        }
      });
    });
  }, [id]);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-ink-100 rounded w-1/3" />
      <div className="h-64 bg-ink-100 rounded-2xl" />
    </div>
  );

  if (!post) return (
    <div className="text-center py-20 text-ink-400 font-sans">Post not found.</div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">Edit Post</h1>
        <p className="font-sans text-sm text-ink-500 mt-0.5 truncate max-w-xl">{post.title}</p>
      </div>
      <PostForm initialData={post} postId={id} isEdit />
    </div>
  );
}
