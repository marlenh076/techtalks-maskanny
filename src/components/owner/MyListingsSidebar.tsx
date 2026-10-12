'use client';

import { useState } from 'react';
import type { OwnerSubmission } from '@/src/app/(dashboard)/owner/page';
import { Building2, DollarSign, Tag, Edit3, X, Check, Trash2, } from 'lucide-react';

interface MyListingsSidebarProps {
  listings: OwnerSubmission[];
  onUpdateListing: (updatedListing: OwnerSubmission) => void;
  onDeleteListing: (id: string) => void;
}

export function MyListingsSidebar({ listings, onUpdateListing }: MyListingsSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<OwnerSubmission>>({});

  const handleEditClick = (item: OwnerSubmission) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = (id: string) => {
    if (!editForm.property || !editForm.price) return;

    onUpdateListing({
      id,
      property: editForm.property,
      price: Number(editForm.price),
      category: editForm.category || 'DORM',
      host: editForm.host || 'You',
      status: editForm.status || 'Active',
      createdAt: editForm.createdAt || new Date().toISOString().split('T')[0],
      imageUrl: editForm.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=150&auto=format&fit=crop&q=80',
    });

    setEditingId(null);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-navy" />
          Manage Your Dorms & Properties ({listings.length})
        </h3>
        <p className="text-xs text-brand-slate mt-0.5">
          Review your student housing units and click edit to update titles, prices, or categories.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-slate/15 p-8 text-center shadow-sm">
          <p className="text-xs text-brand-slate">No properties found. Add a listing to get started.</p>
        </div>
      ) : (
        listings.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-brand-slate/15 p-5 shadow-sm transition-all">
            {editingId === item.id ? (

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-slate/10 pb-3">
                  <span className="text-xs font-bold text-brand-navy uppercase tracking-wide">
                    Editing Property: {item.id}
                  </span>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-brand-slate hover:text-brand-navy"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-slate uppercase mb-1">
                      Property Title
                    </label>
                    <input
                      type="text"
                      value={editForm.property || ''}
                      onChange={(e) => setEditForm({ ...editForm, property: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-brand-slate/30 text-xs font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-slate uppercase mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Price per Month ($)
                    </label>
                    <input
                      type="number"
                      value={editForm.price || ''}
                      onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-brand-slate/30 text-xs font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-slate uppercase mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Housing Category
                    </label>
                    <select
                      value={editForm.category || 'DORM'}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-brand-slate/30 text-xs font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20 bg-white"
                    >
                      <option value="DORM">DORM</option>
                      <option value="STUDIO">STUDIO</option>
                      <option value="APARTMENT">APARTMENT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-slate uppercase mb-1">
                      Status
                    </label>
                    <input
                      type="text"
                      disabled
                      value={editForm.status || 'Active'}
                      className="w-full px-3 py-2 rounded-xl border border-brand-slate/20 bg-brand-light text-xs text-brand-slate cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 text-xs font-bold text-brand-slate hover:bg-brand-slate/10 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(item.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-xl hover:bg-brand-navy/90 transition-all shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.property}
                    className="w-16 h-16 rounded-xl object-cover border border-brand-slate/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-navy/10 text-brand-navy rounded-full uppercase">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-brand-navy mt-1">{item.property}</h4>
                    <p className="text-xs text-brand-slate">${item.price} / month • Added {item.createdAt}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleEditClick(item)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-navy/5 text-brand-navy text-xs font-bold rounded-xl hover:bg-brand-navy hover:text-white transition-all shadow-sm self-end sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Property
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MyListingsSidebar;
