'use client';

import { useState, useMemo } from 'react';
import { OwnerSidebar } from '@/src/components/owner/OwnerSidebar';
import { MetricCard } from '@/src/components/admin/MetricCard';
import { RecentSubmissions, type Submission } from '@/src/components/owner/RecentSubmissions';
import { AnalyticsChart } from '@/src/components/owner/AnalyticsChart';
import { CategoryDonuts } from '@/src/components/owner/CategoryDonuts';
import { useRouter } from 'next/navigation';

import {
  Plus,
  Trash2,
  Edit3,
  X,
  Star,
  Search,
  BarChart3,
  User,
  Bell,
  Sliders,
  Shield,
  Globe,
  HelpCircle,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  BedDouble,
  Wifi,
  Zap,
  Droplets,
  Wind,
  Flame,
  Utensils,
  WashingMachine,
  Car,
  ShieldCheck,
  ArrowUpDown,
  Home,
  BookOpen,
  Image as ImageIcon,
  Upload,
  Check,
  Send,
  Bath,
  Maximize,
  ChevronDown,
  ChevronUp,
  Save,
  Rocket
} from 'lucide-react';


export interface OwnerSubmission extends Submission {
  createdAt: string;

  description: string;

  propertyType:
  | 'Apartment'
  | 'Dorm'
  | 'Studio'
  | 'Shared Apartment';

  roomType:
  | 'Private Room'
  | 'Shared Room'
  | 'Studio';

  location: string;
  city: string;
  area: string;
  university: string;
  distanceToUniversity: string;

  beds: number;
  bathrooms: number;
  rooms: number;
  size: number;

  furnishing:
  | 'Furnished'
  | 'Unfurnished';

  availableRooms: number;

  amenities: string[];

  photos: string[];
}
export interface StudentFeedback {
  id: string;
  studentName: string;
  propertyTitle: string;
  rating: number;
  comment: string;
  date: string;
}

const MOCK_OWNER_SUBMISSIONS: OwnerSubmission[] = [
  {
    id: 'prop-001',
    property: 'Campus View Student Residence',
    host: 'You',
    price: 400,
    status: 'Active',
    category: 'STUDIO',
    createdAt: '2026-10-01',

    description:
      'Modern and fully furnished student accommodation located close to the university campus.',

    propertyType: 'Studio',
    roomType: 'Studio',

    location: 'Hamra Street',
    city: 'Beirut',
    area: 'Hamra',
    university: 'Lebanese University',
    distanceToUniversity: '7 min',

    beds: 1,
    bathrooms: 1,
    rooms: 1,
    size: 35,
    furnishing: 'Furnished',
    availableRooms: 1,

    amenities: [
      'Wi-Fi',
      'Electricity',
      'Water',
      'Air Conditioning',
      'Kitchen',
      'Laundry',
      'Security',
      'Elevator',
      'Study Area',
    ],

    photos: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900',
    ],

    imageUrl:
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500',
  },

  {
    id: 'prop-002',
    property: 'University Heights Residence',
    host: 'You',
    price: 420,
    status: 'Pending Review',
    category: 'DORM',
    createdAt: '2026-09-29',

    description:
      'Comfortable student residence with shared facilities and easy access to universities.',

    propertyType: 'Dorm',
    roomType: 'Private Room',

    location: 'Bliss Street',
    city: 'Beirut',
    area: 'Hamra',
    university: 'Lebanese University',
    distanceToUniversity: '10 min',

    beds: 1,
    bathrooms: 2,
    rooms: 4,
    size: 70,
    furnishing: 'Furnished',
    availableRooms: 2,

    amenities: [
      'Wi-Fi',
      'Electricity',
      'Water',
      'Heating',
      'Kitchen',
      'Laundry',
      'Parking',
      'Security',
    ],

    photos: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900',
    ],

    imageUrl:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
  },

  {
    id: 'prop-003',
    property: 'Green Residence Dorm',
    host: 'You',
    price: 390,
    status: 'Active',
    category: 'DORM',
    createdAt: '2026-09-15',

    description:
      'Affordable student dorm with essential amenities and a quiet environment for studying.',

    propertyType: 'Dorm',
    roomType: 'Shared Room',

    location: 'Verdun',
    city: 'Beirut',
    area: 'Verdun',
    university: 'Lebanese University',
    distanceToUniversity: '12 min',

    beds: 2,
    bathrooms: 2,
    rooms: 5,
    size: 90,
    furnishing: 'Furnished',
    availableRooms: 3,

    amenities: [
      'Wi-Fi',
      'Water',
      'Electricity',
      'Air Conditioning',
      'Kitchen',
      'Study Area',
      'Security',
      'Balcony',
    ],

    photos: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900',
      'https://images.unsplash.com/photo-1560185008-b033106af5c3?w=900',
    ],

    imageUrl:
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500',
  },
];

const MOCK_FEEDBACKS: StudentFeedback[] = [
  {
    id: 'fb-001',
    studentName: 'Alex Johnson',
    propertyTitle: 'Campus View Studio #101',
    rating: 5,
    comment:
      'Amazing studio! Very close to the building and super quiet for studying.',
    date: '2026-10-01',
  },
  {
    id: 'fb-002',
    studentName: 'Sarah Miller',
    propertyTitle: 'Green Residence Dorm B',
    rating: 4,
    comment:
      'Great location and friendly roommates. Good internet speed.',
    date: '2026-09-28',
  },
  {
    id: 'fb-003',
    studentName: 'Liam Davis',
    propertyTitle: 'Campus View Studio #101',
    rating: 5,
    comment:
      'The landlord is very responsive and helpful. Highly recommended!',
    date: '2026-09-10',
  },
];

type DateFilterPreset = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [submissions, setSubmissions] =
    useState<OwnerSubmission[]>(MOCK_OWNER_SUBMISSIONS);

  const [feedbacks, setFeedbacks] =
    useState<StudentFeedback[]>(MOCK_FEEDBACKS);

  const [reviewSearch, setReviewSearch] = useState('');

  const [reviewRating, setReviewRating] = useState('all');

  const [datePreset, setDatePreset] =
    useState<DateFilterPreset>('ALL');


  const filteredReviews = useMemo(() => {
    const reviews = [
      {
        name: "Sarah M.",
        rating: 5,
        listing: "Modern Student Apartment",
        date: "2026-09-28",
        comment:
          "Very clean and comfortable place. The location is perfect and close to the university.",
      },
      {
        name: "John K.",
        rating: 4,
        listing: "University Residence",
        date: "2026-09-25",
        comment:
          "Good location and the apartment was exactly as described.",
      },
      {
        name: "Maya R.",
        rating: 5,
        listing: "Cozy Student Room",
        date: "2026-09-21",
        comment:
          "I really enjoyed my stay. The room was clean and the neighborhood was quiet.",
      },
      {
        name: "Ali H.",
        rating: 4,
        listing: "Downtown Student Apartment",
        date: "2026-09-18",
        comment:
          "Nice apartment with good facilities. Very convenient for students.",
      },
    ];

    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return reviews.filter((review) => {
      const search = reviewSearch.toLowerCase().trim();

      const matchesSearch =
        review.name.toLowerCase().includes(search) ||
        review.listing.toLowerCase().includes(search) ||
        review.comment.toLowerCase().includes(search);

      const matchesRating =
        reviewRating === "all" ||
        review.rating === Number(reviewRating);

      const reviewDate = new Date(review.date);
      const reviewDay = new Date(
        reviewDate.getFullYear(),
        reviewDate.getMonth(),
        reviewDate.getDate()
      );

      const diffInDays = Math.floor(
        (today.getTime() - reviewDay.getTime()) /
        (1000 * 60 * 60 * 24)
      );

      let matchesDate = true;

      if (datePreset === "TODAY") {
        matchesDate = diffInDays === 0;
      } else if (datePreset === "WEEK") {
        matchesDate = diffInDays >= 0 && diffInDays <= 7;
      } else if (datePreset === "MONTH") {
        matchesDate = diffInDays >= 0 && diffInDays <= 30;
      }

      return (
        matchesSearch &&
        matchesRating &&
        matchesDate
      );
    });
  }, [reviewSearch, reviewRating, datePreset]);


  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState('Overview');

  const [editingListing, setEditingListing] =
    useState<OwnerSubmission | null>(null);

  const [expandedAmenities, setExpandedAmenities] =
    useState<string | null>(null);

  const [deleteListingId, setDeleteListingId] =
    useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleAddListing = (newListing: OwnerSubmission) => {
    setSubmissions((prev) => [newListing, ...prev]);
  };

  const handleUpdateListing = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!editingListing) return;

    const formData = new FormData(e.currentTarget);

    const updated: OwnerSubmission = {
      ...editingListing,

      property:
        formData.get('property') as string,

      price:
        Number(formData.get('price')),

      category:
        formData.get('category') as
        | 'STUDIO'
        | 'DORM'
        | 'SHARED',

      description:
        formData.get('description') as string,

      propertyType:
        formData.get('propertyType') as OwnerSubmission['propertyType'],

      roomType:
        formData.get('roomType') as OwnerSubmission['roomType'],

      location:
        formData.get('location') as string,

      city:
        formData.get('city') as string,

      area:
        formData.get('area') as string,

      university:
        formData.get('university') as string,

      distanceToUniversity:
        formData.get('distanceToUniversity') as string,

      beds:
        Number(formData.get('beds')),

      bathrooms:
        Number(formData.get('bathrooms')),

      rooms:
        Number(formData.get('rooms')),

      size:
        Number(formData.get('size')),

      furnishing:
        formData.get('furnishing') as
        | 'Furnished'
        | 'Unfurnished',

      availableRooms:
        Number(formData.get('availableRooms')),

      amenities:
        formData.getAll('amenities') as string[],
    };

    setSubmissions((prev) =>
      prev.map((item) =>
        item.id === updated.id
          ? updated
          : item
      )
    );

    setEditingListing(null);

    triggerSuccess(
      'Listing updated successfully.'
    );
  };
  const dateFilteredSubmissions = useMemo(() => {
    if (datePreset === 'ALL') return submissions;

    const now = new Date();

    return submissions.filter((item) => {
      const itemDate = new Date(item.createdAt);

      const diffInDays = Math.floor(
        (now.getTime() - itemDate.getTime()) /
        (1000 * 3600 * 24)
      );

      if (datePreset === 'WEEK') {
        return diffInDays >= 0 && diffInDays <= 7;
      }

      if (datePreset === 'MONTH') {
        return diffInDays >= 0 && diffInDays <= 30;
      }

      return true;
    });
  }, [submissions, datePreset]);

  const dateFilteredFeedbacks = useMemo(() => {
    if (datePreset === 'ALL') return feedbacks;

    const now = new Date('2026-10-01');

    return feedbacks.filter((fb) => {
      const fbDate = new Date(fb.date);

      const diffInDays = Math.floor(
        (now.getTime() - fbDate.getTime()) /
        (1000 * 3600 * 24)
      );

      if (datePreset === 'TODAY') return diffInDays === 0;
      if (datePreset === 'WEEK') return diffInDays <= 7;
      if (datePreset === 'MONTH') return diffInDays <= 30;

      return true;
    });
  }, [feedbacks, datePreset]);

  const averageRating = useMemo(() => {
    if (dateFilteredFeedbacks.length === 0) {
      return '0.0';
    }

    const sum = dateFilteredFeedbacks.reduce(
      (acc, curr) => acc + curr.rating,
      0
    );

    return (
      sum / dateFilteredFeedbacks.length
    ).toFixed(1);
  }, [dateFilteredFeedbacks]);

  const totalListings = dateFilteredSubmissions.length;

  const activeListings = dateFilteredSubmissions.filter(
    (s) => s.status === 'Active'
  ).length;

  const pendingListings = dateFilteredSubmissions.filter(
    (s) => s.status === 'Pending Review'
  ).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-light text-brand-navy w-full overflow-x-hidden relative">


      <OwnerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 flex flex-col min-w-0">

        <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1 flex flex-col">


          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold shadow-sm flex items-center justify-between shrink-0">
              <span>✓ {successMessage}</span>

              <button
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}


          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-brand-slate/15 shadow-sm shrink-0">

            <div>
              <h2 className="text-xl font-bold text-brand-navy">
                {activeTab === 'My Listings'
                  ? 'My Properties & Dorms'
                  : activeTab === 'Add Listing'
                    ? 'Add New Listing'
                    : activeTab === 'Review' ||
                      activeTab === 'Reviews' ||
                      activeTab === 'Review Submissions'
                      ? 'Student Feedbacks & Reviews'
                      : activeTab.startsWith('Settings')
                        ? 'Owner Settings'
                        : 'Welcome back, Owner!'}
              </h2>

              <p className="text-xs text-brand-slate mt-1">
                {activeTab === 'My Listings'
                  ? 'Manage, edit or delete your student housing units and dorms.'
                  : activeTab === 'Add Listing'
                    ? 'Add your property details to make it available to students on Maskanny.'
                    : activeTab === 'Review' ||
                      activeTab === 'Reviews' ||
                      activeTab === 'Review Submissions'
                      ? 'Read ratings and reviews left by students for your properties.'
                      : activeTab === 'Settings - Profile'
                        ? 'Update your personal details, contact number, and avatar.'
                        : activeTab === 'Settings - Notifications'
                          ? 'Choose how and when you want to receive alerts and summaries.'
                          : activeTab === 'Settings - Listing Preferences'
                            ? 'Set default rules and display preferences for your properties.'
                            : activeTab === 'Settings - Security'
                              ? 'Manage your password, two-factor authentication, and active sessions.'
                              : activeTab === 'Settings - Appearance'
                                ? 'Customize your display theme and language settings.'
                                : activeTab === 'Settings - Support'
                                  ? 'Get in touch with Maskanny support or browse FAQs.'
                                  : 'Here is what is happening with your properties.'}
              </p>
            </div>


            <div className="flex items-center gap-3 self-start sm:self-auto">

              <button
                type="button"
                onClick={() => { router.push("/owner/BoostingPlan") }
                }
                className="inline-flex items-center justify-center gap-2
      bg-brand-gold text-brand-navy px-4 py-2.5 rounded-xl
      text-sm font-bold hover:bg-brand-gold/90
      transition-all shadow-sm"
              >
                <Rocket className="w-4 h-4" />
                Boost Now
              </button>

              {!activeTab.startsWith('Settings') &&
                activeTab !== 'Add Listing' && (
                  <div className="inline-flex p-1 bg-brand-light rounded-xl border border-brand-slate/10 text-xs font-semibold">

                    {[
                      { id: 'ALL', label: 'All Time' },
                      { id: 'TODAY', label: 'Today' },
                      { id: 'WEEK', label: 'This Week' },
                      { id: 'MONTH', label: 'This Month' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() =>
                          setDatePreset(preset.id as DateFilterPreset)
                        }
                        className={`px-3 py-1.5 rounded-lg transition-all ${datePreset === preset.id
                          ? 'bg-white text-brand-navy shadow-sm font-bold'
                          : 'text-brand-slate hover:text-brand-navy'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>


          {activeTab.startsWith('Settings') && (
            <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm p-3">

              <div className="flex flex-wrap gap-2">

                {[
                  {
                    id: 'Settings - Profile',
                    label: 'Profile & Account',
                    icon: User,
                  },
                  {
                    id: 'Settings - Notifications',
                    label: 'Notifications',
                    icon: Bell,
                  },
                  {
                    id: 'Settings - Listing Preferences',
                    label: 'Listing',
                    icon: Sliders,
                  },
                  {
                    id: 'Settings - Security',
                    label: 'Security',
                    icon: Shield,
                  },
                  {
                    id: 'Settings - Appearance',
                    label: 'Appearance',
                    icon: Globe,
                  },
                  {
                    id: 'Settings - Support',
                    label: 'Support',
                    icon: HelpCircle,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setActiveTab(item.id)
                      }
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === item.id
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'text-brand-slate hover:bg-brand-light hover:text-brand-navy'
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}

              </div>
            </div>
          )}



          {activeTab === 'Overview' ||
            activeTab === 'Dashboard' ? (



            <div className="space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                <MetricCard
                  title="Total Listings"
                  value={totalListings.toString()}
                  change="+2"
                  isPositive={true}
                />

                <MetricCard
                  title="Active Listings"
                  value={activeListings.toString()}
                  change="Published"
                  isPositive={true}
                />

                <MetricCard
                  title="Pending Listings"
                  value={pendingListings.toString()}
                  subtitle={
                    pendingListings > 0
                      ? 'Under review'
                      : 'All active'
                  }
                  isPositive={true}
                />

                <MetricCard
                  title="Reviews & Average"
                  value={`${dateFilteredFeedbacks.length}`}
                  change={`${averageRating} ★`}
                  isPositive={true}
                />

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2">
                  <AnalyticsChart />
                </div>

                <div>
                  <CategoryDonuts />
                </div>

              </div>

              <div className="space-y-2">

                <div className="flex items-center justify-between">

                  <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                    Your Properties & Admin Status
                  </h3>

                </div>

                <RecentSubmissions
                  activeStatus="ALL"
                  activeCategory="ALL"
                  submissions={dateFilteredSubmissions}
                />

              </div>

            </div>

          ) : activeTab === 'My Listings' ? (



            <div className="space-y-5">


              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  onClick={() => setActiveTab('Add Listing')}
                  className="inline-flex items-center justify-center gap-2
        bg-brand-navy text-white px-4 py-2.5 rounded-xl
        text-sm font-bold hover:bg-brand-navy/90
        transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add New Listing
                </button>

              </div>




              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                {dateFilteredSubmissions.map((item) => (

                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border
          border-brand-slate/15 shadow-sm overflow-hidden
          hover:shadow-md transition-all text-sm"
                  >



                    <div className="relative h-52">

                      <img
                        src={item.imageUrl}
                        alt={item.property}
                        className="w-full h-full object-cover"
                      />



                      <span
                        className={`absolute top-3 left-3 px-3 py-1
              rounded-full text-[11px] text-sm font-bold ${item.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                          }`}
                      >
                        {item.status}
                      </span>



                      <span className="absolute top-3 right-3 px-3 py-1
              rounded-full bg-white/90 backdrop-blur-sm
              text-[11px] font-bold text-brand-navy"
                      >
                        {item.propertyType}
                      </span>

                    </div>




                    <div className="p-5 space-y-4">



                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <h4 className="text-base font-bold text-brand-navy">
                            {item.property}
                          </h4>

                          <div className="flex items-center gap-1.5 mt-1">

                            <MapPin className="w-3.5 h-3.5 text-brand-slate" />

                            <span className="text-xs text-brand-slate">
                              {item.area}, {item.city}
                            </span>

                          </div>
                        </div>

                        <div className="text-right shrink-0">

                          <p className="text-lg font-bold text-brand-navy">
                            ${item.price}
                          </p>

                          <p className="text-[11px] text-brand-slate">
                            / month
                          </p>

                        </div>

                      </div>




                      <div className="flex items-center justify-between
              rounded-xl bg-brand-light/60 p-3"
                      >

                        <div>
                          <p className="text-xs text-brand-slate">
                            Nearby University
                          </p>

                          <p className="text-xs font-semibold text-brand-navy mt-0.5">
                            {item.university}
                          </p>
                        </div>

                        <span className="text-xs font-bold text-brand-navy">
                          {item.distanceToUniversity}
                        </span>

                      </div>




                      <div className="grid grid-cols-4 gap-2">

                        <div className="rounded-xl border
                border-brand-slate/10 p-3 text-center"
                        >
                          <BedDouble className="w-4 h-4 mx-auto text-brand-slate" />

                          <p className="text-sm font-bold text-brand-navy mt-1">
                            {item.beds}
                          </p>

                          <p className="text-xs text-brand-slate">
                            Beds
                          </p>
                        </div>


                        <div className="rounded-xl border
                border-brand-slate/10 p-3 text-center"
                        >
                          <Bath className="w-4 h-4 mx-auto text-brand-slate" />

                          <p className="text-sm font-bold text-brand-navy mt-1">
                            {item.bathrooms}
                          </p>

                          <p className="text-xs text-brand-slate">
                            Baths
                          </p>
                        </div>


                        <div className="rounded-xl border
                border-brand-slate/10 p-3 text-center"
                        >
                          <Home className="w-4 h-4 mx-auto text-brand-slate" />

                          <p className="text-sm font-bold text-brand-navy mt-1">
                            {item.rooms}
                          </p>

                          <p className="text-xs text-brand-slate">
                            Rooms
                          </p>
                        </div>


                        <div className="rounded-xl border
                border-brand-slate/10 p-3 text-center"
                        >
                          <Maximize className="w-4 h-4 mx-auto text-brand-slate" />

                          <p className="text-sm font-bold text-brand-navy mt-1">
                            {item.size}
                          </p>

                          <p className="text-xs text-brand-slate">
                            m²
                          </p>
                        </div>

                      </div>




                      <div>

                        <p className="text-sm font-bold text-brand-navy mb-2">
                          Amenities
                        </p>

                        <div className="flex flex-wrap gap-1.5">

                          {(expandedAmenities === item.id
                            ? item.amenities
                            : item.amenities.slice(0, 5)
                          ).map((amenity) => (

                            <span
                              key={amenity}
                              className="px-2.5 py-1 rounded-lg bg-brand-light
      text-brand-slate text-xs font-medium"
                            >
                              {amenity}
                            </span>

                          ))}


                          {item.amenities.length > 5 && (

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAmenities(
                                  expandedAmenities === item.id
                                    ? null
                                    : item.id
                                )
                              }
                              className="inline-flex items-center gap-1
      px-2.5 py-1 rounded-lg
      bg-brand-navy/5 text-brand-navy
      text-[10px] font-bold hover:bg-brand-navy/10"
                            >

                              {expandedAmenities === item.id ? (
                                <>
                                  Show Less
                                  <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  +{item.amenities.length - 5} more
                                  <ChevronDown className="w-3 h-3" />
                                </>
                              )}

                            </button>

                          )}

                        </div>

                      </div>



                      <div className="flex items-center justify-between
              border-t border-brand-slate/10 pt-4"
                      >

                        <div>
                          <p className="text-sm text-brand-slate">
                            Available Rooms
                          </p>

                          <p className="text-xs font-bold text-brand-navy mt-0.5">
                            {item.availableRooms} available
                          </p>
                        </div>

                        <p className="text-xs text-brand-slate">
                          {item.furnishing}
                        </p>

                      </div>




                      <div className="flex gap-2 pt-1">

                        <button
                          type="button"
                          onClick={() => setEditingListing(item)}
                          className="flex-1 inline-flex items-center
                justify-center gap-1.5 px-3 py-2.5
                bg-brand-light text-brand-navy
                hover:bg-brand-slate/10 rounded-xl
                text-xs font-bold transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Listing
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteListingId(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5
  bg-rose-50 text-rose-600 hover:bg-rose-100
  rounded-xl text-xs font-bold transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          ) : activeTab === 'Add Listing' ? (
            <div className="w-full max-w-5xl mx-auto space-y-6">


              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  const formData = new FormData(e.currentTarget);

                  const newListing: OwnerSubmission = {
                    id: `prop-${Date.now().toString().slice(-3)}`,
                    property: formData.get("property") as string,
                    host: "You",
                    price: Number(formData.get("price")),
                    status: "Pending Review",
                    category: formData.get("category") as
                      | "STUDIO"
                      | "DORM"
                      | "SHARED",
                    createdAt: new Date().toISOString().split("T")[0],
                    imageUrl:
                      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=150&auto=format&fit=crop&q=80",

                    description: formData.get("description") as string,
                    propertyType: formData.get("propertyType") as
                      | "Apartment"
                      | "Dorm"
                      | "Studio"
                      | "Shared Apartment",
                    roomType: formData.get("roomType") as
                      | "Private Room"
                      | "Shared Room"
                      | "Studio",

                    location: formData.get("location") as string,
                    city: formData.get("city") as string,
                    area: formData.get("area") as string,
                    university: formData.get("university") as string,
                    distanceToUniversity: formData.get("distanceToUniversity") as string,

                    beds: Number(formData.get("beds")),
                    bathrooms: Number(formData.get("bathrooms")),
                    rooms: Number(formData.get("rooms")),
                    size: Number(formData.get("size")),

                    furnishing: formData.get("furnishing") as
                      | "Furnished"
                      | "Unfurnished",

                    availableRooms: Number(formData.get("availableRooms")),

                    amenities: formData.getAll("amenities") as string[],

                    photos: [],
                  };

                  handleAddListing(newListing);

                  setActiveTab("My Listings");

                  triggerSuccess("Listing added and submitted for review.");
                }}
                className="w-full max-w-4xl mx-auto space-y-6"
              >

                <div className="xl:col-span-2 space-y-6">


                  <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm">
                    <div className="p-6 border-b border-brand-slate/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-brand-navy" />
                        </div>

                        <div>
                          <h3 className="font-bold text-brand-navy">
                            Basic Information
                          </h3>
                          <p className="text-xs text-brand-slate mt-0.5">
                            Tell students about your accommodation
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">


                      <div>
                        <label className="block text-sm font-semibold text-brand-navy mb-2">
                          Listing Title <span className="text-red-500">*</span>
                        </label>

                        <input
                          type="text"
                          name="property"
                          required
                          placeholder="e.g. Modern Student Apartment Near Lebanese University"
                          className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    bg-white text-sm text-brand-navy
    placeholder:text-brand-slate/50
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                        />
                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Property Type <span className="text-red-500">*</span>
                          </label>

                          <select
                            name="propertyType"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    bg-white text-sm text-brand-navy
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                          >
                            <option value="">Select property type</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Dorm">Dorm</option>
                            <option value="Studio">Studio</option>
                            <option value="Shared Apartment">Shared Apartment</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Room Type
                          </label>

                          <select
                            name="roomType"
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    bg-white text-sm text-brand-navy
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                          >
                            <option value="">Select room type</option>
                            <option value="Private Room">Private Room</option>
                            <option value="Shared Room">Shared Room</option>
                            <option value="Studio">Studio</option>
                          </select>
                        </div>

                      </div>


                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-brand-navy">
                            Description <span className="text-red-500">*</span>
                          </label>

                          <span className="text-xs text-brand-slate">
                            0 / 1000
                          </span>
                        </div>

                        <textarea
                          name="description"
                          required
                          rows={5}
                          placeholder="Describe the accommodation, its surroundings, nearby universities, transportation, and anything students should know..."
                          className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    bg-white text-sm text-brand-navy resize-none
    placeholder:text-brand-slate/50
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                        />
                      </div>

                    </div>
                  </div>


                  <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm">

                    <div className="p-6 border-b border-brand-slate/10">
                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-brand-gold" />
                        </div>

                        <div>
                          <h3 className="font-bold text-brand-navy">
                            Location
                          </h3>

                          <p className="text-xs text-brand-slate mt-0.5">
                            Help students understand where the property is located
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="p-6 space-y-5">


                      <div>
                        <label className="block text-sm font-semibold text-brand-navy mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="location"
                          required
                          placeholder="Street, building name, or area"
                          className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    text-sm text-brand-navy
    placeholder:text-brand-slate/50
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                        />
                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            City
                          </label>

                          <select
                            name="city"
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    bg-white text-sm text-brand-navy
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                          >
                            <option value="">Select city</option>
                            <option value="Beirut">Beirut</option>
                            <option value="Tripoli">Tripoli</option>
                            <option value="Sidon">Sidon</option>
                            <option value="Jounieh">Jounieh</option>
                            <option value="Zahle">Zahle</option>
                            <option value="Baalbek">Baalbek</option>
                            <option value="Byblos">Byblos</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Area
                          </label>

                          <input
                            type="text"
                            name="area"
                            placeholder="e.g. Hamra, Cola, Badaro..."
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    text-sm text-brand-navy
    placeholder:text-brand-slate/50
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                          />
                        </div>

                      </div>


                      <div>
                        <label className="block text-sm font-semibold text-brand-navy mb-2">
                          Nearby University
                        </label>

                        <select
                          name="university"
                          className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    bg-white text-sm text-brand-navy
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                        >
                          <option value="">Select university</option>
                          <option value="Lebanese University">Lebanese University</option>
                          <option value="American University of Beirut">
                            American University of Beirut
                          </option>
                          <option value="Lebanese American University">
                            Lebanese American University
                          </option>
                          <option value="University of Saint Joseph">
                            University of Saint Joseph
                          </option>
                          <option value="Beirut Arab University">
                            Beirut Arab University
                          </option>
                          <option value="Notre Dame University">
                            Notre Dame University
                          </option>
                          <option value="Other">Other</option>
                        </select>
                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Distance to University
                          </label>

                          <div className="relative">
                            <input
                              type="number"
                              name="distanceToUniversity"
                              min="0"
                              step="0.1"
                              placeholder="e.g. 1.5"
                              className="w-full px-4 py-3 pr-16 rounded-xl border border-brand-slate/20
    text-sm text-brand-navy
    placeholder:text-brand-slate/50
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                            />

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-brand-slate">
                              km
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>


                  <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm">

                    <div className="p-6 border-b border-brand-slate/10">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>

                        <div>
                          <h3 className="font-bold text-brand-navy">
                            Pricing & Availability
                          </h3>

                          <p className="text-xs text-brand-slate mt-0.5">
                            Set the rent and availability details
                          </p>
                        </div>

                      </div>

                    </div>

                    <div className="p-6 space-y-5">

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Monthly Rent <span className="text-red-500">*</span>
                          </label>

                          <div className="relative">

                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-brand-slate">
                              $
                            </span>

                            <input
                              type="number"
                              name="price"
                              required
                              min="0"
                              placeholder="500"
                              className="w-full pl-9 pr-4 py-3 rounded-xl border border-brand-slate/20
    text-sm text-brand-navy
    placeholder:text-brand-slate/50
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                            />

                          </div>
                        </div>


                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Security Deposit
                          </label>

                          <div className="relative">

                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-brand-slate">
                              $
                            </span>

                            <input
                              type="number"
                              min="0"
                              placeholder="500"
                              className="w-full pl-9 pr-4 py-3 rounded-xl border border-brand-slate/20
                    text-sm text-brand-navy
                    placeholder:text-brand-slate/50
                    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
                    focus:border-brand-navy transition"
                            />

                          </div>
                        </div>


                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Available Rooms
                          </label>

                          <input
                            type="number"
                            name="availableRooms"
                            min="1"
                            placeholder="2"
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    text-sm text-brand-navy
    placeholder:text-brand-slate/50
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20
    focus:border-brand-navy transition"
                          />
                        </div>

                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Available From
                          </label>

                          <input
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
                  text-sm text-brand-navy
                  focus:outline-none focus:ring-2 focus:ring-brand-navy/20
                  focus:border-brand-navy transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Listing Status
                          </label>

                          <select
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
                  bg-white text-sm text-brand-navy
                  focus:outline-none focus:ring-2 focus:ring-brand-navy/20
                  focus:border-brand-navy transition"
                          >
                            <option>Available</option>
                            <option>Almost Full</option>
                            <option>Full</option>
                          </select>
                        </div>

                      </div>

                    </div>
                  </div>


                  <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm">

                    <div className="p-6 border-b border-brand-slate/10">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                          <BedDouble className="w-5 h-5 text-purple-600" />
                        </div>

                        <div>
                          <h3 className="font-bold text-brand-navy">
                            Property Details
                          </h3>

                          <p className="text-xs text-brand-slate mt-0.5">
                            Add information about the accommodation
                          </p>
                        </div>

                      </div>

                    </div>

                    <div className="p-6">

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">


                        <div>
                          <label className="block text-xs font-semibold text-brand-slate mb-2">
                            Beds
                          </label>

                          <input
                            type="number"
                            name="beds"
                            min="1"
                            placeholder="2"
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    text-sm text-brand-navy
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                          />
                        </div>


                        <div>
                          <label className="block text-xs font-semibold text-brand-slate mb-2">
                            Bathrooms
                          </label>

                          <input
                            type="number"
                            name="bathrooms"
                            min="1"
                            placeholder="1"
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    text-sm text-brand-navy
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                          />
                        </div>


                        <div>
                          <label className="block text-xs font-semibold text-brand-slate mb-2">
                            Max Guests
                          </label>

                          <input
                            type="number"
                            min="1"
                            placeholder="2"
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
                  text-sm text-brand-navy
                  focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                          />
                        </div>


                        <div>
                          <label className="block text-xs font-semibold text-brand-slate mb-2">
                            Size
                          </label>

                          <div className="relative">

                            <input
                              type="number"
                              name="size"
                              min="0"
                              placeholder="80"
                              className="w-full px-4 py-3 pr-12 rounded-xl border border-brand-slate/20
    text-sm text-brand-navy
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                            />

                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-slate">
                              m²
                            </span>

                          </div>
                        </div>

                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Furnishing
                          </label>

                          <select
                            name="furnishing"
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
    bg-white text-sm text-brand-navy
    focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                          >
                            <option value="Furnished">Fully Furnished</option>
                            <option value="Unfurnished">Unfurnished</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">
                            Preferred Tenant
                          </label>

                          <select
                            className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
                  bg-white text-sm text-brand-navy
                  focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                          >
                            <option>Any</option>
                            <option>Male</option>
                            <option>Female</option>
                          </select>
                        </div>

                      </div>

                    </div>
                  </div>


                  <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm">

                    <div className="p-6 border-b border-brand-slate/10">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Wifi className="w-5 h-5 text-blue-600" />
                        </div>

                        <div>
                          <h3 className="font-bold text-brand-navy">
                            Amenities
                          </h3>

                          <p className="text-xs text-brand-slate mt-0.5">
                            Select the amenities available at this property
                          </p>
                        </div>

                      </div>

                    </div>

                    <div className="p-6">

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                        {[
                          { label: "Wi-Fi", icon: Wifi },
                          { label: "Electricity", icon: Zap },
                          { label: "Water", icon: Droplets },
                          { label: "Air Conditioning", icon: Wind },
                          { label: "Heating", icon: Flame },
                          { label: "Kitchen", icon: Utensils },
                          { label: "Laundry", icon: WashingMachine },
                          { label: "Parking", icon: Car },
                          { label: "Security", icon: ShieldCheck },
                          { label: "Elevator", icon: ArrowUpDown },
                          { label: "Balcony", icon: Home },
                          { label: "Study Area", icon: BookOpen },
                        ].map((amenity) => {
                          const Icon = amenity.icon;

                          return (
                            <label
                              key={amenity.label}
                              className="flex items-center gap-3 p-3.5 rounded-xl
                    border border-brand-slate/15 cursor-pointer
                    hover:border-brand-navy/30 hover:bg-brand-light/40
                    transition group"
                            >

                              <input
                                type="checkbox"
                                name="amenities"
                                value={amenity.label}
                                className="w-4 h-4 rounded border-brand-slate/30
    text-brand-navy focus:ring-brand-navy/20"
                              />
                              <Icon className="w-4 h-4 text-brand-slate group-hover:text-brand-navy transition" />

                              <span className="text-xs font-medium text-brand-navy">
                                {amenity.label}
                              </span>

                            </label>
                          );
                        })}

                      </div>

                    </div>
                  </div>


                  <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm">

                    <div className="p-6 border-b border-brand-slate/10">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-orange-600" />
                        </div>

                        <div>
                          <h3 className="font-bold text-brand-navy">
                            Property Photos
                          </h3>

                          <p className="text-xs text-brand-slate mt-0.5">
                            Add clear photos to attract more students
                          </p>
                        </div>

                      </div>

                    </div>

                    <div className="p-6">

                      <label
                        className="flex flex-col items-center justify-center
              min-h-[220px] rounded-2xl border-2 border-dashed
              border-brand-slate/20 bg-brand-light/20
              hover:border-brand-navy/30 hover:bg-brand-light/40
              transition cursor-pointer"
                      >

                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                          <Upload className="w-6 h-6 text-brand-navy" />
                        </div>

                        <p className="text-sm font-semibold text-brand-navy">
                          Upload property photos
                        </p>

                        <p className="text-xs text-brand-slate mt-1">
                          Drag & drop or click to browse
                        </p>

                        <p className="text-[11px] text-brand-slate/70 mt-3">
                          PNG, JPG or WEBP · Maximum 5MB per image
                        </p>

                        <input
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                        />

                      </label>

                    </div>
                  </div>

                </div>


                <div className="xl:col-span-3 flex items-center justify-end gap-3
        bg-white border border-brand-slate/15 rounded-2xl p-4 shadow-sm">

                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-5 py-2.5 rounded-xl border border-brand-slate/20
          text-sm font-semibold text-brand-slate
          hover:bg-brand-light transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-navy
          text-sm font-semibold text-white
          hover:bg-brand-navy/90 transition
          flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Publish Listing
                  </button>

                </div>

              </form>
            </div>
          ) : activeTab === 'Review' ||
            activeTab === 'Reviews' ||
            activeTab === 'Review Submissions' ? (

            <div className="space-y-5">


              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                <div className="rounded-2xl border border-brand-slate/10 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium text-brand-slate">
                    Average Rating
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div>
                      <span className="text-3xl font-bold text-brand-navy">
                        4.8
                      </span>
                      <span className="text-xs text-brand-slate"> / 5</span>
                    </div>

                    <div className="flex gap-0.5 text-brand-gold">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-current"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-brand-slate">
                    Based on 48 reviews
                  </p>
                </div>


                <div className="rounded-2xl border border-brand-slate/10 bg-white p-5 shadow-sm lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-brand-navy">
                      Rating Distribution
                    </h2>

                    <BarChart3 className="h-4 w-4 text-brand-slate" />
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { stars: 5, count: 32, percentage: 67 },
                      { stars: 4, count: 10, percentage: 21 },
                      { stars: 3, count: 4, percentage: 8 },
                      { stars: 2, count: 1, percentage: 2 },
                      { stars: 1, count: 1, percentage: 2 },
                    ].map((rating) => (
                      <div
                        key={rating.stars}
                        className="flex items-center gap-2.5"
                      >
                        <div className="flex w-12 items-center gap-1 text-xs text-brand-slate">
                          <span>{rating.stars}</span>

                          <Star className="h-3 w-3 fill-brand-gold text-brand-gold" />
                        </div>

                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-light">
                          <div
                            className="h-full rounded-full bg-brand-gold"
                            style={{
                              width: `${rating.percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-6 text-right text-xs font-medium text-brand-slate">
                          {rating.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              <div className="rounded-2xl border border-brand-slate/10 bg-white p-3 shadow-sm">
                <div className="flex flex-col gap-2.5 md:flex-row">

                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-slate" />

                    <input
                      type="text"
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                      placeholder="Search reviews..."
                      className="w-full rounded-xl border border-brand-slate/15 bg-brand-light/30 py-2 pl-9 pr-3 text-xs text-brand-navy outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    />
                  </div>


                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="rounded-xl border border-brand-slate/15 bg-white px-3 py-2 text-xs text-brand-navy outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20">

                    <option value="all">All ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>


              <div className="space-y-3">

                {filteredReviews.map((review, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-brand-slate/10 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                          {review.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </div>

                        <div>

                          <h3 className="text-sm font-semibold text-brand-navy">
                            {review.name}
                          </h3>


                          <div className="mt-1 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${star <= review.rating
                                  ? "fill-brand-gold text-brand-gold"
                                  : "text-brand-slate/20"
                                  }`}
                              />
                            ))}
                          </div>


                          <p className="mt-2 text-xs leading-5 text-brand-slate">
                            {review.comment}
                          </p>
                        </div>
                      </div>


                      <span className="shrink-0 text-[11px] font-medium text-brand-slate">
                        {review.date}
                      </span>
                    </div>


                    <div className="mt-3 border-t border-brand-slate/10 pt-3">
                      <p className="text-[11px] text-brand-slate">
                        Listing
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-brand-navy">
                        {review.listing}
                      </p>
                    </div>
                  </div>
                ))}
                {filteredReviews.length === 0 && (
                  <div className="rounded-2xl border border-brand-slate/10 bg-white p-8 text-center">
                    <Search className="mx-auto h-6 w-6 text-brand-slate/50" />

                    <p className="mt-2 text-sm font-semibold text-brand-navy">
                      No reviews found
                    </p>

                    <p className="mt-1 text-xs text-brand-slate">
                      Try a different search term or rating.
                    </p>
                  </div>
                )}
              </div>
            </div>

          ) : activeTab === 'Settings - Profile' ? (
            <div className="bg-white rounded-2xl border border-brand-slate/10 p-6 shadow-sm max-w-4xl mx-auto w-full">

              <div className="flex items-center gap-3 pb-5 border-b border-brand-slate/10">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-brand-navy">
                    Profile & Account
                  </h3>
                  <p className="text-xs text-brand-slate mt-0.5">
                    Manage your personal and contact information.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerSuccess("Profile updated successfully.");
                }}
                className="mt-6 space-y-6"
              >

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-navy text-white flex items-center justify-center text-base font-bold">
                    OW
                  </div>

                  <div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          triggerSuccess("Avatar selected successfully.");
                        }
                      }}
                    />

                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-light border border-brand-slate/10 text-sm font-semibold text-brand-navy cursor-pointer hover:bg-brand-slate/10 active:scale-[0.98] transition"
                    >
                      <Upload className="w-4 h-4" />
                      Change Avatar
                    </label>

                    <p className="mt-1.5 text-xs text-brand-slate">
                      JPG, PNG or GIF • Max 2MB
                    </p>
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      defaultValue="Owner Workspace"
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      Email Address
                    </label>

                    <input
                      type="email"
                      defaultValue="owner@maskanny.com"
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      placeholder="+961 XX XXX XXX"
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      Account Type
                    </label>

                    <input
                      type="text"
                      value="Property Owner"
                      disabled
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/10 bg-brand-light text-sm text-brand-slate"
                    />
                  </div>
                </div>


                <div className="flex justify-end border-t border-brand-slate/10 pt-5">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 active:scale-[0.98] transition shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

          ) : activeTab === "Settings - Notifications" ? (

            <div className="bg-white rounded-2xl border border-brand-slate/10 p-6 shadow-sm max-w-4xl mx-auto w-full">

              <div className="flex items-center gap-3 pb-5 border-b border-brand-slate/10">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-brand-navy">
                    Notifications
                  </h3>
                  <p className="text-xs text-brand-slate mt-0.5">
                    Choose which updates you want to receive.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerSuccess("Notification preferences saved.");
                }}
                className="mt-6 space-y-3"
              >
                {[
                  {
                    label: "New student inquiries",
                    desc: "Get notified when a student contacts you.",
                  },
                  {
                    label: "New reviews & ratings",
                    desc: "Receive an alert when a student leaves feedback.",
                  },
                  {
                    label: "Listing status updates",
                    desc: "Know when your listing is approved or rejected.",
                  },
                  {
                    label: "Weekly performance summary",
                    desc: "Receive a weekly overview of your listings.",
                  },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center justify-between gap-5 p-4 rounded-xl border border-brand-slate/10 hover:bg-brand-light/40 transition cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">
                        {item.label}
                      </p>

                      <p className="mt-1 text-xs text-brand-slate">
                        {item.desc}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 accent-brand-navy cursor-pointer shrink-0"
                    />
                  </label>
                ))}

                <div className="flex justify-end border-t border-brand-slate/10 pt-5">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 active:scale-[0.98] transition shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>

          ) : activeTab === "Settings - Listing Preferences" ? (

            <div className="bg-white rounded-2xl border border-brand-slate/10 p-6 shadow-sm max-w-4xl mx-auto w-full">
              {/* Header */}
              <div className="flex items-center gap-3 pb-5 border-b border-brand-slate/10">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-brand-navy">
                    Listing Preferences
                  </h3>
                  <p className="text-xs text-brand-slate mt-0.5">
                    Configure your default listing settings.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerSuccess("Listing preferences saved.");
                }}
                className="mt-6 space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      Default Listing Visibility
                    </label>

                    <select className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 bg-white text-sm text-brand-navy outline-none focus:border-brand-navy transition">
                      <option>Public</option>
                      <option>Private</option>
                      <option>Admin Review Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      Preferred Contact Channel
                    </label>

                    <select className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 bg-white text-sm text-brand-navy outline-none focus:border-brand-navy transition">
                      <option>In-App Chat & WhatsApp</option>
                      <option>In-App Chat Only</option>
                      <option>Phone / WhatsApp Only</option>
                    </select>
                  </div>
                </div>

                {[
                  {
                    title: "Automatically mark listing as full",
                    description:
                      "Automatically update the status when capacity is reached.",
                  },
                  {
                    title: "Accept student inquiries",
                    description:
                      "Allow students to contact you through Maskanny.",
                  },
                ].map((item) => (
                  <label
                    key={item.title}
                    className="flex items-center justify-between gap-5 p-4 rounded-xl border border-brand-slate/10 hover:bg-brand-light/40 transition cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">
                        {item.title}
                      </p>

                      <p className="text-xs text-brand-slate mt-1">
                        {item.description}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 accent-brand-navy cursor-pointer"
                    />
                  </label>
                ))}

                <div className="flex justify-end border-t border-brand-slate/10 pt-5">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 active:scale-[0.98] transition shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Save Settings
                  </button>
                </div>
              </form>
            </div>

          ) : activeTab === "Settings - Security" ? (

            <div className="bg-white rounded-2xl border border-brand-slate/10 p-6 shadow-sm max-w-4xl mx-auto w-full">

              <div className="flex items-center gap-3 pb-5 border-b border-brand-slate/10">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-brand-navy">
                    Security
                  </h3>
                  <p className="text-xs text-brand-slate mt-0.5">
                    Keep your Maskanny account secure.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  triggerSuccess("Security settings updated.");
                }}
                className="mt-6 space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      Current Password
                    </label>

                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      New Password
                    </label>

                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition"
                    />
                  </div>
                </div>

                <label className="flex items-center justify-between gap-5 p-4 rounded-xl border border-brand-slate/10 hover:bg-brand-light/40 transition cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">
                      Two-Factor Authentication
                    </p>

                    <p className="text-xs text-brand-slate mt-1">
                      Add an extra layer of security to your account.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-brand-navy cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between p-4 rounded-xl bg-brand-light/40 border border-brand-slate/10">
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">
                      Current Session
                    </p>

                    <p className="text-xs text-brand-slate mt-1">
                      Chrome on Windows
                    </p>
                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                    Active
                  </span>
                </div>

                <div className="flex justify-end border-t border-brand-slate/10 pt-5">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 active:scale-[0.98] transition shadow-sm"
                  >
                    <Shield className="w-4 h-4" />
                    Update Security
                  </button>
                </div>
              </form>
            </div>

          ) : activeTab === "Settings - Appearance" ? (

            <div className="bg-white rounded-2xl border border-brand-slate/10 p-6 shadow-sm max-w-4xl mx-auto w-full">

              <div className="flex items-center gap-3 pb-5 border-b border-brand-slate/10">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-brand-navy">
                    Appearance
                  </h3>

                  <p className="text-xs text-brand-slate mt-0.5">
                    Customize your dashboard language and theme.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerSuccess("Appearance settings saved.");
                }}
                className="mt-6 space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      Language
                    </label>

                    <select className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 bg-white text-sm text-brand-navy outline-none focus:border-brand-navy transition">
                      <option>English</option>
                      <option>العربية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-navy mb-2">
                      Theme
                    </label>

                    <select className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 bg-white text-sm text-brand-navy outline-none focus:border-brand-navy transition">
                      <option>Light Mode</option>
                      <option>System Default</option>
                      <option>Dark Mode</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end border-t border-brand-slate/10 pt-5">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 active:scale-[0.98] transition shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Save Appearance
                  </button>
                </div>
              </form>
            </div>

          ) : activeTab === "Settings - Support" ? (

            <div className="bg-white rounded-2xl border border-brand-slate/10 p-6 shadow-sm max-w-4xl mx-auto w-full">

              <div className="flex items-center gap-3 pb-5 border-b border-brand-slate/10">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-brand-navy">
                    Help & Support
                  </h3>

                  <p className="text-xs text-brand-slate mt-0.5">
                    Get help with your Maskanny owner account.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => triggerSuccess("Support request created.")}
                  className="text-left p-5 rounded-xl border border-brand-slate/10 hover:bg-brand-light/40 hover:border-brand-slate/20 active:scale-[0.99] transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-navy/5 flex items-center justify-center mb-3">
                    <HelpCircle className="w-4 h-4 text-brand-navy" />
                  </div>

                  <p className="text-sm font-semibold text-brand-navy">
                    Contact Support
                  </p>

                  <p className="mt-1.5 text-xs leading-5 text-brand-slate">
                    Contact the Maskanny support team for help with your account or listings.
                  </p>

                  <span className="inline-block mt-4 text-xs font-semibold text-brand-navy">
                    Contact Team →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerSuccess("Bug report form opened.")}
                  className="text-left p-5 rounded-xl border border-brand-slate/10 hover:bg-brand-light/40 hover:border-brand-slate/20 active:scale-[0.99] transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-navy/5 flex items-center justify-center mb-3">
                    <AlertCircle className="w-4 h-4 text-brand-navy" />
                  </div>

                  <p className="text-sm font-semibold text-brand-navy">
                    Report a Problem
                  </p>

                  <p className="mt-1.5 text-xs leading-5 text-brand-slate">
                    Report a technical issue or send feedback about the dashboard.
                  </p>

                  <span className="inline-block mt-4 text-xs font-semibold text-brand-navy">
                    Report Issue →
                  </span>
                </button>
              </div>

              <div className="mt-5 rounded-xl bg-brand-navy p-5 text-white">
                <p className="text-sm font-semibold">
                  Need quick help?
                </p>

                <p className="mt-1 text-xs leading-5 text-white/70">
                  Our support team can help with listings, account settings, and owner verification.
                </p>
              </div>
            </div>

          ) : null}
        </div>
      </main>

      {editingListing && (
        <div className="fixed inset-0 z-50 bg-brand-navy/40 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl border border-brand-slate/15 w-full max-w-4xl max-h-[90vh] overflow-hidden">



            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-slate/10">

              <div>
                <h3 className="text-lg font-bold text-brand-navy">
                  Edit Listing
                </h3>

                <p className="text-xs text-brand-slate mt-1">
                  Update all information about your property.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="p-2 rounded-xl hover:bg-brand-light transition"
              >
                <X className="w-5 h-5 text-brand-slate" />
              </button>

            </div>




            <form
              onSubmit={handleUpdateListing}
              className="overflow-y-auto max-h-[calc(90vh-145px)] p-6 space-y-6"
            >



              <section>

                <h4 className="text-sm font-bold text-brand-navy mb-4">
                  Basic Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="md:col-span-2">

                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Property / Dorm Name
                    </label>

                    <input
                      name="property"
                      defaultValue={editingListing.property}
                      required
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                    />

                  </div>


                  <div>

                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Property Type
                    </label>

                    <select
                      name="propertyType"
                      defaultValue={editingListing.propertyType}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 bg-white text-sm text-brand-navy outline-none"
                    >
                      <option>Apartment</option>
                      <option>Dorm</option>
                      <option>Studio</option>
                      <option>Shared Apartment</option>
                    </select>

                  </div>


                  <div>

                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Room Type
                    </label>

                    <select
                      name="roomType"
                      defaultValue={editingListing.roomType}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 bg-white text-sm text-brand-navy outline-none"
                    >
                      <option>Private Room</option>
                      <option>Shared Room</option>
                      <option>Studio</option>
                    </select>

                  </div>


                  <div>

                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Monthly Price ($)
                    </label>

                    <input
                      name="price"
                      type="number"
                      defaultValue={editingListing.price}
                      required
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm text-brand-navy outline-none"
                    />

                  </div>

                  <div className="md:col-span-2">

                    <label className="block text-sm font-bold text-brand-navy mb-1.5">
                      Description
                    </label>

                    <textarea
                      name="description"
                      defaultValue={editingListing.description}
                      rows={4}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm text-brand-navy outline-none resize-none"
                    />

                  </div>

                </div>

              </section>




              <section className="border-t border-brand-slate/10 pt-6">

                <h4 className="text-sm font-bold text-brand-navy mb-4">
                  Location
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-bold text-brand-navy mb-1.5">
                      Address
                    </label>

                    <input
                      name="location"
                      defaultValue={editingListing.location}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-bold text-brand-navy mb-1.5">
                      City
                    </label>

                    <input
                      name="city"
                      defaultValue={editingListing.city}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-bold text-brand-navy mb-1.5">
                      Area
                    </label>

                    <input
                      name="area"
                      defaultValue={editingListing.area}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-bold text-brand-navy mb-1.5">
                      Nearby University
                    </label>

                    <input
                      name="university"
                      defaultValue={editingListing.university}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-bold text-brand-navy mb-1.5">
                      Distance to University
                    </label>

                    <input
                      name="distanceToUniversity"
                      defaultValue={editingListing.distanceToUniversity}
                      placeholder="e.g. 7 min"
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm"
                    />
                  </div>

                </div>

              </section>



              <section className="border-t border-brand-slate/10 pt-6">

                <h4 className="text-sm font-bold text-brand-navy mb-4">
                  Property Details
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                  <div>
                    <label className="block text-sm font-bold mb-1.5">
                      Beds
                    </label>

                    <input
                      name="beds"
                      type="number"
                      min="0"
                      defaultValue={editingListing.beds}
                      className="w-full px-3 py-3 rounded-xl border border-brand-slate/20 text-sm"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-bold mb-1.5">
                      Bathrooms
                    </label>

                    <input
                      name="bathrooms"
                      type="number"
                      min="0"
                      defaultValue={editingListing.bathrooms}
                      className="w-full px-3 py-3 rounded-xl border border-brand-slate/20 text-sm"
                    />
                  </div>


                  <div>
                    <label className="block text-xs font-semibold text-brand-slate mb-2">
                      Rooms
                    </label>

                    <input
                      type="number"
                      name="rooms"
                      min="1"
                      placeholder="3"
                      className="w-full px-4 py-3 rounded-xl border border-brand-slate/20
      text-sm text-brand-navy
      focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5">
                      Size (m²)
                    </label>

                    <input
                      name="size"
                      type="number"
                      min="0"
                      defaultValue={editingListing.size}
                      className="w-full px-3 py-3 rounded-xl border border-brand-slate/20 text-sm"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-bold mb-1.5">
                      Available Rooms
                    </label>

                    <input
                      name="availableRooms"
                      type="number"
                      min="0"
                      defaultValue={editingListing.availableRooms}
                      className="w-full px-3 py-3 rounded-xl border border-brand-slate/20 text-sm"
                    />
                  </div>


                  <div className="col-span-2 md:col-span-3">

                    <label className="block text-sm font-bold mb-1.5">
                      Furnishing
                    </label>

                    <select
                      name="furnishing"
                      defaultValue={editingListing.furnishing}
                      className="w-full px-3 py-3 rounded-xl border border-brand-slate/20 bg-white text-sm"
                    >
                      <option>Furnished</option>
                      <option>Unfurnished</option>
                    </select>

                  </div>

                </div>

              </section>


              <section className="border-t border-brand-slate/10 pt-6">

                <div className="flex items-center justify-between mb-4">

                  <div>
                    <h4 className="text-sm font-bold text-brand-navy">
                      Amenities
                    </h4>

                    <p className="text-sm text-brand-slate mt-1">
                      Select everything available at this property.
                    </p>
                  </div>

                </div>


                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                  {[
                    'Wi-Fi',
                    'Electricity',
                    'Water',
                    'Air Conditioning',
                    'Heating',
                    'Kitchen',
                    'Laundry',
                    'Parking',
                    'Security',
                    'Elevator',
                    'Balcony',
                    'Study Area',
                  ].map((amenity) => (

                    <label
                      key={amenity}
                      className="flex items-center gap-3 p-3 rounded-xl border border-brand-slate/10 hover:bg-brand-light cursor-pointer"
                    >

                      <input
                        type="checkbox"
                        name="amenities"
                        value={amenity}
                        defaultChecked={editingListing.amenities?.includes(amenity)}
                        className="w-4 h-4 accent-brand-navy"
                      />

                      <span className="text-sm font-medium text-brand-navy">
                        {amenity}
                      </span>

                    </label>

                  ))}

                </div>

              </section>




              <section className="border-t border-brand-slate/10 pt-6">

                <h4 className="text-sm font-bold text-brand-navy mb-4">
                  Property Photos
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                  {editingListing.photos?.map((photo, index) => (

                    <div
                      key={index}
                      className="relative h-32 rounded-xl overflow-hidden border border-brand-slate/10"
                    >

                      <img
                        src={photo}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                    </div>

                  ))}

                </div>

                <p className="text-[11px] text-brand-slate mt-2">
                  Existing mock photos are shown here. File upload can be connected to Supabase Storage later.
                </p>

              </section>




              <div className="sticky bottom-0 bg-white border-t border-brand-slate/10 pt-4 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-brand-slate hover:bg-brand-light"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy/90 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {deleteListingId && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/40 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">

            <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>

            <h3 className="text-base font-bold text-brand-navy">
              Delete this listing?
            </h3>

            <p className="text-xs text-brand-slate mt-2 leading-5">
              This listing will be removed from your My Listings page.
              This action cannot be undone.
            </p>


            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() => setDeleteListingId(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-brand-slate hover:bg-brand-light"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={() => {

                  setSubmissions((prev) =>
                    prev.filter(
                      (item) =>
                        item.id !== deleteListingId
                    )
                  );

                  setDeleteListingId(null);

                  triggerSuccess(
                    'Listing deleted successfully.'
                  );

                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Listing
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
