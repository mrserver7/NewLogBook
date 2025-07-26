import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AnesthesiaSelectorProps {
  anesthesiaType: string;
  regionalBlockType?: string;
  customRegionalBlock?: string;
  onAnesthesiaTypeChange: (value: string) => void;
  onRegionalBlockTypeChange?: (value: string) => void;
  onCustomRegionalBlockChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  showRegionalBlocks?: boolean;
}

export function AnesthesiaSelector({
  anesthesiaType,
  regionalBlockType = "",
  customRegionalBlock = "",
  onAnesthesiaTypeChange,
  onRegionalBlockTypeChange,
  onCustomRegionalBlockChange,
  className = "",
  required = false,
  showRegionalBlocks = true
}: AnesthesiaSelectorProps) {
  return (
    <div className={className}>
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Anesthesia Type {required && "*"}
        </Label>
        <Select value={anesthesiaType} onValueChange={onAnesthesiaTypeChange}>
          <SelectTrigger className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General anesthesia">General anesthesia</SelectItem>
            <SelectItem value="Spinal anesthesia">Spinal anesthesia</SelectItem>
            <SelectItem value="Epidural anesthesia">Epidural anesthesia</SelectItem>
            <SelectItem value="Regional blocks">Regional blocks</SelectItem>
            <SelectItem value="Monitored anesthesia care (MAC)">Monitored anesthesia care (MAC)</SelectItem>
            <SelectItem value="Sedation (conscious/deep)">Sedation (conscious/deep)</SelectItem>
            <SelectItem value="Local anesthesia">Local anesthesia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Regional Block Type - Show only when Regional blocks is selected and feature is enabled */}
      {showRegionalBlocks && anesthesiaType === "Regional blocks" && onRegionalBlockTypeChange && (
        <div className="mt-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Regional Block Type
          </Label>
          <Select value={regionalBlockType} onValueChange={(value) => {
            onRegionalBlockTypeChange(value);
            if (value !== "Other" && onCustomRegionalBlockChange) {
              onCustomRegionalBlockChange("");
            }
          }}>
            <SelectTrigger className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select regional block..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="Trigeminal nerve block">Trigeminal nerve block</SelectItem>
              <SelectItem value="Supraorbital nerve block">Supraorbital nerve block</SelectItem>
              <SelectItem value="Infraorbital nerve block">Infraorbital nerve block</SelectItem>
              <SelectItem value="Mental nerve block">Mental nerve block</SelectItem>
              <SelectItem value="Maxillary nerve block">Maxillary nerve block</SelectItem>
              <SelectItem value="Mandibular nerve block">Mandibular nerve block</SelectItem>
              <SelectItem value="Glossopharyngeal nerve block">Glossopharyngeal nerve block</SelectItem>
              <SelectItem value="Greater auricular nerve block">Greater auricular nerve block</SelectItem>
              <SelectItem value="Occipital nerve block">Occipital nerve block</SelectItem>
              <SelectItem value="Superficial cervical plexus block">Superficial cervical plexus block</SelectItem>
              <SelectItem value="Deep cervical plexus block">Deep cervical plexus block</SelectItem>
              <SelectItem value="Paravertebral block (thoracic)">Paravertebral block (thoracic)</SelectItem>
              <SelectItem value="Erector spinae plane (ESP) block (thoracic)">Erector spinae plane (ESP) block (thoracic)</SelectItem>
              <SelectItem value="Pectoral nerve block I">Pectoral nerve block I</SelectItem>
              <SelectItem value="Pectoral nerve block II">Pectoral nerve block II</SelectItem>
              <SelectItem value="Serratus anterior plane block">Serratus anterior plane block</SelectItem>
              <SelectItem value="Intercostal nerve block">Intercostal nerve block</SelectItem>
              <SelectItem value="Interscalene block">Interscalene block</SelectItem>
              <SelectItem value="Supraclavicular block">Supraclavicular block</SelectItem>
              <SelectItem value="Infraclavicular block">Infraclavicular block</SelectItem>
              <SelectItem value="Axillary block">Axillary block</SelectItem>
              <SelectItem value="Lateral cutaneous nerve of forearm block">Lateral cutaneous nerve of forearm block</SelectItem>
              <SelectItem value="Median nerve block">Median nerve block</SelectItem>
              <SelectItem value="Ulnar nerve block">Ulnar nerve block</SelectItem>
              <SelectItem value="Radial nerve block">Radial nerve block</SelectItem>
              <SelectItem value="Digital nerve block">Digital nerve block</SelectItem>
              <SelectItem value="Transversus abdominis plane (TAP) block">Transversus abdominis plane (TAP) block</SelectItem>
              <SelectItem value="Rectus sheath block">Rectus sheath block</SelectItem>
              <SelectItem value="Ilioinguinal/iliohypogastric block">Ilioinguinal/iliohypogastric block</SelectItem>
              <SelectItem value="Quadratus lumborum (QL) block">Quadratus lumborum (QL) block</SelectItem>
              <SelectItem value="Erector spinae plane (ESP) block (lumbar)">Erector spinae plane (ESP) block (lumbar)</SelectItem>
              <SelectItem value="Paravertebral block (lumbar)">Paravertebral block (lumbar)</SelectItem>
              <SelectItem value="Lumbar plexus block">Lumbar plexus block</SelectItem>
              <SelectItem value="Femoral nerve block">Femoral nerve block</SelectItem>
              <SelectItem value="Fascia iliaca block">Fascia iliaca block</SelectItem>
              <SelectItem value="Obturator nerve block">Obturator nerve block</SelectItem>
              <SelectItem value="Lateral femoral cutaneous nerve block">Lateral femoral cutaneous nerve block</SelectItem>
              <SelectItem value="Sciatic nerve block">Sciatic nerve block</SelectItem>
              <SelectItem value="Popliteal sciatic nerve block">Popliteal sciatic nerve block</SelectItem>
              <SelectItem value="Saphenous nerve block (adductor canal)">Saphenous nerve block (adductor canal)</SelectItem>
              <SelectItem value="Ankle block">Ankle block</SelectItem>
              <SelectItem value="Spinal anesthesia">Spinal anesthesia</SelectItem>
              <SelectItem value="Epidural anesthesia">Epidural anesthesia</SelectItem>
              <SelectItem value="Combined spinal-epidural (CSE)">Combined spinal-epidural (CSE)</SelectItem>
              <SelectItem value="Caudal epidural block">Caudal epidural block</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Custom regional block input */}
          {regionalBlockType === "Other" && onCustomRegionalBlockChange && (
            <div className="mt-2">
              <Input
                type="text"
                placeholder="Enter custom regional block..."
                value={customRegionalBlock}
                onChange={(e) => onCustomRegionalBlockChange(e.target.value)}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}