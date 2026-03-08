import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Document Management</h1>
        <p className="text-muted-foreground mt-1">Store policies, SOPs, compliance evidence, and reports</p>
      </div>
      <div className="grc-card p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display font-semibold text-foreground">Document Repository</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
          Upload and manage policies, SOPs, audit evidence, and reports. All documents are automatically linked to related incidents, risks, and compliance records.
        </p>
      </div>
    </div>
  );
}
