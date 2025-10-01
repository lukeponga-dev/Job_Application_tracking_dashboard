
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.95-4.25 1.95-3.87 0-7-3.13-7-7s3.13-7 7-7c1.73 0 3.3.62 4.54 1.8l2.5-2.5C18.14 1.3 15.48 0 12.48 0 5.88 0 .48 5.39.48 12s5.4 12 12 12c3.24 0 5.95-1.08 7.95-3.03s2.55-5.06 2.55-8.05c0-.85-.08-1.55-.25-2.25H12.48z" />
    </svg>
);

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormInputs) => {
    setIsLoading(true);
    const { error } = await signUp({
        email: data.email,
        password: data.password,
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: error.message,
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Sign-up Successful',
        description: 'Please check your email to verify your account.',
      });
      router.push('/login');
    }
  };

  const onGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Google Sign Up Failed',
        description: error.message,
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
                disabled={isLoading || isGoogleLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isLoading || isGoogleLoading}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <Separator className="my-4" />
          <Button variant="outline" className="w-full" onClick={onGoogleSignUp} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? "Signing up..." : <> <GoogleIcon className='mr-2 h-4 w-4'/> Sign up with Google </>}
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
