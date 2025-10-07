import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface IframeDemoProps {
  deployedUrl?: string;
}

export function IframeDemo({ deployedUrl = "https://your-app.vercel.app" }: IframeDemoProps) {
  const iframeCode = `<iframe 
  src="${deployedUrl}" 
  width="100%" 
  height="800px"
  frameborder="0"
  allow="payment"
  style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(iframeCode);
    toast.success("Iframe code copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Iframe Embedding
          </CardTitle>
          <CardDescription>
            Embed your deployed app anywhere using this iframe code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              <code>{iframeCode}</code>
            </pre>
          </div>
          <Button onClick={copyToClipboard} className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy Iframe Code
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            This is how your app will look when embedded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={deployedUrl}
              width="100%"
              height="600px"
              frameBorder="0"
              allow="payment"
              className="w-full"
              title="App Preview"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}