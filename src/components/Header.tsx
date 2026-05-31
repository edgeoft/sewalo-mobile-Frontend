import { useRouter } from 'expo-router';

import LanguageSelector from './LanguageSelector';
import TopBar from './TopBar';

interface HeaderProps {
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
}

export default function Header({ showBackButton = false, rightContent }: HeaderProps) {
  const router = useRouter();

  return (
    <TopBar
      showBackButton={showBackButton}
      onBackPress={() => router.back()}
      rightContent={rightContent ?? <LanguageSelector />}
    />
  );
}
