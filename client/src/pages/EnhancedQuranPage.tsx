import { EnhancedMushafReader } from '@/components/EnhancedMushafReader';

export default function EnhancedQuranPage() {
  return (
    <div className="h-screen">
      <EnhancedMushafReader initialPage={1} mode="read" />
    </div>
  );
}
