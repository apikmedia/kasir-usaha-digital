
import { Badge } from "@/components/ui/badge";
import { Crown, Clock } from "lucide-react";

interface PremiumBadgeProps {
  plan: 'basic' | 'premium';
  is_trial?: boolean;
  days_remaining?: number;
}

const PremiumBadge = ({ plan, is_trial = false, days_remaining = 0 }: PremiumBadgeProps) => {
  if (plan === 'basic') {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Basic
      </Badge>
    );
  }

  if (is_trial) {
    return (
      <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center space-x-1">
        <Clock className="h-3 w-3" />
        <span>Trial {days_remaining}d</span>
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="bg-gradient-to-r from-gold-500 to-yellow-500 text-white flex items-center space-x-1">
      <Crown className="h-3 w-3" />
      <span>Premium</span>
    </Badge>
  );
};

export default PremiumBadge;
