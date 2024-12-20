import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from 'react-dropzone';
import { toast } from 'sonner';
import z from 'zod';
import { UseFormReturn } from 'react-hook-form';

import { initiateUploadSchema } from '../../../api/src/schemas/videos.schema';
import { cn, formatBytes } from '../utils/cn';

import { FormField, FormItem, FormMessage } from './ui/form';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

type Form = UseFormReturn<z.infer<typeof initiateUploadSchema>>;

interface VideoUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  file: File | undefined;
  setFile: Dispatch<SetStateAction<File | undefined>>;
  uploading: boolean;
  progress: number;
  accept?: DropzoneProps['accept'];
  maxSize?: DropzoneProps['maxSize']; // 200MB default
  disabled?: boolean;
  form: Form;
}

export function VideoUploader(props: VideoUploaderProps) {
  const {
    file,
    setFile,
    uploading,
    progress,
    accept = { 'video/mp4': [] },
    maxSize = 1024 * 1024 * 200, // 200MB
    disabled = false,
    form,
    className,
    ...dropzoneProps
  } = props;

  const [previewImage, setPreviewImage] = useState('');

  // Used to create video preview
  const videoRef = useRef<HTMLVideoElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 1) {
        toast.error('Cannot upload more than 1 video at a time.');
        return;
      }

      if ((file ? 1 : 0) + acceptedFiles.length > 1) {
        toast.error('Cannot upload more than 1 video.');
        return;
      }

      const newFiles = acceptedFiles.map((file) => {
        const videoURL = URL.createObjectURL(file);
        const videoElement = videoRef.current!;

        videoElement!.src = videoURL;

        // Wait for video metadata to load to capture a frame
        videoElement.onloadedmetadata = () => {
          videoElement.currentTime = 5; // Capture a frame at 1 second (you can adjust this)
          form.setValue(
            'duration',
            parseFloat(videoElement.duration.toFixed(3)),
          );
        };

        videoElement.onseeked = () => {
          // Create a canvas to capture the image frame
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;

          const ratio = videoElement.videoWidth / videoElement.videoHeight;

          form.setValue('aspectRatio', Number(ratio.toFixed(2)));

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          // Convert canvas to image URL
          setPreviewImage(canvas.toDataURL('image/png'));
        };

        return file;
      });

      setFile(newFiles[0]);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`Video file ${file.name} was rejected.`);
        });
      }
    },

    [file, setFile, form],
  );

  function onRemove() {
    if (!file) return;
    setFile(undefined);
  }

  // Revoke preview url when component unmounts
  useEffect(() => {
    if (file) {
      form.clearErrors(['fileName', 'fileSize', 'fileType']);

      form.setValue('fileName', file.name);
      form.setValue('fileSize', file.size);
      form.setValue('fileType', file.type as 'video/mp4');
    }

    return () => {
      if (!file) return;
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const isDisabled = disabled || !!file;

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <video ref={videoRef} style={{ display: 'none' }} />
      {file ? (
        <FileCard
          file={file}
          previewImage={previewImage}
          onRemove={onRemove}
          uploading={uploading}
          progress={progress}
          form={form}
        />
      ) : (
        <Dropzone
          onDrop={onDrop}
          accept={accept}
          // maxSize={maxSize} // We will validate this both in the form and backend
          maxFiles={1}
          multiple={false}
          disabled={isDisabled}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className={cn(
                'border-muted-foreground/25 hover:bg-muted/25 group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed px-5 py-2.5 text-center transition',
                'ring-offset-background focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isDragActive && 'border-muted-foreground/50',
                isDisabled && 'pointer-events-none opacity-60',
                className,
              )}
              {...dropzoneProps}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  <div className="rounded-full border border-dashed p-3">
                    <Upload
                      className="text-muted-foreground size-7"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    Drop the video here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                  <div className="rounded-full border border-dashed p-3">
                    <Upload
                      className="text-muted-foreground size-7"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-col gap-px">
                    <p className="text-muted-foreground font-medium">
                      Drag {`'n'`} drop a video, must be an mp4 file
                    </p>
                    <p className="text-muted-foreground/70 text-sm">
                      You can upload a video up to {formatBytes(maxSize)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Dropzone>
      )}
    </div>
  );
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
  previewImage: string;
  uploading: boolean;
  progress: number;
  form: Form;
}

function FileCard({
  file,
  previewImage,
  uploading,
  progress,
  onRemove,
  form,
}: FileCardProps) {
  return (
    <div className="relative flex-row items-center gap-2.5">
      <div className="flex-1 flex-row gap-2.5">
        <FilePreview file={file} previewImage={previewImage} />
        <div className="flex w-full flex-col pb-2">
          <div className="h-full justify-between">
            <div>
              <div className="flex-row justify-between gap-2.5">
                <p className="text-foreground/80 line-clamp-1 text-lg font-medium">
                  {file.name}
                </p>
                <div className="min-w-fit">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={onRemove}
                  >
                    <X className="size-4" aria-hidden="true" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground -mt-1 text-xs">
                {formatBytes(file.size)}
              </p>
            </div>
            {uploading ? <Progress value={progress} /> : null}
          </div>
          <FormField
            control={form.control}
            name="fileName"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fileSize"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fileType"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

interface FilePreviewProps {
  file: File;
  previewImage: string;
}

function FilePreview({ file, previewImage }: FilePreviewProps) {
  return (
    <Image
      src={previewImage}
      alt={file.name}
      width={96}
      height={96}
      loading="lazy"
      className="aspect-square shrink-0 rounded-md object-cover"
    />
  );
}
