import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Procedure {
  id: number;
  name: string;
  category: string;
}

interface ProcedureSelectorProps {
  value?: { procedureId?: number; customProcedureName?: string; category?: string };
  onChange: (value: { procedureId?: number; customProcedureName?: string; category?: string }) => void;
  className?: string;
  placeholder?: string;
}

export function ProcedureSelector({ value, onChange, className, placeholder = "Select category..." }: ProcedureSelectorProps) {
  const [open, setOpen] = useState(false);
  const [categorySelected, setCategorySelected] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customProcedureName, setCustomProcedureName] = useState("");

  const { data: procedures = [] } = useQuery<Procedure[]>({
    queryKey: ["/api/procedures"],
  });

  // Define category order and emojis
  const categoryOrder = [
    "General Surgery",
    "Orthopedic Surgery", 
    "Thoracic Surgery",
    "Cardiac Surgery",
    "Pediatric Surgery",
    "Neurosurgery",
    "Obstetrics & Gynecology",
    "ENT Surgery",
    "Ophthalmic Surgery",
    "Dental / Maxillofacial Surgery",
    "Urology",
    "Diagnostic & Minor Procedures",
    "Other"
  ];

  const emojiMap: Record<string, string> = {
    "General Surgery": "🏥",
    "Orthopedic Surgery": "🦴", 
    "Thoracic Surgery": "🫁",
    "Cardiac Surgery": "❤️",
    "Pediatric Surgery": "👶",
    "Neurosurgery": "🧠",
    "Obstetrics & Gynecology": "🧑‍⚕️",
    "ENT Surgery": "👃",
    "Ophthalmic Surgery": "👁",
    "Dental / Maxillofacial Surgery": "🦷",
    "Urology": "🧑‍🔧",
    "Diagnostic & Minor Procedures": "🔬",
    "Other": "📋"
  };

  // Get current selection display
  const getDisplayValue = () => {
    if (value?.customProcedureName && value?.category) {
      return `${emojiMap[value.category] || "📋"} ${value.category}: ${value.customProcedureName}`;
    }
    if (value?.category && !value?.customProcedureName) {
      return `${emojiMap[value.category] || "📋"} ${value.category} - Enter procedure name below`;
    }
    return placeholder;
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    console.log("Category selected:", category);
    setSelectedCategory(category);
    setCategorySelected(true);
    setOpen(false);
    // Clear any existing custom procedure name and update with category
    setCustomProcedureName("");
    onChange({ 
      procedureId: undefined, 
      customProcedureName: undefined, 
      category: category 
    });
  };

  // Handle custom procedure name change
  const handleCustomProcedureChange = (customName: string) => {
    setCustomProcedureName(customName);
    onChange({ 
      procedureId: undefined, 
      customProcedureName: customName,
      category: selectedCategory || value?.category
    });
  };

  // Handle clear/reset
  const handleClear = () => {
    setCategorySelected(false);
    setSelectedCategory("");
    setCustomProcedureName("");
    onChange({ procedureId: undefined, customProcedureName: undefined, category: undefined });
  };

  // Initialize state from props
  useEffect(() => {
    if (value?.category) {
      setSelectedCategory(value.category);
      setCategorySelected(true);
    }
    if (value?.customProcedureName) {
      setCustomProcedureName(value.customProcedureName);
    }
  }, [value?.category, value?.customProcedureName]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Category Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Procedure Category
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-light-elevated dark:bg-dark-elevated border-0 hover:bg-light-surface dark:hover:bg-dark-surface"
            >
              <span className={cn(
                "truncate",
                !selectedCategory && "text-gray-500 dark:text-gray-400"
              )}>
                {getDisplayValue()}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <Command>
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput 
                  placeholder="Search categories..."
                  className="border-0 focus:ring-0"
                />
              </div>
              <CommandList className="max-h-80">
                <CommandEmpty>No categories found.</CommandEmpty>
                
                {/* Show categories only */}
                <CommandGroup heading="Select Procedure Category">
                  {categoryOrder.map((category) => (
                    <CommandItem
                      key={category}
                      onSelect={() => handleCategorySelect(category)}
                      className="cursor-pointer hover:bg-light-elevated dark:hover:bg-dark-elevated"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {emojiMap[category] || "📋"} {category}
                        </span>
                        <Check
                          className={cn(
                            "h-4 w-4",
                            selectedCategory === category ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Custom procedure name input - shown after category selection */}
      {categorySelected && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="custom-procedure" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Procedure Name
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i className="fas fa-times mr-1"></i>
              Clear
            </Button>
          </div>
          <Input
            id="custom-procedure"
            type="text"
            placeholder={`Enter ${selectedCategory} procedure name...`}
            value={customProcedureName}
            onChange={(e) => handleCustomProcedureChange(e.target.value)}
            className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter the specific name of the {selectedCategory.toLowerCase()} procedure
          </p>
        </div>
      )}

      {/* Show selected category info */}
      {selectedCategory && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {emojiMap[selectedCategory] || "📋"} {selectedCategory}
          </Badge>
        </div>
      )}
    </div>
  );
}