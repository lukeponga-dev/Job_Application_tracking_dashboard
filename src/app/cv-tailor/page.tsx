'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tailorCv } from '@/ai/flows/tailor-cv';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Clipboard, ClipboardCheck } from 'lucide-react';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';

const cvTailorSchema = z.object({
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters long.'),
  currentCv: z.string().min(50, 'CV must be at least 50 characters long.'),
});

type CvTailorFormInputs = z.infer<typeof cvTailorSchema>;

export default function CvTailorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [tailoredCv, setTailoredCv] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<CvTailorFormInputs>({
    resolver: zodResolver(cvTailorSchema),
    defaultValues: {
      jobDescription: '',
      currentCv: '',
    },
  });

  const onSubmit = async (data: CvTailorFormInputs) => {
    setIsLoading(true);
    setTailoredCv('');
    try {
      const result = await tailorCv(data);
      if (result.tailoredCv) {
        setTailoredCv(result.tailoredCv);
        toast({
          title: 'CV Tailored Successfully',
          description: 'Your new CV is ready.',
        });
      } else {
        throw new Error('The AI did not return a tailored CV.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Tailoring CV',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tailoredCv);
    setHasCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">CV Tailor</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tailor Your CV</CardTitle>
            <CardDescription>
              Paste a job description and your current CV to get an AI-powered, tailored version.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="job-description">Job Description</Label>
                      <FormControl>
                        <Textarea
                          id="job-description"
                          placeholder="Paste the job description here..."
                          className="min-h-[200px]"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentCv"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="current-cv">Your Current CV</Label>
                      <FormControl>
                        <Textarea
                          id="current-cv"
                          placeholder="Paste your current CV text here..."
                          className="min-h-[300px]"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" /> Tailor CV
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Tailored CV</CardTitle>
            <CardDescription>
              Your AI-generated CV will appear here. Review and copy it for your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tailoredCv ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={handleCopy}
                >
                  {hasCopied ? (
                    <ClipboardCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy</span>
                </Button>
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-md min-h-[500px] whitespace-pre-wrap">
                  {tailoredCv}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-center text-sm text-muted-foreground h-full min-h-[500px] border-2 border-dashed rounded-lg">
                <p>Your tailored CV will be generated here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
