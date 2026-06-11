'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Customer {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { orders: number };
}

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/customers');
      const json = await res.json();
      setCustomers(Array.isArray(json) ? json : []);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const handleToggleActive = async (customer: Customer) => {
    try {
      await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !customer.isActive }),
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, isActive: !c.isActive } : c
        )
      );
      toast.success(`Customer ${!customer.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update customer');
    }
  };

  const parseAddress = (addr: string | null): string => {
    if (!addr) return 'No address provided';
    try {
      const a = JSON.parse(addr);
      return [a.address, a.city, a.state, a.zipCode, a.country].filter(Boolean).join(', ');
    } catch {
      return addr;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Customers</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/60">
          <Users className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-500">No customers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-100 hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-zinc-500">Customer</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 hidden sm:table-cell">Role</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-center hidden md:table-cell">Orders</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="border-zinc-50 hover:bg-zinc-50/50 cursor-pointer"
                    onClick={() => setDetailCustomer(customer)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {customer.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-zinc-500">{customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="secondary"
                        className={
                          customer.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }
                      >
                        {customer.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <span className="text-sm text-zinc-600">
                        {customer._count?.orders ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-zinc-500">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={customer.isActive}
                        onCheckedChange={() => handleToggleActive(customer)}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Customer detail dialog */}
      <Dialog open={!!detailCustomer} onOpenChange={() => setDetailCustomer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {detailCustomer && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-white font-semibold">
                  {(detailCustomer.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-zinc-900">
                    {detailCustomer.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-zinc-500">{detailCustomer.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Role</p>
                  <p className="font-medium text-zinc-900 capitalize">{detailCustomer.role}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Orders</p>
                  <p className="font-medium text-zinc-900">
                    {detailCustomer._count?.orders ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Phone</p>
                  <p className="font-medium text-zinc-900">{detailCustomer.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Joined</p>
                  <p className="font-medium text-zinc-900">
                    {new Date(detailCustomer.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-zinc-500 mb-1">Address</p>
                <p className="text-sm text-zinc-900">{parseAddress(detailCustomer.address)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}