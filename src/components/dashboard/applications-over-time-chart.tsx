
"use client"

import * as React from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import type { JobApplication } from "@/lib/types"
import { subDays, format, startOfWeek, startOfMonth, eachDayOfInterval } from "date-fns"

interface ApplicationsOverTimeChartProps {
  applications: JobApplication[];
}

const chartConfig = {
  applications: {
    label: "Applications",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function ApplicationsOverTimeChart({ applications }: ApplicationsOverTimeChartProps) {

  const data = React.useMemo(() => {
    const last30Days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date(),
    });

    const applicationsByDay = last30Days.map(day => ({
      date: format(day, 'MMM d'),
      applications: applications.filter(app => format(new Date(app.dateApplied), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length,
    }));
    
    return applicationsByDay;
  }, [applications]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Trends</CardTitle>
        <CardDescription>Applications submitted over the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
      {applications.length > 0 ? (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={data}
                margin={{
                top: 5,
                right: 10,
                left: -20,
                bottom: 0,
                }}
            >
                <XAxis 
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    stroke="#888888"
                    fontSize={12}
                    interval={Math.ceil(data.length / 5)}
                    padding={{ left: 10, right: 10 }}
                />
                <YAxis allowDecimals={false} stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
         ) : (
            <div className="flex h-[250px] items-center justify-center text-center text-sm text-muted-foreground">
                Not enough data to display trends. <br/> Add more applications to see your progress.
            </div>
        )}
      </CardContent>
    </Card>
  )
}
