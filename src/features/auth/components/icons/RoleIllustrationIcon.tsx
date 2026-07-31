import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { USER_ROLES } from '@/types';

export interface RoleIllustrationIconProps {
  variant: 'customer' | 'provider';
  active: boolean;
}

export default function RoleIllustrationIcon({ variant, active }: RoleIllustrationIconProps) {
  const primary = active ? '#485aff' : '#94a3b8';
  const soft = active ? '#c7cbff' : '#e2e8f0';
  const accent = active ? '#8b97ff' : '#b0bec5';
  const bg = active ? '#e8eaff' : '#f1f5f9';

  if (variant === USER_ROLES.Customer) {
    return (
      <Svg width={52} height={52} viewBox="0 0 52 52">
        <Rect x="10" y="6" width="32" height="42" rx="6" fill={soft} />
        <Rect x="13" y="10" width="26" height="32" rx="3" fill="white" />
        <Rect x="21" y="41" width="10" height="2.5" rx="1.25" fill={accent} />
        <Rect x="17" y="14" width="8" height="7" rx="2" fill={bg} />
        <Rect x="27" y="14" width="8" height="7" rx="2" fill={primary} opacity="0.45" />
        <Rect x="17" y="24" width="8" height="7" rx="2" fill={primary} opacity="0.45" />
        <Rect x="27" y="24" width="8" height="7" rx="2" fill={bg} />
        <Rect x="17" y="34" width="18" height="4" rx="2" fill={bg} />
        <Circle cx="40" cy="14" r="9" fill={primary} />
        <Rect x="35.5" y="14" width="9" height="7" rx="1.5" fill="white" />
        <Path
          d="M37.5 16.5 L38.5 18 L42.5 15"
          stroke={primary}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={52} height={52} viewBox="0 0 52 52">
      <Rect x="8" y="26" width="36" height="22" rx="5" fill={soft} />
      <Rect x="8" y="26" width="36" height="10" rx="5" fill={accent} />
      <Rect x="8" y="30" width="36" height="6" fill={accent} />
      <Path
        d="M18 26 L18 20 C18 16.7 21 14 26 14 C31 14 34 16.7 34 20 L34 26"
        stroke={primary}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <Rect x="20" y="29" width="12" height="7" rx="3.5" fill={primary} />
      <G transform="translate(13, 34)">
        <Path
          d="M2 8 C0.8 6.8 0.8 4.2 2 3 L4.5 5.5 L5.5 4.5 L3 2 C4.2 0.8 6.8 0.8 8 2 C9.2 3.2 9.2 5.8 8 7 L5.5 9.5 C4.5 10.5 2.8 9.2 2 8 Z"
          fill="white"
          opacity="0.75"
        />
      </G>
      <G transform="translate(28, 34)">
        <Rect x="0" y="3" width="8" height="5" rx="1" fill="white" opacity="0.55" />
        <Path
          d="M1 3 L1 1.5 C1 0.7 1.7 0 2.5 0 L5.5 0 C6.3 0 7 0.7 7 1.5 L7 3"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
      </G>
      <Circle cx="40" cy="13" r="9" fill={primary} />
      <Path d="M35 13 l4 4 l7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
