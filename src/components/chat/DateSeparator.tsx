import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateSeparatorProps {
  date: Date;
}

export const DateSeparator = ({ date }: DateSeparatorProps) => {
  const getDateLabel = () => {
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, 'd MMM', { locale: es });
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-muted/80 text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">
        {getDateLabel()}
      </div>
    </div>
  );
};
