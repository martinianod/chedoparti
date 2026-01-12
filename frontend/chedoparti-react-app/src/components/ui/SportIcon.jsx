import { FaTableTennis, FaFutbol, FaBasketballBall } from 'react-icons/fa';
import { GiTennisRacket, GiSoccerBall, GiBasketballBall } from 'react-icons/gi';

const sportIcons = {
  padel: FaTableTennis,
  tennis: GiTennisRacket,
  soccer: FaFutbol,
  basketball: FaBasketballBall,
};

export default function SportIcon({ name, className = 'w-5 h-5' }) {
  const Icon = sportIcons[name] || FaTableTennis;
  return <Icon className={className} />;
}
