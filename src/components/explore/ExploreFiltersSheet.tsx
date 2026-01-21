import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, X } from "lucide-react";
import { ExploreFilters, defaultFilters, EXPLORE_CATEGORIES } from "@/hooks/useExploreProfiles";

interface ExploreFiltersSheetProps {
  filters: ExploreFilters;
  onFiltersChange: (filters: ExploreFilters) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExploreFiltersSheet = ({ filters, onFiltersChange, open, onOpenChange }: ExploreFiltersSheetProps) => {
  const toggleInterest = (interest: string) => {
    const newInterests = filters.interests.includes(interest)
      ? filters.interests.filter(i => i !== interest)
      : [...filters.interests, interest];
    onFiltersChange({ ...filters, interests: newInterests });
  };

  const resetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = 
    filters.ageRange[0] !== defaultFilters.ageRange[0] ||
    filters.ageRange[1] !== defaultFilters.ageRange[1] ||
    filters.distance !== defaultFilters.distance ||
    filters.gender !== null ||
    filters.interests.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative rounded-full border-border bg-card"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-card">
        <SheetHeader className="flex flex-row items-center justify-between pb-4">
          <SheetTitle className="font-serif text-xl">Filters</SheetTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-primary">
              Reset All
            </Button>
          )}
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto pb-20">
          {/* Age Range */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Age Range</Label>
            <div className="px-2">
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => onFiltersChange({ ...filters, ageRange: value as [number, number] })}
                min={18}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{filters.ageRange[0]} years</span>
                <span>{filters.ageRange[1]} years</span>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Maximum Distance</Label>
            <div className="px-2">
              <Slider
                value={[filters.distance]}
                onValueChange={(value) => onFiltersChange({ ...filters, distance: value[0] })}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{filters.distance} miles</span>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Gender Preference</Label>
            <Select
              value={filters.gender || "all"}
              onValueChange={(value) => onFiltersChange({ ...filters, gender: value === "all" ? null : value })}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Men</SelectItem>
                <SelectItem value="female">Women</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Interests</Label>
            <div className="flex flex-wrap gap-2">
              {EXPLORE_CATEGORIES.map((category) => (
                <Badge
                  key={category.id}
                  variant={filters.interests.includes(category.id) ? "default" : "outline"}
                  className={`cursor-pointer py-2 px-3 text-sm transition-colors ${
                    filters.interests.includes(category.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-secondary"
                  }`}
                  onClick={() => toggleInterest(category.id)}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <Button 
            className="w-full gradient-primary text-primary-foreground"
            onClick={() => onOpenChange(false)}
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExploreFiltersSheet;
