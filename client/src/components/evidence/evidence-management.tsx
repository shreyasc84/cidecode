import { useState } from "react";
import { Evidence, UserRole, EvidenceMetadata } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";

const editEvidenceSchema = z.object({
  caseId: z.string().min(1, "Case ID is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["pending", "approved", "rejected"]),
});

type EditEvidenceFormData = z.infer<typeof editEvidenceSchema>;

interface EvidenceManagementProps {
  evidence: Evidence;
  onClose: () => void;
}

export function EvidenceManagement({ evidence, onClose }: EvidenceManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const metadata = evidence.metadata as EvidenceMetadata;

  const form = useForm<EditEvidenceFormData>({
    resolver: zodResolver(editEvidenceSchema),
    defaultValues: {
      caseId: evidence.caseId,
      description: metadata.description,
      status: evidence.status as "pending" | "approved" | "rejected",
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: EditEvidenceFormData) => {
      const res = await apiRequest("PATCH", `/api/evidence/${evidence.id}`, {
        ...data,
        metadata: {
          ...metadata,
          description: data.description,
        },
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Evidence updated successfully",
        description: "The case details have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/evidence"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/evidence/${evidence.id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Evidence deleted successfully",
        description: "The case has been permanently removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/evidence"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Only administrators can manage evidence.</p>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => editMutation.mutateAsync(data))}>
          <DialogHeader>
            <DialogTitle>Edit Evidence - Case #{evidence.caseId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="caseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3"
                      {...field}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Case
            </Button>
            <Button type="submit" disabled={editMutation.isPending}>
              <Pencil className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </Form>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this case? This action cannot be undone
            and all evidence data will be permanently removed.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}