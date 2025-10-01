
"use client"

import * as React from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import type { JobApplication, Status } from "@/lib/types"

interface StatusDistributionChartProps {
  applications: JobApplication[];
}

const statusColors: Record<Status, string> = {
    Applied: "hsl(var(--chart-1))",
    Interviewing: "hsl(var(--chart-4))",
    Offer: "hsl(var(--chart-2))",
    Rejected: "hsl(var(--destructive))",
};
  

const chartConfig = {
    applications: {
      label: "Applications",
    },
    Applied: {
      label: "Applied",
      color: "hsl(var(--chart-1))",
    },
    Interviewing: {
      label: "Interviewing",
      color: "hsl(var(--chart-4))",
    },
    Offer: {
      label: "Offer",
      color: "hsl(var(--chart-2))",
    },
    Rejected: {
      label: "Rejected",
      color: "hsl(var(--destructive))",
    },
} satisfies ChartConfig

export default function StatusDistributionChart({ applications }: StatusDistributionChartProps) {

  const data = React.useMemo(() => {
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<Status, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      fill: statusColors[status as Status],
    }));
  }, [applications]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
        <CardDescription>Distribution of your job application statuses.</CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[250px]"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                    >
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        ) : (
            <div className="flex h-[250px] items-center justify-center text-center text-sm text-muted-foreground">
                No application data to display. <br/> Add some applications to see your status distribution.
            </div>
        )}
      </CardContent>
    </Card>
  )
}
