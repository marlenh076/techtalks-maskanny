/**
 * ============================================================================
 * TEMPORARY DEMO DATA — DELETE THIS ENTIRE FILE WHEN THE API IS READY
 * ============================================================================
 *
 * Placeholder dorms so the design can be reviewed before the backend exists.
 * This file is deliberately the ONLY place demo data lives. It contains no
 * fetch calls, no route handlers and no database access — just an array.
 *
 * To remove it later, see the three-step note at the bottom of this file.
 */

import type { Dorm, DormFilters } from "@/types/dorm";

/**
 * Master switch. Set to false (or delete this file and the one import in
 * useDormSearch.ts) to go back to live API results only.
 */
export const USE_DEMO_DORMS = true;

/**
 * Photos are hot-linked from Unsplash for review purposes only. Replace with
 * real owner-uploaded photos before launch — don't ship hot-linked images.
 *
 * next/image needs remote hosts allow-listed. Add to next.config.js:
 *
 *   images: {
 *     remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
 *   },
 *
 * That config line is the only change outside this feature, and it comes out
 * when the demo data does.
 */
const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

export const DEMO_DORMS: Dorm[] = [
  {
    id: "demo-1",
    name: "Bliss Street Residence",
    location: "Hamra, Beirut",
    university: "American University of Beirut",
    price: 320,
    distanceFromUniversity: 0.4,
    availableRooms: 3,
    gender: "female",
    roomType: "Double",
    facilities: ["Wi-Fi", "Study room", "Laundry", "Generator", "Kitchen"],
    imageUrl: photo("photo-1522708323590-d24dbb6b0267"),
  },
  {
    id: "demo-2",
    name: "Cedar House Dorms",
    location: "Ras Beirut",
    university: "American University of Beirut",
    price: 280,
    distanceFromUniversity: 1.1,
    availableRooms: 1,
    gender: "mixed",
    roomType: "Triple",
    facilities: ["Wi-Fi", "Generator", "Shared kitchen", "Balcony"],
    imageUrl: photo("photo-1502672260266-1c1ef2d93688"),
  },
  {
    id: "demo-3",
    name: "Byblos Student Lodge",
    location: "Byblos",
    university: "Lebanese American University",
    price: 245,
    distanceFromUniversity: 0.8,
    availableRooms: 5,
    gender: "male",
    roomType: "Double",
    facilities: ["Wi-Fi", "Parking", "Laundry", "Security"],
    imageUrl: photo("photo-1560448204-e02f11c3d0e2"),
  },
  {
    id: "demo-4",
    name: "Achrafieh Quarters",
    location: "Achrafieh, Beirut",
    university: "Université Saint-Joseph",
    price: 410,
    distanceFromUniversity: 2.3,
    availableRooms: 2,
    gender: "female",
    roomType: "Single",
    facilities: ["Wi-Fi", "Private bathroom", "Generator", "Cleaning", "Gym"],
    imageUrl: photo("photo-1586023492125-27b2c045efd7"),
  },
  {
    id: "demo-5",
    name: "Maison Badaro",
    location: "Badaro, Beirut",
    university: "Lebanese University",
    price: 190,
    distanceFromUniversity: 1.6,
    availableRooms: null,
    gender: "mixed",
    roomType: "Shared",
    facilities: ["Wi-Fi", "Shared kitchen", "Rooftop"],
    imageUrl: photo("photo-1493809842364-78817add7ffb"),
  },
  {
    id: "demo-6",
    name: "Kaslik Student House",
    location: "Jounieh",
    university: "Holy Spirit University of Kaslik",
    price: 265,
    distanceFromUniversity: 0.6,
    availableRooms: 4,
    gender: "male",
    roomType: "Double",
    facilities: ["Wi-Fi", "Sea view", "Laundry", "Parking"],
    imageUrl: photo("photo-1560185007-cde436f6a4d0"),
  },
  {
    id: "demo-7",
    name: "Hamra Loft Rooms",
    location: "Hamra, Beirut",
    university: "Lebanese American University",
    price: 355,
    distanceFromUniversity: 1.9,
    availableRooms: 2,
    gender: "female",
    roomType: "Single",
    facilities: ["Wi-Fi", "Elevator", "Generator", "Study desk"],
    imageUrl: photo("photo-1568605114967-8130f3a36994"),
  },
  {
    id: "demo-8",
    name: "Tripoli Campus Stay",
    location: "Tripoli",
    university: "Beirut Arab University",
    price: 165,
    distanceFromUniversity: 0.5,
    availableRooms: 6,
    gender: "mixed",
    roomType: "Triple",
    facilities: ["Wi-Fi", "Shared kitchen", "Laundry"],
    imageUrl: photo("photo-1512917774080-9991f1c4c750"),
  },
  {
    id: "demo-9",
    name: "Zahlé Valley Residence",
    location: "Zahlé",
    university: "Lebanese University",
    price: 145,
    distanceFromUniversity: 3.1,
    availableRooms: 3,
    gender: "male",
    roomType: "Double",
    facilities: ["Wi-Fi", "Parking", "Garden"],
    imageUrl: photo("photo-1576941089067-2de3c901e126"),
  },
];

/**
 * Applies the filter state to the demo array in memory, so the filter UI can
 * be tested end-to-end without a backend. This mirrors what the API will do
 * server-side — it is throwaway code, not a spec.
 */
export function filterDemoDorms(filters: DormFilters): Dorm[] {
  const q = filters.query.trim().toLowerCase();
  const min = filters.minPrice === "" ? null : Number(filters.minPrice);
  const max = filters.maxPrice === "" ? null : Number(filters.maxPrice);
  const rooms =
    filters.availableRooms === "" ? null : Number(filters.availableRooms);

  return DEMO_DORMS.filter((dorm) => {
    if (q) {
      const haystack = [dorm.name, dorm.location, dorm.university ?? ""]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.university && dorm.university !== filters.university) return false;
    if (filters.location && !dorm.location.includes(filters.location)) return false;
    if (filters.gender && dorm.gender !== filters.gender) return false;
    if (filters.roomType && dorm.roomType !== filters.roomType) return false;
    if (min !== null && dorm.price < min) return false;
    if (max !== null && dorm.price > max) return false;
    if (rooms !== null && (dorm.availableRooms ?? 0) < rooms) return false;
    return true;
  });
}

/**
 * ============================================================================
 * HOW TO REMOVE THIS LATER (3 steps, ~2 minutes)
 * ============================================================================
 * 1. Delete this file.
 * 2. In src/hooks/useDormSearch.ts, delete the import from this file and the
 *    one `if (USE_DEMO_DORMS)` block inside the effect. It's marked with a
 *    DEMO comment banner and is the only reference anywhere in the codebase.
 * 3. Remove the images.remotePatterns entry from next.config.js.
 *
 * Nothing in src/lib/api/dorms.ts ever touches this file, so the real API path
 * is already clean and working — flipping USE_DEMO_DORMS to false is enough to
 * verify that before you delete anything.
 * ============================================================================
 */
