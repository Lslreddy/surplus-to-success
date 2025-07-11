
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const DonationGuidelines: React.FC = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Donation Guidelines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Safety First</p>
              <p className="text-sm text-muted-foreground">
                Ensure food is handled safely and is free from contamination.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Be Accurate</p>
              <p className="text-sm text-muted-foreground">
                Provide accurate information about quantity, expiry time, and ingredients.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Packaging</p>
              <p className="text-sm text-muted-foreground">
                Use clean, sealed containers suitable for the type of food you're donating.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary font-bold">
              4
            </div>
            <div>
              <p className="font-medium">Be Available</p>
              <p className="text-sm text-muted-foreground">
                Make yourself available for pickup during the specified time window.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonationGuidelines;
