"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { OwnerSidebar } from "@/src/components/owner/OwnerSidebar";
import { MetricCard } from "@/src/components/admin/MetricCard";
import { RecentSubmissions, type Submission } from "@/src/components/owner/RecentSubmissions";
import { AnalyticsChart } from "@/src/components/owner/AnalyticsChart";
import { CategoryDonuts } from "@/src/components/owner/CategoryDonuts";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase/client";
import {
  loadHostListings,
  hostRequest,
} from "@/src/features/properties/presentation/host-listings.api";
import {
  boostHref,
  canRequestBoost,
  coverImage,
  isLive,
  propertyFeatureLabels,
  type HostListing,
} from "@/src/features/properties/presentation/host-listings";
import type { Property } from "@/src/features/properties/models/property.model";
import type { Media } from "@/src/features/properties/models/media.model";
import type { University } from "@/src/features/universities/models/university.model";
import PropertyUniversitySelect from "@/src/features/properties/presentation/components/PropertyUniversitySelect";
import type { BoostingPlan } from "@/src/features/boosting/models/boosting_plan.model";
import { MAX_PROPERTY_IMAGES } from "@/src/features/properties/validation/media-limits";
import {
  saveListingChanges,
  validatePhotoAdditions,
  validatePropertyEdit,
  type PendingPhoto,
} from "@/src/features/properties/presentation/host-listing-editor";

import {
  Plus,
  Trash2,
  Edit3,
  X,
  Star,
  Search,
  BarChart3,
  User,
  Shield,
  HelpCircle,
  MapPin,
  BedDouble,
  Home,
  Upload,
  Check,
  Bath,
  Save,
  Rocket,
} from "lucide-react";

export interface OwnerSubmission extends Submission {
  propertyId: string;
  approvalStatus: Property["approval_status"];
  live: boolean;
  canBoost: boolean;
  unavailableRelatedData: string[];
  associatedUniversities: University[];
  createdAt: string;

  description: string;

  propertyType: "Apartment" | "Dorm" | "Studio" | "Shared Apartment";

  electricityIncluded: boolean;
  kitchenType: "private" | "shared";
  bathroomType: "private" | "shared";
  gender: "boys" | "girls" | "mixed";
  images: Media[];
  imageLimit: number | null;

  location: string;
  city: string;
  area: string;
  university: string;
  distanceToUniversity: string;

  beds: number;
  bathrooms: number;
  rooms: number;

  furnishing: "Furnished" | "Unfurnished";

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

function toOwnerSubmission(listing: HostListing, plans: BoostingPlan[] | null): OwnerSubmission {
  const { property, media, universities } = listing;
  const live = isLive(listing);
  const propertyType =
    property.property_type === "dorm"
      ? "Dorm"
      : property.property_type === "studio"
        ? "Studio"
        : "Apartment";
  const plan = listing.boost
    ? plans?.find((item) => item.boosting_plan_id === listing.boost?.boosting_plan_id)
    : null;
  return {
    id: property.property_id,
    propertyId: property.property_id,
    approvalStatus: property.approval_status,
    live,
    canBoost: canRequestBoost(listing),
    moderationStatus: property.approval_status,
    visibilityStatus:
      listing.relatedData.boost === "unavailable" ? "Unavailable" : live ? "Live" : "Hidden",
    unavailableRelatedData: [
      ...(listing.relatedData.boost === "unavailable" ? ["boost status"] : []),
      ...(listing.relatedData.media === "unavailable" ? ["photos"] : []),
      ...(listing.relatedData.universities === "unavailable" ? ["university associations"] : []),
    ],
    associatedUniversities: universities,
    property: property.title,
    host: "You",
    price: property.price,
    status:
      property.approval_status === "pending"
        ? "Pending Review"
        : property.approval_status === "rejected"
          ? "Rejected"
          : live
            ? "Active"
            : "Approved",
    category:
      property.property_type === "dorm"
        ? "DORM"
        : property.property_type === "studio"
          ? "STUDIO"
          : "APARTMENT",
    createdAt: property.created_at,
    description: property.description ?? "",
    propertyType,
    electricityIncluded: property.electricity_included,
    kitchenType: property.kitchen_type,
    bathroomType: property.bathroom_type,
    gender: property.gender,
    images: media.filter((item) => item.type === "image"),
    imageLimit: listing.boost
      ? plan
        ? Math.min(MAX_PROPERTY_IMAGES, plan.max_images)
        : null
      : MAX_PROPERTY_IMAGES,
    location: property.address,
    city: "",
    area: "",
    university:
      listing.relatedData.universities === "unavailable"
        ? "Unavailable"
        : universities.map((item) => item.name).join(", "),
    distanceToUniversity: "",
    beds: property.bed_count,
    bathrooms: property.bathrooms,
    rooms: property.bedrooms,
    furnishing: property.furnished ? "Furnished" : "Unfurnished",
    amenities: propertyFeatureLabels(property),
    photos: media.filter((item) => item.type === "image").map((item) => item.url),
    imageUrl: coverImage(media) ?? undefined,
  };
}

type DateFilterPreset = "TODAY" | "WEEK" | "MONTH" | "ALL";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [listings, setListings] = useState<HostListing[]>([]);
  const [boostingPlans, setBoostingPlans] = useState<BoostingPlan[] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewRating, setReviewRating] = useState("all");
  const [datePreset, setDatePreset] = useState<DateFilterPreset>("ALL");
  const [newPhotos, setNewPhotos] = useState<PendingPhoto[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileReload, setProfileReload] = useState(0);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportNotice, setSupportNotice] = useState<string | null>(null);
  const supportAddress = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ?? "";
  const supportAddressConfigured = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportAddress);
  const [activeTab, setActiveTab] = useState("Overview");
  const refreshInFlight = useRef<Promise<HostListing[] | null> | null>(null);
  const profileLoaded = useRef<{ token: string; revision: number; at: number } | null>(null);
  const submissions = useMemo(
    () => listings.map((listing) => toOwnerSubmission(listing, boostingPlans)),
    [listings, boostingPlans],
  );
  type ReviewView = {
    name: string;
    rating: number;
    listing: string;
    date: string;
    comment: string;
  };
  const filteredReviews: ReviewView[] = [];
  const unavailableRelatedData = [
    ...new Set(submissions.flatMap((item) => item.unavailableRelatedData)),
  ];

  const refresh = useCallback((): Promise<HostListing[] | null> => {
    if (refreshInFlight.current) return refreshInFlight.current;
    const request = (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Sign in as a Host to view your listings.");
        setToken(session.access_token);
        setUserEmail(session.user.email ?? "");
        const [loaded, plans] = await Promise.all([
          loadHostListings(session.access_token),
          hostRequest<BoostingPlan[]>("/api/boosting_plans", session.access_token).catch(
            () => null,
          ),
        ]);
        setListings(loaded);
        setBoostingPlans(plans);
        return loaded;
      } catch (cause) {
        setListings([]);
        setLoadError(cause instanceof Error ? cause.message : "Could not load your properties.");
        return null;
      } finally {
        setLoading(false);
      }
    })();
    refreshInFlight.current = request;
    void request.then(() => {
      if (refreshInFlight.current === request) refreshInFlight.current = null;
    });
    return request;
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  useEffect(() => {
    if (activeTab !== "Settings - Profile" || !token) return;
    if (
      profileLoaded.current?.token === token &&
      profileLoaded.current.revision === profileReload &&
      Date.now() - profileLoaded.current.at < 30_000
    )
      return;
    const controller = new AbortController();
    void hostRequest<typeof profile>("/api/host/profile", token, { signal: controller.signal })
      .then((loaded) => {
        if (!controller.signal.aborted) {
          setProfile(loaded);
          profileLoaded.current = { token, revision: profileReload, at: Date.now() };
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setProfileError(error instanceof Error ? error.message : "Could not load your profile.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setProfileLoading(false);
      });
    return () => controller.abort();
  }, [activeTab, token, profileReload]);

  const saveHostProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !profile || profileSaving) return;
    const form = new FormData(event.currentTarget);
    setProfileSaving(true);
    setProfileError(null);
    try {
      const updated = await hostRequest<typeof profile>("/api/host/profile", token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: form.get("firstname"),
          lastname: form.get("lastname"),
          phone: form.get("phone"),
        }),
      });
      setProfile(updated);
      triggerSuccess("Profile updated successfully.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const changeHostPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || passwordSaving) return;
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword.length < 8 || newPassword.length > 128) {
      setPasswordError("Use a new password between 8 and 128 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("Choose a password different from your current password.");
      return;
    }
    setPasswordSaving(true);
    try {
      await hostRequest<{ ok: true }>("/api/host/settings/password", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      event.currentTarget.reset();
      setPasswordSuccess("Password changed successfully.");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Could not change your password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const submitSupportEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supportAddressConfigured) {
      setSupportNotice("Support email is not configured. Please try again later.");
      return;
    }
    const subject = supportSubject.trim();
    const message = supportMessage.trim();
    if (!subject || !message) {
      setSupportNotice("Enter a subject and message before continuing.");
      return;
    }
    window.location.href = `mailto:${supportAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    setSupportNotice("Your email app should open with a draft. Send it there to contact Support.");
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingListing, setEditingListing] = useState<OwnerSubmission | null>(null);
  const [editingUniversities, setEditingUniversities] = useState<University[]>([]);
  const [initialEditingUniversityIds, setInitialEditingUniversityIds] = useState<string[]>([]);
  const [editingUniversitiesStatus, setEditingUniversitiesStatus] = useState<
    "loading" | "ready" | "error"
  >("ready");
  const [editingUniversitiesError, setEditingUniversitiesError] = useState<string | null>(null);

  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [photoCleanupRetryId, setPhotoCleanupRetryId] = useState<string | null>(null);

  function triggerSuccess(msg: string) {
    setSuccessMessage(msg);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  }

  const handleUpdateListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingListing || !token || busy) return;
    const formData = new FormData(e.currentTarget);
    const result = validatePropertyEdit({
      title: String(formData.get("property") ?? "").trim(),
      property_type: String(formData.get("propertyType") ?? "").toLowerCase(),
      price: Number(formData.get("price")),
      description: String(formData.get("description") ?? "").trim() || null,
      bedrooms: Number(formData.get("bedrooms")),
      bathrooms: Number(formData.get("bathrooms")),
      bed_count: Number(formData.get("bedCount")),
      furnished: formData.get("furnished") === "true",
      electricity_included: formData.get("electricityIncluded") === "true",
      kitchen_type: String(formData.get("kitchenType") ?? ""),
      bathroom_type: String(formData.get("bathroomType") ?? ""),
      gender: String(formData.get("gender") ?? ""),
    });
    if (!result.success) {
      setEditError(result.error.issues[0]?.message ?? "Check the property details.");
      return;
    }
    if (newPhotos.length) {
      const photoError = validatePhotoAdditions(
        newPhotos.map((photo) => photo.file),
        editingListing.images.length,
        editingListing.imageLimit ?? -1,
      );
      if (photoError) {
        setEditError(photoError);
        return;
      }
    }

    setBusy(true);
    setEditError(null);
    try {
      await saveListingChanges({
        propertyId: editingListing.propertyId,
        token,
        values: result.data,
        additions: newPhotos,
        removals: removedPhotoIds,
        startingOrder:
          Math.max(
            -1,
            ...editingListing.images
              .filter((image) => !removedPhotoIds.includes(image.media_id))
              .map((image) => image.sort_order ?? 0),
          ) + 1,
        request: hostRequest,
      });
      const universityIds = editingUniversities.map((university) => university.university_id);
      const initialUniversityIds = [...initialEditingUniversityIds];
      const universitiesChanged =
        [...universityIds].sort().join(",") !== initialUniversityIds.sort().join(",");
      if (editingUniversitiesStatus === "ready" && universitiesChanged) {
        await hostRequest<{ university_ids: string[] }>(
          `/api/properties/${encodeURIComponent(editingListing.propertyId)}/universities`,
          token,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ university_ids: universityIds }),
          },
        );
      }
      const refreshed = await refresh();
      if (!refreshed)
        throw new Error(
          "Changes were saved, but your listings could not be refreshed. Reload the dashboard to confirm them.",
        );
      closeEditListing();
      triggerSuccess("Listing updated successfully.");
    } catch (cause) {
      setEditError(cause instanceof Error ? cause.message : "Could not update listing.");
      const refreshed = await refresh();
      const latest = refreshed?.find(
        (item) => item.property.property_id === editingListing.propertyId,
      );
      if (latest) {
        setEditingListing(toOwnerSubmission(latest, boostingPlans));
        for (const photo of newPhotos) URL.revokeObjectURL(photo.preview);
        setNewPhotos([]);
        setRemovedPhotoIds([]);
      }
    } finally {
      setBusy(false);
    }
  };

  const closeEditListing = () => {
    for (const photo of newPhotos) URL.revokeObjectURL(photo.preview);
    setNewPhotos([]);
    setRemovedPhotoIds([]);
    setEditError(null);
    setEditingUniversities([]);
    setInitialEditingUniversityIds([]);
    setEditingUniversitiesStatus("ready");
    setEditingUniversitiesError(null);
    setEditingListing(null);
  };

  const loadEditingUniversities = async (propertyId: string) => {
    if (!token) {
      setEditingUniversitiesStatus("error");
      setEditingUniversitiesError("Sign in as a Host to load university associations.");
      return;
    }
    setEditingUniversitiesStatus("loading");
    setEditingUniversitiesError(null);
    try {
      const universities = await hostRequest<University[]>(
        `/api/properties/${encodeURIComponent(propertyId)}/universities`,
        token,
      );
      if (!Array.isArray(universities))
        throw new Error("University associations returned an invalid response.");
      setEditingUniversities(universities);
      setInitialEditingUniversityIds(universities.map((university) => university.university_id));
      setEditingUniversitiesStatus("ready");
    } catch (cause) {
      setEditingUniversitiesStatus("error");
      setEditingUniversitiesError(
        cause instanceof Error ? cause.message : "Could not load university associations.",
      );
    }
  };

  const openEditListing = (listing: OwnerSubmission) => {
    setNewPhotos([]);
    setRemovedPhotoIds([]);
    setEditError(null);
    setEditingListing(listing);
    setEditingUniversities(listing.associatedUniversities);
    setInitialEditingUniversityIds(
      listing.associatedUniversities.map((university) => university.university_id),
    );
    setEditingUniversitiesError(null);
    if (listing.unavailableRelatedData.includes("university associations")) {
      void loadEditingUniversities(listing.propertyId);
    } else {
      setEditingUniversitiesStatus("ready");
    }
  };

  const addEditPhotos = (files: File[]) => {
    if (!editingListing) return;
    const error = validatePhotoAdditions(
      files,
      editingListing.images.length + newPhotos.length,
      editingListing.imageLimit ?? -1,
    );
    if (error) {
      setEditError(error);
      return;
    }
    setEditError(null);
    setNewPhotos((current) =>
      current.concat(
        files.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          requestId: crypto.randomUUID(),
        })),
      ),
    );
  };

  const handleDeleteListing = async () => {
    if (!deleteListingId || !token || busy) return;
    setBusy(true);
    setLoadError(null);
    try {
      const result = await hostRequest<{ media_cleanup_pending?: boolean }>(
        `/api/properties/${encodeURIComponent(deleteListingId)}`,
        token,
        { method: "DELETE" },
      );
      setDeleteListingId(null);
      if (result.media_cleanup_pending) {
        setPhotoCleanupRetryId(deleteListingId);
        setSuccessMessage("Listing archived. Photo cleanup is pending.");
      } else {
        setPhotoCleanupRetryId(null);
        triggerSuccess("Listing archived successfully.");
      }
      await refresh();
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : "Could not delete listing.");
    } finally {
      setBusy(false);
    }
  };

  const retryArchivedPhotoCleanup = async () => {
    if (!photoCleanupRetryId || !token || busy) return;
    setBusy(true);
    try {
      const result = await hostRequest<{ media_cleanup_pending?: boolean }>(
        `/api/properties/${encodeURIComponent(photoCleanupRetryId)}`,
        token,
        { method: "DELETE" },
      );
      if (result.media_cleanup_pending) {
        setSuccessMessage("Photo cleanup is still pending. You can retry it.");
      } else {
        setPhotoCleanupRetryId(null);
        triggerSuccess("Archived listing photo cleanup completed.");
      }
    } catch {
      setSuccessMessage("The listing is archived. Photo cleanup could not be retried yet.");
    } finally {
      setBusy(false);
    }
  };

  const dateFilteredSubmissions = useMemo(() => {
    if (datePreset === "ALL") return submissions;

    const now = new Date();

    return submissions.filter((item) => {
      const itemDate = new Date(item.createdAt);

      const diffInDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24));

      if (datePreset === "TODAY") {
        return (
          itemDate.getFullYear() === now.getFullYear() &&
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getDate() === now.getDate()
        );
      }

      if (datePreset === "WEEK") {
        return diffInDays >= 0 && diffInDays <= 7;
      }

      if (datePreset === "MONTH") {
        return diffInDays >= 0 && diffInDays <= 30;
      }

      return true;
    });
  }, [submissions, datePreset]);

  const totalListings = dateFilteredSubmissions.length;

  const activeListings = dateFilteredSubmissions.filter((s) => s.status === "Active").length;
  const boostStatusUnavailable = dateFilteredSubmissions.some((item) =>
    item.unavailableRelatedData.includes("boost status"),
  );

  const pendingListings = dateFilteredSubmissions.filter(
    (s) => s.status === "Pending Review",
  ).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-light text-brand-navy w-full overflow-x-hidden relative">
      <OwnerSidebar
        activeTab={activeTab.startsWith("Settings") ? "Settings" : activeTab}
        setActiveTab={(tab) => setActiveTab(tab === "Settings" ? "Settings - Profile" : tab)}
        userEmail={userEmail}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto flex-1 flex flex-col">
          {successMessage && (
            <div
              className={`border px-4 py-3 rounded-2xl text-xs font-bold shadow-sm flex items-center justify-between shrink-0 ${photoCleanupRetryId ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}
            >
              <span>✓ {successMessage}</span>

              {photoCleanupRetryId && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void retryArchivedPhotoCleanup()}
                  className="underline disabled:opacity-50"
                >
                  {busy ? "Retrying…" : "Retry photo cleanup"}
                </button>
              )}

              <button
                type="button"
                disabled={Boolean(photoCleanupRetryId)}
                onClick={() => setSuccessMessage(null)}
                className="text-current hover:opacity-70 disabled:opacity-50"
                aria-label="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading && (
            <div
              role="status"
              className="rounded-2xl border border-brand-slate/15 bg-white p-4 text-sm text-brand-slate"
            >
              Loading your properties…
            </div>
          )}
          {loadError && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              {loadError}{" "}
              <button
                type="button"
                onClick={() => void refresh()}
                className="ml-2 font-bold underline"
              >
                Retry
              </button>
            </div>
          )}
          {!loadError && unavailableRelatedData.length > 0 && (
            <div
              role="status"
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              Some listing information is unavailable ({unavailableRelatedData.join(", ")}). Your
              properties are still shown; retry to reload these details.{" "}
              <button type="button" onClick={() => void refresh()} className="font-bold underline">
                Retry
              </button>
            </div>
          )}

          <div className="grid w-full min-w-0 grid-cols-1 gap-3 rounded-2xl border border-brand-slate/15 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3 sm:p-5 lg:flex lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-brand-navy sm:text-xl">
                {activeTab === "My Listings"
                  ? "My Properties & Dorms"
                  : activeTab === "Review" ||
                      activeTab === "Reviews" ||
                      activeTab === "Review Submissions"
                    ? "Student Feedbacks & Reviews"
                    : activeTab.startsWith("Settings")
                      ? "Owner Settings"
                      : "Welcome back, Owner!"}
              </h2>

              <p className="text-xs text-brand-slate mt-1">
                {activeTab === "My Listings"
                  ? "Manage, edit or delete your student housing units and dorms."
                  : activeTab === "Review" ||
                      activeTab === "Reviews" ||
                      activeTab === "Review Submissions"
                    ? "Read ratings and reviews left by students for your properties."
                    : activeTab === "Settings - Profile"
                      ? "Update your personal details and contact number."
                      : activeTab === "Settings - Security"
                        ? "Change your Maskanny account password."
                        : activeTab === "Settings - Support"
                          ? "Contact the Maskanny support team."
                          : "Here is what is happening with your properties."}
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-2 min-[390px]:flex-row min-[390px]:items-center sm:flex-col sm:items-stretch lg:flex-row lg:items-center">
              <button
                type="button"
                onClick={() => setActiveTab("My Listings")}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-gold px-2.5 py-2 text-xs font-bold text-brand-navy shadow-sm transition-all hover:bg-brand-gold/90 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <Rocket className="h-4 w-4 shrink-0" />
                <span>Boost Now</span>
              </button>

              {!activeTab.startsWith("Settings") && activeTab !== "Add Listing" && (
                <div className="grid w-full min-w-0 grid-cols-4 gap-1 rounded-xl border border-brand-slate/10 bg-brand-light p-1 text-[11px] font-semibold lg:inline-flex lg:w-auto">
                  {[
                    { id: "ALL", label: "All", fullLabel: "All Time" },
                    { id: "TODAY", label: "Today", fullLabel: "Today" },
                    { id: "WEEK", label: "7d", fullLabel: "This Week" },
                    { id: "MONTH", label: "30d", fullLabel: "This Month" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setDatePreset(preset.id as DateFilterPreset)}
                      className={`rounded-lg px-1.5 py-2 transition-all sm:px-2.5 ${
                        datePreset === preset.id
                          ? "bg-white font-bold text-brand-navy shadow-sm"
                          : "text-brand-slate hover:text-brand-navy"
                      }`}
                    >
                      <span className="sm:hidden">{preset.label}</span>
                      <span className="hidden sm:inline">{preset.fullLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {activeTab.startsWith("Settings") && (
            <div className="bg-white rounded-2xl border border-brand-slate/15 shadow-sm p-3">
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: "Settings - Profile",
                    label: "Profile & Account",
                    icon: User,
                  },
                  {
                    id: "Settings - Security",
                    label: "Security",
                    icon: Shield,
                  },
                  {
                    id: "Settings - Support",
                    label: "Support",
                    icon: HelpCircle,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === item.id
                          ? "bg-brand-navy text-white shadow-sm"
                          : "text-brand-slate hover:bg-brand-light hover:text-brand-navy"
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

          {activeTab === "Overview" || activeTab === "Dashboard" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard title="Total Listings" value={totalListings.toString()} />

                <MetricCard
                  title="Active Listings"
                  value={boostStatusUnavailable ? "—" : activeListings.toString()}
                  subtitle={boostStatusUnavailable ? "Boost status unavailable" : "Live"}
                  isPositive={!boostStatusUnavailable}
                />

                <MetricCard
                  title="Pending Listings"
                  value={pendingListings.toString()}
                  subtitle={pendingListings > 0 ? "Under review" : "None pending"}
                  isPositive={true}
                />

                <MetricCard title="Reviews & Average" value="—" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AnalyticsChart token={token} period={datePreset} />
                </div>

                <div>
                  <CategoryDonuts
                    counts={{
                      active: activeListings,
                      pending: pendingListings,
                      approved: dateFilteredSubmissions.filter(
                        (item) => item.approvalStatus === "approved" && !item.live,
                      ).length,
                      rejected: dateFilteredSubmissions.filter(
                        (item) => item.approvalStatus === "rejected",
                      ).length,
                    }}
                  />
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
          ) : activeTab === "My Listings" ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  onClick={() => {
                    setActiveTab("Add Listing");
                    router.push("/AddListing");
                  }}
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
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.property}
                          fill
                          sizes="(min-width: 1280px) 50vw, 100vw"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 bg-brand-light text-brand-slate">
                          <Home
                            className="h-12 w-12"
                            aria-label={
                              item.unavailableRelatedData.includes("photos")
                                ? "Photos unavailable"
                                : "No photo uploaded"
                            }
                          />
                          {item.unavailableRelatedData.includes("photos") && (
                            <span className="text-xs">Photos unavailable</span>
                          )}
                        </div>
                      )}

                      <span
                        className={`absolute top-3 left-3 px-3 py-1
              rounded-full text-[11px] text-sm font-bold ${
                item.status === "Active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
                      >
                        Moderation: {item.approvalStatus}
                      </span>

                      <span
                        className="absolute top-3 right-3 px-3 py-1
              rounded-full bg-white/90 backdrop-blur-sm
              text-[11px] font-bold text-brand-navy"
                      >
                        {item.propertyType}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-base font-bold text-brand-navy">{item.property}</h4>

                          <div className="flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-slate" />

                            <span className="text-xs text-brand-slate">{item.location}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-brand-navy">${item.price}</p>

                          <p className="text-[11px] text-brand-slate">/ month</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div
                          className="rounded-xl border
                border-brand-slate/10 p-3 text-center"
                        >
                          <BedDouble className="w-4 h-4 mx-auto text-brand-slate" />

                          <p className="text-sm font-bold text-brand-navy mt-1">{item.beds}</p>

                          <p className="text-xs text-brand-slate">Beds</p>
                        </div>

                        <div
                          className="rounded-xl border
                border-brand-slate/10 p-3 text-center"
                        >
                          <Bath className="w-4 h-4 mx-auto text-brand-slate" />

                          <p className="text-sm font-bold text-brand-navy mt-1">{item.bathrooms}</p>

                          <p className="text-xs text-brand-slate">Baths</p>
                        </div>

                        <div
                          className="rounded-xl border
                border-brand-slate/10 p-3 text-center"
                        >
                          <Home className="w-4 h-4 mx-auto text-brand-slate" />

                          <p className="text-sm font-bold text-brand-navy mt-1">{item.rooms}</p>

                          <p className="text-xs text-brand-slate">Bedrooms</p>
                        </div>

                        <div
                          className="rounded-xl border
                border-brand-slate/10 p-3 text-center"
                        >
                          <User className="w-4 h-4 mx-auto text-brand-slate" />

                          <p className="text-sm font-bold text-brand-navy mt-1">
                            {item.gender === "boys"
                              ? "Boys"
                              : item.gender === "girls"
                                ? "Girls"
                                : item.gender === "mixed"
                                  ? "Mixed"
                                  : "—"}
                          </p>

                          <p className="text-xs text-brand-slate">Gender</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-brand-navy mb-2">Amenities</p>

                        <div className="flex flex-wrap gap-1.5">
                          {item.amenities.map((amenity) => (
                            <span
                              key={amenity}
                              className="px-2.5 py-1 rounded-lg bg-brand-light
      text-brand-slate text-xs font-medium"
                            >
                              {amenity}
                            </span>
                          ))}
                          {item.amenities.length === 0 && (
                            <span className="text-xs text-brand-slate">
                              Property features unavailable
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-brand-slate/10 pt-3 text-xs">
                        <span className="text-brand-slate">Public visibility</span>
                        <strong
                          className={
                            item.visibilityStatus === "Unavailable"
                              ? "text-amber-700"
                              : item.live
                                ? "text-emerald-700"
                                : "text-brand-slate"
                          }
                        >
                          {item.visibilityStatus}
                        </strong>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openEditListing(item)}
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
                        {item.canBoost && (
                          <button
                            type="button"
                            onClick={() => router.push(boostHref(item.propertyId))}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-gold text-brand-navy hover:bg-brand-gold/90 rounded-xl text-xs font-bold transition-all"
                          >
                            <Rocket className="w-3.5 h-3.5" />
                            Boost
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && !loadError && dateFilteredSubmissions.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-brand-slate/15 bg-white p-8 text-center text-sm text-brand-slate">
                    {submissions.length === 0
                      ? "You have no properties yet. Add your first listing to submit it for review."
                      : "No listings match the selected date filter."}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "Review" ||
            activeTab === "Reviews" ||
            activeTab === "Review Submissions" ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="rounded-2xl border border-brand-slate/10 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium text-brand-slate">Average Rating</p>

                  <div className="mt-3 flex items-center gap-3">
                    <div>
                      <span className="text-3xl font-bold text-brand-navy">—</span>
                      <span className="text-xs text-brand-slate"> / 5</span>
                    </div>

                    <div className="flex gap-0.5 text-brand-slate/30">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4" />
                      ))}
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-brand-slate">Review data unavailable</p>
                </div>

                <div className="rounded-2xl border border-brand-slate/10 bg-white p-5 shadow-sm lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-brand-navy">Rating Distribution</h2>

                    <BarChart3 className="h-4 w-4 text-brand-slate" />
                  </div>

                  <div className="space-y-2.5">
                    {[{ stars: 5 }, { stars: 4 }, { stars: 3 }, { stars: 2 }, { stars: 1 }].map(
                      (rating) => (
                        <div key={rating.stars} className="flex items-center gap-2.5">
                          <div className="flex w-12 items-center gap-1 text-xs text-brand-slate">
                            <span>{rating.stars}</span>

                            <Star className="h-3 w-3 fill-brand-gold text-brand-gold" />
                          </div>

                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-light">
                            <div
                              className="h-full rounded-full bg-brand-gold"
                              style={{
                                width: "0%",
                              }}
                            />
                          </div>

                          <span className="w-6 text-right text-xs font-medium text-brand-slate">
                            —
                          </span>
                        </div>
                      ),
                    )}
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
                      disabled
                      onChange={(e) => setReviewSearch(e.target.value)}
                      placeholder="Search reviews..."
                      className="w-full rounded-xl border border-brand-slate/15 bg-brand-light/30 py-2 pl-9 pr-3 text-xs text-brand-navy outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                    />
                  </div>

                  <select
                    value={reviewRating}
                    disabled
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="rounded-xl border border-brand-slate/15 bg-white px-3 py-2 text-xs text-brand-navy outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  >
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
                          <h3 className="text-sm font-semibold text-brand-navy">{review.name}</h3>

                          <div className="mt-1 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
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
                      <p className="text-[11px] text-brand-slate">Listing</p>

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
                      Review data unavailable
                    </p>

                    <p className="mt-1 text-xs text-brand-slate">
                      Student reviews are not available from the current Host API.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "Settings - Profile" ? (
            <div className="bg-white rounded-2xl border border-brand-slate/10 p-6 shadow-sm max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-3 pb-5 border-b border-brand-slate/10">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">Profile &amp; Account</h3>
                  <p className="text-xs text-brand-slate mt-0.5">
                    Manage your personal and contact information.
                  </p>
                </div>
              </div>
              {profileLoading || (!profile && !profileError && (!!token || loading)) ? (
                <p role="status" className="mt-5 text-sm text-brand-slate">
                  Loading your profile…
                </p>
              ) : !token ? (
                <p role="alert" className="mt-5 text-sm text-rose-700">
                  Sign in as a Host to load your profile.
                </p>
              ) : profileError && !profile ? (
                <div className="mt-5" role="alert">
                  <p className="text-sm text-rose-700">{profileError}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm font-semibold underline"
                    onClick={() => {
                      setProfileError(null);
                      setProfileLoading(true);
                      setProfileReload((value) => value + 1);
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : profile ? (
                <form
                  key={`${profile.firstname}:${profile.lastname}:${profile.phone}`}
                  onSubmit={saveHostProfile}
                  className="mt-6 space-y-6"
                >
                  {profileError && (
                    <p
                      role="alert"
                      className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700"
                    >
                      {profileError}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="host-firstname"
                        className="block text-xs font-semibold text-brand-navy mb-2"
                      >
                        First Name
                      </label>
                      <input
                        id="host-firstname"
                        name="firstname"
                        type="text"
                        required
                        maxLength={100}
                        defaultValue={profile.firstname}
                        disabled={profileSaving}
                        className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 disabled:bg-brand-light"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="host-lastname"
                        className="block text-xs font-semibold text-brand-navy mb-2"
                      >
                        Last Name
                      </label>
                      <input
                        id="host-lastname"
                        name="lastname"
                        type="text"
                        required
                        maxLength={100}
                        defaultValue={profile.lastname}
                        disabled={profileSaving}
                        className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 disabled:bg-brand-light"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="host-email"
                        className="block text-xs font-semibold text-brand-navy mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        id="host-email"
                        type="email"
                        value={profile.email}
                        readOnly
                        aria-readonly="true"
                        className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 bg-brand-light text-sm text-brand-slate"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="host-phone"
                        className="block text-xs font-semibold text-brand-navy mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        id="host-phone"
                        name="phone"
                        type="tel"
                        required
                        pattern="(01|03|05|70|71|76|78|79|81)[0-9]{6}"
                        maxLength={8}
                        placeholder="70123456"
                        defaultValue={profile.phone}
                        disabled={profileSaving}
                        className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 disabled:bg-brand-light"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-brand-slate/10 pt-5">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 transition shadow-sm disabled:opacity-60"
                    >
                      <Check className="w-4 h-4" />
                      {profileSaving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <p role="alert" className="mt-5 text-sm text-rose-700">
                  Profile data is unavailable.
                </p>
              )}
            </div>
          ) : activeTab === "Settings - Security" ? (
            <div className="bg-white rounded-2xl border border-brand-slate/10 p-6 shadow-sm max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-3 pb-5 border-b border-brand-slate/10">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">Security</h3>
                  <p className="text-xs text-brand-slate mt-0.5">
                    Change your account password securely.
                  </p>
                </div>
              </div>
              <form onSubmit={changeHostPassword} className="mt-6 space-y-5">
                {passwordError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700"
                  >
                    {passwordError}
                  </p>
                )}
                {passwordSuccess && (
                  <p
                    role="status"
                    className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700"
                  >
                    {passwordSuccess}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="host-current-password"
                      className="block text-xs font-semibold text-brand-navy mb-2"
                    >
                      Current Password
                    </label>
                    <input
                      id="host-current-password"
                      name="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      required
                      maxLength={128}
                      disabled={passwordSaving}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 disabled:bg-brand-light"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="host-new-password"
                      className="block text-xs font-semibold text-brand-navy mb-2"
                    >
                      New Password
                    </label>
                    <input
                      id="host-new-password"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={128}
                      disabled={passwordSaving}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 disabled:bg-brand-light"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="host-confirm-password"
                      className="block text-xs font-semibold text-brand-navy mb-2"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="host-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={128}
                      disabled={passwordSaving}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 disabled:bg-brand-light"
                    />
                  </div>
                </div>
                <div className="flex justify-end border-t border-brand-slate/10 pt-5">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 transition shadow-sm disabled:opacity-60"
                  >
                    <Shield className="w-4 h-4" />
                    {passwordSaving ? "Updating…" : "Update Password"}
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
                  <h3 className="text-base font-bold text-brand-navy">Help &amp; Support</h3>
                  <p className="text-xs text-brand-slate mt-0.5">
                    Get help with your Maskanny Host account.
                  </p>
                </div>
              </div>
              <form onSubmit={submitSupportEmail} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="host-support-subject"
                    className="block text-xs font-semibold text-brand-navy mb-2"
                  >
                    Subject
                  </label>
                  <input
                    id="host-support-subject"
                    value={supportSubject}
                    onChange={(event) => setSupportSubject(event.target.value)}
                    required
                    maxLength={160}
                    className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>
                <div>
                  <label
                    htmlFor="host-support-message"
                    className="block text-xs font-semibold text-brand-navy mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="host-support-message"
                    value={supportMessage}
                    onChange={(event) => setSupportMessage(event.target.value)}
                    required
                    maxLength={5000}
                    rows={5}
                    className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/15 text-sm text-brand-navy outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                  />
                </div>
                {supportNotice && (
                  <p role="status" className="text-sm text-brand-slate">
                    {supportNotice}
                  </p>
                )}
                {!supportAddressConfigured && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    Support email is not configured. Please try again later.
                  </p>
                )}
                <div className="flex justify-end border-t border-brand-slate/10 pt-5">
                  <button
                    type="submit"
                    disabled={!supportAddressConfigured}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 transition shadow-sm disabled:opacity-50"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Continue to Email
                  </button>
                </div>
              </form>
              <div className="mt-5 rounded-xl bg-brand-navy p-5 text-white">
                <p className="text-sm font-semibold">Need quick help?</p>
                <p className="mt-1 text-xs leading-5 text-white/70">
                  Our support team can help with listings, account settings, and Host verification.
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
                <h3 className="text-lg font-bold text-brand-navy">Edit Listing</h3>

                <p className="text-xs text-brand-slate mt-1">
                  Update all information about your property.
                </p>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={closeEditListing}
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
                <h4 className="text-sm font-bold text-brand-navy mb-4">Basic Information</h4>

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
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Monthly Price ($)
                    </label>

                    <input
                      name="price"
                      type="number"
                      min="0.01"
                      step="any"
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
                <h4 className="text-sm font-bold text-brand-navy mb-4">Property Details</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Bedrooms
                    </label>
                    <input
                      name="bedrooms"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={editingListing.rooms}
                      required
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm text-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Bathrooms
                    </label>
                    <input
                      name="bathrooms"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={editingListing.bathrooms}
                      required
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm text-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Bed count
                    </label>
                    <input
                      name="bedCount"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={editingListing.beds}
                      required
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 text-sm text-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Furnished
                    </label>
                    <select
                      name="furnished"
                      defaultValue={String(editingListing.furnishing === "Furnished")}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 bg-white text-sm text-brand-navy"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Electricity included
                    </label>
                    <select
                      name="electricityIncluded"
                      defaultValue={String(editingListing.electricityIncluded)}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 bg-white text-sm text-brand-navy"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Kitchen type
                    </label>
                    <select
                      name="kitchenType"
                      defaultValue={editingListing.kitchenType}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 bg-white text-sm text-brand-navy"
                    >
                      <option value="private">Private</option>
                      <option value="shared">Shared</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Bathroom type
                    </label>
                    <select
                      name="bathroomType"
                      defaultValue={editingListing.bathroomType}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 bg-white text-sm text-brand-navy"
                    >
                      <option value="private">Private</option>
                      <option value="shared">Shared</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">
                      Gender preference
                    </label>
                    <select
                      name="gender"
                      defaultValue={editingListing.gender}
                      className="w-full px-3.5 py-3 rounded-xl border border-brand-slate/20 bg-white text-sm text-brand-navy"
                    >
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="border-t border-brand-slate/10 pt-6">
                {editingUniversitiesStatus === "loading" ? (
                  <p role="status" className="text-sm text-brand-slate">
                    Loading current university associations…
                  </p>
                ) : editingUniversitiesStatus === "error" ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                  >
                    <p>{editingUniversitiesError}</p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void loadEditingUniversities(editingListing.propertyId)}
                      className="mt-2 font-bold underline disabled:opacity-50"
                    >
                      Retry loading associations
                    </button>
                  </div>
                ) : (
                  <PropertyUniversitySelect
                    selected={editingUniversities}
                    onChange={setEditingUniversities}
                    disabled={busy}
                  />
                )}
              </section>

              <section className="border-t border-brand-slate/10 pt-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-brand-navy">Property Photos</h4>
                    <p className="text-xs text-brand-slate mt-1">
                      {editingListing.imageLimit === null
                        ? "Photo additions are unavailable because this boost plan could not be loaded."
                        : `${editingListing.images.length - removedPhotoIds.filter((id) => editingListing.images.some((image) => image.media_id === id)).length + newPhotos.length} of ${editingListing.imageLimit} photos`}
                    </p>
                  </div>
                  <label
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-slate/15 text-xs font-bold ${busy || editingListing.imageLimit === null ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-brand-light"}`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Add Photos
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={busy || editingListing.imageLimit === null}
                      className="sr-only"
                      onChange={(event) => {
                        addEditPhotos(Array.from(event.currentTarget.files ?? []));
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {editingListing.images
                    .filter((image) => !removedPhotoIds.includes(image.media_id))
                    .map((image) => (
                      <div
                        key={image.media_id}
                        className="relative h-32 rounded-xl overflow-hidden border border-brand-slate/10"
                      >
                        <Image
                          src={image.url}
                          alt="Property photo"
                          width={320}
                          height={240}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          disabled={busy}
                          aria-label="Remove property photo"
                          onClick={() =>
                            setRemovedPhotoIds((current) => [...current, image.media_id])
                          }
                          className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-rose-600 shadow-sm disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  {newPhotos.map((photo) => (
                    <div
                      key={photo.requestId}
                      className="relative h-32 rounded-xl overflow-hidden border border-brand-slate/10"
                    >
                      <Image
                        src={photo.preview}
                        alt={photo.file.name}
                        width={320}
                        height={240}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        aria-label={`Remove ${photo.file.name}`}
                        onClick={() => {
                          URL.revokeObjectURL(photo.preview);
                          setNewPhotos((current) =>
                            current.filter((item) => item.requestId !== photo.requestId),
                          );
                        }}
                        className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-rose-600 shadow-sm disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {editingListing.images.length + newPhotos.length === 0 && (
                  <p className="text-xs text-brand-slate">No photos have been added.</p>
                )}
                {editError && (
                  <p role="alert" className="mt-3 text-xs text-rose-700">
                    {editError}
                  </p>
                )}
              </section>

              <div className="sticky bottom-0 bg-white border-t border-brand-slate/10 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={closeEditListing}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-brand-slate hover:bg-brand-light"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy/90 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {busy ? "Saving…" : "Save Changes"}
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

            <h3 className="text-base font-bold text-brand-navy">Delete this listing?</h3>

            <p className="text-xs text-brand-slate mt-2 leading-5">
              This listing will be archived and removed from public and Host active listings. Boost
              and payment history will be retained.
            </p>

            {loadError && (
              <p role="alert" className="mt-3 text-xs text-rose-700">
                {loadError}
              </p>
            )}

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
                onClick={() => void handleDeleteListing()}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {busy ? "Deleting…" : "Delete Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
