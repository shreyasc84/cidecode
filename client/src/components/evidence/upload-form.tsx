import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadEvidence, storeEvidenceOnChain } from "@/lib/web3";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const uploadSchema = z.object({
  caseId: z.string().min(1, "Case ID is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  file: z.instanceof(File, { message: "Evidence file is required" }),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export function UploadForm() {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      try {
        if (!user) throw new Error("User not authenticated");

        // 1. Upload to IPFS
        const ipfsHash = await uploadEvidence(data.file);
        console.log("IPFS upload complete:", ipfsHash);

        // 2. Calculate file hash
        const fileBuffer = await data.file.arrayBuffer();
        const fileHash = await crypto.subtle.digest('SHA-256', fileBuffer);
        const fileHashHex = Array.from(new Uint8Array(fileHash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        console.log("File hash calculated:", fileHashHex);

        // 3. Prepare metadata
        const metadata = {
          description: data.description,
          fileName: data.file.name,
          fileSize: data.file.size,
          fileType: data.file.type,
          timestamp: new Date().toISOString(),
        };

        // 4. Store on blockchain
        console.log("Storing on blockchain...");
        const txHash = await storeEvidenceOnChain(ipfsHash, metadata);
        console.log("Blockchain storage complete:", txHash);

        // 5. Store in backend
        console.log("Submitting to backend...");
        const requestData = {
          caseId: data.caseId,
          fileHash: fileHashHex,
          ipfsHash,
          metadata,
          status: "pending",
          transactionHash: txHash,
        };
        console.log("Request data:", requestData);

        const res = await apiRequest("POST", "/api/evidence", requestData);
        return res.json();
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Evidence uploaded successfully",
        description: "The evidence has been securely stored on the blockchain",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/evidence"] });
    },
    onError: (error: Error) => {
      console.error("Upload mutation error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user || (user.role !== "admin" && user.role !== "officer")) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">You do not have permission to upload evidence.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => uploadMutation.mutateAsync(data))} className="space-y-6">
        <FormField
          control={form.control}
          name="caseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter case ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide a detailed description of the evidence"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel>Evidence File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange(file);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Evidence
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}