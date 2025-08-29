import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, Mail, Search, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface NewsletterSignup {
  id: string;
  email: string;
  discount_amount: number;
  source: string;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  discount_code_sent: boolean;
  discount_code_used: boolean;
}

export default function NewsletterTab() {
  const [signups, setSignups] = useState<NewsletterSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    conversionRate: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNewsletterSignups();
  }, []);

  const fetchNewsletterSignups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSignups(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching newsletter signups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch newsletter signups.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: NewsletterSignup[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = data.filter(signup => new Date(signup.created_at) > weekAgo).length;
    const thisMonth = data.filter(signup => new Date(signup.created_at) > monthAgo).length;
    const codesSent = data.filter(signup => signup.discount_code_sent).length;
    const conversionRate = data.length > 0 ? (codesSent / data.length) * 100 : 0;

    setStats({
      total: data.length,
      thisWeek,
      thisMonth,
      conversionRate
    });
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Discount Amount', 'Source', 'Created At', 'Status', 'Code Sent', 'Code Used'];
    const csvContent = [
      headers.join(','),
      ...signups.map(signup => [
        signup.email,
        signup.discount_amount,
        signup.source,
        format(new Date(signup.created_at), 'yyyy-MM-dd HH:mm:ss'),
        signup.status,
        signup.discount_code_sent ? 'Yes' : 'No',
        signup.discount_code_used ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-signups-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSignups = signups.filter(signup =>
    signup.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Newsletter Signups</h2>
          <p className="text-gray-600">Manage email signups from the discount popup</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Signups List */}
      <Card>
        <CardHeader>
          <CardTitle>Email Signups ({filteredSignups.length})</CardTitle>
          <CardDescription>
            List of users who signed up for the £25 discount offer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSignups.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No signups found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Signups will appear here once users subscribe.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Discount</th>
                      <th className="text-left py-2">Source</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Code Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSignups.map((signup) => (
                      <tr key={signup.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <div className="font-medium">{signup.email}</div>
                        </td>
                        <td className="py-3">
                          <div className="font-medium">£{signup.discount_amount}</div>
                        </td>
                        <td className="py-3">
                          <Badge variant={signup.source === 'popup' ? 'default' : 'secondary'}>
                            {signup.source}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="text-sm text-gray-600">
                            {format(new Date(signup.created_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(signup.created_at), 'HH:mm')}
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant={signup.status === 'active' ? 'default' : 'secondary'}>
                            {signup.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="space-y-1">
                            <Badge variant={signup.discount_code_sent ? 'default' : 'outline'}>
                              {signup.discount_code_sent ? 'Sent' : 'Pending'}
                            </Badge>
                            {signup.discount_code_used && (
                              <Badge variant="secondary" className="block">
                                Used
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}