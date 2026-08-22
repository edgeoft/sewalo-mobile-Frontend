import { useRouter, type Href } from 'expo-router';
import { useSwitchRole } from '@/api';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES } from '@/constants/roles';
import { AccountMenuItemId } from '@/types';
import { getMissingFields } from '@/api/client/query/errorHandler';

export function useAccountActions() {
  const router = useRouter();
  const { logout } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { mutate: switchRoleMutation, isPending: isSwitching } = useSwitchRole();

  const handleLogout = () => {
    logout();
    router.replace(ROUTES.auth.signin);
  };

  const handleSwitchRole = (targetRole: typeof USER_ROLES.Customer | typeof USER_ROLES.Provider) => {
    switchRoleMutation(
      { target_role: targetRole },
      {
        onSuccess: () => {
          const successMessage =
            targetRole === USER_ROLES.Provider ? 'Switched to provider account' : 'Switched to customer account';
          const nextRoute = targetRole === USER_ROLES.Provider ? ROUTES.provider.home : ROUTES.customer.home;

          showSnackbar({ message: successMessage, type: 'success' });
          router.replace(nextRoute);
        },
        onError: (err) => {
          if (targetRole === USER_ROLES.Provider && err.status === 422) {
            const missing = getMissingFields(err.details);
            const params: Record<string, string> = {};
            if (missing?.length) {
              params.missingFields = JSON.stringify(missing);
            }
            router.push({ pathname: ROUTES.customer.becomeProvider, params });
            return;
          }
          showSnackbar({ message: err.message || 'Failed to switch role.', type: 'error' });
        },
      },
    );
  };

  const handleItemNavigation = (itemId: AccountMenuItemId, route?: Href | string) => {
    if (itemId === 'logout') {
      handleLogout();
    } else if (route) {
      router.push(route as Href);
    }
  };

  return {
    isSwitching,
    handleLogout,
    handleSwitchRole,
    handleItemNavigation,
  };
}
