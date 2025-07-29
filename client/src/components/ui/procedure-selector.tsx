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
  value?: { procedureId?: number; customProcedureName?: string };
  onChange: (value: { procedureId?: number; customProcedureName?: string }) => void;
  className?: string;
  placeholder?: string;
}

export function ProcedureSelector({ value, onChange, className, placeholder = "Select procedure..." }: ProcedureSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customProcedureName, setCustomProcedureName] = useState("");

  const { data: procedures = [] } = useQuery<Procedure[]>({
    queryKey: ["/api/procedures"],
  });

  // Group procedures by category with proper sorting
  const proceduresByCategory = procedures.reduce((acc, procedure) => {
    const category = procedure.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(procedure);
    return acc;
  }, {} as Record<string, Procedure[]>);

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

  // Filter all procedures based on search term
  const filteredProcedures = procedures.filter(procedure =>
    procedure.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered procedures by category
  const filteredByCategory = filteredProcedures.reduce((acc, procedure) => {
    const category = procedure.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(procedure);
    return acc;
  }, {} as Record<string, Procedure[]>);

  // Get current selection display
  const getDisplayValue = () => {
    if (value?.customProcedureName) {
      return value.customProcedureName;
    }
    if (value?.procedureId) {
      const procedure = procedures.find(p => p.id === value.procedureId);
      return procedure?.name || "Selected procedure";
    }
    return placeholder;
  };

  // Handle procedure selection
  const handleProcedureSelect = (procedure: Procedure) => {
    console.log("Handling procedure selection:", procedure);
    if (procedure.name === "Other") {
      setShowCustomInput(true);
      setOpen(false);
      onChange({ procedureId: procedure.id, customProcedureName: "" });
    } else {
      setShowCustomInput(false);
      setCustomProcedureName("");
      onChange({ procedureId: procedure.id, customProcedureName: undefined });
      setOpen(false);
    }
  };

  // Handle custom procedure name change
  const handleCustomProcedureChange = (customName: string) => {
    setCustomProcedureName(customName);
    onChange({ 
      procedureId: undefined, 
      customProcedureName: customName 
    });
  };

  // Handle add custom procedure button
  const handleAddCustomProcedure = () => {
    setShowCustomInput(true);
    setOpen(false);
    onChange({ procedureId: undefined, customProcedureName: "" });
  };

  // Initialize custom input state if value has custom procedure name
  useEffect(() => {
    if (value?.customProcedureName) {
      setShowCustomInput(true);
      setCustomProcedureName(value.customProcedureName);
    }
  }, [value?.customProcedureName]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Single Procedure Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Procedure
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
                !value?.procedureId && !value?.customProcedureName && "text-gray-500 dark:text-gray-400"
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
                  placeholder="Search procedures..."
                  className="border-0 focus:ring-0"
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
              </div>
              <CommandList className="max-h-80">
                <CommandEmpty>No procedures found.</CommandEmpty>
                
                {/* Always show "Add Custom Procedure" option */}
                <CommandGroup heading="Custom">
                  <CommandItem
                    onSelect={() => handleAddCustomProcedure()}
                    className="cursor-pointer hover:bg-light-elevated dark:hover:bg-dark-elevated"
                  >
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-plus text-blue-600 dark:text-blue-400"></i>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        Add Custom Procedure
                      </span>
                    </div>
                  </CommandItem>
                </CommandGroup>
                
                {/* Show procedures grouped by category */}
                {categoryOrder.map(category => {
                  const categoryProcedures = filteredByCategory[category];
                  if (!categoryProcedures || categoryProcedures.length === 0) return null;
                  
                  return (
                    <CommandGroup key={category} heading={`${emojiMap[category] || "📋"} ${category}`}>
                      {categoryProcedures.map((procedure) => (
                        <CommandItem
                          key={procedure.id}
                          value={`${procedure.id}-${procedure.name}`}
                          onSelect={() => {
                            console.log("Selected procedure:", procedure);
                            handleProcedureSelect(procedure);
                          }}
                          className="cursor-pointer hover:bg-light-elevated dark:hover:bg-dark-elevated"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={cn(
                              procedure.name === "Other" && "font-medium text-blue-600 dark:text-blue-400"
                            )}>
                              {procedure.name}
                            </span>
                            <Check
                              className={cn(
                                "h-4 w-4",
                                value?.procedureId === procedure.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Custom procedure name input */}
      {showCustomInput && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="custom-procedure" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Custom Procedure Name
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustomInput(false);
                setCustomProcedureName("");
                onChange({ procedureId: undefined, customProcedureName: undefined });
              }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i className="fas fa-times mr-1"></i>
              Clear
            </Button>
          </div>
          <Input
            id="custom-procedure"
            type="text"
            placeholder="Enter procedure name..."
            value={customProcedureName}
            onChange={(e) => handleCustomProcedureChange(e.target.value)}
            className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter the specific name of the procedure not listed above
          </p>
        </div>
      )}

      {/* Show selected procedure info */}
      {value?.procedureId && !showCustomInput && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {emojiMap[procedures.find(p => p.id === value.procedureId)?.category || "Other"] || "📋"} {procedures.find(p => p.id === value.procedureId)?.category}
          </Badge>
        </div>
      )}
    </div>
  );
}