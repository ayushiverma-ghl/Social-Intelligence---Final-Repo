// One icon per industry (15 Oct). Shapes follow the HighLevel onboarding reference where it
// has one (storefront, building, briefcase, cross, bank, house, bus, sparkles, brush, shield,
// scales); the rest are the closest outline icon in HighRise. Restaurants & Food has no
// outline icon, so it borrows Material's restaurant mark from the same library.
import {
  Building02Icon, Building05Icon, Tool02Icon, Briefcase02Icon, MedicalCrossIcon, BankIcon, Home03Icon,
  ActivityIcon, GraduationHat01Icon, ShoppingBag01Icon, BusIcon, Stars03Icon, Brush01Icon, Shield01Icon,
  Monitor01Icon, HeartHandIcon, PlaneIcon, FaceSmileIcon, Scales02Icon, Users01Icon, Globe01Icon,
} from '@gohighlevel/ghl-icons/24/outline'
import { MaterialRestaurantIcon } from '@gohighlevel/ghl-icons/24/material/rounded'

export const INDUSTRY_ICONS = {
  'Marketing & Advertising': Building02Icon,
  'Real Estate & Property': Building05Icon,
  'Construction, Remodeling & Solar': Tool02Icon,
  'Coaching & Business Consulting': Briefcase02Icon,
  'Medical & Healthcare': MedicalCrossIcon,
  'Financial Services, Lending & Accounting': BankIcon,
  'Home Maintenance & Trades': Home03Icon,
  'Fitness & Nutrition': ActivityIcon,
  'Education & Training': GraduationHat01Icon,
  'Retail & E-commerce': ShoppingBag01Icon,
  'Automotive & Transportation': BusIcon,
  'Beauty, Salon & Spa': Stars03Icon,
  'Photography & Creative Media': Brush01Icon,
  Insurance: Shield01Icon,
  'Technology & Software': Monitor01Icon,
  'Mental Health & Wellness': HeartHandIcon,
  'Events, Travel & Hospitality': PlaneIcon,
  Dental: FaceSmileIcon,
  'Restaurants & Food': MaterialRestaurantIcon,
  Legal: Scales02Icon,
  'Non-profit, Religious & Community': Users01Icon,
}
export const industryIcon = (name) => INDUSTRY_ICONS[name] || Globe01Icon
