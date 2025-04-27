// app/(manager)/manager/page.tsx
"use client";

// Shadcn UI & Lucide Icons
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Package,
  ShoppingCart,
  Users,
  ZoomIn, // Kept for potential future use
  ZoomOut, // Kept for potential future use
} from "lucide-react";

// Tremor Charts (excluding GeoMap)
import { AreaChart, BarChart, DonutChart, Legend } from "@tremor/react";

// React & State
import { useState, useMemo } from "react"; // Added useMemo

// react-simple-maps & Dependencies
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip"; // Renamed import

// --- Mock Data ---

const summaryCardsData = [
  {
    title: "Total Views",
    value: "$3,456K",
    change: "+0.43%",
    changeType: "increase" as const,
    icon: Eye,
  },
  {
    title: "Total Profit",
    value: "$45,2K",
    change: "+4.35%",
    changeType: "increase" as const,
    icon: ShoppingCart,
  },
  {
    title: "Total Product",
    value: "2,450",
    change: "+2.59%",
    changeType: "increase" as const,
    icon: Package,
  },
  {
    title: "Total Users",
    value: "3,456",
    change: "-0.95%",
    changeType: "decrease" as const,
    icon: Users,
  },
];

const chartData = [
  { month: "Jan", "Total Revenue": 80, "Total Sales": 60 },
  { month: "Feb", "Total Revenue": 150, "Total Sales": 100 },
  { month: "Mar", "Total Revenue": 180, "Total Sales": 120 },
  { month: "Apr", "Total Revenue": 160, "Total Sales": 180 },
  { month: "May", "Total Revenue": 140, "Total Sales": 170 },
  { month: "Jun", "Total Revenue": 200, "Total Sales": 140 },
  { month: "Jul", "Total Revenue": 220, "Total Sales": 160 },
  { month: "Aug", "Total Revenue": 210, "Total Sales": 180 },
  { month: "Sep", "Total Revenue": 200, "Total Sales": 210 },
  { month: "Oct", "Total Revenue": 150, "Total Sales": 240 },
  { month: "Nov", "Total Revenue": 280, "Total Sales": 250 },
  { month: "Dec", "Total Revenue": 300, "Total Sales": 290 },
];

const profitData = [
  { day: "M", Sales: 100, Revenue: 240 },
  { day: "T", Sales: 80, Revenue: 120 },
  { day: "W", Sales: 150, Revenue: 220 },
  { day: "Th", Sales: 120, Revenue: 260 },
  { day: "F", Sales: 70, Revenue: 120 },
  { day: "Sa", Sales: 180, Revenue: 280 },
  { day: "Su", Sales: 140, Revenue: 200 },
];

const visitorsData = [
  {
    source: "Desktop",
    visitors: Math.round(2548 * 0.65),
    fill: "hsl(var(--primary))",
  },
  {
    source: "Mobile",
    visitors: Math.round(2548 * 0.45),
    fill: "hsl(200 80% 60%)",
  },
  {
    source: "Tablet",
    visitors: Math.round(2548 * 0.34),
    fill: "hsl(var(--primary) / 0.5)",
  },
  {
    source: "Unknown",
    visitors: Math.round(2548 * 0.12),
    fill: "hsl(var(--muted))",
  },
];
const totalVisitors = visitorsData.reduce(
  (acc, curr) => acc + curr.visitors,
  0,
);

// Original map data
const mapDataBase = [
  { id: "US-NE", value: 10, fill: "hsl(var(--primary))", name: "Nebraska" },
  { id: "US-CA", value: 5, name: "California" },
  { id: "US-TX", value: 7, name: "Texas" },
  { id: "US-KS", value: 4, name: "Kansas" },
  { id: "US-IA", value: 3, name: "Iowa" },
  { id: "US-CO", value: 6, name: "Colorado" },
  { id: "US-SD", value: 2, name: "South Dakota" },
  { id: "US-WY", value: 1, name: "Wyoming" },
  { id: "US-MO", value: 4, name: "Missouri" },
];

// URL for US states TopoJSON data
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// --- Helper Components ---

const valueFormatter = (number: number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

const donutLabel = `${valueFormatter(totalVisitors)}\nVisitors`;

// --- Main Dashboard Component ---

export default function ManagerDashboardPage() {
  // Memoize the map data lookup for performance
  const mapDataLookup = useMemo(() => {
    return new Map(
      mapDataBase.map((item) => [
        item.name,
        {
          // Use state NAME as key for lookup
          value: item.value,
          name: item.name,
          fill: item.fill || "hsl(var(--primary) / 0.6)", // Specific fill or slightly transparent primary
          originalId: item.id,
        },
      ]),
    );
  }, []); // Empty dependency array means this runs once

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Tooltip component needs to be mounted somewhere accessible */}
      <ReactTooltip id="map-tooltip" />

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCardsData.map((item, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p
                className={cn(
                  "text-xs text-muted-foreground flex items-center",
                  item.changeType === "increase"
                    ? "text-green-600 dark:text-green-500"
                    : "text-red-600 dark:text-red-500",
                )}
              >
                {item.changeType === "increase" ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {item.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line/Area Chart Card */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle>Revenue & Sales Overview</CardTitle>
              <CardDescription>12.04.2022 - 12.05.2023</CardDescription>
            </div>
            <ToggleGroup type="single" defaultValue="month" size="sm">
              <ToggleGroupItem value="day" aria-label="Toggle Day">
                Day
              </ToggleGroupItem>
              <ToggleGroupItem value="week" aria-label="Toggle Week">
                Week
              </ToggleGroupItem>
              <ToggleGroupItem value="month" aria-label="Toggle Month">
                Month
              </ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent className="h-[350px] pl-0 pt-4">
            <AreaChart
              data={chartData}
              index="month"
              categories={["Total Revenue", "Total Sales"]}
              colors={["indigo", "cyan"]}
              valueFormatter={(number: number) =>
                `$${Intl.NumberFormat("us").format(number).toString()}`
              }
              yAxisWidth={60}
              showLegend={true}
              className="h-full w-full"
              curveType="monotone"
            />
          </CardContent>
        </Card>

        {/* Bar Chart Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profit this week</CardTitle>
              <Select defaultValue="this-week">
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-2xl font-semibold pt-2">$13,209</p>
            <Legend
              categories={["Sales", "Revenue"]}
              colors={["blue", "cyan"]}
              className="pt-2"
            />
          </CardHeader>
          <CardContent className="h-[300px] pt-4 pl-0">
            <BarChart
              data={profitData}
              index="day"
              categories={["Sales", "Revenue"]}
              colors={["blue", "cyan"]}
              valueFormatter={(number: number) =>
                `$${Intl.NumberFormat("us").format(number).toString()}`
              }
              yAxisWidth={48}
              stack={true}
              showLegend={false}
              className="h-full w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Analytics Area */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Donut Chart Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Visitors Analytics</CardTitle>
            <Select defaultValue="monthly">
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[350px]">
            <DonutChart
              data={visitorsData}
              category="visitors"
              index="source"
              valueFormatter={valueFormatter}
              colors={["primary", "cyan", "primary/50", "muted"]}
              showLabel={true}
              label={donutLabel}
              className="w-60 h-60"
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-6 text-sm w-full max-w-xs">
              {visitorsData.map((item, i) => {
                const percentage =
                  totalVisitors > 0 ? (item.visitors / totalVisitors) * 100 : 0;
                const colorClasses = [
                  "bg-primary",
                  "bg-cyan-500",
                  "bg-primary/50",
                  "bg-muted-foreground",
                ];
                return (
                  <div
                    key={item.source}
                    className="flex items-center gap-1.5 justify-start"
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        colorClasses[i],
                      )}
                    />
                    <span>{item.source}</span>
                    <span className="text-muted-foreground ml-auto">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Map Card - REWRITTEN with react-simple-maps */}
        <Card className="shadow-sm relative overflow-hidden">
          <CardHeader>
            <CardTitle>Region Labels</CardTitle>
            <CardDescription>
              Visitor distribution across the US
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] p-0">
            {" "}
            {/* Removed relative here, Tooltip is mounted globally */}
            <ComposableMap
              projection="geoAlbersUsa"
              style={{ width: "100%", height: "100%" }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateName = geo.properties.name;
                    const stateData = mapDataLookup.get(stateName); // Use the memoized Map lookup

                    const stateFill = stateData
                      ? stateData.fill
                      : "hsl(var(--muted) / 0.3)"; // Lighter default fill
                    const stateValue = stateData
                      ? `${stateData.value} users`
                      : "No data";

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        data-tooltip-id="map-tooltip" // Connects to the Tooltip component
                        data-tooltip-content={`${stateName}: ${stateValue}`}
                        fill={stateFill}
                        stroke="hsl(var(--card))" // Use card background for borders for better theme support
                        strokeWidth={0.5}
                        style={{
                          default: {
                            outline: "none",
                            transition: "fill 0.2s ease-in-out",
                          }, // Smooth transition
                          hover: {
                            outline: "none",
                            fill: "hsl(var(--primary) / 0.8)",
                          },
                          pressed: {
                            outline: "none",
                            fill: "hsl(var(--primary))",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
            {/* Zoom buttons would require state management with ZoomableGroup */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
