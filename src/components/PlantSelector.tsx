import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const plants = [
  { value: "tomato", label: "Tomato" },
  { value: "potato", label: "Potato" },
  { value: "corn", label: "Corn" },
  { value: "rice", label: "Rice" },
  { value: "wheat", label: "Wheat" },
  { value: "apple", label: "Apple" },
  { value: "grape", label: "Grape" },
  { value: "pepper", label: "Bell Pepper" },
  { value: "strawberry", label: "Strawberry" },
  { value: "cherry", label: "Cherry" },
];

interface PlantSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const PlantSelector = ({ value, onValueChange }: PlantSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select plant type..." />
      </SelectTrigger>
      <SelectContent>
        {plants.map((plant) => (
          <SelectItem key={plant.value} value={plant.value}>
            {plant.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PlantSelector;
