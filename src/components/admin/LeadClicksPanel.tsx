import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, MousePointerClick } from 'lucide-react';

interface AggregatedLead {
  professional_id: string;
  full_name: string;
  profession: string;
  total_clicks: number;
}

const LeadClicksPanel = () => {
  const [search, setSearch] = useState('');

  const { data: leads, isLoading } = useQuery({
    queryKey: ['admin-lead-clicks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_clicks')
        .select('professional_id, professionals(full_name, profession)');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const aggregated = useMemo(() => {
    if (!leads) return [];

    const map = new Map<string, AggregatedLead>();

    for (const click of leads) {
      const pid = click.professional_id;
      const prof = click.professionals as any;
      const existing = map.get(pid);

      if (existing) {
        existing.total_clicks++;
      } else {
        map.set(pid, {
          professional_id: pid,
          full_name: prof?.full_name || 'Desconocido',
          profession: prof?.profession || 'Sin categoría',
          total_clicks: 1,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total_clicks - a.total_clicks);
  }, [leads]);

  const filtered = useMemo(() => {
    if (!search.trim()) return aggregated;
    const q = search.toLowerCase();
    return aggregated.filter(
      (l) => l.full_name.toLowerCase().includes(q) || l.profession.toLowerCase().includes(q)
    );
  }, [aggregated, search]);

  const totalClicks = aggregated.reduce((sum, l) => sum + l.total_clicks, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando estadísticas de leads...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-primary" />
            <CardTitle>Leads por WhatsApp</CardTitle>
            <Badge variant="secondary">{totalClicks} clics totales</Badge>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar profesional..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {search ? 'Sin resultados para esa búsqueda.' : 'Aún no hay clics registrados.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Contactos Generados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead, idx) => (
                  <TableRow key={lead.professional_id}>
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{lead.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.profession}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-primary">{lead.total_clicks}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadClicksPanel;
