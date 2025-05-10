import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { AppVersion } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VersionHistoryProps {
  appId: string | number;
}

export default function VersionHistory({ appId }: VersionHistoryProps) {
  // Fetch app versions
  const { data: versions, isLoading, error } = useQuery<AppVersion[]>({
    queryKey: [`/api/apps/${appId}/versions`],
    enabled: !!appId,
  });
  
  // Format file size in human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !versions) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        Failed to load version history. Please refresh the page.
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <p className="text-gray-500 mb-2">No version history available</p>
        <p className="text-sm text-gray-400">The developer hasn't published multiple versions yet</p>
      </div>
    );
  }

  // Sort versions by release date, newest first
  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );

  return (
    <div>
      <Table>
        <TableCaption>Version history for this app</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Released</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Min Android</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Changes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedVersions.map((version) => (
            <TableRow key={version.id}>
              <TableCell className="font-medium">
                {version.version}
                <div className="text-xs text-gray-500 mt-1">
                  Code: {version.versionCode}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(version.releaseDate), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>{formatFileSize(version.fileSize)}</TableCell>
              <TableCell>{version.minAndroidVersion}</TableCell>
              <TableCell>
                {version.isLive ? (
                  <Badge className="bg-green-600">Current</Badge>
                ) : (
                  <Badge variant="outline">Previous</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      View Changes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Log: Version {version.version}</DialogTitle>
                      <DialogDescription>
                        Released on {format(new Date(version.releaseDate), 'MMMM d, yyyy')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 whitespace-pre-wrap">
                      {version.changeLog || "No change log available for this version."}
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}