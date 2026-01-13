import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Download, AlertCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  email?: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  max_students_capacity?: number;
  pets?: string;
  preferred_locations?: string[];
  role?: string;
  isDuplicate?: boolean;
  duplicateType?: 'name' | 'email' | 'both';
}

interface ImportResult {
  identifier: string;
  success: boolean;
  error?: string;
}

interface ImportSummary {
  total: number;
  successful: number;
  failed: number;
}

interface ExistingUser {
  full_name: string;
  email: string;
}

const BulkUserImport = () => {
  const [parsedUsers, setParsedUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing users on mount
  useEffect(() => {
    const fetchExistingUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email');
      
      if (!error && data) {
        setExistingUsers(data);
      }
    };
    fetchExistingUsers();
  }, []);

  const checkDuplicates = (users: UserData[]): UserData[] => {
    const existingNames = new Set(existingUsers.map(u => u.full_name.toLowerCase().trim()));
    const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase().trim()));
    
    let dupCount = 0;
    const usersWithDuplicateInfo = users.map(user => {
      const nameMatch = existingNames.has(user.full_name.toLowerCase().trim());
      const emailMatch = user.email && existingEmails.has(user.email.toLowerCase().trim());
      
      if (nameMatch || emailMatch) {
        dupCount++;
        return {
          ...user,
          isDuplicate: true,
          duplicateType: (nameMatch && emailMatch) ? 'both' as const : 
                         nameMatch ? 'name' as const : 'email' as const
        };
      }
      return user;
    });
    
    setDuplicateCount(dupCount);
    return usersWithDuplicateInfo;
  };

  const parseCSV = (text: string): UserData[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const users: UserData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Handle CSV with quoted fields containing commas
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));

      const user: UserData = {
        email: '',
        password: '',
        full_name: '',
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'email':
            user.email = value;
            break;
          case 'password':
            user.password = value;
            break;
          case 'full_name':
            user.full_name = value;
            break;
          case 'phone':
            user.phone = value || undefined;
            break;
          case 'address':
            user.address = value || undefined;
            break;
          case 'max_students_capacity':
            user.max_students_capacity = value ? parseInt(value, 10) : undefined;
            break;
          case 'pets':
            user.pets = value || undefined;
            break;
          case 'preferred_locations':
            user.preferred_locations = value ? value.split(',').map(l => l.trim()) : undefined;
            break;
          case 'role':
            user.role = value || 'host';
            break;
        }
      });

      if (user.password && user.full_name) {
        users.push(user);
      }
    }

    return users;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResults([]);
    setSummary(null);
    setFileName(file.name);
    setDuplicateCount(0);

    try {
      const text = await file.text();
      const users = parseCSV(text);
      const usersWithDuplicates = checkDuplicates(users);
      setParsedUsers(usersWithDuplicates);

      if (users.length === 0) {
        toast.error('No valid users found in CSV');
      } else {
        toast.success(`Found ${users.length} users ready for import`);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (parsedUsers.length === 0) {
      toast.error('No users to import');
      return;
    }

    setIsImporting(true);
    setResults([]);
    setSummary(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to import users');
        return;
      }

      const response = await supabase.functions.invoke('bulk-import-users', {
        body: { users: parsedUsers }
      });

      if (response.error) {
        throw response.error;
      }

      const data = response.data;
      setResults(data.results || []);
      setSummary(data.summary || null);

      if (data.summary?.failed === 0) {
        toast.success(`Successfully imported ${data.summary.successful} users!`);
      } else if (data.summary?.successful > 0) {
        toast.warning(`Imported ${data.summary.successful} users, ${data.summary.failed} failed`);
      } else {
        toast.error('All imports failed');
      }

      // Refresh existing users list after import
      const { data: profiles } = await supabase
        .from('profiles')
        .select('full_name, email');
      if (profiles) {
        setExistingUsers(profiles);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import users');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = `password,full_name,phone,address,max_students_capacity,pets,preferred_locations,role,email
SecurePass123!,John Doe,07123456789,"123 Main Street, London",4,dog,"Watford,Hatch End",host,john.doe@example.com`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'host-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setParsedUsers([]);
    setResults([]);
    setSummary(null);
    setFileName('');
    setDuplicateCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDuplicateLabel = (type?: 'name' | 'email' | 'both') => {
    switch (type) {
      case 'both': return 'Name & Email exist';
      case 'name': return 'Name exists';
      case 'email': return 'Email exists';
      default: return 'Duplicate';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk User Import
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Import multiple host users from a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            CSV must include: <strong>password, full_name</strong>. 
            Optional: email, phone, address, max_students_capacity, pets, preferred_locations, role
          </AlertDescription>
        </Alert>

        {/* File Upload */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="csv-file" className="sr-only">CSV File</Label>
              <Input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isLoading || isImporting}
                className="cursor-pointer"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleDownloadTemplate}
              className="shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>
          {fileName && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {fileName}
            </p>
          )}
        </div>

        {/* Duplicate Warning */}
        {duplicateCount > 0 && !summary && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              <strong>{duplicateCount}</strong> user(s) may already exist in the system. 
              They are marked with a warning badge below. Importing duplicates may fail or create duplicate entries.
            </AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {parsedUsers.length > 0 && !summary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Preview ({parsedUsers.length} users)</h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={resetImport}>
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import All
                    </>
                  )}
                </Button>
              </div>
            </div>
            <ScrollArea className="h-48 border rounded-md">
              <div className="p-3 space-y-2">
                {parsedUsers.slice(0, 10).map((user, index) => (
                  <div 
                    key={index} 
                    className={`text-xs p-2 rounded flex flex-wrap gap-2 items-center ${
                      user.isDuplicate 
                        ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' 
                        : 'bg-muted/50'
                    }`}
                  >
                    {user.isDuplicate && (
                      <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                    )}
                    <span className="font-medium">{user.full_name}</span>
                    {user.email && <span className="text-muted-foreground">{user.email}</span>}
                    {user.isDuplicate && (
                      <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700">
                        {getDuplicateLabel(user.duplicateType)}
                      </Badge>
                    )}
                    {user.preferred_locations && (
                      <Badge variant="secondary" className="text-[10px]">
                        {user.preferred_locations.join(', ')}
                      </Badge>
                    )}
                  </div>
                ))}
                {parsedUsers.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    ... and {parsedUsers.length - 10} more
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Results */}
        {summary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Import Results</h4>
              <Button variant="outline" size="sm" onClick={resetImport}>
                New Import
              </Button>
            </div>
            
            {/* Summary Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                Total: {summary.total}
              </Badge>
              <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Success: {summary.successful}
              </Badge>
              {summary.failed > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed: {summary.failed}
                </Badge>
              )}
            </div>

            {/* Detailed Results */}
            <ScrollArea className="h-48 border rounded-md">
              <div className="p-3 space-y-1">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`text-xs p-2 rounded flex items-start gap-2 ${
                      result.success ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="h-3 w-3 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <span className="font-medium">{result.identifier}</span>
                      {result.error && (
                        <p className="text-red-600 text-[10px] mt-0.5">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkUserImport;
