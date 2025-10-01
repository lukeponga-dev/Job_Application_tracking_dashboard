"use client"
import { useState } from 'react';
import { Lightbulb, BarChart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getDataVisualizationSuggestions } from '@/ai/flows/data-visualization-suggestions';
import type { JobApplication } from '@/lib/types';

interface VisualizationSuggestionsProps {
  applications: JobApplication[];
}

export default function VisualizationSuggestions({ applications }: VisualizationSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const response = await getDataVisualizationSuggestions({
        jobApplicationData: JSON.stringify(applications, null, 2),
      });
      if (response?.suggestions) {
        setSuggestions(response.suggestions);
      } else {
          throw new Error("No suggestions returned from AI.");
      }
    } catch (error) {
      console.error("Failed to get visualization suggestions:", error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not fetch suggestions. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
                <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div className='flex flex-col'>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Get visualization ideas for your data.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Suggestions:</h4>
            <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {suggestions.length === 0 && !isLoading && (
            <div className="text-sm text-center text-muted-foreground py-4 border-2 border-dashed rounded-lg">
                Click the button to generate chart and graph ideas based on your current application data.
            </div>
        )}

        {isLoading && (
            <div className="text-sm text-center text-muted-foreground py-4 flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI is thinking...
            </div>
        )}

        <Button onClick={handleGetSuggestions} disabled={isLoading || applications.length === 0} className="w-full">
            <BarChart className="mr-2 h-4 w-4" />
            {suggestions.length > 0 ? 'Regenerate Suggestions' : 'Get Suggestions'}
        </Button>
      </CardContent>
    </Card>
  );
}
