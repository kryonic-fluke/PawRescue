import { useState } from "react";
import { Users, Plus, Mail, Phone, Shield, Star, Calendar, Activity, UserPlus, Send, Eye, Clock, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const mockTeamMembers = [
  {
    id: "TM001",
    name: "Dr. Sarah Johnson",
    role: "Veterinarian",
    email: "sarah.johnson@happytails.org",
    phone: "+91 98765 43210",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/ac68c699-50dc-4969-948e-c865aa87c2ee/generated_images/professional-3d-cartoon-style-female-vet-9ec7b701-20251102072130.jpg",
    status: "active",
    joinDate: "2022-03-15",
    specialization: "Emergency Medicine",
    casesHandled: 145,
    rating: 4.9
  },
  {
    id: "TM002", 
    name: "Raj Patel",
    role: "Rescue Coordinator",
    email: "raj.patel@happytails.org",
    phone: "+91 87654 32109",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/ac68c699-50dc-4969-948e-c865aa87c2ee/generated_images/professional-3d-cartoon-style-male-rescu-ae3f5e7c-20251102072131.jpg",
    status: "active",
    joinDate: "2021-08-20",
    specialization: "Field Rescue",
    casesHandled: 98,
    rating: 4.7
  },
  {
    id: "TM003",
    name: "Priya Sharma",
    role: "Adoption Counselor", 
    email: "priya.sharma@happytails.org",
    phone: "+91 76543 21098",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/ac68c699-50dc-4969-948e-c865aa87c2ee/generated_images/professional-3d-cartoon-style-female-ado-462cc614-20251102072131.jpg",
    status: "active",
    joinDate: "2023-01-10",
    specialization: "Family Matching",
    casesHandled: 67,
    rating: 4.8
  },
  {
    id: "TM004",
    name: "Mike Wilson",
    role: "Volunteer",
    email: "mike.wilson@email.com",
    phone: "+91 65432 10987",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/ac68c699-50dc-4969-948e-c865aa87c2ee/generated_images/professional-3d-cartoon-style-male-rescu-ae3f5e7c-20251102072131.jpg",
    status: "inactive",
    joinDate: "2023-06-15",
    specialization: "Transport",
    casesHandled: 23,
    rating: 4.5
  }
];

const mockVolunteers = [
  {
    id: "VOL001",
    name: "Anita Desai",
    email: "anita.desai@email.com",
    phone: "+91 98765 12345",
    role: "Transport Volunteer",
    status: "active",
    hoursContributed: 45,
    joinDate: "2023-09-01"
  },
  {
    id: "VOL002",
    name: "Karan Singh",
    email: "karan.singh@email.com",
    phone: "+91 87654 23456",
    role: "Foster Volunteer",
    status: "active",
    hoursContributed: 120,
    joinDate: "2023-07-15"
  }
];

const mockSchedule = [
  {
    id: "SCH001",
    memberName: "Dr. Sarah Johnson",
    role: "Veterinarian",
    date: "2024-01-20",
    shift: "Morning (9AM-2PM)",
    status: "confirmed"
  },
  {
    id: "SCH002",
    memberName: "Raj Patel",
    role: "Rescue Coordinator",
    date: "2024-01-20",
    shift: "Afternoon (2PM-7PM)",
    status: "confirmed"
  }
];

const TeamSection = () => {
  const [activeTab, setActiveTab] = useState("members");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [volunteers, setVolunteers] = useState(mockVolunteers);
  const [schedule, setSchedule] = useState(mockSchedule);
  
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [memberProfileDialog, setMemberProfileDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [addVolunteerDialog, setAddVolunteerDialog] = useState(false);
  const [createShiftDialog, setCreateShiftDialog] = useState(false);
  const [contactDialog, setContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState("");

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'veterinarian': return 'bg-urgent text-urgent-foreground';
      case 'rescue coordinator': return 'bg-primary text-primary-foreground';
      case 'adoption counselor': return 'bg-accent text-accent-foreground';
      case 'volunteer': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'status-available' : 'bg-muted text-muted-foreground';
  };

  const handleAddMember = () => {
    toast.success("New team member added successfully!");
    setAddMemberDialog(false);
  };

  const handleContactMember = (member: any) => {
    setSelectedMember(member);
    setContactDialog(true);
  };

  const handleSendMessage = () => {
    if (!contactMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    toast.success(`Message sent to ${selectedMember?.name}`);
    setContactDialog(false);
    setContactMessage("");
  };

  const handleViewProfile = (member: any) => {
    setSelectedMember(member);
    setMemberProfileDialog(true);
  };

  const handleAddVolunteer = () => {
    toast.success("Volunteer added successfully!");
    setAddVolunteerDialog(false);
  };

  const handleCreateShift = () => {
    toast.success("Shift created successfully!");
    setCreateShiftDialog(false);
  };

  const handleViewSchedule = () => {
    toast.info("Opening full schedule view...");
  };

  const handleViewReports = () => {
    toast.info("Generating performance reports...");
  };

  const handleExportData = () => {
    toast.success("Performance data exported!");
  };

  const filteredMembers = teamMembers.filter(member => {
    const roleMatch = roleFilter === "all" || member.role.toLowerCase().includes(roleFilter.toLowerCase());
    const statusMatch = statusFilter === "all" || member.status === statusFilter;
    return roleMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <Input placeholder="Search members..." className="w-64" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="veterinarian">Veterinarian</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="counselor">Counselor</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="btn-hope" onClick={() => setAddMemberDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="card-warm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{member.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(member.role)} variant="secondary">
                          {member.role}
                        </Badge>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                      {member.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                      {member.phone}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                      Joined {member.joinDate}
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-3 w-3 mr-2 text-muted-foreground" />
                      {member.specialization}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{member.casesHandled}</div>
                      <div className="text-xs text-muted-foreground">Cases</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold flex items-center justify-center">
                        <Star className="h-4 w-4 text-primary fill-current mr-1" />
                        {member.rating}
                      </div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleContactMember(member)}>
                      <Mail className="h-3 w-3 mr-2" />
                      Contact
                    </Button>
                    <Button size="sm" className="btn-trust flex-1" onClick={() => handleViewProfile(member)}>
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="volunteers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Volunteer Management</h3>
            <div className="flex gap-2">
              <Button className="btn-hope" onClick={() => setAddVolunteerDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Volunteer
              </Button>
              <Button variant="outline">Training Schedule</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {volunteers.map((volunteer) => (
              <Card key={volunteer.id} className="card-warm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{volunteer.name}</h4>
                      <p className="text-sm text-muted-foreground">{volunteer.role}</p>
                    </div>
                    <Badge className={volunteer.status === 'active' ? 'status-available' : 'bg-muted'}>
                      {volunteer.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                      {volunteer.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                      {volunteer.phone}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                      {volunteer.hoursContributed} hours contributed
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleContactMember(volunteer)}>
                      Contact
                    </Button>
                    <Button size="sm" className="btn-trust flex-1" onClick={() => handleViewProfile(volunteer)}>
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Team Schedule</h3>
            <div className="flex gap-2">
              <Button className="btn-trust" onClick={handleViewSchedule}>
                <Eye className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
              <Button variant="outline" onClick={() => setCreateShiftDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Shift
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {schedule.map((shift) => (
              <Card key={shift.id} className="card-warm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{shift.memberName}</h4>
                        <Badge>{shift.role}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {shift.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {shift.shift}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="status-available">{shift.status}</Badge>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Performance Analytics</h3>
            <div className="flex gap-2">
              <Button className="btn-hope" onClick={handleViewReports}>
                <Activity className="h-4 w-4 mr-2" />
                View Reports
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Target className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="card-warm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cases</p>
                    <p className="text-3xl font-bold">333</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% this month
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-warm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-3xl font-bold">2.4h</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      -15% faster
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-warm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Rating</p>
                    <p className="text-3xl font-bold">4.8</p>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Excellent
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-accent fill-current" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-warm">
            <CardHeader>
              <CardTitle>Top Performers This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.slice(0, 3).map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{member.casesHandled} cases</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-primary fill-current mr-1" />
                        {member.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onOpenChange={setAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>Enter details for the new team member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input placeholder="Enter full name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="email@example.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <Label>Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veterinarian">Veterinarian</SelectItem>
                  <SelectItem value="coordinator">Rescue Coordinator</SelectItem>
                  <SelectItem value="counselor">Adoption Counselor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Specialization</Label>
              <Input placeholder="Area of expertise" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddMemberDialog(false)}>Cancel</Button>
              <Button className="btn-hope" onClick={handleAddMember}>Add Member</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Member Dialog */}
      <Dialog open={contactDialog} onOpenChange={setContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {selectedMember?.name}</DialogTitle>
            <DialogDescription>Send a message to this team member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Message</Label>
              <Textarea 
                rows={5} 
                placeholder="Type your message here..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setContactDialog(false)}>Cancel</Button>
              <Button className="btn-trust" onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={memberProfileDialog} onOpenChange={setMemberProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Team Member Profile</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedMember.avatar} />
                  <AvatarFallback>{selectedMember.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedMember.name}</h3>
                  <p className="text-muted-foreground">{selectedMember.role}</p>
                  <Badge className="mt-1">{selectedMember.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedMember.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{selectedMember.phone}</p>
                </div>
                <div>
                  <Label>Join Date</Label>
                  <p className="text-sm">{selectedMember.joinDate}</p>
                </div>
                <div>
                  <Label>Specialization</Label>
                  <p className="text-sm">{selectedMember.specialization}</p>
                </div>
                <div>
                  <Label>Cases Handled</Label>
                  <p className="text-sm font-semibold">{selectedMember.casesHandled}</p>
                </div>
                <div>
                  <Label>Rating</Label>
                  <p className="text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 text-primary fill-current mr-1" />
                    {selectedMember.rating}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setMemberProfileDialog(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Volunteer Dialog */}
      <Dialog open={addVolunteerDialog} onOpenChange={setAddVolunteerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Volunteer</DialogTitle>
            <DialogDescription>Register a new volunteer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input placeholder="Enter full name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="email@example.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <Label>Volunteer Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transport">Transport Volunteer</SelectItem>
                  <SelectItem value="foster">Foster Volunteer</SelectItem>
                  <SelectItem value="events">Events Volunteer</SelectItem>
                  <SelectItem value="admin">Admin Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddVolunteerDialog(false)}>Cancel</Button>
              <Button className="btn-hope" onClick={handleAddVolunteer}>Add Volunteer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Shift Dialog */}
      <Dialog open={createShiftDialog} onOpenChange={setCreateShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shift</DialogTitle>
            <DialogDescription>Schedule a new work shift</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Team Member</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Shift Time</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9AM-2PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (2PM-7PM)</SelectItem>
                  <SelectItem value="evening">Evening (7PM-12AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateShiftDialog(false)}>Cancel</Button>
              <Button className="btn-trust" onClick={handleCreateShift}>Create Shift</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamSection;