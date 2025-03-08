import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { UploadForm } from "@/components/evidence/upload-form";

export default function EvidenceUpload() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Upload Evidence</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload evidence files to be securely stored on the blockchain
            </p>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All evidence is encrypted and stored on IPFS with blockchain verification. 
                Only authorized personnel can access the files.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chain of Custody</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every action is recorded on the blockchain, creating an immutable 
                audit trail for complete chain of custody.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
