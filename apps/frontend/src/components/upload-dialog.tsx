import { useState } from 'react';
import { Focus, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

import { initiateUploadSchema } from '../../../api/src/schemas/videos.schema';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { VideoUploader } from './video-uploader';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';

export function UploadDialog() {
  const [open, setOpen] = useState(false);

  const [videoFile, setVideoFile] = useState<File>();

  const form = useForm<z.infer<typeof initiateUploadSchema>>({
    resolver: zodResolver(initiateUploadSchema),
    defaultValues: { visibility: 'PUBLIC' },
  });

  function onSubmit(values: z.infer<typeof initiateUploadSchema>) {
    console.log({ values });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="rainbow">
          <Upload /> Upload
        </Button>
      </DialogTrigger>
      <DialogContent autoFocus={false}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="gap-6">
            <DialogHeader>
              <DialogTitle>Upload video</DialogTitle>
              <DialogDescription>
                Upload a video and start multiple AI analysis jobs on it!
              </DialogDescription>
            </DialogHeader>
            <VideoUploader file={videoFile} setFile={setVideoFile} />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Analysis prompt</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="(e.g) Explain what is happening in this video"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What do you want the model to analyze about the video?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value === 'PUBLIC'}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? 'PUBLIC' : 'PRIVATE');
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set video visibility to public</FormLabel>
                    <FormDescription>
                      Anyone will be able to see the video you upload and the
                      generated analysis.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                disabled={!videoFile}
                type="submit"
                variant={videoFile ? 'rainbow' : 'secondary'}
                className="w-full"
              >
                <Focus /> Upload and Analyze
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
