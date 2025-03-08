import { Evidence } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileBox, Link as LinkIcon, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

interface EvidenceCardProps {
  evidence: Evidence;
  onViewDetails?: (evidence: Evidence) => void;
}

export function EvidenceCard({ evidence, onViewDetails }: EvidenceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Case #{evidence.caseId}</CardTitle>
          <Badge variant="outline" className={getStatusColor(evidence.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(evidence.status)}
              {evidence.status}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileBox className="h-4 w-4" />
            <span>File Hash: {evidence.fileHash.slice(0, 10)}...</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LinkIcon className="h-4 w-4" />
            <span>IPFS: {evidence.ipfsHash.slice(0, 10)}...</span>
          </div>
          <p className="text-sm">
            Submitted on: {format(new Date(evidence.createdAt), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => onViewDetails?.(evidence)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
