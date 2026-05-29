import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { BiRefresh } from 'react-icons/bi';

interface ResetFiltersButtonProps {
  onReset: () => void;
  className?: string;
}

const ResetFiltersButton = ({ onReset, className }: ResetFiltersButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleReset = useCallback(() => {
    onReset();
    navigate({ pathname: location.pathname, search: '' }, { replace: true });
  }, [onReset, navigate, location.pathname]);

  return (
    <Button
      type="default"
      onClick={handleReset}
      icon={<BiRefresh size={18} />}
      className={className}
    >
      Сбросить фильтры
    </Button>
  );
};

export default ResetFiltersButton;
