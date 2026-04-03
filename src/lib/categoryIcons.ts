import { 
  Car, 
  Utensils, 
  Home, 
  Wifi, 
  ShoppingCart, 
  Fuel, 
  Droplets, 
  GraduationCap, 
  HeartPulse, 
  Gamepad2, 
  Package,
  LucideIcon 
} from 'lucide-react';

export const categoryIconMap: Record<string, LucideIcon> = {
  transport: Car,
  food: Utensils,
  home: Home,
  internet: Wifi,
  shopping: ShoppingCart,
  fuel: Fuel,
  water: Droplets,
  education: GraduationCap,
  health: HeartPulse,
  leisure: Gamepad2,
  other: Package,
};

/**
 * Returns the Lucide icon component associated with a category ID.
 */
export function getCategoryIcon(categoryId: string): LucideIcon {
  return categoryIconMap[categoryId] || Package;
}
