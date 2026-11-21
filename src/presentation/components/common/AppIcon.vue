<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    filled?: boolean;
  }>(),
  {
    size: "md",
    filled: false,
  },
);

const sizeClasses = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
};
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.85"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="[sizeClasses[props.size], 'shrink-0 transition-transform duration-200']"
    aria-hidden="true"
  >
    <!-- 1. GAMES -->
    <!-- Daily Challenges: Target with Dart -->
    <g v-if="name === 'daily-challenges' || name === 'target'">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" :fill="filled ? 'currentColor' : 'none'" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </g>

    <!-- Snake & Ladder -->
    <g v-else-if="name === 'snake-ladder' || name === 'snake'">
      <path d="M8 3v18M16 3v18" />
      <path d="M8 7h8M8 12h8M8 17h8" />
      <path d="M4 19c2-2 4-2 6-4s4-4 6-2 3 2 4 1" stroke-dasharray="1 1" />
    </g>

    <!-- Dual Dice -->
    <g v-else-if="name === 'dual-dice' || name === 'dice'">
      <rect x="2" y="3" width="12" height="12" rx="2.5" />
      <circle cx="5.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="8" cy="9" r="1" fill="currentColor" />
      <circle cx="10.5" cy="11.5" r="1" fill="currentColor" />
      <path d="M14 7h6a2 2 0 012 2v10a2 2 0 01-2 2h-10a2 2 0 01-2-2v-4" />
      <circle cx="16" cy="13" r="1" fill="currentColor" />
      <circle cx="18" cy="17" r="1" fill="currentColor" />
    </g>

    <!-- Truth or Dare: Flame -->
    <g v-else-if="name === 'truth-or-dare' || name === 'flame'">
      <path d="M12 2c1 3.5 4 6 4 10a6 6 0 11-12 0c0-3 2-6.5 4-8.5.5 1.5 1.5 2.5 2.5 2.5 1 0 1.5-1.5 1.5-4z" />
      <path d="M12 18a2.5 2.5 0 002.5-2.5c0-1.5-1.5-2.5-2.5-3.5-1 1-2.5 2-2.5 3.5A2.5 2.5 0 0012 18z" :fill="filled ? 'currentColor' : 'none'" />
    </g>

    <!-- Two Questions: Conversation Spark -->
    <g v-else-if="name === 'two-questions' || name === 'two-chat'">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      <path d="M9 10h.01M12 10h.01M15 10h.01" stroke-width="2.5" />
    </g>

    <!-- Conversation Cards -->
    <g v-else-if="name === 'conversation-cards' || name === 'cards'">
      <rect x="3" y="5" width="13" height="16" rx="2" />
      <path d="M8 3h10a2 2 0 012 2v13" />
      <path d="M7 10h5M7 14h3" />
    </g>

    <!-- Scratch Cards: Ticket & Stars -->
    <g v-else-if="name === 'scratch-cards' || name === 'scratch'">
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <path d="M2 12a2 2 0 002-2V8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 002 2 2 2 0 00-2 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 00-2-2z" />
      <circle cx="12" cy="12" r="2.5" :fill="filled ? 'currentColor' : 'none'" />
    </g>

    <!-- Positions / Intimacy -->
    <g v-else-if="name === 'positions' || name === 'book-heart'">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M12 9.5a1.8 1.8 0 00-2.5 0 1.8 1.8 0 000 2.5L12 14.5l2.5-2.5a1.8 1.8 0 000-2.5 1.8 1.8 0 00-2.5 0z" :fill="filled ? 'currentColor' : 'none'" />
    </g>

    <!-- 2. HAMYAR GUIDES -->
    <!-- Couple Communication: Connected Hearts -->
    <g v-else-if="name === 'couple_communication' || name === 'couple'">
      <path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" :fill="filled ? 'currentColor' : 'none'" :fill-opacity="filled ? 0.2 : 0" />
      <path d="M12 7.5c-1-1.5-3-2-4.5-.5s-1.5 3.5 0 5L12 16.5" stroke-dasharray="1 1" />
    </g>

    <!-- Premarital Acquaintance: Engagement Ring -->
    <g v-else-if="name === 'premarital_acquaintance' || name === 'ring'">
      <circle cx="12" cy="14" r="7" />
      <path d="M9 4l3-2 3 2-1 3H10L9 4z" :fill="filled ? 'currentColor' : 'none'" />
    </g>

    <!-- Early Marriage: Cozy Home -->
    <g v-else-if="name === 'early_marriage' || name === 'home'">
      <path d="M3 10.5L12 3l9 7.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2V10.5z" />
      <path d="M10 22v-6a2 2 0 012-2h0a2 2 0 012 2v6" />
      <path d="M12 8.5l.8.8a1 1 0 001.4-1.4L12 5.7l-2.2 2.2a1 1 0 001.4 1.4l.8-.8z" />
    </g>

    <!-- Motherhood: Flower / Bloom -->
    <g v-else-if="name === 'motherhood' || name === 'flower'">
      <circle cx="12" cy="12" r="3" :fill="filled ? 'currentColor' : 'none'" />
      <path d="M12 2a3 3 0 00-3 3 3 3 0 006 0 3 3 0 00-3-3z" />
      <path d="M12 16a3 3 0 00-3 3 3 3 0 006 0 3 3 0 00-3-3z" />
      <path d="M2 12a3 3 0 003-3 3 3 0 000 6 3 3 0 00-3-3z" />
      <path d="M16 12a3 3 0 003-3 3 3 0 000 6 3 3 0 00-3-3z" />
    </g>

    <!-- Parenting: Sprout -->
    <g v-else-if="name === 'parenting' || name === 'sprout'">
      <path d="M12 22V10" />
      <path d="M12 10c0-4.5 3.5-8 8-8 0 4.5-3.5 8-8 8z" :fill="filled ? 'currentColor' : 'none'" />
      <path d="M12 14c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6z" />
    </g>

    <!-- Second Child: Baby Stroller / Bottle -->
    <g v-else-if="name === 'second_child' || name === 'baby'">
      <circle cx="8" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M3 5h3l2.5 9h9.5a2 2 0 002-1.5l1.5-6.5H7.5" />
      <path d="M12 8a2.5 2.5 0 012.5 2.5" />
    </g>

    <!-- Empty Nest: Autumn Leaves -->
    <g v-else-if="name === 'mother_empty_nest' || name === 'father_empty_nest' || name === 'leaves'">
      <path d="M12 2a9 9 0 019 9c0 4.97-4.03 9-9 9A9 9 0 013 11c0-4.97 4.03-9 9-9z" />
      <path d="M3 21l9-9" />
      <path d="M12 12c2.5-1 4.5-3.5 5-6" />
    </g>

    <!-- 3. ACTIONS & MODAL HELPERS -->
    <!-- Sparkles -->
    <g v-else-if="name === 'sparkles'">
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" :fill="filled ? 'currentColor' : 'none'" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </g>

    <!-- Calendar -->
    <g v-else-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </g>

    <!-- Calendar Next -->
    <g v-else-if="name === 'calendar-next'">
      <rect x="3" y="4" width="14" height="16" rx="2.5" />
      <path d="M13 2v4M7 2v4M3 9h14" />
      <path d="M18 10l3 3-3 3" />
    </g>

    <!-- History: Clock Rewind -->
    <g v-else-if="name === 'history'">
      <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 3" />
    </g>

    <!-- Pencil / Edit -->
    <g v-else-if="name === 'pencil' || name === 'edit'">
      <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </g>

    <!-- Note / Document -->
    <g v-else-if="name === 'note'">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </g>

    <!-- Beach / Off Day (Umbrella & Sun) -->
    <g v-else-if="name === 'beach' || name === 'sun-beach' || name === 'holiday'">
      <circle cx="18" cy="6" r="3" />
      <path d="M4 14a8 8 0 0116 0H4z" :fill="filled ? 'currentColor' : 'none'" />
      <path d="M12 14v7M10 21h4" />
      <path d="M7 14l1.5-4M17 14l-1.5-4" />
    </g>

    <!-- Sun / Day -->
    <g v-else-if="name === 'sun' || name === 'day'">
      <circle cx="12" cy="12" r="4" :fill="filled ? 'currentColor' : 'none'" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </g>

    <!-- Moon / Night -->
    <g v-else-if="name === 'moon' || name === 'night'">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" :fill="filled ? 'currentColor' : 'none'" />
    </g>

    <!-- Check / Success -->
    <g v-else-if="name === 'check' || name === 'check-circle'">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l2.8 2.8L16 9.5" />
    </g>

    <!-- X / Cancel -->
    <g v-else-if="name === 'x' || name === 'x-circle'">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </g>

    <!-- Clock / Pending -->
    <g v-else-if="name === 'clock' || name === 'pending'">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l3.5 2" />
    </g>

    <!-- Re-roll / Refresh -->
    <g v-else-if="name === 'rotate' || name === 'refresh'">
      <path d="M21.5 2v6h-6M2.5 22v-6h6" />
      <path d="M19.1 14.5a8 8 0 01-14.7 1.2L2.5 16M4.9 9.5a8 8 0 0114.7-1.2L21.5 8" />
    </g>

    <!-- Male (Men Guide) -->
    <g v-else-if="name === 'male'">
      <circle cx="10" cy="14" r="5" />
      <path d="M19 5l-5.4 5.4M19 5h-5M19 5v5" />
    </g>

    <!-- Female (Women Guide) -->
    <g v-else-if="name === 'female'">
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7M9 18h6" />
    </g>

    <!-- Handshake (Little Interaction Experience) -->
    <g v-else-if="name === 'handshake'">
      <path d="M11 17l-4-4 4-4M13 7l4 4-4 4" />
      <rect x="2" y="4" width="20" height="16" rx="4" />
    </g>

    <!-- Chat / Discussion -->
    <g v-else-if="name === 'chat'">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <path d="M8 9h8M8 13h5" />
    </g>

    <!-- Balance / Scale (Do's and Don'ts) -->
    <g v-else-if="name === 'balance' || name === 'scale'">
      <path d="M12 3v18M4 7h16M4 7l3 6M7 13a3 3 0 01-6 0l3-6M17 7l3 6M20 13a3 3 0 01-6 0l3-6" />
    </g>

    <!-- Heart / Love & Affection -->
    <g v-else-if="name === 'heart'">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" :fill="filled ? 'currentColor' : 'none'" />
    </g>

    <!-- Brain / Psychology -->
    <g v-else-if="name === 'brain'">
      <path d="M9.5 4a3.5 3.5 0 00-3.5 3.5c0 .4.07.78.2 1.13A4 4 0 004 12.5a4 4 0 001.5 3.12 3.5 3.5 0 004.5 4.38V12" />
      <path d="M14.5 4a3.5 3.5 0 013.5 3.5c0 .4-.07.78-.2 1.13A4 4 0 0120 12.5a4 4 0 01-1.5 3.12 3.5 3.5 0 01-4.5 4.38V12" />
      <path d="M9.5 8h5M9.5 16h5" />
    </g>

    <!-- Book / Knowledge -->
    <g v-else-if="name === 'book' || name === 'knowledge'">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="14" y2="10" />
    </g>

    <!-- Lightbulb / Myths -->
    <g v-else-if="name === 'lightbulb' || name === 'myths'">
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z" :fill="filled ? 'currentColor' : 'none'" :fill-opacity="filled ? 0.2 : 0" />
    </g>

    <!-- Flag / Red Flags -->
    <g v-else-if="name === 'flag' || name === 'red_flags'">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" :fill="filled ? 'currentColor' : 'none'" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </g>

    <!-- Stethoscope / Professional Questions -->
    <g v-else-if="name === 'stethoscope' || name === 'questions'">
      <path d="M4.5 3v5a4.5 4.5 0 009 0V3" />
      <path d="M9 12.5v4a4 4 0 004 4h1a4 4 0 004-4v-1.5" />
      <circle cx="18" cy="11" r="2" :fill="filled ? 'currentColor' : 'none'" />
    </g>

    <!-- Document / All -->
    <g v-else-if="name === 'document' || name === 'folder'">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </g>

    <!-- Shield / Privacy -->
    <g v-else-if="name === 'shield'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" :fill="filled ? 'currentColor' : 'none'" :fill-opacity="filled ? 0.2 : 0" />
    </g>

    <!-- Lock / Security -->
    <g v-else-if="name === 'lock'">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" :fill="filled ? 'currentColor' : 'none'" :fill-opacity="filled ? 0.15 : 0" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </g>

    <!-- Unlock -->
    <g v-else-if="name === 'unlock'">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 019.9-1" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </g>

    <!-- Trophy / Award -->
    <g v-else-if="name === 'trophy'">
      <path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" />
      <path d="M6 3h12v7a6 6 0 01-12 0V3z" />
      <path d="M9 21h6M12 16v5" />
    </g>

    <!-- Flame / Fire -->
    <g v-else-if="name === 'flame' || name === 'fire'">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" :fill="filled ? 'currentColor' : 'none'" />
    </g>

    <!-- Droplet / Blood -->
    <g v-else-if="name === 'drop' || name === 'blood'">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" :fill="filled ? 'currentColor' : 'none'" />
    </g>

    <!-- Users / Couple -->
    <g v-else-if="name === 'users' || name === 'couple'">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </g>

    <!-- Bell / Reminder -->
    <g v-else-if="name === 'bell'">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </g>

    <!-- Phone / Call -->
    <g v-else-if="name === 'phone'">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </g>

    <!-- Search -->
    <g v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </g>

    <!-- Fallback / Star -->
    <g v-else>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </g>
  </svg>
</template>
