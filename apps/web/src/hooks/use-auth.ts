"use client"

import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/components/ui/use-toast';
import type { LoginRequest, RegisterRequest, VerifyEmailRequest, ResendVerificationRequest, User } from '@canvas-llm/shared';

export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
    setLoading,
    setError,
    updateUser,
  } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => apiClient.login(credentials),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      if (response.data) {
        const { user, accessToken, refreshToken } = response.data;
        setAuth(user, accessToken, refreshToken);
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully logged in.',
        });
        router.push('/dashboard');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message,
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => apiClient.register(userData),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      if (response.data) {
        toast({
          title: 'Registration successful!',
          description: 'Please check your email for verification code.',
        });
        router.push(`/verify-email?email=${encodeURIComponent(response.data.user.email)}`);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message,
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      clearAuth();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    },
    onError: (error: Error) => {
      // Clear auth even if logout request fails
      clearAuth();
      router.push('/login');
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.getProfile(),
    enabled: isAuthenticated,
  });

  // Handle profile query success
  React.useEffect(() => {
    if (profileQuery.data?.data) {
      updateUser(profileQuery.data.data);
    }
  }, [profileQuery.data, updateUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<User>) => apiClient.updateProfile(updates),
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data);
        toast({
          title: 'Profile updated',
          description: 'Your profile has been successfully updated.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message,
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (verifyData: VerifyEmailRequest) => apiClient.verifyEmail(verifyData),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (response) => {
      if (response.data) {
        const { user, accessToken, refreshToken } = response.data;
        setAuth(user, accessToken, refreshToken);
        toast({
          title: 'Email verified!',
          description: 'Your email has been successfully verified.',
        });
        router.push('/dashboard');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: error.message,
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: (resendData: ResendVerificationRequest) => apiClient.resendVerification(resendData),
    onSuccess: () => {
      toast({
        title: 'Verification code sent',
        description: 'A new verification code has been sent to your email.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to resend code',
        description: error.message,
      });
    },
  });

  return {
    // State
    user,
    isAuthenticated,
    isLoading: useAuthStore((state) => state.isLoading),
    error: useAuthStore((state) => state.error),

    // Mutations
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    verifyEmail: verifyEmailMutation.mutate,
    resendVerification: resendVerificationMutation.mutate,

    // Query states
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isProfileLoading: profileQuery.isLoading,
    isUpdateProfileLoading: updateProfileMutation.isPending,
    isVerifyEmailLoading: verifyEmailMutation.isPending,
    isResendVerificationLoading: resendVerificationMutation.isPending,
  };
}
