import React from "react";
import { Truck, ShieldCheck, HeadphonesIcon } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Truck,
      title: "Global Shipping",
      description: "Worldwide delivery with real-time package tracking",
    },
    {
      icon: ShieldCheck,
      title: "Secure Transactions",
      description: "Enterprise-grade security with encrypted payments",
    },
    {
      icon: HeadphonesIcon,
      title: "Premium Support",
      description: "Dedicated customer service team at your service",
    },
  ];

  return (
    <div className="w-full py-16 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start space-x-6 p-8 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300 flex-1"
            >
              <div className="rounded-full bg-secondary p-4">
                <feature.icon className="w-8 h-8 text-primary shrink-0" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
