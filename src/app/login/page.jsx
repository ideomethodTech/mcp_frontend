'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Chrome } from 'lucide-react';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signInWithEmail } = useAuth();

  // AUTH DISABLED: Always redirect to main app
  useEffect(() => {
    router.push('/');
  }, [router]);

  async function loginWithEmailFn({ email, password }, signInWithEmail) {
    const res = await signInWithEmail(email, password);
    return res;
  }

  async function loginWithGoogleFn(signInWithGoogle) {
    const res = await signInWithGoogle();
    return res;
  }

  const emailLoginMutation = useMutation({
    mutationFn: (values) => loginWithEmailFn(values, signInWithEmail),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Signed in successfully!',
      });
      router.push('/');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: () => loginWithGoogleFn(signInWithGoogle),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Signed in successfully!',
      });
      router.push('/');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
    },
  });


  /* Original auth logic - commented out for now
  // Redirect if already logged in
  useEffect(() => {
      if (user) {
          router.push('/');
      }
  }, [user, router]);
  */
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // const handleGoogleSignIn = async () => {
  //   setIsGoogleLoading(true);
  //   try {
  //     await signInWithGoogle();
  //     toast({
  //       title: 'Success',
  //       description: 'Signed in successfully!',
  //     });
  //     router.push('/');
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: error.message || 'Failed to sign in with Google',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsGoogleLoading(false);
  //   }
  // };

  // async function onSubmit(values) {
  //   setIsLoading(true);
  //   try {
  //     await signInWithEmail(values.email, values.password);
  //     toast({
  //       title: 'Success',
  //       description: 'Signed in successfully!',
  //     });
  //     router.push('/');
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: error.message || 'Failed to sign in',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  const handleGoogleSignIn = () => {
    googleLoginMutation.mutate();
  };

  const onSubmit = (values) => {
    emailLoginMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>
            </form>
          </Form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Button variant="link" asChild className="p-0">
              <Link href="/signup">Sign up</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}