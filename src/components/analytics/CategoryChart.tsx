import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface CategoryChartProps {
  categories: { profession: string; count: number; growth: number }[];
}

const CategoryChart = ({ categories }: CategoryChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-blue-600">{`Profesionales: ${payload[0].value}`}</p>
          <p className="text-sm text-green-600">{`Crecimiento: +${data.growth.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          Categorías Más Populares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Top 5 as list */}
          <div className="grid gap-3">
            {categories.slice(0, 5).map((category, index) => (
              <div key={category.profession} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{category.profession}</p>
                    <p className="text-sm text-muted-foreground">{category.count} profesionales</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={category.growth >= 10 ? "default" : "secondary"}
                    className={category.growth >= 10 ? "bg-green-500" : ""}
                  >
                    <div className="flex items-center gap-1">
                      {category.growth >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      +{category.growth.toFixed(1)}%
                    </div>
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Chart for all categories */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Distribución por Categorías</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categories.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  className="text-sm fill-muted-foreground"
                />
                <YAxis 
                  type="category"
                  dataKey="profession" 
                  className="text-sm fill-muted-foreground"
                  width={80}
                  tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Categorías Activas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Profesionales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                +{categories.reduce((sum, cat) => sum + cat.growth, 0).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Crecimiento Total</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;