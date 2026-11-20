import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmPasswordReset,
  fetchAuthMe,
  loginWithGoogleToken,
  loginWithPassword,
  logoutSession,
  registerAccount,
  requestPasswordReset,
  verifyEmailCode,
} from '../api/publicContent.js';

export const AUTH_QUERY_KEY = ['auth', 'me'];

export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchAuthMe,
    staleTime: 60 * 1000,
    retry: 0,
  });

  const refreshAuth = () => queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });

  const loginMutation = useMutation({
    mutationFn: loginWithPassword,
    onSuccess: refreshAuth,
  });

  const registerMutation = useMutation({
    mutationFn: registerAccount,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyEmailCode,
    onSuccess: refreshAuth,
  });

  const forgotMutation = useMutation({
    mutationFn: requestPasswordReset,
  });

  const resetMutation = useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: refreshAuth,
  });

  const googleMutation = useMutation({
    mutationFn: loginWithGoogleToken,
    onSuccess: refreshAuth,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutSession,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, (prev) => ({
        ...(prev || {}),
        user: null,
      }));
    },
  });

  return {
    user: query.data?.user || null,
    googleClientId: query.data?.googleClientId || '',
    mailEnabled: Boolean(query.data?.mailEnabled),
    isLoading: query.isLoading,
    login: loginMutation,
    register: registerMutation,
    verifyEmail: verifyMutation,
    forgotPassword: forgotMutation,
    resetPassword: resetMutation,
    googleLogin: googleMutation,
    logout: logoutMutation,
  };
}
