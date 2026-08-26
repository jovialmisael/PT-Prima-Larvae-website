import { Category, Division, SectionId } from '@domainTypes/index';
import { UnifiedFormWrapper } from './UnifiedFormWrapper';

interface StackedFormListProps {
  categories: Category[];
  division: Division;
  section: SectionId;
}

export function StackedFormList({ categories, division, section }: StackedFormListProps) {
  if (categories.length === 0) return null;

  return (
    <div className="stacked-form-list">
      <div className="stacked-forms-container">
        <UnifiedFormWrapper categories={categories} division={division} section={section} />
      </div>
    </div>
  );
}
