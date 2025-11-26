import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  ngoId: number;
}

const ReviewDialog: React.FC<Props> = ({ ngoId }) => {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (open) fetchReviews();
  }, [open]);

  const fetchReviews = async () => {
    try {
      const resp = await fetch(`/api/ngos/reviews?ngoId=${ngoId}`);
      if (resp.ok) {
        const data = await resp.json();
        setReviews(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submit = async () => {
    try {
      const resp = await fetch('/api/ngos/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngoId, rating, title, body })
      });
      if (resp.ok) {
        toast.success('Review submitted');
        setTitle(''); setBody(''); setRating(5);
        fetchReviews();
      } else {
        toast.error('Failed to submit review');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit review');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Reviews</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reviews</DialogTitle>
          <DialogDescription>Read and write reviews for this NGO</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm">Rating</label>
            <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="w-full">
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} stars</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm">Review</label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={submit}>Submit Review</Button>
          </div>

          <div className="mt-4 space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-3 border rounded">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.title || `${r.rating} stars`}</div>
                  <div className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                {r.body && <p className="text-sm text-muted-foreground mt-2">{r.body}</p>}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
