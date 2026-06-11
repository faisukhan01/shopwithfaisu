'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, Trash2, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string | null;
  userName: string | null;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

const filterTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
];

export default function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews');
      const json = await res.json();
      setReviews(Array.isArray(json) ? json : json.reviews || []);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    return true;
  });

  const handleToggleApprove = async (review: Review) => {
    try {
      await fetch(`/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !review.isApproved }),
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, isApproved: !r.isApproved } : r
        )
      );
      toast.success(`Review ${!review.isApproved ? 'approved' : 'rejected'}`);
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/reviews/${deleteTarget.id}`, { method: 'DELETE' });
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-zinc-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Reviews</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {filtered.length} review{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/60">
          <MessageSquare className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-500">No reviews found</p>
          <p className="text-xs text-zinc-400 mt-1">
            {filter !== 'all'
              ? 'Try changing the filter'
              : 'Reviews will appear here once submitted'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-100 hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-zinc-500">Product</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 hidden sm:table-cell">Reviewer</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-center">Rating</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 hidden md:table-cell">Comment</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-center">Status</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((review) => (
                  <TableRow key={review.id} className="border-zinc-50 hover:bg-zinc-50/50">
                    <TableCell>
                      <span className="text-sm font-medium text-zinc-900">
                        {review.productName || review.productId}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-zinc-600">
                        {review.userName || 'Anonymous'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        {renderStars(review.rating)}
                        <span className="text-[11px] text-zinc-400">{review.rating}/5</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="max-w-[250px]">
                        {review.title && (
                          <p className="text-sm font-medium text-zinc-900">{review.title}</p>
                        )}
                        <p className="text-xs text-zinc-500 truncate">{review.comment}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-zinc-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={review.isApproved}
                        onCheckedChange={() => handleToggleApprove(review)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(review)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review by &quot;{deleteTarget?.userName || 'Anonymous'}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}