import React from 'react';
import { DollarSign, ShoppingBag, UserCheck, Package, TrendingUp, BarChart3 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  color 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-3 h-3" />;
      case 'negative':
        return <TrendingUp className="w-3 h-3 rotate-180" />;
      default:
        return <TrendingUp className="w-3 h-3 rotate-90" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center">
              <span className={`text-sm font-medium ${getChangeColor()} flex items-center`}>
                {getChangeIcon()} <span className="ml-1">{change}</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <icon className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface AdminStatsProps {
  stats: {
    sales: number;
    orders: number;
    users: number;
    products: number;
  };
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Ventes Totales',
      value: `${stats.sales.toLocaleString()} €`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'hover:bg-blue-50 transition-colors'
    },
    {
      title: 'Commandes',
      value: stats.orders,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: ShoppingBag,
      color: 'hover:bg-green-50 transition-colors'
    },
    {
      title: 'Utilisateurs',
      value: stats.users,
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: UserCheck,
      color: 'hover:bg-purple-50 transition-colors'
    },
    {
      title: 'Produits',
      value: stats.products,
      change: '+5.7%',
      changeType: 'positive' as const,
      icon: Package,
      color: 'hover:bg-orange-50 transition-colors'
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2" />
        Statistiques Rapides
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default AdminStats;
