import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, PawPrint, Users, FileText, MessageSquare, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Mock data - in a real app, this would come from an API
  const stats = [
    { name: 'Favorites', value: '12', icon: Heart, change: '+2', changeType: 'positive' },
    { name: 'Adoptions', value: '3', icon: PawPrint, change: '+1', changeType: 'positive' },
    { name: 'Following', value: '5', icon: Users, change: '0', changeType: 'neutral' },
    { name: 'Upcoming', value: '2', icon: Calendar, change: '+1', changeType: 'positive' },
  ];

  const recentActivities = [
    { id: 1, type: 'adoption', text: 'Your adoption application for Max has been approved!', time: '2 hours ago', read: false },
    { id: 2, type: 'reminder', text: 'Vaccination due for Luna in 3 days', time: '1 day ago', read: true },
    { id: 3, type: 'message', text: 'New message from Happy Paws Shelter', time: '2 days ago', read: true },
  ];

  const quickActions = [
    { title: 'Report a Stray', description: 'Help an animal in need', icon: FileText, path: '/report' },
    { title: 'Adopt a Pet', description: 'Find your new best friend', icon: PawPrint, path: '/adopt' },
    { title: 'Contact Shelters', description: 'Reach out to local shelters', icon: MessageSquare, path: '/contact-shelters' },
    { title: 'Account Settings', description: 'Update your profile', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || 'Pet Lover'}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your pet adoption journey.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-500' : 'text-muted-foreground'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 text-center p-4 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className="h-6 w-6" />
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className={`flex items-start space-x-3 ${!activity.read ? 'bg-accent/50 p-2 rounded-md' : ''}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {!activity.read && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-2" onClick={() => {
                // In a real app, this would navigate to a dedicated activity page
                toast('Navigating to activity feed');
                console.log('Viewing all activity');
              }}>
                View all activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled pet visits and meetings</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              // In a real app, this would navigate to a dedicated appointments page
              toast('Navigating to all appointments');
              console.log('Viewing all appointments');
            }}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Meet & Greet - Max</h3>
                  <span className="text-xs text-muted-foreground">Tomorrow, 2:00 PM</span>
                </div>
                <p className="text-sm text-muted-foreground">Happy Paws Shelter</p>
              </div>
            </div>
            <div className="flex items-center p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Vaccination - Luna</h3>
                  <span className="text-xs text-muted-foreground">In 3 days, 10:00 AM</span>
                </div>
                <p className="text-sm text-muted-foreground">Paws & Care Clinic</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
