"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import createPostAction from '@/actions/createPostAction';

interface PendingUpload {
  file: File;
  previewUrl: string;
}

export default function CreatePost() {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<PendingUpload | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto resize textarea height
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }, [text]);

  const onPickImage = () => fileInputRef.current?.click();

  const onImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPendingImage({ file, previewUrl });
    }
  };

  const resetForm = () => {
    setText("");
    setPendingImage(null);
    setError(null);
  };

  const submit = useCallback(async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set('postInput', text.trim());
      if (pendingImage?.file) {
        formData.set('image', pendingImage.file);
      }
      await createPostAction(formData);
      resetForm();
    } catch (e: any) {
      setError(e.message || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  }, [text, pendingImage]);

  // Ctrl+Enter to post
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (text.trim()) submit();
    }
  };

  const initial = (user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase();

  return (
  <div className="surface-card glow hoverable p-6 max-w-2xl mx-auto mb-8 text-neutral-100 space-y-5">{/* Animation applied by parent wrapper */}
  <h2 className="typ-h">Create a Post</h2>

    <div className="flex items-center gap-4">
  <Avatar className="h-12 w-12 rounded-full overflow-hidden border border-neutral-700">
          <AvatarImage src={user?.imageUrl || ''} alt="Profile image" />
          <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>

  <div className="space-y-4">
        <textarea
          ref={textAreaRef}
          rows={3}
            placeholder="What's on your mind?"
          className="w-full bg-[#27272a] text-neutral-100 placeholder-neutral-500 border border-[#3f3f46] rounded-lg p-3 resize-none focus:ring-2 focus:ring-purple-600 focus:outline-none disabled:opacity-50"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={submitting}
          maxLength={4000}
        />
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        {pendingImage && (
          <div className="mt-3 relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage.previewUrl}
              alt="Preview"
              className="max-h-72 w-full object-cover rounded-lg border border-neutral-700"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute top-2 right-2 bg-black/60 text-neutral-200 text-xs px-2 py-1 rounded-md hover:bg-black/80"
            >Remove</button>
          </div>
        )}
      </div>

  <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={onPickImage}
            className="flex items-center gap-2 text-neutral-400 hover:text-purple-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded-md"
          >
            <ImageIcon size={16} /> <span className="hidden sm:inline">Add image</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim() || submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 focus-visible:ring-offset-[#18181b]"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={onImageSelected}
      />
    </div>
  );
}
