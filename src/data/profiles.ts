export interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  distance: number;
  images: string[];
  interests: string[];
  occupation?: string;
  verified?: boolean;
}

export const profiles: Profile[] = [
  {
    id: "1",
    name: "Sofia",
    age: 26,
    bio: "Coffee enthusiast ☕ Art lover 🎨 Looking for someone to explore the city with and share spontaneous adventures.",
    location: "Brooklyn, NY",
    distance: 3,
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
    ],
    interests: ["Art", "Coffee", "Travel", "Photography"],
    occupation: "Graphic Designer",
    verified: true,
  },
  {
    id: "2",
    name: "Marcus",
    age: 29,
    bio: "Musician by night, software engineer by day. Let's grab a drink and talk about everything and nothing.",
    location: "Manhattan, NY",
    distance: 5,
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80",
    ],
    interests: ["Music", "Coding", "Jazz", "Hiking"],
    occupation: "Software Engineer",
    verified: true,
  },
  {
    id: "3",
    name: "Ava",
    age: 24,
    bio: "Yoga instructor finding balance in chaos. Foodie who loves trying new restaurants. Dog mom 🐕",
    location: "Queens, NY",
    distance: 7,
    images: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    ],
    interests: ["Yoga", "Cooking", "Dogs", "Wellness"],
    occupation: "Yoga Instructor",
    verified: false,
  },
  {
    id: "4",
    name: "James",
    age: 31,
    bio: "Chef who believes the way to the heart is through the stomach. Weekend hiker and bookworm.",
    location: "Jersey City, NJ",
    distance: 10,
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80",
    ],
    interests: ["Cooking", "Hiking", "Books", "Wine"],
    occupation: "Executive Chef",
    verified: true,
  },
  {
    id: "5",
    name: "Luna",
    age: 27,
    bio: "Documentary filmmaker with too many plants. Looking for deep conversations and silly moments.",
    location: "Williamsburg, NY",
    distance: 2,
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80",
    ],
    interests: ["Film", "Plants", "Documentary", "Photography"],
    occupation: "Filmmaker",
    verified: true,
  },
];
