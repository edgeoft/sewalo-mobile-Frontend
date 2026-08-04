import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';

interface ExperienceItem {
  id: number;
  title: string;
  company_name: string;
  start_date: string;
  end_date: string | null;
}

interface EducationItem {
  id: number;
  degree: string;
  institute: string;
  start_date: string;
  end_date?: string | null;
}

interface CertificateItem {
  id: number;
  value: string;
}

interface ProviderOverviewTabProps {
  bio: string;
  experience: string;
  languages: string[];
  skills: string[];
  education?: EducationItem[] | null;
  experienceList?: ExperienceItem[] | null;
  certificates?: CertificateItem[] | string[] | null;
}

export default function ProviderOverviewTab({
  bio,
  experience,
  languages,
  skills,
  education,
  experienceList,
  certificates,
}: ProviderOverviewTabProps) {
  const { t } = useTranslation();

  const validExperienceList = (experienceList || []).filter(
    (exp) => (exp.title && exp.title.trim()) || (exp.company_name && exp.company_name.trim()),
  );

  const validEducation = (education || []).filter(
    (edu) => (edu.degree && edu.degree.trim()) || (edu.institute && edu.institute.trim()),
  );

  const formatDateRange = (startDate?: string | null, endDate?: string | null) => {
    const startYear = startDate && startDate.trim() ? startDate.split('-')[0].trim() : null;
    const endYear = endDate && endDate.trim() ? endDate.split('-')[0].trim() : null;
    if (!startYear && !endYear) return null;
    if (!startYear) return endYear;
    return `${startYear} – ${endYear || t('services.present')}`;
  };

  const hasExperienceList = validExperienceList.length > 0;
  const hasEducation = validEducation.length > 0;
  const hasSkills = skills && skills.length > 0;
  const hasCertificates = certificates && (Array.isArray(certificates) ? certificates.length > 0 : false);

  return (
    <View className="gap-y-4">
      {/* About Bio Section */}
      <View className="bg-white border border-gray-200 rounded-lg p-4">
        <Text className="text-sm font-sans-bold text-gray-950 mb-2">{t('services.aboutProvider')}</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-5">{bio || t('services.noBio')}</Text>
      </View>

      {/* Merged Background, Skills, Experience Container */}
      <View className="bg-white border border-gray-200 rounded-lg p-4 gap-y-4">
        {/* Experience & Languages Summary */}
        <View className="gap-y-3">
          <View className="flex-row items-center gap-2">
            <Feather name="briefcase" size={14} color={THEME_COLORS.primary} />
            <Text className="text-xs font-sans-bold text-gray-900">
              {experience || t('services.experiencedProfessional')}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Feather name="globe" size={14} color={THEME_COLORS.primary} />
            <Text className="text-xs font-sans-bold text-gray-900">{t('services.languages')}</Text>
            <Text className="text-xs font-sans-medium text-gray-500">
              {languages.length > 0 ? languages.join(', ') : t('services.notSpecified')}
            </Text>
          </View>
        </View>

        {/* Separator and Work Experience */}
        <View className="h-[1px] bg-slate-100" />
        <View className="gap-y-2">
          <Text className="text-xs font-sans-bold text-gray-900">{t('services.workExperience')}</Text>
          {hasExperienceList ? (
            <View className="gap-y-2">
              {validExperienceList.map((exp) => {
                const dateText = formatDateRange(exp.start_date, exp.end_date);
                return (
                  <View key={exp.id} className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-xs font-sans-bold text-gray-950 flex-1 pr-2">
                        {exp.title || exp.company_name}
                      </Text>
                      {dateText && (
                        <View className="bg-primary/5 rounded-md px-2 py-0.5">
                          <Text className="text-[9px] font-sans-bold text-primary">{dateText}</Text>
                        </View>
                      )}
                    </View>
                    {exp.title && exp.company_name && (
                      <Text className="text-[11px] font-sans-medium text-gray-500">{exp.company_name}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-slate-50/50 border border-slate-100 border-dashed rounded-lg p-3.5 flex-row items-center gap-3">
              <View className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center">
                <Feather name="briefcase" size={14} color="#64748b" />
              </View>
              <Text className="text-xs font-sans-medium text-gray-500 flex-1">{t('services.noExperienceAdded')}</Text>
            </View>
          )}
        </View>

        {/* Separator and Education */}
        <View className="h-[1px] bg-slate-100" />
        <View className="gap-y-2">
          <Text className="text-xs font-sans-bold text-gray-900">{t('services.education')}</Text>
          {hasEducation ? (
            <View className="gap-y-2">
              {validEducation.map((edu) => {
                const dateText = formatDateRange(edu.start_date, edu.end_date);
                return (
                  <View key={edu.id} className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-xs font-sans-bold text-gray-950 flex-1 pr-2">
                        {edu.degree || edu.institute}
                      </Text>
                      {dateText && (
                        <View className="bg-primary/5 rounded-md px-2 py-0.5">
                          <Text className="text-[9px] font-sans-bold text-primary">{dateText}</Text>
                        </View>
                      )}
                    </View>
                    {edu.degree && edu.institute && (
                      <Text className="text-[11px] font-sans-medium text-gray-500">{edu.institute}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-slate-50/50 border border-slate-100 border-dashed rounded-lg p-3.5 flex-row items-center gap-3">
              <View className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center">
                <Feather name="book-open" size={14} color="#64748b" />
              </View>
              <Text className="text-xs font-sans-medium text-gray-500 flex-1">{t('services.noEducationAdded')}</Text>
            </View>
          )}
        </View>

        {/* Separator and Skills & Expertise */}
        {hasSkills && (
          <>
            <View className="h-[1px] bg-slate-100" />
            <View className="gap-y-2">
              <Text className="text-xs font-sans-bold text-gray-900">{t('services.skillsExpertise')}</Text>
              <View className="flex-row flex-wrap gap-2">
                {skills.map((skill) => (
                  <View key={skill} className="bg-gray-100 rounded-lg px-2.5 py-1">
                    <Text className="text-xs font-sans-medium text-gray-600">{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </View>

      {/* Certificates Section */}
      {hasCertificates && (
        <View className="bg-white border border-gray-200 rounded-lg p-4">
          <Text className="text-sm font-sans-bold text-gray-950 mb-3">{t('services.certificatesDocuments')}</Text>
          <View className="gap-y-2">
            {certificates.map((cert, index) => {
              const val = typeof cert === 'string' ? cert : cert.value;
              return (
                <View key={index} className="flex-row items-center gap-2">
                  <Feather name="award" size={14} color={THEME_COLORS.amberStar} />
                  <Text className="text-xs font-sans-medium text-gray-600">{val}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
