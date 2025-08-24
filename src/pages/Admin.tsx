import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  FileText, 
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Shield
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  plan_type: string;
  status: string;
  created_at: string;
  vehicle_make?: string;
  vehicle_model?: string;
}

interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  is_active: boolean;
  coverage: any;
}

const Admin = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersResponse, plansResponse] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('plans').select('*').order('name')
      ]);

      if (customersResponse.error) throw customersResponse.error;
      if (plansResponse.error) throw plansResponse.error;

      setCustomers(customersResponse.data || []);
      setPlans(plansResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId);

      if (error) throw error;

      setPlans(plans.map(plan => 
        plan.id === planId ? { ...plan, is_active: !currentStatus } : plan
      ));

      toast({
        title: "Success",
        description: `Plan ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Failed to update plan status",
        variant: "destructive",
      });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    {
      title: "Total Customers",
      value: customers.length,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Plans",
      value: plans.filter(p => p.is_active).length,
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: "Total Revenue",
      value: `£${customers.reduce((sum, c) => sum + (plans.find(p => p.name === c.plan_type)?.monthly_price || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Policies",
      value: customers.filter(c => c.status === 'Active').length,
      icon: FileText,
      color: "text-purple-600"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">CoverMe Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "customers", label: "Customers" },
              { id: "plans", label: "Plans" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Customers */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Customers</h3>
              <div className="space-y-4">
                {customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                        {customer.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{customer.plan_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Customers</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <Card>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                          {customer.vehicle_make && (
                            <div className="text-sm">
                              <p className="text-muted-foreground">
                                {customer.vehicle_make} {customer.vehicle_model}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                          {customer.status}
                        </Badge>
                        <p className="text-sm font-medium">{customer.plan_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Warranty Plans</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </div>

            <div className="grid gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {plan.coverage && Array.isArray(plan.coverage) && plan.coverage.map((item: string, index: number) => (
                          <p key={index} className="text-sm text-muted-foreground">• {item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="space-y-1">
                        <p className="text-lg font-bold">£{plan.monthly_price}/mo</p>
                        <p className="text-sm text-muted-foreground">£{plan.yearly_price}/year</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                        >
                          {plan.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;