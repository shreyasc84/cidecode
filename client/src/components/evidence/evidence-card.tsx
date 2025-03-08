import { useQuery } from "@tanstack/react-query";
import { Evidence } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileBox, Link as LinkIcon, Clock, CheckCircle2, XCircle, Brain, AlertTriangle } from "lucide-react";
import { analyzeEvidence, type AIAnalysisResult } from "@/lib/ai-analysis";

interface EvidenceCardProps {
  evidence: Evidence;
  onViewDetails?: (evidence: Evidence) => void;
}

export function EvidenceCard({ evidence, onViewDetails }: EvidenceCardProps) {
  const { data: analysis, isLoading: isAnalyzing } = useQuery<AIAnalysisResult>({
    queryKey: ['/api/evidence/analyze', evidence.id],
    queryFn: () => analyzeEvidence(evidence),
  });

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Format the date safely
  const formatDate = (dateString: string | Date) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Case #{evidence.caseId}</CardTitle>
          <div className="flex gap-2">
            {analysis && (
              <Badge variant="outline" className={getRiskColor(analysis.riskLevel)}>
                <AlertTriangle className="h-4 w-4 mr-1" />
                {analysis.riskLevel} risk
              </Badge>
            )}
            <Badge variant="outline" className={getStatusColor(evidence.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(evidence.status)}
                {evidence.status}
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
              Submitted: {formatDate(evidence.createdAt)}
            </p>
          </div>

          {isAnalyzing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 animate-pulse" />
                <span>Analyzing evidence...</span>
              </div>
              <Skeleton className="h-20" />
            </div>
          ) : analysis && (
            <div className="space-y-2 bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Brain className="h-4 w-4" />
                <span>AI Analysis</span>
                <Badge variant="outline" className="ml-auto">
                  {Math.round(analysis.confidence * 100)}% confidence
                </Badge>
              </div>
              <div className="text-sm">
                <p><strong>Category:</strong> {analysis.category}</p>
                <p><strong>Key Insight:</strong> {analysis.insights[0]}</p>
                <p><strong>Related Cases:</strong> {analysis.relatedCases.join(', ')}</p>
              </div>
            </div>
          )}
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