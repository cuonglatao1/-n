'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyEmailSchema, resendVerificationSchema } from '@canvas-llm/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import type { VerifyEmailRequest, ResendVerificationRequest } from '@canvas-llm/shared';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const { verifyEmail, resendVerification, isVerifyEmailLoading, isResendVerificationLoading } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyEmailRequest>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: email,
    },
  });

  const resendForm = useForm<ResendVerificationRequest>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: email,
    },
  });

  useEffect(() => {
    if (email) {
      setValue('email', email);
      resendForm.setValue('email', email);
    }
  }, [email, setValue, resendForm]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [resendCooldown]);

  const onSubmit = (data: VerifyEmailRequest) => {
    verifyEmail(data);
  };

  const onResendCode = (data: ResendVerificationRequest) => {
    resendVerification(data);
    setResendCooldown(60); // 60 seconds cooldown
    setIsResendDisabled(true);
  };

  return (
    <div className="container mx-auto flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a 6-digit verification code to your email address.
            Please enter the code below to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                disabled
                className="bg-gray-50"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                {...register('code')}
                className="text-center text-lg tracking-widest"
              />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifyEmailLoading}
            >
              {isVerifyEmailLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Didn&apos;t receive the code?
              </span>
            </div>
          </div>

          <form onSubmit={resendForm.handleSubmit(onResendCode)} className="space-y-2">
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isResendVerificationLoading || isResendDisabled}
            >
              {isResendVerificationLoading
                ? 'Sending...'
                : isResendDisabled
                ? `Resend in ${resendCooldown}s`
                : 'Resend Verification Code'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Need help? Contact our support team.
          </p>
          <Link
            href="/login"
            className="text-sm text-primary hover:underline"
          >
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
