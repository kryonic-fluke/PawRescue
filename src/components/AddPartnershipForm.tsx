import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Props {
  onClose?: () => void;
}

const AddPartnershipForm: React.FC<Props> = ({ onClose }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    programType: 'Adoption',
    geographicFocus: '',
    beneficiaries: '',
    fundingSources: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (resp.ok) {
        toast.success('Partnership created');
        onClose && onClose();
      } else {
        const err = await resp.json();
        toast.error(err?.error || 'Failed to create partnership');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to create partnership');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <Label>Program Type</Label>
        <Select value={form.programType} onValueChange={(value) => setForm({ ...form, programType: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Adoption">Adoption</SelectItem>
            <SelectItem value="Vaccination">Vaccination</SelectItem>
            <SelectItem value="Sterilization">Sterilization</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Foster">Foster</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
      </div>
      <div>
        <Label>Geographic Focus</Label>
        <Input value={form.geographicFocus} onChange={(e) => setForm({ ...form, geographicFocus: e.target.value })} />
      </div>
      <div>
        <Label>Beneficiaries</Label>
        <Input value={form.beneficiaries} onChange={(e) => setForm({ ...form, beneficiaries: e.target.value })} />
      </div>
      <div>
        <Label>Funding Sources</Label>
        <Input value={form.fundingSources} onChange={(e) => setForm({ ...form, fundingSources: e.target.value })} />
      </div>
      <div>
        <Label>Contact Name</Label>
        <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
      </div>
      <div>
        <Label>Contact Email</Label>
        <Input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
      </div>
      <div>
        <Label>Contact Phone</Label>
        <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
      </div>
      <div>
        <Label>Website</Label>
        <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => onClose && onClose()}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Adding...' : 'Add Partnership'}</Button>
      </div>
    </div>
  );
};

export default AddPartnershipForm;
