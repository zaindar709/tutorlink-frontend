import { useMemo, useState } from 'react';
import { subjectOptions } from '../../../../constants/SubjectSelection.data';

export const useSubjectSelection = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔍 filter subjects
  const filteredSubjects = useMemo(() => {
    return subjectOptions.filter(subject =>
      subject.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  // 🎯 toggle subject
  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(item => item !== subject)
        : [...prev, subject],
    );
  };

  // 🚀 button enable/disable logic
  const isButtonDisabled = useMemo(() => {
    return selectedSubjects.length === 0 || selectedClass === '';
  }, [selectedSubjects, selectedClass]);

  // 📌 label text
  const selectedLabel =
    selectedSubjects.length === 0
      ? 'No subjects selected'
      : `${selectedSubjects.length} subject${
          selectedSubjects.length > 1 ? 's' : ''
        } selected`;

  return {
    selectedSubjects,
    selectedClass,
    searchQuery,

    filteredSubjects,
    selectedLabel,
    isButtonDisabled,

    setSearchQuery,
    setSelectedClass,
    toggleSubject,
  };
};