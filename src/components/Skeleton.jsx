import PropTypes from 'prop-types';

/**
 * Componente de Skeleton Loader genérico
 * Usado para mostrar estados de carregamento
 */
export const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${width} ${height} ${className}`}
  />
);

Skeleton.propTypes = {
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
};

/**
 * Skeleton para ExpenseCard
 */
export const ExpenseCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
    <div className="flex items-start gap-4">
      {/* Ícone */}
      <Skeleton width="w-14" height="h-14" className="rounded-xl shrink-0" />

      {/* Conteúdo */}
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton width="w-3/4" height="h-5" />
            <Skeleton width="w-1/2" height="h-4" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton width="w-24" height="h-6" />
            <Skeleton width="w-20" height="h-3" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton para DebtCard
 */
export const DebtCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton width="w-2/3" height="h-6" />
          <Skeleton width="w-1/3" height="h-4" />
        </div>
        <Skeleton width="w-16" height="h-6" className="rounded-full" />
      </div>

      {/* Progresso */}
      <div className="space-y-2">
        <Skeleton width="w-full" height="h-2" className="rounded-full" />
        <div className="flex justify-between">
          <Skeleton width="w-24" height="h-4" />
          <Skeleton width="w-24" height="h-4" />
        </div>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <Skeleton width="w-20" height="h-3" />
          <Skeleton width="w-24" height="h-5" />
        </div>
        <div className="space-y-1">
          <Skeleton width="w-20" height="h-3" />
          <Skeleton width="w-24" height="h-5" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton para GoalCard
 */
export const GoalCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton width="w-2/3" height="h-6" />
          <Skeleton width="w-1/2" height="h-4" />
        </div>
        <Skeleton width="w-10" height="h-10" className="rounded-full" />
      </div>

      {/* Progresso */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton width="w-20" height="h-4" />
          <Skeleton width="w-20" height="h-4" />
        </div>
        <Skeleton width="w-full" height="h-3" className="rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Skeleton width="w-32" height="h-4" />
        <Skeleton width="w-20" height="h-9" className="rounded-lg" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton para IncomeCard
 */
export const IncomeCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
    <div className="flex items-start gap-4">
      {/* Ícone */}
      <Skeleton width="w-12" height="h-12" className="rounded-full shrink-0" />

      {/* Conteúdo */}
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton width="w-3/4" height="h-5" />
            <Skeleton width="w-1/2" height="h-4" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton width="w-24" height="h-6" />
            <Skeleton width="w-20" height="h-3" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton para Cards de Resumo (Dashboard)
 */
export const SummaryCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
    <div className="flex items-center gap-4">
      <Skeleton width="w-12" height="h-12" className="rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-24" height="h-4" />
        <Skeleton width="w-32" height="h-7" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton para InsightCard
 */
export const InsightCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton width="w-6" height="h-6" className="rounded shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton width="w-full" height="h-5" />
          <Skeleton width="w-5/6" height="h-4" />
          <Skeleton width="w-2/3" height="h-4" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Container de Skeleton com múltiplos items
 */
export const SkeletonList = ({ count = 3, component: SkeletonComponent = ExpenseCardSkeleton }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => {
      const Component = SkeletonComponent;
      return <Component key={index} />;
    })}
  </div>
);

SkeletonList.propTypes = {
  count: PropTypes.number,
  component: PropTypes.elementType,
};
