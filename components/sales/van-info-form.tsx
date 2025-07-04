import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface VanInfo {
  vanId?: string;
  driverName: string;
  route: string;
  departureTime?: string;
  expectedReturnTime?: string;
  vanNotes?: string;
  isVanOperation: boolean;
}

interface VanInfoFormProps {
  vanInfo: VanInfo;
  onVanInfoChange: (info: VanInfo) => void;
  showVanFields: boolean;
}

export function VanInfoForm({ vanInfo, onVanInfoChange, showVanFields }: VanInfoFormProps) {
  
  const handleFieldChange = (field: keyof VanInfo, value: string | boolean) => {
    onVanInfoChange({
      ...vanInfo,
      [field]: value,
    });
  };

  if (!showVanFields) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Van Operation Details
          <div className="flex items-center space-x-2">
            <Checkbox
              id="van-operation"
              checked={vanInfo.isVanOperation}
              onChange={(e) => handleFieldChange('isVanOperation', e.target.checked)}
            />
            <Label htmlFor="van-operation">Enable Van Operation</Label>
          </div>
        </CardTitle>
      </CardHeader>
      
      {vanInfo.isVanOperation && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="van-id">Van ID</Label>
              <Input
                id="van-id"
                value={vanInfo.vanId || ''}
                onChange={(e) => handleFieldChange('vanId', e.target.value)}
                placeholder="Enter van identifier"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-name">
                Driver Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="driver-name"
                value={vanInfo.driverName}
                onChange={(e) => handleFieldChange('driverName', e.target.value)}
                placeholder="Enter driver name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="route">
                Route <span className="text-red-500">*</span>
              </Label>
              <Input
                id="route"
                value={vanInfo.route}
                onChange={(e) => handleFieldChange('route', e.target.value)}
                placeholder="Enter route description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departure-time">Departure Time</Label>
              <Input
                id="departure-time"
                type="datetime-local"
                value={vanInfo.departureTime || ''}
                onChange={(e) => handleFieldChange('departureTime', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected-return">Expected Return Time</Label>
              <Input
                id="expected-return"
                type="datetime-local"
                value={vanInfo.expectedReturnTime || ''}
                onChange={(e) => handleFieldChange('expectedReturnTime', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="van-notes">Van Operation Notes</Label>
              <Textarea
                id="van-notes"
                value={vanInfo.vanNotes || ''}
                onChange={(e) => handleFieldChange('vanNotes', e.target.value)}
                placeholder="Additional notes about the van operation"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
} 