import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
  const getYear = (dateStr?: string | null) => {
    if (!dateStr) return 'Present';
    return dateStr.split('-')[0];
  };

  const hasExperienceList = experienceList && experienceList.length > 0;
  const hasEducation = education && education.length > 0;
  const hasSkills = skills && skills.length > 0;
  const hasCertificates = certificates && (Array.isArray(certificates) ? certificates.length > 0 : false);

  return (
    <View className="gap-y-4">
      {/* About Bio Section */}
      <View className="bg-white border border-gray-200 rounded-lg p-4" style={styles.shadowMin}>
        <Text className="text-sm font-sans-bold text-gray-950 mb-2">About Provider</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-5">
          {bio || 'No bio or description provided by the provider.'}
        </Text>
      </View>

      {/* Merged Background, Skills, Experience Container */}
      <View className="bg-white border border-gray-200 rounded-lg p-4 gap-y-4" style={styles.shadowMin}>
        {/* Experience & Languages Summary */}
        <View className="gap-y-3">
          <View className="flex-row items-center gap-2">
            <Feather name="briefcase" size={14} color="#485aff" />
            <Text className="text-xs font-sans-bold text-gray-900">{experience || 'Experienced Professional'}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Feather name="globe" size={14} color="#485aff" />
            <Text className="text-xs font-sans-bold text-gray-900">Languages:</Text>
            <Text className="text-xs font-sans-medium text-gray-500">
              {languages.length > 0 ? languages.join(', ') : 'Not specified'}
            </Text>
          </View>
        </View>

        {/* Separator and Work Experience */}
        {hasExperienceList && (
          <>
            <View className="h-[1px] bg-slate-100" />
            <View className="gap-y-2">
              <Text className="text-xs font-sans-bold text-gray-900">Work Experience</Text>
              <View className="gap-y-2">
                {experienceList.map((exp) => (
                  <View key={exp.id} className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-xs font-sans-bold text-gray-950 flex-1 pr-2">{exp.title}</Text>
                      <View className="bg-primary/5 rounded-md px-2 py-0.5">
                        <Text className="text-[9px] font-sans-bold text-primary">
                          {getYear(exp.start_date)} – {getYear(exp.end_date)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[11px] font-sans-medium text-gray-500">{exp.company_name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Separator and Education */}
        {hasEducation && (
          <>
            <View className="h-[1px] bg-slate-100" />
            <View className="gap-y-2">
              <Text className="text-xs font-sans-bold text-gray-900">Education</Text>
              <View className="gap-y-2">
                {education.map((edu) => (
                  <View key={edu.id} className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-xs font-sans-bold text-gray-950 flex-1 pr-2">{edu.degree}</Text>
                      <View className="bg-primary/5 rounded-md px-2 py-0.5">
                        <Text className="text-[9px] font-sans-bold text-primary">
                          {getYear(edu.start_date)} – {getYear(edu.end_date)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[11px] font-sans-medium text-gray-500">{edu.institute}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Separator and Skills & Expertise */}
        {hasSkills && (
          <>
            <View className="h-[1px] bg-slate-100" />
            <View className="gap-y-2">
              <Text className="text-xs font-sans-bold text-gray-900">Skills & Expertise</Text>
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
        <View className="bg-white border border-gray-200 rounded-lg p-4" style={styles.shadowMin}>
          <Text className="text-sm font-sans-bold text-gray-950 mb-3">Certificates & Documents</Text>
          <View className="gap-y-2">
            {(certificates as any[]).map((cert, index) => {
              const val = typeof cert === 'string' ? cert : cert.value;
              return (
                <View key={index} className="flex-row items-center gap-2">
                  <Feather name="award" size={14} color="#f59e0b" />
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

const styles = StyleSheet.create({
  shadowMin: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
});
