import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calendar, 
  DollarSign,
  Target,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { parseUTMParams } from '@/utils/utmHelpers';

interface CampaignMetrics {
  campaign: string;
  source: string;
  visits: number;
  leads: number;
  whatsappClicks: number;
  turnos: number;
  senas: number;
  revenue: number;
}

const CampaignMetricsPanel = () => {
  const [dateRange, setDateRange] = useState('7d');
  
  // Fetch redirect analytics for UTM tracking
  const { data: redirectData, isLoading, refetch } = useQuery({
    queryKey: ['campaign-metrics', dateRange],
    queryFn: async () => {
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 1;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const { data, error } = await supabase
        .from('redirect_analytics')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch contact requests for conversion tracking
  const { data: contactData } = useQuery({
    queryKey: ['campaign-contacts', dateRange],
    queryFn: async () => {
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 1;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .gte('created_at', startDate.toISOString());
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate metrics by campaign
  const campaignMetrics: CampaignMetrics[] = [
    {
      campaign: 'Urgencias 24/7',
      source: 'Meta Ads',
      visits: redirectData?.filter(r => r.to_path?.includes('/urgencias')).length || 0,
      leads: contactData?.filter(c => c.is_express).length || 0,
      whatsappClicks: 0, // Would need separate tracking
      turnos: 0,
      senas: 0,
      revenue: 0
    },
    {
      campaign: 'Promo CHEQ10',
      source: 'Meta Ads',
      visits: redirectData?.filter(r => r.to_path?.includes('/promo')).length || 0,
      leads: contactData?.filter(c => c.budget_range).length || 0,
      whatsappClicks: 0,
      turnos: 0,
      senas: 0,
      revenue: 0
    },
    {
      campaign: 'Seña Online',
      source: 'Meta Ads',
      visits: redirectData?.filter(r => r.to_path?.includes('/sena')).length || 0,
      leads: 0,
      whatsappClicks: 0,
      turnos: 0,
      senas: 0,
      revenue: 0
    }
  ];

  // Summary metrics
  const totalVisits = campaignMetrics.reduce((sum, c) => sum + c.visits, 0);
  const totalLeads = contactData?.length || 0;
  const conversionRate = totalVisits > 0 ? ((totalLeads / totalVisits) * 100).toFixed(1) : '0';

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: any;
    trend?: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métricas de Campañas</h2>
          <p className="text-muted-foreground">Seguimiento de rendimiento Meta Ads</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Hoy</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Visitas Totales" 
          value={totalVisits}
          subtitle="Landing pages"
          icon={Users}
        />
        <MetricCard 
          title="Leads Generados" 
          value={totalLeads}
          subtitle="Solicitudes de contacto"
          icon={Target}
        />
        <MetricCard 
          title="Tasa de Conversión" 
          value={`${conversionRate}%`}
          subtitle="Visita → Lead"
          icon={TrendingUp}
        />
        <MetricCard 
          title="CPL Estimado" 
          value="$--"
          subtitle="Configurar gasto"
          icon={DollarSign}
        />
      </div>

      {/* Campaign Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Rendimiento por Campaña
          </CardTitle>
          <CardDescription>
            Desglose de métricas por landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Campaña</th>
                  <th className="text-center py-3 px-2 font-medium">Visitas</th>
                  <th className="text-center py-3 px-2 font-medium">Leads</th>
                  <th className="text-center py-3 px-2 font-medium">WhatsApp</th>
                  <th className="text-center py-3 px-2 font-medium">Turnos</th>
                  <th className="text-center py-3 px-2 font-medium">Señas</th>
                  <th className="text-center py-3 px-2 font-medium">Conv. %</th>
                  <th className="text-right py-3 px-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {campaignMetrics.map((campaign, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{campaign.campaign}</p>
                        <p className="text-xs text-muted-foreground">{campaign.source}</p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">{campaign.visits}</td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={campaign.leads > 0 ? "default" : "secondary"}>
                        {campaign.leads}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-2">{campaign.whatsappClicks}</td>
                    <td className="text-center py-3 px-2">{campaign.turnos}</td>
                    <td className="text-center py-3 px-2">{campaign.senas}</td>
                    <td className="text-center py-3 px-2">
                      {campaign.visits > 0 
                        ? `${((campaign.leads / campaign.visits) * 100).toFixed(1)}%` 
                        : '0%'}
                    </td>
                    <td className="text-right py-3 px-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`/${campaign.campaign.toLowerCase().includes('urgencias') ? 'urgencias' : campaign.campaign.toLowerCase().includes('promo') ? 'promo' : 'sena'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* UTM Parameters Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parámetros UTM para Meta Ads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto">
            <p className="text-muted-foreground mb-2">Urgencias 24/7:</p>
            <code className="text-xs break-all">
              {`${window.location.origin}/urgencias?utm_source=meta&utm_medium=cpc&utm_campaign=urgencias24`}
            </code>
          </div>
          <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto">
            <p className="text-muted-foreground mb-2">Promo CHEQ10:</p>
            <code className="text-xs break-all">
              {`${window.location.origin}/promo?utm_source=meta&utm_medium=cpc&utm_campaign=cheq10`}
            </code>
          </div>
          <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto">
            <p className="text-muted-foreground mb-2">Seña Online:</p>
            <code className="text-xs break-all">
              {`${window.location.origin}/sena?utm_source=meta&utm_medium=cpc&utm_campaign=sena20`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignMetricsPanel;
