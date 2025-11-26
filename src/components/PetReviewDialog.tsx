import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Props {
  petId: string | number;
}

const PetReviewDialog: React.FC<Props> = ({ petId }) => {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (open) load();
  }, [open]);

  const load = () => {
    try {
      const key = `pet_reviews_${petId}`;
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      setReviews(data || []);
    } catch (e) { console.error(e); }
  };

  const submit = () => {
    if (!title && !body) return toast({ description: 'Please add a title or review', variant: 'destructive' });
    const key = `pet_reviews_${petId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const entry = { id: Date.now(), rating, title, body, date: new Date().toISOString() };
    existing.unshift(entry);
    localStorage.setItem(key, JSON.stringify(existing));
    toast({ description: 'Review saved' });
    setTitle(''); setBody(''); setRating(5);
    load();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Reviews</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pet Reviews</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
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
            {reviews.length === 0 && <div className="text-sm text-muted-foreground">No reviews yet — be the first!</div>}
            {reviews.map(r => (
              <div key={r.id} className="p-3 border rounded">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.title || `${r.rating} stars`}</div>
                  <div className="text-sm text-muted-foreground">{new Date(r.date).toLocaleDateString()}</div>
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

export default PetReviewDialog;
