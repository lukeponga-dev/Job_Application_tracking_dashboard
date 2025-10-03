
'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tailorCv } from '@/ai/flows/tailor-cv';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Clipboard, ClipboardCheck, FileText, FileUp } from 'lucide-react';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CvTailorFormInputs>({
    resolver: zodResolver(cvTailorSchema),
    defaultValues: {
      jobDescription: '',
      currentCv: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          form.setValue('currentCv', text, { shouldValidate: true });
          toast({
            title: 'CV Uploaded',
            description: `${file.name} has been loaded.`,
          });
        };
        reader.readAsText(file);
      } else {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a .txt or .md file.',
        });
      }
    }
  };


  const onSubmit = async (data: CvTailorFormInputs) => {
    setIsLoading(true);
    setTailoredCv('');
    try {
      const result = await tailorCv(data);
      if (result.tailoredCv) {
        setTailoredCv(result.tailoredCv);
        toast({
          title: 'CV Tailored Successfully',
          description: 'Your new AI-powered CV is ready.',
        });
      } else {
        throw new Error('The AI did not return a tailored CV.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Tailoring CV',
        description: (error as Error)?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if(!tailoredCv) return;
    navigator.clipboard.writeText(tailoredCv);
    setHasCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI-Powered CV Tailor
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Instantly customize your CV for any job description.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Create Your Tailored CV</CardTitle>
          <CardDescription>
            Paste the job description and your current CV below, and let our AI handle the rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
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
                          className="min-h-[300px] text-sm"
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
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="current-cv">Your Current CV</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            <FileUp className="mr-2 h-4 w-4" />
                            Upload CV
                        </Button>
                        <Input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".txt,.md"
                        />
                      </div>
                      <FormControl>
                        <Textarea
                          id="current-cv"
                          placeholder="Paste your current CV text here, or upload a file..."
                          className="min-h-[300px] text-sm"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" /> Tailor My CV
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className={`transition-all duration-300 ${isLoading ? 'bg-muted/50 animate-pulse' : ''}`}>
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>Your Tailored CV</CardTitle>
                <CardDescription>
                The AI-generated version of your CV will appear below.
                </CardDescription>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!tailoredCv || isLoading}
                className="shrink-0"
              >
                {hasCopied ? (
                  <ClipboardCheck className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Clipboard className="mr-2 h-4 w-4" />
                )}
                {hasCopied ? 'Copied!' : 'Copy'}
              </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-lg font-medium">AI is tailoring your CV...</p>
              <p className="text-sm">This may take a moment.</p>
            </div>
          ) : tailoredCv ? (
            <div className="relative">
              <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-background border rounded-md min-h-[400px] whitespace-pre-wrap text-foreground">
                {tailoredCv}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground h-full min-h-[400px] border-2 border-dashed rounded-lg p-8">
              <FileText className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Your tailored CV will appear here</h3>
              <p className="max-w-md">Once you provide a job description and your current CV, the AI-generated result will be ready for you to copy and use.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
