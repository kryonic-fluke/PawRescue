// src/pages/NGODashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { mockApi } from '@/services/mockApi';
import { NGO } from '@/types/ngo';

const NGODashboard: React.FC = () => {
  const [ngos, setNGOs] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NGO | null>(null);

  // Form state now includes position/lat/lng/type
  const [form, setForm] = useState<Omit<NGO, 'id'>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    description: '',
    services: '',
    website: '',
    // Added required/default fields
    position: [0, 0] as [number, number],
    lat: 0,
    lng: 0,
    type: 'ngo',
  });

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockApi.getNGOs();
      setNGOs(data);
    } catch (err) {
      console.error('Error fetching NGOs:', err);
      setError('Failed to load NGOs. Please try again later.');
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      description: '',
      services: '',
      website: '',
      position: [0, 0] as [number, number],
      lat: 0,
      lng: 0,
      type: 'ngo',
    });
    setOpen(true);
  };

  const handleEdit = (ngo: NGO) => {
    setEditing(ngo);
    setForm({
      name: ngo.name || '',
      phone: ngo.phone || '',
      email: ngo.email || '',
      address: ngo.address || '',
      city: ngo.city || '',
      description: ngo.description || '',
      services: ngo.services || '',
      website: ngo.website || '',
      position: ngo.position || ([0, 0] as [number, number]),
      lat: ngo.lat ?? 0,
      lng: ngo.lng ?? 0,
      type: ngo.type || 'ngo',
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this NGO?')) return;

    try {
      await mockApi.deleteNGO(id);
      setNGOs(prev => prev.filter(ngo => ngo.id !== id));
      toast.success('NGO deleted successfully');
    } catch (err) {
      console.error('Error deleting NGO:', err);
      toast.error('Failed to delete NGO');
    }
  };

  // Geocode helper using Nominatim (OpenStreetMap)
  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data && data[0]) {
        const { lat, lon } = data[0];
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          position: [parseFloat(lat), parseFloat(lon)] as [number, number],
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData: Omit<NGO, 'id'> = {
        ...form,
        // Ensure required fields have values
        position: form.position || ([0, 0] as [number, number]),
        lat: form.lat || 0,
        lng: form.lng || 0,
        type: form.type || 'ngo',
      };

      if (editing && editing.id) {
        const updated = await mockApi.updateNGO(editing.id, formData);
        if (updated) {
          setNGOs(prev => prev.map(n => n.id === updated.id ? updated : n));
          toast.success('NGO updated successfully');
        }
      } else {
        const newNGO = await mockApi.createNGO(formData);
        setNGOs(prev => [newNGO, ...prev]);
        toast.success('NGO created successfully');
      }
      setOpen(false);
    } catch (err) {
      console.error('Error saving NGO:', err);
      toast.error('Failed to save NGO');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchNGOs}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">NGO Dashboard</h1>
        <Button onClick={handleOpenCreate}>Add NGO</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ngos.map(ngo => (
          <Card key={ngo.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{ngo.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {ngo.city && <div>{ngo.city}</div>}
                {ngo.phone && <div>{ngo.phone}</div>}
                {ngo.email && <div>{ngo.email}</div>}
              </div>
            </CardHeader>
            <CardContent>
              {ngo.description && <p className="text-sm mb-3">{ngo.description}</p>}

              {ngo.services && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1">Services:</h4>
                  <div className="flex flex-wrap gap-1">
                    {ngo.services.split(',').map((service: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(ngo)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => ngo.id && handleDelete(ngo.id)}
                >
                  Delete
                </Button>
                {ngo.website && (
                  <a
                    href={ngo.website.startsWith('http') ? ngo.website : `https://${ngo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto"
                  >
                    <Button variant="ghost" size="sm">
                      Website
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit NGO' : 'Create New NGO'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="example.com"
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={async (e) => {
                  const address = e.target.value;
                  setForm(prev => ({ ...prev, address }));

                  // Optional: Auto-update coordinates when address changes
                  // Only geocode for longer addresses to avoid excessive requests
                  if (address.length > 5) {
                    const coords = await geocodeAddress(address);
                    if (coords) {
                      setForm(prev => ({
                        ...prev,
                        lat: coords.lat,
                        lng: coords.lng,
                        position: coords.position,
                      }));
                    }
                  }
                }}
              />
            </div>
            <div>
              <Label>Services (comma separated)</Label>
              <Input
                value={form.services}
                onChange={(e) => setForm({ ...form, services: e.target.value })}
                placeholder="e.g., Rescue, Adoption, Medical Care"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Hidden inputs for lat/lng (optional display for debugging) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input value={String(form.lat)} readOnly />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input value={String(form.lng)} readOnly />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editing ? 'Update' : 'Create'} NGO
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NGODashboard;
