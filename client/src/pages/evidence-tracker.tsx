import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { EvidenceCard } from "@/components/evidence/evidence-card";
import { Evidence } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileBox, Link as LinkIcon, User, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function EvidenceTracker() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const { data: evidence = [], isLoading } = useQuery<Evidence[]>({
    queryKey: ["/api/evidence"],
  });

  const filteredEvidence = evidence.filter((e) => {
    const matchesSearch = e.caseId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || e.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Evidence Tracker</h1>
          <div className="flex gap-4">
            <Input
              placeholder="Search by case ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvidence.map((evidence) => (
            <EvidenceCard
              key={evidence.id}
              evidence={evidence}
              onViewDetails={setSelectedEvidence}
            />
          ))}
        </div>

        <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
          {selectedEvidence && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Evidence Details - Case #{selectedEvidence.caseId}</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                </TabsList>
                <ScrollArea className="h-[400px] mt-4">
                  <TabsContent value="details">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">File Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileBox className="h-4 w-4" />
                            <span>Hash: {selectedEvidence.fileHash}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            <span>IPFS: {selectedEvidence.ipfsHash}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Submission Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Submitted by: {selectedEvidence.submittedBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Date: {format(new Date(selectedEvidence.createdAt), 'PPpp')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="metadata">
                    <Card>
                      <CardContent className="pt-6">
                        <pre className="text-sm">
                          {JSON.stringify(selectedEvidence.metadata, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="blockchain">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Transaction Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm break-all">
                          Transaction Hash: {selectedEvidence.transactionHash}
                        </p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${selectedEvidence.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2 inline-block"
                        >
                          View on Etherscan
                        </a>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
