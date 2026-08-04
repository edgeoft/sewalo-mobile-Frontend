export interface LanguageOption {
  id: string;
  name: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { id: 'english', name: 'English' },
  { id: 'nepali', name: 'Nepali' },
  { id: 'hindi', name: 'Hindi' },
  { id: 'newari', name: 'Newari' },
  { id: 'tamang', name: 'Tamang' },
  { id: 'maithili', name: 'Maithili' },
  { id: 'bhojpuri', name: 'Bhojpuri' },
  { id: 'magar', name: 'Magar' },
  { id: 'doteli', name: 'Doteli' },
  { id: 'tharu', name: 'Tharu' },
  { id: 'rai', name: 'Rai' },
  { id: 'limbu', name: 'Limbu' },
  { id: 'gurung', name: 'Gurung' },
  { id: 'sherpa', name: 'Sherpa' },
  { id: 'other', name: 'Other' },
];
