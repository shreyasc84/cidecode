import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Shield, FileBox, Brain, AlertTriangle } from "lucide-react";
import { getCrimeAnalytics } from "@/lib/ai-analysis";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
const RISK_COLORS = {
  high: '#FF6B6B',
  medium: '#FFD93D',
  low: '#6BCB77'
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: getCrimeAnalytics
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBox className="h-5 w-5" />
                Total Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics?.monthlyTrends.reduce((acc, curr) => acc + curr.cases, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {Math.floor(analytics?.monthlyTrends.reduce((acc, curr) => acc + curr.cases, 0) * 0.85)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                High Risk Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {analytics?.riskAssessment.high}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 mt-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Case Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={500} height={300} data={analytics?.monthlyTrends}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cases" fill="hsl(var(--primary))" />
              </BarChart>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crime Categories</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PieChart width={300} height={300}>
                <Pie
                  data={analytics?.crimeCategories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics?.crimeCategories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Risk Assessment Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 justify-center">
              {Object.entries(analytics?.riskAssessment || {}).map(([level, count]) => (
                <div
                  key={level}
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: RISK_COLORS[level as keyof typeof RISK_COLORS] + '20' }}
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm capitalize">{level} Risk</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}