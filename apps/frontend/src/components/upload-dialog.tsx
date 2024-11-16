import { useEffect, useState } from 'react';
import { Focus, Loader2, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import z from 'zod';
import { toast } from 'sonner';

import { initiateUploadSchema } from '../../../api/src/schemas/videos.schema';
import { trpc } from '../utils/trpc';

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

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for multipart upload

export function UploadDialog() {
  const [open, setOpen] = useState(false);

  const [videoFile, setVideoFile] = useState<File>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof initiateUploadSchema>>({
    resolver: zodResolver(initiateUploadSchema),
    defaultValues: { visibility: 'PUBLIC', prompt: '' },
  });

  const { initiateUpload, getUploadUrl, completeUpload } = trpc.videos;

  const { mutateAsync: initiateUploadAsync } = initiateUpload.useMutation();
  const { mutateAsync: getUploadUrlAsync } = getUploadUrl.useMutation();
  const { mutateAsync: completeUploadAsync } = completeUpload.useMutation();

  async function onSubmit(values: z.infer<typeof initiateUploadSchema>) {
    setUploading(true);

    // Slip file and prepare to upload parts
    const chunks = Math.ceil(values.fileSize / CHUNK_SIZE);
    const parts = Array.from({ length: chunks }, (_, i) => i + 1); // part numbers array
    const eTags: { PartNumber: number; ETag: string }[] = [];
    let uploadedChunks = 0;

    // Upload chunk function with retry logic
    async function uploadChunk({
      uploadId,
      s3Key,
      partNumber,
    }: {
      uploadId: string;
      s3Key: string;
      partNumber: number;
    }) {
      if (!videoFile) return;

      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, values.fileSize);
      const chunk = videoFile.slice(start, end);

      async function s3UploadWithRetry(
        signedUrl: string,
        options: RequestInit,
        retries = 3,
      ) {
        for (let i = 0; i < retries; i++) {
          const response = await fetch(signedUrl, options);
          if (response.ok) return response;
          if (i < retries - 1)
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
        }
        throw new Error(`Failed to upload part ${partNumber}`);
      }

      // Fetch signed URL and upload part with retries
      const { signedUrl } = await getUploadUrlAsync({
        uploadId,
        s3Key,
        partNumber,
      });

      const uploadResult = await s3UploadWithRetry(signedUrl, {
        method: 'PUT',
        body: chunk,
      });

      const eTag = uploadResult.headers.get('ETag')!.replace(/"/g, '');
      eTags.push({ PartNumber: partNumber, ETag: eTag });
      uploadedChunks++;

      // Update progress based on completed chunks
      setUploadProgress((uploadedChunks / chunks) * 100);
    }

    try {
      // 1. Initiate upload
      const { uploadId, s3Key, videoId } = await initiateUploadAsync(values);

      // 2. Upload chunks in parallel
      const parallelUploads = parts.map((partNumber) =>
        uploadChunk({ uploadId, s3Key, partNumber }),
      );
      await Promise.all(parallelUploads);

      // 3. Complete upload
      // Double quote eTags as S3 expects it and order by part number
      const doubleQuotedTagParts = eTags
        .map((part) => ({
          ...part,
          ETag: `"${part.ETag}"`,
        }))
        .sort((partA, partB) => partA.PartNumber - partB.PartNumber);

      await completeUploadAsync({
        uploadId,
        s3Key,
        parts: doubleQuotedTagParts,
        videoId,
      });

      setUploadProgress(100);
      setOpen(false);
      setVideoFile(undefined);
      form.reset();
      toast.success('Upload completed successfully.', {
        description:
          'Analysis jobs will start processing now. You can check their status on the video page.',
      });
    } catch (error) {
      toast.error('An error occurred while uploading', {
        description: (error as Error).message,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  // Effect to clear form on close (couldn't find another way for shadcn ui form)
  useEffect(() => {
    if (!open) {
      const clearFormTimeOut = setTimeout(() => {
        setVideoFile(undefined);
        form.reset();
      }, 500);

      () => clearTimeout(clearFormTimeOut);
    }
  }, [open, form]);

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
              <DialogClose className="-mb-2" />
              <DialogTitle>Upload video</DialogTitle>
              <DialogDescription>
                Upload a video and start multiple AI analysis jobs on it!
              </DialogDescription>
            </DialogHeader>
            <VideoUploader
              file={videoFile}
              setFile={setVideoFile}
              form={form}
              uploading={uploading}
              progress={uploadProgress}
            />
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
                    What do you want the model to analyze? You can ask it
                    anything.
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
                disabled={!videoFile || uploading}
                type="submit"
                variant={videoFile && !uploading ? 'rainbow' : 'secondary'}
                className="w-full"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Focus />}
                <p className="sm:w-32">
                  {uploading ? (
                    <span>Uploading...</span>
                  ) : (
                    <>
                      <span>Upload and Analyze</span>
                    </>
                  )}
                </p>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
