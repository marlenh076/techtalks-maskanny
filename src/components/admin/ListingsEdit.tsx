'use client';

import React, { useState } from 'react';
import { X, Edit3, Save, Building, GraduationCap, Home } from 'lucide-react';
import { Submission } from '@/src/components/admin/RecentSubmissions';


interface EditListingModalProps<T extends Submission> {
  listing: T;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedListing: T) => void;
}

export default function EditListingModal<T extends Submission>({
  listing,
  isOpen,
  onClose,
  onSave,
}: EditListingModalProps<T>) {
  const [formData, setFormData] = useState<T>({ ...listing });
  const [isSubmitting, setIsSubmitting] = useState(false);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onSave(formData);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-brand-slate/15 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-slate/10 bg-brand-light/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy ring-1 ring-brand-navy/15">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-navy tracking-tight">Edit Listing Details</h3>
              <p className="text-[11px] text-brand-slate font-mono">Ref: {listing.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-slate hover:text-brand-navy hover:bg-brand-slate/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Property Name / Title</label>
            <input
              type="text"
              value={formData.property}
              onChange={(e) => setFormData({ ...formData, property: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-light/40 border border-brand-slate/20 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Submission['category'] })}
                className="w-full px-3 py-2.5 rounded-xl bg-brand-light/40 border border-brand-slate/20 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              >
                <option value="SHARED">Shared</option>
                <option value="STUDIO">Studio</option>
                <option value="DORM">Dorm</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Monthly Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-light/40 border border-brand-slate/20 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Host Name</label>
            <input
              type="text"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-brand-light/40 border border-brand-slate/20 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">Listing Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Submission['status'] })}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-light/40 border border-brand-slate/20 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            >
              <option value="Active">Active</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="pt-4 border-t border-brand-slate/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-brand-navy bg-white border border-brand-slate/20 hover:bg-brand-slate/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy/90 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
