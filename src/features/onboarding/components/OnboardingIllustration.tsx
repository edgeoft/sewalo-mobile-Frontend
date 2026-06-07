import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface OnboardingIllustrationProps {
  role: 'customer' | 'provider';
}

export default function OnboardingIllustration({ role }: OnboardingIllustrationProps) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 64, 280);

  if (role === 'customer') {
    return (
      <View className="items-center justify-center py-4 bg-transparent">
        <Svg width={size} height={size} viewBox="0 0 280 280">
          <Defs>
            <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#eef2ff" />
              <Stop offset="100%" stopColor="#e0e7ff" />
            </LinearGradient>
            <LinearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#6366f1" />
              <Stop offset="100%" stopColor="#4338ca" />
            </LinearGradient>
            <LinearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#38bdf8" />
              <Stop offset="100%" stopColor="#0284c7" />
            </LinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle cx="140" cy="140" r="120" fill="url(#bgGrad)" />

          {/* Floating abstract decorative leaves/shapes */}
          <Path d="M40 90 C 50 70, 70 80, 60 100 C 50 110, 40 100, 40 90 Z" fill="#c7d2fe" opacity={0.6} />
          <Path d="M220 180 C 230 160, 250 170, 240 190 C 230 200, 220 190, 220 180 Z" fill="#38bdf8" opacity={0.4} />
          <Path d="M210 80 C 215 70, 225 75, 220 85 C 215 90, 210 85, 210 80 Z" fill="#818cf8" opacity={0.5} />

          {/* Base Platform / Ground shadow */}
          <Ellipse cx="140" cy="225" rx="90" ry="12" fill="#cbd5e1" opacity={0.6} />

          {/* Customer looking at a dashboard */}
          <G transform="translate(60, 80)">
            {/* Phone/Screen Backdrop */}
            <Rect x="10" y="0" width="100" height="140" rx="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            {/* Screen Notch */}
            <Rect x="40" y="0" width="40" height="8" rx="4" fill="#cbd5e1" />
            {/* Map Header Card */}
            <Rect x="20" y="18" width="80" height="40" rx="8" fill="#e0e7ff" />
            {/* Small map elements */}
            <Circle cx="40" cy="38" r="6" fill="#818cf8" />
            <Path d="M60 28 H 85 M60 38 H 80 M60 48 H 75" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            {/* Location Pin */}
            <Path
              d="M40 32 C 38 32, 36 34, 36 36 C 36 39, 40 43, 40 43 C 40 43, 44 39, 44 36 C 44 34, 42 32, 40 32 Z"
              fill="#f43f5e"
            />
            <Circle cx="40" cy="35.5" r="1.5" fill="white" />

            {/* Service Selection Cards */}
            <Rect x="20" y="66" width="80" height="20" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
            <Circle cx="32" cy="76" r="6" fill="url(#primaryGrad)" />
            <Rect x="44" y="73" width="44" height="6" rx="3" fill="#cbd5e1" />

            <Rect x="20" y="94" width="80" height="20" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
            <Circle cx="32" cy="104" r="6" fill="url(#accentGrad)" />
            <Rect x="44" y="101" width="44" height="6" rx="3" fill="#cbd5e1" />
          </G>

          {/* User Figure (Customer) */}
          <G transform="translate(155, 95)">
            {/* Shadow */}
            <Ellipse cx="25" cy="120" rx="18" ry="6" fill="#94a3b8" opacity={0.4} />
            {/* Body */}
            <Path d="M10 90 C 10 70, 40 70, 40 90 C 40 100, 40 120, 40 120 L 10 120 Z" fill="url(#primaryGrad)" />
            {/* Head */}
            <Circle cx="25" cy="55" r="16" fill="#fed7aa" />
            {/* Hair */}
            <Path d="M9 53 C 9 40, 41 40, 41 53 C 41 55, 38 52, 25 52 C 12 52, 9 55, 9 53 Z" fill="#1e293b" />
            {/* Arm pointing to the screen */}
            <Path
              d="M15 82 C 5 70, 0 74, -12 70 C -15 69, -15 67, -10 68 C 0 71, 10 77, 15 82 Z"
              fill="#fed7aa"
              stroke="#fed7aa"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </G>

          {/* Floating Rating Star */}
          <G transform="translate(195, 60)">
            <Circle cx="15" cy="15" r="15" fill="#fef08a" />
            <Path
              d="M15 6 L 17.5 11.5 L 23.5 12 L 19 16 L 20.5 22 L 15 19 L 9.5 22 L 11 16 L 6.5 12 L 12.5 11.5 Z"
              fill="#eab308"
            />
          </G>
        </Svg>
      </View>
    );
  }

  // Provider illustration (matches the web screenshot representation: figures on ladder carrying picture/box/screen)
  return (
    <View className="items-center justify-center py-4 bg-transparent">
      <Svg width={size} height={size} viewBox="0 0 280 280">
        <Defs>
          <LinearGradient id="bgGradP" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#eef2ff" />
            <Stop offset="100%" stopColor="#e0e7ff" />
          </LinearGradient>
          <LinearGradient id="primaryGradP" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6366f1" />
            <Stop offset="100%" stopColor="#485aff" />
          </LinearGradient>
          <LinearGradient id="accentGradP" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ff8a8a" />
            <Stop offset="100%" stopColor="#ff4d4d" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle cx="140" cy="140" r="120" fill="url(#bgGradP)" />

        {/* Dynamic abstract flora in back */}
        <Path d="M70 70 C 80 40, 110 50, 100 80 C 90 90, 80 80, 70 70 Z" fill="#fbcfe8" opacity={0.6} />
        <Path d="M200 60 C 210 40, 230 50, 220 70 C 210 80, 200 70, 200 60 Z" fill="#c7d2fe" opacity={0.6} />

        {/* Web screen dashboard backplate */}
        <G transform="translate(60, 90)">
          <Rect x="0" y="0" width="160" height="100" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
          {/* Header bar */}
          <Rect x="0" y="0" width="160" height="18" rx="10" fill="#cbd5e1" />
          <Rect x="0" y="8" width="160" height="10" fill="#cbd5e1" />
          {/* Circular window controls */}
          <Circle cx="10" cy="9" r="3" fill="#ff4d4d" />
          <Circle cx="18" cy="9" r="3" fill="#eab308" />
          <Circle cx="26" cy="9" r="3" fill="#22c55e" />
          {/* Simple lines inside screen */}
          <Rect x="15" y="30" width="70" height="8" rx="2" fill="#e2e8f0" />
          <Rect x="15" y="44" width="90" height="6" rx="2" fill="#f1f5f9" />
          <Rect x="15" y="54" width="50" height="6" rx="2" fill="#f1f5f9" />
        </G>

        {/* Ladder */}
        <G transform="translate(65, 80)">
          {/* Rails */}
          <Line x1={10} y1={0} x2={10} y2={140} stroke="#64748b" strokeWidth={3} strokeLinecap="round" />
          <Line x1={30} y1={0} x2={30} y2={140} stroke="#64748b" strokeWidth={3} strokeLinecap="round" />
          {/* Rungs */}
          <Line x1={10} y1={20} x2={30} y2={20} stroke="#64748b" strokeWidth={2.5} />
          <Line x1={10} y1={40} x2={30} y2={40} stroke="#64748b" strokeWidth={2.5} />
          <Line x1={10} y1={60} x2={30} y2={60} stroke="#64748b" strokeWidth={2.5} />
          <Line x1={10} y1={80} x2={30} y2={80} stroke="#64748b" strokeWidth={2.5} />
          <Line x1={10} y1={100} x2={30} y2={100} stroke="#64748b" strokeWidth={2.5} />
          <Line x1={10} y1={120} x2={30} y2={120} stroke="#64748b" strokeWidth={2.5} />
        </G>

        {/* Worker on the ladder (Left) */}
        <G transform="translate(75, 110)">
          {/* Body */}
          <Path d="M8 35 C 8 20, 20 20, 20 35 C 20 45, 20 70, 20 70 L 8 70 Z" fill="url(#primaryGradP)" />
          {/* Head */}
          <Circle cx="14" cy="12" r="10" fill="#fed7aa" />
          {/* Cap */}
          <Path d="M5 10 C 5 2, 23 2, 23 10 Z" fill="#312e81" />
          {/* Arms reaching to picture */}
          <Path d="M18 35 Q 35 25 45 35" stroke="#fed7aa" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </G>

        {/* Picture Frame / Box element being placed */}
        <G transform="translate(110, 100)">
          <Rect x="0" y="0" width="55" height="50" rx="8" fill="url(#accentGradP)" stroke="#ffffff" strokeWidth={2.5} />
          <Circle cx="27" cy="25" r="10" fill="#ffffff" opacity={0.3} />
        </G>

        {/* Worker on the right (carrying/supporting the frame) */}
        <G transform="translate(155, 130)">
          {/* Body */}
          <Path d="M10 35 C 10 20, 22 20, 22 35 C 22 45, 22 65, 22 65 L 10 65 Z" fill="#312e81" />
          {/* Head */}
          <Circle cx="16" cy="12" r="10" fill="#fed7aa" />
          {/* Hair */}
          <Path d="M6 12 C 6 5, 26 5, 26 12 Z" fill="#000000" />
          {/* Arms holding picture */}
          <Path d="M12 35 Q -5 22 -15 15" stroke="#fed7aa" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </G>
      </Svg>
    </View>
  );
}
