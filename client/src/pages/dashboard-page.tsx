import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";

const mockData = [
  { month: "Jan", cases: 65 },
  { month: "Feb", cases: 59 },
  { month: "Mar", cases: 80 },
  { month: "Apr", cases: 81 },
  { month: "May", cases: 56 },
  { month: "Jun", cases: 55 },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">396</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">372</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Case Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={800} height={300} data={mockData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cases" fill="hsl(var(--primary))" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
